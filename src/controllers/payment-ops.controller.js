const prisma = require('../prisma');
const paymentAttemptService = require('../services/payment-attempt.service');
const flutterwaveService = require('../services/flutterwave.service');

const isAdmin = (user) => user.roleName === 'SuperAdmin' || user.roleName === 'MarketMaster';

class PaymentOpsController {
  async receiveFlutterwaveWebhook(req, res) {
    try {
      const signatureValid = flutterwaveService.validateWebhookSignature(req.headers || {});
      const event = await prisma.paymentWebhookEvent.create({
        data: {
          provider: 'FLUTTERWAVE',
          eventReference: req.body?.eventReference || req.body?.id ? String(req.body?.id || req.body?.eventReference) : null,
          eventType: req.body?.event || req.body?.eventType || 'UNKNOWN',
          providerTransactionId: req.body?.data?.id ? String(req.body.data.id) : null,
          providerTxRef: req.body?.data?.tx_ref || null,
          status: signatureValid ? 'RECEIVED' : 'PENDING_REVIEW',
          signatureValid,
          payload: req.body || null,
          headers: req.headers || null,
          processingNotes: signatureValid ? 'Webhook received and queued for verification.' : 'Webhook received without a valid configured signature.',
        },
      });
      res.json({ success: true, message: 'Webhook received', data: { id: event.id, signatureValid } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to persist webhook event' });
    }
  }

  async listAdminOnlinePayments(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view online payments' });
      }
      const attempts = await paymentAttemptService.listAdminAttempts({
        marketId: req.user.roleName === 'MarketMaster' ? req.user.marketId : (req.query.marketId || null),
        status: req.query.status || null,
        search: req.query.search || null,
        limit: req.query.limit || 50,
      });
      res.json({ success: true, data: attempts });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to list online payments' });
    }
  }

  async getAdminOnlinePaymentDetail(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view online payment detail' });
      }
      const attempt = await paymentAttemptService.getAdminAttemptDetail({
        attemptId: req.params.attemptId,
        marketId: req.user.roleName === 'MarketMaster' ? req.user.marketId : null,
      });
      res.json({ success: true, data: attempt });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, message: error.message || 'Failed to get online payment detail' });
    }
  }

  async reverifyAttempt(req, res) {
    res.status(501).json({ success: false, message: 'Admin payment re-verification is not implemented yet.' });
  }

  async listWebhookEvents(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view webhook events' });
      }
      const events = await prisma.paymentWebhookEvent.findMany({
        where: {
          provider: 'FLUTTERWAVE',
          ...(req.user.roleName === 'MarketMaster' ? { marketId: req.user.marketId } : {}),
          ...(req.query.status ? { status: req.query.status } : {}),
        },
        orderBy: { receivedAt: 'desc' },
        take: Math.min(Math.max(Number(req.query.limit || 50), 1), 100),
      });
      res.json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to list webhook events' });
    }
  }

  async reprocessWebhookEvent(req, res) {
    res.status(501).json({ success: false, message: 'Webhook reprocessing is not implemented yet.' });
  }
}

module.exports = new PaymentOpsController();
