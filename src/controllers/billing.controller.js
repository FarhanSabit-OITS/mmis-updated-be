const billingService = require('../services/billing.service');
const prisma = require('../prisma');

const isAdmin = (user) => user.roleName === 'SuperAdmin' || user.roleName === 'MarketMaster';

async function resolveVendorAccess(vendorId, user) {
  if (isAdmin(user)) return true;
  const vendor = await prisma.vendor.findFirst({
    where: { stakeholder: { userId: user.userId } },
    select: { id: true },
  });
  if (!vendor || vendor.id !== vendorId) {
    throw new Error('Unauthorized to access this vendor billing information');
  }
  return true;
}

class BillingController {
  async createGenerationRun(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to generate invoices' });
      }
      const marketScopedScopeId = req.user.roleName === 'MarketMaster'
        ? req.user.marketId
        : req.body.scopeId || null;
      const marketScopedScopeType = req.user.roleName === 'MarketMaster'
        ? 'MARKET'
        : (req.body.scopeType || 'ALL');
      const now = new Date();
      const result = await billingService.runInvoiceGeneration({
        targetMonth: req.body.targetMonth || now.getUTCMonth() + 1,
        targetYear: req.body.targetYear || now.getUTCFullYear(),
        scopeType: marketScopedScopeType,
        scopeId: marketScopedScopeId,
        mode: req.body.mode || 'MANUAL',
        reason: req.body.reason || null,
        triggeredByUserId: req.user.userId,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to start invoice generation' });
    }
  }

