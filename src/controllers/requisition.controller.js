const { ApiResponse, asyncHandler } = require('../utils');
const prisma = require('../prisma');


module.exports = {
  // ─── VENDOR METHODS ─────────────────────────────────────

  /**
   * POST /api/requisitions
   * Vendor creates a new RFQ with one or more line items.
   */
  createRequisition: asyncHandler(async (req, res) => {
    
    const { title, description, deadline, budget, marketId, items } = req.body;
    const userId = req.user.id;

    // Resolve vendorId from the authenticated user's stakeholder record
    const vendor = await prisma.vendor.findFirst({
      where: { stakeholder: { userId } },
      select: { id: true }
    });
    if (!vendor) {
      return res.status(403).json(new ApiResponse({ statusCode: 403, success: false, message: 'Vendor profile not found for this user.' }));
    }

    const requisition = await prisma.requisition.create({
      data: {
        vendorId: vendor.id,
        marketId: marketId || null,
        title,
        description,
        deadline: new Date(deadline),
        budget: budget ? parseFloat(budget) : null,
        status: 'OPEN',
        items: {
          create: (items || []).map(item => ({
            name: item.name,
            quantity: parseFloat(item.quantity),
            unit: item.unit,
            specifications: item.specifications || null
          }))
        }
      },
      include: { items: true }
    });

    return res.status(201).json(new ApiResponse({
      statusCode: 201,
      success: true,
      data: requisition,
      message: 'Requisition created successfully'
    }));
  }),

  /**
   * GET /api/requisitions/my
   * Vendor fetches their own requisitions.
   */
  getVendorRequisitions: asyncHandler(async (req, res) => {
    
    const userId = req.user.id;

    const vendor = await prisma.vendor.findFirst({
      where: { stakeholder: { userId } },
      select: { id: true }
    });
    if (!vendor) {
      return res.status(403).json(new ApiResponse({ statusCode: 403, success: false, message: 'Vendor profile not found.' }));
    }

    const { page = 1, limit = 10, status } = req.query;
    const where = { vendorId: vendor.id };
    if (status) where.status = status;

    const [requisitions, total] = await Promise.all([
      prisma.requisition.findMany({
        where,
        include: { items: true, bids: { include: { supplier: { select: { businessName: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.requisition.count({ where })
    ]);

    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: { requisitions, total, page: parseInt(page), limit: parseInt(limit) },
      message: 'Requisitions fetched'
    }));
  }),

  /**
   * POST /api/requisitions/:requisitionId/accept-bid
   * Vendor accepts a supplier's bid → requisition moves to AWARDED and a PurchaseOrder is generated.
   */
  acceptBid: asyncHandler(async (req, res) => {
    const { requisitionId } = req.params;
    const { bidId, paymentTerms, expectedDate } = req.body;
    const notificationService = require('./notification.service'); // In-controller import to avoid circular dep if any

    const bid = await prisma.supplierBid.findUnique({
      where: { id: bidId },
      include: { 
        requisition: {
          include: { items: true }
        },
        supplier: {
          include: { stakeholder: true }
        }
      }
    });

    if (!bid || bid.requisitionId !== requisitionId) {
      return res.status(404).json(new ApiResponse({ statusCode: 404, success: false, message: 'Bid not found for this requisition.' }));
    }
    if (bid.status !== 'PENDING') {
      return res.status(409).json(new ApiResponse({ statusCode: 409, success: false, message: `Bid is already ${bid.status}.` }));
    }

    // 1. Calculate VAT (18%)
    const amount = parseFloat(bid.amount);
    const vatRate = 0.18;
    const totalExclVat = amount / (1 + vatRate);
    const vatAmount = amount - totalExclVat;
    const totalInclVat = amount;

    // 2. Generate PO Number
    const poNumber = `PO-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // 3. Accept chosen bid, reject others, and create PO in transaction
    const [acceptedBid, updatedReq, purchaseOrder] = await prisma.$transaction([
      prisma.supplierBid.update({ 
        where: { id: bidId }, 
        data: { status: 'ACCEPTED' } 
      }),
      prisma.requisition.update({ 
        where: { id: requisitionId }, 
        data: { status: 'AWARDED' } 
      }),
      prisma.purchaseOrder.create({
        data: {
          poNumber,
          marketId: bid.requisition.marketId,
          vendorId: bid.requisition.vendorId,
          supplierId: bid.supplierId,
          bidId: bid.id,
          totalExclVat,
          vatAmount,
          totalInclVat,
          paymentTerms: paymentTerms || bid.supplier.paymentTerms || 'NET30',
          expectedDate: expectedDate ? new Date(expectedDate) : bid.deliveryDate,
          status: 'PENDING'
        }
      })
    ]);

    // Reject all other pending bids on this requisition
    await prisma.supplierBid.updateMany({
      where: { requisitionId, id: { not: bidId }, status: 'PENDING' },
      data: { status: 'REJECTED' }
    });

    // 4. Notify Supplier
    if (bid.supplier.stakeholder.userId) {
      await notificationService.notify({
        userId: bid.supplier.stakeholder.userId,
        title: 'New Purchase Order Awarded',
        message: `Your bid for "${bid.requisition.title}" has been accepted. PO Number: ${poNumber}`,
        type: 'SUCCESS',
        sendEmail: true,
        actionUrl: `/supplier/orders/${purchaseOrder.id}`
      });
    }

    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: { requisition: updatedReq, acceptedBid, purchaseOrder },
      message: 'Bid accepted and Purchase Order generated. Supplier has been notified.'
    }));
  }),

  // ─── SUPPLIER METHODS ────────────────────────────────────

  /**
   * GET /api/requisitions/open
   * Suppliers browse open/bidding requisitions across all markets.
   */
  getOpenRequisitions: asyncHandler(async (req, res) => {
    
    const { page = 1, limit = 15, marketId } = req.query;
    const where = { status: { in: ['OPEN', 'BIDDING'] } };
    if (marketId) where.marketId = marketId;

    const [requisitions, total] = await Promise.all([
      prisma.requisition.findMany({
        where,
        include: {
          items: true,
          vendor: { select: { businessName: true } },
          market: { select: { name: true } },
          _count: { select: { bids: true } }
        },
        orderBy: { deadline: 'asc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.requisition.count({ where })
    ]);

    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: { requisitions, total, page: parseInt(page), limit: parseInt(limit) },
      message: 'Open requisitions fetched'
    }));
  }),

  /**
   * POST /api/requisitions/:requisitionId/bids
   * Supplier places a bid on an open requisition.
   */
  placeBid: asyncHandler(async (req, res) => {
    
    const { requisitionId } = req.params;
    const { amount, deliveryDate, notes } = req.body;
    const userId = req.user.id;

    const supplier = await prisma.supplier.findFirst({
      where: { stakeholder: { userId } },
      select: { id: true }
    });
    if (!supplier) {
      return res.status(403).json(new ApiResponse({ statusCode: 403, success: false, message: 'Supplier profile not found for this user.' }));
    }

    const requisition = await prisma.requisition.findUnique({ where: { id: requisitionId } });
    if (!requisition || !['OPEN', 'BIDDING'].includes(requisition.status)) {
      return res.status(400).json(new ApiResponse({ statusCode: 400, success: false, message: 'Requisition is not open for bidding.' }));
    }

    // Check for duplicate bid from this supplier
    const existing = await prisma.supplierBid.findFirst({
      where: { requisitionId, supplierId: supplier.id }
    });
    if (existing) {
      return res.status(409).json(new ApiResponse({ statusCode: 409, success: false, message: 'You have already placed a bid on this requisition.' }));
    }

    // Calculate AI Trust Score based on history (Heuristic)
    const stats = await prisma.purchaseOrder.aggregate({
      where: { supplierId: supplier.id },
      _count: { id: true }
    });

    const successCount = await prisma.purchaseOrder.count({
      where: { supplierId: supplier.id, status: 'DELIVERED' }
    });

    const supplierProfile = await prisma.supplier.findUnique({
      where: { id: supplier.id },
      select: { averageRating: true, isVerified: true }
    });

    // Score components: Success Rate (40%), Rating (40%), Verified Status (20%)
    let score = 70; // Base score
    if (stats._count.id > 0) {
      const successRate = (successCount / stats._count.id) * 40;
      const ratingWeight = ((supplierProfile.averageRating || 0) / 5) * 40;
      const verifiedWeight = supplierProfile.isVerified ? 20 : 0;
      score = Math.floor(successRate + ratingWeight + verifiedWeight);
    } else {
      // New supplier logic
      score = supplierProfile.isVerified ? 85 : 75;
    }
    
    // Clamp between 70 and 98 as per requirement
    const aiTrustScore = Math.max(70, Math.min(98, score));

    const [bid] = await prisma.$transaction([
      prisma.supplierBid.create({
        data: {
          requisitionId,
          supplierId: supplier.id,
          amount: parseFloat(amount),
          deliveryDate: new Date(deliveryDate),
          notes: notes || null,
          aiTrustScore,
          status: 'PENDING'
        }
      }),
      prisma.requisition.update({
        where: { id: requisitionId, status: 'OPEN' },
        data: { status: 'BIDDING' }
      }).catch(() => null) // Silently skip if already BIDDING
    ]);

    return res.status(201).json(new ApiResponse({
      statusCode: 201,
      success: true,
      data: bid,
      message: 'Bid placed successfully'
    }));
  }),

  /**
   * GET /api/requisitions/my-bids
   * Supplier fetches all their placed bids.
   */
  getSupplierBids: asyncHandler(async (req, res) => {
    
    const userId = req.user.id;

    const supplier = await prisma.supplier.findFirst({
      where: { stakeholder: { userId } },
      select: { id: true }
    });
    if (!supplier) {
      return res.status(403).json(new ApiResponse({ statusCode: 403, success: false, message: 'Supplier profile not found.' }));
    }

    const bids = await prisma.supplierBid.findMany({
      where: { supplierId: supplier.id },
      include: {
        requisition: {
          include: { items: true, vendor: { select: { businessName: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: bids,
      message: 'Supplier bids fetched'
    }));
  }),

  /**
   * GET /api/requisitions/suppliers
   * Fetch all verified suppliers for the directory.
   */
  getSuppliers: asyncHandler(async (req, res) => {
    const suppliers = await prisma.supplier.findMany({
      where: { isVerified: true },
      select: {
        id: true,
        businessName: true,
        supplierType: true,
        averageRating: true,
        isVerified: true,
        stakeholder: {
          select: {
            kycStatus: true
          }
        }
      }
    });

    // Map to frontend expectation (matching SuppliersNetwork.tsx)
    const formatted = suppliers.map(s => ({
      id: s.id,
      companyName: s.businessName,
      rating: s.averageRating || 0,
      totalRatings: 0, // Not explicitly tracked in schema as count, but average is there
      trustScore: 85, // Default trust score
      categories: [s.supplierType], // Use supplierType as primary category
      kycVerified: s.stakeholder?.kycStatus === 'VERIFIED'
    }));

    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: formatted,
      message: 'Suppliers fetched'
    }));
  }),

  /**
   * POST /api/requisitions/suppliers/:supplierId/rate
   * Vendor rates a supplier based on a specific Purchase Order
   */
  submitRating: asyncHandler(async (req, res) => {
    const { supplierId } = req.params;
    const { orderId, rating, quality, timeliness, comment } = req.body;
    const userId = req.user.id;

    // 1. Verify user is a vendor
    const vendor = await prisma.vendor.findFirst({
      where: { stakeholder: { userId } },
      select: { id: true }
    });
    if (!vendor) {
      return res.status(403).json(new ApiResponse({ statusCode: 403, success: false, message: 'Only vendors can rate suppliers.' }));
    }

    // 2. Verify order exists and belongs to this vendor and supplier
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: orderId }
    });

    if (!order || order.vendorId !== vendor.id || order.supplierId !== supplierId) {
       return res.status(404).json(new ApiResponse({ statusCode: 404, success: false, message: 'Invalid order for this rating submission.' }));
    }

    // 3. Create Rating in transaction and update Supplier average
    const result = await prisma.$transaction(async (tx) => {
      // Create the rating record
      const newRating = await tx.supplierRating.create({
        data: {
          supplierId,
          vendorId: vendor.id,
          orderId,
          rating: parseInt(rating),
          quality: quality ? parseInt(quality) : null,
          timeliness: timeliness ? parseInt(timeliness) : null,
          comment
        }
      });

      // Calculate new average rating for supplier
      const ratings = await tx.supplierRating.aggregate({
        where: { supplierId },
        _avg: { rating: true },
        _count: { rating: true }
      });

      // Update supplier averageRating
      await tx.supplier.update({
        where: { id: supplierId },
        data: { averageRating: ratings._avg.rating || rating }
      });

      return newRating;
    });

    return res.status(201).json(new ApiResponse({
      statusCode: 201,
      success: true,
      data: result,
      message: 'Rating submitted successfully'
    }));
  })
};
