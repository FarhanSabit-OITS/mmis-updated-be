const { ApiResponse, asyncHandler } = require('../utils');
const prisma = require('../prisma');

module.exports = {
  /**
   * GET /api/orders/my
   * Fetches orders for the authenticated user (Vendor or Supplier).
   */
  getMyOrders: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Identify user role and stakeholder
    const stakeholder = await prisma.stakeholder.findUnique({
      where: { userId },
      include: { vendor: true, supplier: true }
    });

    if (!stakeholder) {
      return res.status(404).json(new ApiResponse({ statusCode: 404, success: false, message: 'Stakeholder profile not found.' }));
    }

    const where = {};
    if (stakeholder.vendor) where.vendorId = stakeholder.vendor.id;
    else if (stakeholder.supplier) where.supplierId = stakeholder.supplier.id;
    else {
      return res.status(403).json(new ApiResponse({ statusCode: 403, success: false, message: 'Only vendors or suppliers can view orders.' }));
    }

    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          vendor: { select: { businessName: true } },
          supplier: { select: { businessName: true } },
          bid: { include: { requisition: { include: { items: true } } } },
          deliveries: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.purchaseOrder.count({ where })
    ]);

    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: { orders, total, page: parseInt(page), limit: parseInt(limit) },
      message: 'Orders fetched successfully'
    }));
  }),

  /**
   * GET /api/orders/:id
   */
  getOrderDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: { select: { businessName: true } },
        supplier: { select: { businessName: true, supplierCode: true } },
        bid: { include: { requisition: { include: { items: true } } } },
        deliveries: { include: { deliveryItems: true } }
      }
    });

    if (!order) {
      return res.status(404).json(new ApiResponse({ statusCode: 404, success: false, message: 'Order not found.' }));
    }

    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: order,
      message: 'Order details fetched'
    }));
  }),

  /**
   * PATCH /api/orders/:id/status
   * Update order status (Confirmation, etc.)
   */
  updateOrderStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: { status }
    });

    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    }));
  })
};
