const prisma = require('../prisma');
const paymentAttemptService = require('../services/payment-attempt.service');
const flutterwaveService = require('../services/flutterwave.service');

const isAdmin = (user) => user.roleName === 'SuperAdmin' || user.roleName === 'MarketMaster';

class PaymentOpsController {
  async receiveFlutterwaveWebhook(req, res) {
    try {
      const providerData = req.body?.data || {};
      const txRef =
        providerData?.tx_ref ||
        providerData?.txRef ||
        providerData?.reference ||
        req.body?.tx_ref ||
        req.body?.reference ||
        null;
      const attempt = txRef ? await paymentAttemptService.findAttemptByReference(txRef) : null;
      const signatureValid = flutterwaveService.validateWebhookSignature(req.headers || {});
      const eventReference = req.body?.eventReference || req.body?.id ? String(req.body?.id || req.body?.eventReference) : null;
      const providerTransactionId =
        providerData?.id
          ? String(providerData.id)
          : providerData?.charge_id
            ? String(providerData.charge_id)
            : null;
      let event = null;

      if (eventReference) {
        const existingEvent = await prisma.paymentWebhookEvent.findUnique({
          where: { eventReference },
        });
        if (existingEvent) {
          return res.json({
            success: true,
            message: 'Duplicate webhook ignored',
            data: { id: existingEvent.id, signatureValid: existingEvent.signatureValid, duplicate: true },
          });
        }
      }

      try {
        event = await prisma.paymentWebhookEvent.create({
          data: {
            provider: 'FLUTTERWAVE',
            eventReference,
            eventType: req.body?.event || req.body?.eventType || 'UNKNOWN',
            paymentAttemptId: attempt?.id || null,
            vendorId: attempt?.vendorId || null,
            marketId: attempt?.marketId || null,
            providerTransactionId,
            providerTxRef: txRef,
            status: signatureValid ? 'RECEIVED' : 'PENDING_REVIEW',
            signatureValid,
            payload: req.body || null,
            headers: req.headers || null,
            processingNotes: signatureValid ? 'Webhook received and queued for verification.' : 'Webhook received without a valid configured signature.',
          },
        });
      } catch (error) {
        if (error?.code === 'P2002' && eventReference) {
          const existingEvent = await prisma.paymentWebhookEvent.findUnique({
            where: { eventReference },
          });
          return res.json({
            success: true,
            message: 'Duplicate webhook ignored',
            data: { id: existingEvent?.id || null, signatureValid: existingEvent?.signatureValid ?? signatureValid, duplicate: true },
          });
        }
        throw error;
      }

      if (signatureValid && attempt?.id && providerTransactionId) {
        await paymentAttemptService.verifyAndFinalizeAttempt({
          attemptId: attempt.id,
          webhookEventId: event.id,
          providerTransactionId,
        });
      }

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
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to re-verify online payments' });
      }
      const result = await paymentAttemptService.verifyAndFinalizeAttempt({
        attemptId: req.params.attemptId,
        actorUserId: req.user.userId,
        providerTransactionId: req.body?.providerTransactionId ? String(req.body.providerTransactionId) : null,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Failed to re-verify payment attempt' });
    }
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
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to reprocess webhook events' });
      }
      const event = await prisma.paymentWebhookEvent.findUnique({ where: { id: req.params.eventId } });
      if (!event) {
        return res.status(404).json({ success: false, message: 'Webhook event not found' });
      }
      if (!event.paymentAttemptId) {
        return res.status(400).json({ success: false, message: 'Webhook event is not linked to a payment attempt yet.' });
      }
      const result = await paymentAttemptService.verifyAndFinalizeAttempt({
        attemptId: event.paymentAttemptId,
        actorUserId: req.user.userId,
        webhookEventId: event.id,
        providerTransactionId: event.providerTransactionId || null,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Failed to reprocess webhook event' });
    }
  }
}

module.exports = new PaymentOpsController();
