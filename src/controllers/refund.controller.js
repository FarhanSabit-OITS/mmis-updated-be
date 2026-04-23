const refundService = require('../services/refund.service');

const isAdmin = (user) => user.roleName === 'SuperAdmin' || user.roleName === 'MarketMaster';

class RefundController {
  async listRefunds(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view refunds' });
      }
      const refunds = await refundService.listRefunds({
        marketId: req.user.roleName === 'MarketMaster' ? req.user.marketId : (req.query.marketId || null),
        status: req.query.status || null,
        vendorId: req.query.vendorId || null,
        limit: req.query.limit || 50,
      });
      res.json({ success: true, data: refunds });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to list refunds' });
    }
  }

  async createRefundRecord(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to create refunds' });
      }
      const refund = await refundService.createRefundRecord({
        invoicePaymentId: req.body.invoicePaymentId,
        amount: Number(req.body.amount),
        reason: req.body.reason,
        notes: req.body.notes || null,
        actorUserId: req.user.userId,
      });
      res.status(201).json({ success: true, data: refund });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Failed to create refund record' });
    }
  }

  async updateRefundStatus(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to update refunds' });
      }
      const refund = await refundService.updateRefundStatus({
        refundId: req.params.refundId,
        status: req.body.status,
        notes: req.body.notes || null,
        actorUserId: req.user.userId,
        marketId: req.user.roleName === 'MarketMaster' ? req.user.marketId : null,
      });
      res.json({ success: true, data: refund });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message || 'Failed to update refund status' });
    }
  }
}

module.exports = new RefundController();
