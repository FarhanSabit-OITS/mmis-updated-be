const { ApiResponse, asyncHandler } = require('../utils');
const prisma = require('../prisma');

module.exports = {
  /**
   * POST /api/suppliers/:supplierId/rate
   * Vendor rates a supplier after an order is completed.
   */
  submitRating: asyncHandler(async (req, res) => {
    const { supplierId } = req.params;
    const { orderId, rating, quality, timeliness, comment } = req.body;
    const vendorId = req.user.vendorId; // Assuming vendorId is in JWT or resolved

    if (!vendorId) {
      // Resolve vendorId if not in user object
      const stakeholder = await prisma.stakeholder.findUnique({
        where: { userId: req.user.id },
        include: { vendor: true }
      });
      if (!stakeholder?.vendor) {
        return res.status(403).json(new ApiResponse({ statusCode: 403, success: false, message: 'Only vendors can rate suppliers.' }));
      }
    }

    const order = await prisma.purchaseOrder.findUnique({ where: { id: orderId } });
    if (!order || order.supplierId !== supplierId) {
       return res.status(400).json(new ApiResponse({ statusCode: 400, success: false, message: 'Invalid order for this supplier.' }));
    }

    const supplierRating = await prisma.supplierRating.create({
      data: {
        supplierId,
        vendorId: vendorId || (await prisma.vendor.findFirst({ where: { stakeholder: { userId: req.user.id } } })).id,
        orderId,
        rating: parseInt(rating),
        quality: quality ? parseInt(quality) : null,
        timeliness: timeliness ? parseInt(timeliness) : null,
        comment
      }
    });

    // Recalculate Supplier's Average Rating
    const aggregate = await prisma.supplierRating.aggregate({
      where: { supplierId },
      _avg: { rating: true },
      _count: { id: true }
    });

    await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        averageRating: aggregate._avg.rating || 0
      }
    });

    return res.status(201).json(new ApiResponse({
      statusCode: 201,
      success: true,
      data: supplierRating,
      message: 'Rating submitted and supplier profile updated.'
    }));
  })
};