  async listGenerationRuns(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view generation runs' });
      }
      const runs = await billingService.listGenerationRuns({
        year: req.query.year,
        month: req.query.month,
        scopeType: req.user.roleName === 'MarketMaster' ? 'MARKET' : req.query.scopeType,
        status: req.query.status,
      });
      const filtered = req.user.roleName === 'MarketMaster'
        ? runs.filter((run) => !run.scopeId || run.scopeId === req.user.marketId)
        : runs;
      res.json({ success: true, data: filtered });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to get generation runs' });
    }
  }

  async getGenerationRun(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view generation run detail' });
      }
      const run = await billingService.getGenerationRun(req.params.id);
      if (req.user.roleName === 'MarketMaster' && run.scopeId && run.scopeId !== req.user.marketId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this generation run' });
      }
      res.json({ success: true, data: run });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message || 'Failed to get generation run detail' });
    }
  }

  async listAdminInvoices(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view invoices' });
      }
      const invoices = await billingService.listInvoices({
        vendorId: req.query.vendorId,
        marketId: req.user.roleName === 'MarketMaster' ? req.user.marketId : req.query.marketId,
        status: req.query.status,
        year: req.query.year,
        month: req.query.month,
      });
      res.json({ success: true, data: invoices });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to list invoices' });
    }
  }

  async getAdminInvoiceDetail(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view invoice detail' });
      }
      const invoice = await billingService.getInvoiceById(req.params.invoiceId);
      if (req.user.roleName === 'MarketMaster' && invoice.marketId !== req.user.marketId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this invoice' });
      }
      res.json({ success: true, data: invoice });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message || 'Failed to get invoice detail' });
    }
  }

  async downloadAdminInvoicePdf(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to download invoice PDF' });
      }
      const { fileName, buffer, invoice } = await billingService.generateInvoicePdf(req.params.invoiceId);
      if (req.user.roleName === 'MarketMaster' && invoice.marketId !== req.user.marketId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to download this invoice PDF' });
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(buffer);
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message || 'Failed to download invoice PDF' });
    }
  }

  async listVendorInvoices(req, res) {
    try {
      await resolveVendorAccess(req.params.vendorId, req.user);
      const invoices = await billingService.listInvoices({
        vendorId: req.params.vendorId,
        ...(req.user.roleName === 'MarketMaster' ? { marketId: req.user.marketId } : {}),
        status: req.query.status,
        year: req.query.year,
        month: req.query.month,
      });
      res.json({ success: true, data: invoices });
    } catch (error) {
      res.status(error.message.includes('Unauthorized') ? 403 : 500).json({ success: false, message: error.message || 'Failed to list vendor invoices' });
    }
  }

  async getVendorInvoiceDetail(req, res) {
    try {
      await resolveVendorAccess(req.params.vendorId, req.user);
      const invoice = await billingService.getInvoiceById(req.params.invoiceId);
      if (invoice.vendorId !== req.params.vendorId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this vendor invoice' });
      }
      if (req.user.roleName === 'MarketMaster' && invoice.marketId !== req.user.marketId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this vendor invoice' });
      }
      res.json({ success: true, data: invoice });
    } catch (error) {
      res.status(error.message.includes('Unauthorized') ? 403 : error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message || 'Failed to get vendor invoice detail' });
    }
  }

  async downloadVendorInvoicePdf(req, res) {
    try {
      await resolveVendorAccess(req.params.vendorId, req.user);
      const { fileName, buffer, invoice } = await billingService.generateInvoicePdf(req.params.invoiceId);
      if (invoice.vendorId !== req.params.vendorId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to download this vendor invoice PDF' });
      }
      if (req.user.roleName === 'MarketMaster' && invoice.marketId !== req.user.marketId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to download this vendor invoice PDF' });
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(buffer);
    } catch (error) {
      res.status(error.message.includes('Unauthorized') ? 403 : error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message || 'Failed to download vendor invoice PDF' });
    }
  }

  async submitVendorPaymentClaim(req, res) {
    try {
      await resolveVendorAccess(req.params.vendorId, req.user);
      const claim = await billingService.createPaymentClaim({
        vendorId: req.params.vendorId,
        amount: Number(req.body.amount),
        paymentDate: req.body.paymentDate,
        paymentMethod: req.body.paymentMethod,
        claimedForInvoiceId: req.body.invoiceId || null,
        claimedForBillingMonth: req.body.claimedForBillingMonth || null,
        externalReference: req.body.reference || null,
        notes: req.body.notes || null,
        submittedByUserId: req.user.userId,
        proofFile: req.files?.file || null,
      });
      res.status(201).json({ success: true, data: claim });
    } catch (error) {
      res.status(error.message.includes('Unauthorized') ? 403 : 500).json({ success: false, message: error.message || 'Failed to submit payment claim' });
    }
  }

  async listVendorPaymentClaims(req, res) {
    try {
      await resolveVendorAccess(req.params.vendorId, req.user);
      const claims = await billingService.listPaymentClaims({
        vendorId: req.params.vendorId,
        ...(req.user.roleName === 'MarketMaster' ? { marketId: req.user.marketId } : {}),
        status: req.query.status,
      });
      res.json({ success: true, data: claims });
    } catch (error) {
      res.status(error.message.includes('Unauthorized') ? 403 : 500).json({ success: false, message: error.message || 'Failed to list vendor payment claims' });
    }
  }

  async listAdminPaymentClaims(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view payment claims' });
      }
      const claims = await billingService.listPaymentClaims({
        marketId: req.user.roleName === 'MarketMaster' ? req.user.marketId : req.query.marketId,
        status: req.query.status,
      });
      res.json({ success: true, data: claims });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to list payment claims' });
    }
  }

  async getAdminPaymentClaim(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view payment claim detail' });
      }
      const claim = await billingService.getPaymentClaim(req.params.id);
      if (req.user.roleName === 'MarketMaster' && claim.marketId !== req.user.marketId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this payment claim' });
      }
      res.json({ success: true, data: claim });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message || 'Failed to get payment claim detail' });
    }
  }

  async approvePaymentClaim(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to approve payment claim' });
      }
      const result = await billingService.approvePaymentClaim(req.params.id, {
        notes: req.body.notes || null,
        explicitInvoiceId: req.body.invoiceId || null,
      }, req.user.userId);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to approve payment claim' });
    }
  }

  async rejectPaymentClaim(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to reject payment claim' });
      }
      const result = await billingService.rejectPaymentClaim(req.params.id, {
        reason: req.body.reason || 'Rejected by administrator',
      }, req.user.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to reject payment claim' });
    }
  }
}

module.exports = new BillingController();
