const paymentService = require('../services/payment.service');

class PaymentController {
  // Get vendor payment summary
  async getVendorPaymentSummary(req, res) {
    try {
      const { vendorId } = req.params;

      // Check if user is authorized (vendor themselves or admin)
      const isAdmin = req.user.roleName === 'SuperAdmin' || req.user.roleName === 'MarketMaster';
      const isVendor = req.user.roleName === 'Vendor';
      
      if (!isAdmin && (!isVendor || req.user.userId !== vendorId)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this vendor\'s payment information'
        });
      }

      const summary = await paymentService.getVendorPaymentSummary(vendorId);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error in getVendorPaymentSummary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get payment summary'
      });
    }
  }

  // Get vendor rent payments
  async getVendorRentPayments(req, res) {
    try {
      const { vendorId } = req.params;

      // Check authorization
      const isAdmin = req.user.roleName === 'SuperAdmin' || req.user.roleName === 'MarketMaster';
      const isVendor = req.user.roleName === 'Vendor';
      
      if (!isAdmin && (!isVendor || req.user.userId !== vendorId)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this vendor\'s rent payments'
        });
      }

      const rentData = await paymentService.calculateOutstandingRent(vendorId);

      res.json({
        success: true,
        data: rentData
      });
    } catch (error) {
      console.error('Error in getVendorRentPayments:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get rent payments'
      });
    }
  }

  // Get vendor tax payments
  async getVendorTaxPayments(req, res) {
    try {
      const { vendorId } = req.params;

      // Check authorization
      const isAdmin = req.user.roleName === 'SuperAdmin' || req.user.roleName === 'MarketMaster';
      const isVendor = req.user.roleName === 'Vendor';
      
      if (!isAdmin && (!isVendor || req.user.userId !== vendorId)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this vendor\'s tax payments'
        });
      }

      const taxData = await paymentService.calculateOutstandingTax(vendorId);

      res.json({
        success: true,
        data: taxData
      });
    } catch (error) {
      console.error('Error in getVendorTaxPayments:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get tax payments'
      });
    }
  }

  // Get vendor payment history
  async getVendorPaymentHistory(req, res) {
    try {
      const { vendorId } = req.params;
      const { limit = 10 } = req.query;

      // Check authorization
      const isAdmin = req.user.roleName === 'SuperAdmin' || req.user.roleName === 'MarketMaster';
      const isVendor = req.user.roleName === 'Vendor';
      
      if (!isAdmin && (!isVendor || req.user.userId !== vendorId)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this vendor\'s payment history'
        });
      }

      const history = await paymentService.getRecentPayments(vendorId, parseInt(limit));

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error in getVendorPaymentHistory:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get payment history'
      });
    }
  }

  // Process rent payment
  async processRentPayment(req, res) {
    try {
      const { contractId, amount, paymentMethod, transactionId, notes } = req.body;

      // Validate required fields
      if (!contractId || !amount || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'Contract ID, amount, and payment method are required'
        });
      }

      const result = await paymentService.processRentPayment({
        contractId,
        amount,
        paymentMethod,
        transactionId,
        notes,
        processedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Rent payment processed successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in processRentPayment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process rent payment'
      });
    }
  }

  // Process tax payment
  async processTaxPayment(req, res) {
    try {
      const { taxPaymentId, amount, paymentMethod, transactionId, notes } = req.body;

      // Validate required fields
      if (!taxPaymentId || !amount || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'Tax payment ID, amount, and payment method are required'
        });
      }

      const result = await paymentService.processTaxPayment({
        taxPaymentId,
        amount,
        paymentMethod,
        transactionId,
        notes,
        collectedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Tax payment processed successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in processTaxPayment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process tax payment'
      });
    }
  }

  // Get admin payment collections
  async getAdminPaymentCollections(req, res) {
    try {
      // Check if user is admin
      const isAdmin = req.user.roleName === 'SuperAdmin' || req.user.roleName === 'MarketMaster';
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view payment collections'
        });
      }

      const { marketId, startDate, endDate } = req.query;

      if (!marketId) {
        return res.status(400).json({
          success: false,
          message: 'Market ID is required'
        });
      }

      const dateRange = startDate && endDate ? { start: startDate, end: endDate } : null;
      const collections = await paymentService.getAdminPaymentCollections(marketId, dateRange);

      res.json({
        success: true,
        data: collections
      });
    } catch (error) {
      console.error('Error in getAdminPaymentCollections:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get payment collections'
      });
    }
  }

  // Get outstanding payments for admin
  async getOutstandingPayments(req, res) {
    try {
      // Check if user is admin
      const isAdmin = req.user.roleName === 'SuperAdmin' || req.user.roleName === 'MarketMaster';
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view outstanding payments'
        });
      }

      const { marketId } = req.query;

      if (!marketId) {
        return res.status(400).json({
          success: false,
          message: 'Market ID is required'
        });
      }

      const outstanding = await paymentService.getOutstandingPayments(marketId);

      res.json({
        success: true,
        data: outstanding
      });
    } catch (error) {
      console.error('Error in getOutstandingPayments:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get outstanding payments'
      });
    }
  }

  // Generate invoice (placeholder for future implementation)
  async generateInvoice(req, res) {
    try {
      const { paymentId, type } = req.body;

      // This would integrate with a PDF generation service
      res.json({
        success: true,
        message: 'Invoice generation not yet implemented',
        data: { paymentId, type }
      });
    } catch (error) {
      console.error('Error in generateInvoice:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate invoice'
      });
    }
  }

  // Send payment reminder (placeholder for future implementation)
  async sendPaymentReminder(req, res) {
    try {
      const { vendorId, paymentType, message } = req.body;

      // Check if user is admin
      const isAdmin = req.user.roleName === 'SuperAdmin' || req.user.roleName === 'MarketMaster';
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to send payment reminders'
        });
      }

      // This would integrate with notification service
      res.json({
        success: true,
        message: 'Payment reminder functionality not yet implemented',
        data: { vendorId, paymentType }
      });
    } catch (error) {
      console.error('Error in sendPaymentReminder:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send payment reminder'
      });
    }
  }

  // Webhook for payment confirmation (URA gateway)
  async handlePaymentWebhook(req, res) {
    try {
      const webhookData = req.body;

      // Log webhook data for debugging
      console.log('Payment webhook received:', webhookData);

      // Process webhook based on provider
      // This would contain logic to verify webhook authenticity
      // and update payment status accordingly

      res.json({
        success: true,
        message: 'Webhook received and processed'
      });
    } catch (error) {
      console.error('Error in handlePaymentWebhook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process payment webhook'
      });
    }
  }

  // URA callback handler
  async handleURACallback(req, res) {
    try {
      const callbackData = req.body;

      // Log callback data
      console.log('URA callback received:', callbackData);

      // Process URA payment confirmation
      // This would update payment status based on URA response

      res.json({
        success: true,
        message: 'URA callback processed successfully'
      });
    } catch (error) {
      console.error('Error in handleURACallback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process URA callback'
      });
    }
  }
}

module.exports = new PaymentController();