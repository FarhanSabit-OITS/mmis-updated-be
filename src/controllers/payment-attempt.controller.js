const prisma = require('../prisma');
const paymentAttemptService = require('../services/payment-attempt.service');
const paymentReceiptService = require('../services/payment-receipt.service');

const isAdmin = (user) => user.roleName === 'SuperAdmin' || user.roleName === 'MarketMaster';

async function resolveVendorAccess(vendorId, user) {
  if (isAdmin(user)) return true;
  const vendor = await prisma.vendor.findFirst({
    where: { stakeholder: { userId: user.userId } },
    select: { id: true },
  });
  if (!vendor || vendor.id !== vendorId) {
    throw new Error('Unauthorized to access this vendor payment attempt information');
  }
  return true;
}

class PaymentAttemptController {
  async createVendorAttempt(req, res) {
    try {
      await resolveVendorAccess(req.params.vendorId, req.user);
      const attempt = await paymentAttemptService.createAttempt({
        vendorId: req.params.vendorId,
        actorUserId: req.user.userId,
        marketScopeId: req.user.roleName === 'MarketMaster' ? req.user.marketId : null,
        invoiceIds: req.body.invoiceIds || [],
        selectionMode: req.body.selectionMode,
        amount: req.body.amount != null ? Number(req.body.amount) : null,
      });
      res.status(201).json({ success: true, data: attempt });
    } catch (error) {
      const status = error.message.includes('Unauthorized') ? 403 : 400;
      res.status(status).json({ success: false, message: error.message || 'Failed to create payment attempt' });
    }
  }

  async listVendorAttempts(req, res) {
    try {
      await resolveVendorAccess(req.params.vendorId, req.user);
      const attempts = await paymentAttemptService.listVendorAttempts({
        vendorId: req.params.vendorId,
        status: req.query.status || null,
        limit: req.query.limit || 20,
      });
      res.json({ success: true, data: attempts });
    } catch (error) {
      const status = error.message.includes('Unauthorized') ? 403 : 500;
      res.status(status).json({ success: false, message: error.message || 'Failed to list vendor payment attempts' });
    }
  }

  async getVendorAttemptDetail(req, res) {
    try {
      await resolveVendorAccess(req.params.vendorId, req.user);
      const attempt = await paymentAttemptService.getVendorAttemptDetail({
        vendorId: req.params.vendorId,
        attemptId: req.params.attemptId,
      });
      res.json({ success: true, data: attempt });
    } catch (error) {
      const status = error.message.includes('Unauthorized') ? 403 : error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, message: error.message || 'Failed to get payment attempt detail' });
    }
  }

  async getVendorAttemptStatus(req, res) {
    try {
      await resolveVendorAccess(req.params.vendorId, req.user);
      const attempt = await paymentAttemptService.getVendorAttemptStatus({
        vendorId: req.params.vendorId,
        attemptId: req.params.attemptId,
      });
      res.json({ success: true, data: attempt });
    } catch (error) {
      const status = error.message.includes('Unauthorized') ? 403 : error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, message: error.message || 'Failed to get payment attempt status' });
    }
  }

  async downloadVendorReceiptPdf(req, res) {
    try {
      await resolveVendorAccess(req.params.vendorId, req.user);
      const result = await paymentReceiptService.generatePaymentReceiptPdf({
        vendorId: req.params.vendorId,
        paymentId: req.params.paymentId,
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      res.send(result.buffer);
    } catch (error) {
      const status = error.message.includes('Unauthorized') ? 403 : error.message.includes('not found') ? 404 : 501;
      res.status(status).json({ success: false, message: error.message || 'Failed to download receipt PDF' });
    }
  }
}

module.exports = new PaymentAttemptController();
