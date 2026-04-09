const { ApiResponse, asyncHandler } = require('../utils');
const prisma = require('../prisma');
const notificationService = require('../services/notification.service');

module.exports = {
  /**
   * POST /api/deliveries
   * Supplier creates a delivery note for an awarded PO.
   */
  createDelivery: asyncHandler(async (req, res) => {
    const { orderId, vehicleNumber, driverName, driverPhone, expectedDate, items } = req.body;
    const userId = req.user.id;

    const supplier = await prisma.supplier.findFirst({
      where: { stakeholder: { userId } },
      select: { id: true }
    });

    if (!supplier) {
      return res.status(403).json(new ApiResponse({ statusCode: 403, success: false, message: 'Supplier profile not found.' }));
    }

    const order = await prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      include: { vendor: { include: { stakeholder: true } } }
    });

    if (!order || order.supplierId !== supplier.id) {
      return res.status(404).json(new ApiResponse({ statusCode: 404, success: false, message: 'Purchase Order not found or unauthorized.' }));
    }

    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        supplierId: supplier.id,
        facilityId: order.bidId, // Temporary mapping or need to resolve shop facility
        // Note: in high-level schema, facility is the destination shop. 
        // We'll use order.vendor's primary facility if available or pass it from frontend.
        facilityId: req.body.facilityId || order.deliveries?.[0]?.facilityId || '', 
        vehicleNumber,
        driverName,
        driverPhone,
        expectedDate: new Date(expectedDate),
        status: 'SHIPPED',
        createdById: userId,
        deliveryItems: {
          create: (items || []).map(item => ({
            productId: item.productId,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.quantity) * parseFloat(item.unitPrice)
          }))
        }
      }
    });

    // Notify Vendor
    if (order.vendor.stakeholder.userId) {
      await notificationService.notify({
        userId: order.vendor.stakeholder.userId,
        title: 'Shipment Dispatched',
        message: `Supplier has dispatched delivery for PO ${order.poNumber}. Vehicle: ${vehicleNumber}`,
        type: 'INFO',
        sendEmail: true
      });
    }

    return res.status(201).json(new ApiResponse({
      statusCode: 201,
      success: true,
      data: delivery,
      message: 'Delivery note created and vendor notified.'
    }));
  }),

  /**
   * GET /api/deliveries/:id
   */
  getDeliveryDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        supplier: { select: { businessName: true } },
        order: { select: { poNumber: true } },
        deliveryItems: true,
        verifiedBy: { select: { profile: true } }
      }
    });

    if (!delivery) {
      return res.status(404).json(new ApiResponse({ statusCode: 404, success: false, message: 'Delivery not found.' }));
    }

    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: delivery,
      message: 'Delivery details fetched'
    }));
  }),

  /**
   * PATCH /api/deliveries/:id/verify
   * Gate or Vendor verifies the delivery.
   */
  verifyDelivery: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { receivedItems, notes, action } = req.body; // action: 'ARRIVED' or 'RECEIVED'
    const userId = req.user.id;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: { order: true, supplier: { include: { stakeholder: true } } }
    });

    if (!delivery) {
       return res.status(404).json(new ApiResponse({ statusCode: 404, success: false, message: 'Delivery not found.' }));
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: {
        status: action === 'ARRIVED' ? 'ARRIVED' : 'DELIVERED',
        receivedDate: action === 'RECEIVED' ? new Date() : null,
        verifiedById: userId,
        verificationNotes: notes,
        // Update items if receiving
      }
    });

    // If fully delivered, update PO status
    if (action === 'RECEIVED') {
      await prisma.purchaseOrder.update({
        where: { id: delivery.orderId },
        data: { status: 'DELIVERED' }
      });

      // Notify Supplier
      if (delivery.supplier.stakeholder.userId) {
        await notificationService.notify({
          userId: delivery.supplier.stakeholder.userId,
          title: 'Delivery Confirmed',
          message: `Your delivery for PO ${delivery.order.poNumber} has been received and verified.`,
          type: 'SUCCESS',
          sendEmail: true
        });
      }
    }

    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: updatedDelivery,
      message: `Delivery status updated to ${updatedDelivery.status}`
    }));
  })
};
