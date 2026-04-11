const prisma = require('../prisma');
const paymentService = require('../services/payment.service');

const isAdmin = (user) => user.roleName === 'SuperAdmin' || user.roleName === 'MarketMaster';

async function resolveVendorScope(vendorId, user) {
  if (user.roleName === 'SuperAdmin') return null;
  if (user.roleName === 'MarketMaster') return user.marketId;
  const vendor = await prisma.vendor.findFirst({
    where: { stakeholder: { userId: user.userId } },
    select: { id: true, primaryMarketId: true }
  });
  if (!vendor || vendor.id !== vendorId) {
    throw new Error('Unauthorized to view this vendor payment information');
  }
  return vendor.primaryMarketId || null;
}

class PaymentController {
  async getVendorPaymentSummary(req, res) {
    try {
      const { vendorId } = req.params;
      const marketScopeId = await resolveVendorScope(vendorId, req.user);
      const summary = await paymentService.getVendorPaymentSummary(vendorId, marketScopeId);
      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(error.message.includes('Unauthorized') ? 403 : 500).json({ success: false, message: error.message });
    }
  }

  async getVendorRentPayments(req, res) {
    try {
      const { vendorId } = req.params;
      const marketScopeId = await resolveVendorScope(vendorId, req.user);
      const rentData = await paymentService.calculateOutstandingRent(vendorId, marketScopeId);
      res.json({ success: true, data: rentData });
    } catch (error) {
      res.status(error.message.includes('Unauthorized') ? 403 : 500).json({ success: false, message: error.message });
    }
  }

  async getVendorTaxPayments(req, res) {
    try {
      const { vendorId } = req.params;
      const marketScopeId = await resolveVendorScope(vendorId, req.user);
      const taxData = await paymentService.calculateOutstandingTax(vendorId, marketScopeId);
      res.json({ success: true, data: taxData });
    } catch (error) {
      res.status(error.message.includes('Unauthorized') ? 403 : 500).json({ success: false, message: error.message });
    }
  }

  async getVendorPaymentHistory(req, res) {
    try {
      const { vendorId } = req.params;
      const { limit = 10 } = req.query;
      const marketScopeId = await resolveVendorScope(vendorId, req.user);
      const history = await paymentService.getRecentPayments(vendorId, parseInt(limit, 10), marketScopeId);
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(error.message.includes('Unauthorized') ? 403 : 500).json({ success: false, message: error.message });
    }
  }

  async getScopedVendorsWithPayments(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view vendor payment list' });
      }
      const marketId = req.user.roleName === 'MarketMaster' ? req.user.marketId : (req.query.marketId || null);
      const data = await paymentService.getScopedVendorsWithPayments(marketId, {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
      });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to get vendor payment list' });
    }
  }

  async uploadPaymentEvidence(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to upload payment evidence' });
      }
      const { vendorId } = req.body;
      if (!vendorId || !req.files?.file) {
        return res.status(400).json({ success: false, message: 'vendorId and file are required' });
      }
      const document = await paymentService.uploadPaymentEvidence({
        vendorId,
        uploadedById: req.user.userId,
        file: req.files.file,
      });
      res.status(201).json({ success: true, data: document });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to upload payment evidence' });
    }
  }

  async recordRentPayment(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to record rent payment' });
      }
      const result = await paymentService.createOrUpdateRentPaymentEntry({
        ...req.body,
        actorUserId: req.user.userId,
        marketScopeId: req.user.roleName === 'MarketMaster' ? req.user.marketId : null,
      });

      const complianceService = require('../services/compliance.service');
      complianceService.logAudit({
          action: 'RENT_PAYMENT_RECORDED',
          entityType: 'RentPayment',
          entityId: result.id || 'bulk-or-unknown',
          newData: { ...req.body, status: result.status },
          userId: req.user.userId,
          ipAddress: req.ip,
          endpoint: req.originalUrl,
          httpMethod: req.method
      });

      res.status(201).json({ success: true, message: 'Rent payment recorded successfully', data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to record rent payment' });
    }
  }

  async getAdminPaymentCollections(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view payment collections' });
      }
      const marketId = req.user.roleName === 'MarketMaster' ? req.user.marketId : (req.query.marketId || null);
      const { startDate, endDate } = req.query;
      const dateRange = startDate && endDate ? { start: startDate, end: endDate } : null;
      const collections = await paymentService.getAdminPaymentCollections(marketId, dateRange);
      res.json({ success: true, data: collections });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to get payment collections' });
    }
  }

  async getOutstandingPayments(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view outstanding payments' });
      }
      const marketId = req.user.roleName === 'MarketMaster' ? req.user.marketId : (req.query.marketId || null);
      const outstanding = await paymentService.getOutstandingPayments(marketId, {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
      });
      res.json({ success: true, data: outstanding });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to get outstanding payments' });
    }
  }

  async sendPaymentReminder(req, res) {
    try {
      const { vendorId, amountDue, dueDate, description } = req.body;

      if (!vendorId || !amountDue) {
        return res.status(400).json({ success: false, message: 'vendorId and amountDue are required' });
      }

      // Fetch vendor and user email
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: {
          stakeholder: {
            include: {
              user: true
            }
          }
        }
      });

      if (!vendor || !vendor.stakeholder || !vendor.stakeholder.user || !vendor.stakeholder.user.email) {
        return res.status(404).json({ success: false, message: 'Vendor email not found' });
      }

      const emailService = require('../services/email.service');
      const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString() : 'immediately';
      
      await emailService.sendGenericNotificationEmail(
        vendor.stakeholder.user.email,
        'Payment Reminder: Outstanding Dues',
        `This is a reminder that you have an outstanding balance of UGX ${amountDue.toLocaleString()} ${description ? 'for ' + description : ''} due ${formattedDate}. Please clear your dues at the earliest to avoid penalties.`,
        null,
        { name: vendor.stakeholder.user.profile?.firstName || 'Vendor', ctaTag: 'Accounts' }
      );

      res.status(200).json({ success: true, message: 'Payment reminder sent successfully' });
    } catch (error) {
      console.error('sendPaymentReminder Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to send payment reminder' });
    }
  }

  /**
   * GET /api/payments/revenue-hub
   * ✅ FIXED: Logic moved to service layer. Max 20 rows per page.
   * Uses select projections instead of deep include chains.
   */
  async getRevenueHub(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
      }

      const { type, marketId, page, cursor } = req.query;
      const { roleName, marketId: managerMarketId } = req.user;

      // MarketMaster is always scoped to their own market — cannot override
      const targetMarketId = roleName === 'MarketMaster' ? managerMarketId : (marketId || null);

      const result = await paymentService.getRevenueHubPaginated({
        marketId: targetMarketId,
        type,
        page: parseInt(page) || 1,
        cursor,
      });

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PaymentController();

