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
   * Vendor accepts a supplier's bid → requisition moves to AWARDED.
   */
  acceptBid: asyncHandler(async (req, res) => {
    
    const { requisitionId } = req.params;
    const { bidId } = req.body;

    const bid = await prisma.supplierBid.findUnique({
      where: { id: bidId },
      include: { requisition: true }
    });

    if (!bid || bid.requisitionId !== requisitionId) {
      return res.status(404).json(new ApiResponse({ statusCode: 404, success: false, message: 'Bid not found for this requisition.' }));
    }
    if (bid.status !== 'PENDING') {
      return res.status(409).json(new ApiResponse({ statusCode: 409, success: false, message: `Bid is already ${bid.status}.` }));
    }

    // Accept chosen bid, reject others
    const [acceptedBid, updatedReq] = await prisma.$transaction([
      prisma.supplierBid.update({ where: { id: bidId }, data: { status: 'ACCEPTED' } }),
      prisma.requisition.update({ where: { id: requisitionId }, data: { status: 'AWARDED' } }),
    ]);

    // Reject all other pending bids on this requisition
    await prisma.supplierBid.updateMany({
      where: { requisitionId, id: { not: bidId }, status: 'PENDING' },
      data: { status: 'REJECTED' }
    });

    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: { requisition: updatedReq, acceptedBid },
      message: 'Bid accepted. Supplier notified to prepare delivery.'
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

    const aiTrustScore = Math.floor(Math.random() * (98 - 70 + 1)) + 70; // TODO: Replace with real AI service

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
  })
};
