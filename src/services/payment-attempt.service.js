const crypto = require('crypto');
const prisma = require('../prisma');
const flutterwaveService = require('./flutterwave.service');

const PAYABLE_STATUSES = ['OPEN', 'PARTIALLY_PAID', 'OVERDUE'];
const FINAL_ATTEMPT_STATUSES = ['SUCCESSFUL', 'FAILED', 'ABANDONED', 'CANCELLED', 'EXPIRED', 'MISMATCH_REVIEW_REQUIRED'];
const isWholePositiveAmount = (value) => Number.isInteger(value) && value > 0;
const toNumber = (value) => Number(value || 0);

class PaymentAttemptService {
  generateAttemptReference() {
    return `PAT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }

  async getVendorCheckoutContext(vendorId) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        stakeholder: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!vendor) throw new Error('Vendor not found');
    return vendor;
  }

  async resolvePayableInvoices(vendorId, marketScopeId = null, invoiceIds = []) {
    const invoices = await prisma.rentInvoice.findMany({
      where: {
        vendorId,
        ...(marketScopeId ? { marketId: marketScopeId } : {}),
        status: { in: PAYABLE_STATUSES },
        ...(invoiceIds.length ? { id: { in: invoiceIds } } : {}),
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    });
    return invoices;
  }

  validateSelectionMode(selectionMode) {
    if (!['FULL_SELECTED', 'PARTIAL_SELECTED', 'FULL_OUTSTANDING'].includes(selectionMode)) {
      throw new Error('Invalid selection mode.');
    }
  }

  async buildSelection({ vendorId, marketScopeId = null, invoiceIds = [], selectionMode, amount }) {
    this.validateSelectionMode(selectionMode);

    const uniqueInvoiceIds = Array.from(new Set((invoiceIds || []).filter(Boolean)));
    const payableInvoices = await this.resolvePayableInvoices(vendorId, marketScopeId, selectionMode === 'FULL_OUTSTANDING' ? [] : uniqueInvoiceIds);

    if (selectionMode !== 'FULL_OUTSTANDING' && !uniqueInvoiceIds.length) {
      throw new Error('At least one invoice must be selected.');
    }

    if (selectionMode !== 'FULL_OUTSTANDING' && payableInvoices.length !== uniqueInvoiceIds.length) {
      throw new Error('One or more selected invoices are invalid, already paid, superseded, or unavailable.');
    }

    const selectedInvoices = selectionMode === 'FULL_OUTSTANDING'
      ? await this.resolvePayableInvoices(vendorId, marketScopeId)
      : payableInvoices;

    if (!selectedInvoices.length) {
      throw new Error('No payable invoices are currently available for this vendor.');
    }

    const selectedTotal = selectedInvoices.reduce((sum, invoice) => sum + toNumber(invoice.outstandingAmount), 0);
    let requestedAmount = selectedTotal;
    if (selectionMode === 'PARTIAL_SELECTED') {
      if (!isWholePositiveAmount(amount)) {
        throw new Error('Partial payment amount must be a whole-number UGX value greater than zero.');
      }
      if (amount > selectedTotal) {
        throw new Error('Partial payment amount cannot exceed the selected outstanding total.');
      }
      requestedAmount = amount;
    } else if (amount != null && amount !== selectedTotal) {
      requestedAmount = selectedTotal;
    }

    if (!isWholePositiveAmount(requestedAmount)) {
      throw new Error('Payment amount must be a whole-number UGX value greater than zero.');
    }

    let remaining = requestedAmount;
    const allocationPreview = selectedInvoices.map((invoice) => {
      const outstandingAmount = toNumber(invoice.outstandingAmount);
      const allocatedAmount = Math.min(outstandingAmount, remaining);
      remaining -= allocatedAmount;
      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        dueDate: invoice.dueDate,
        outstandingAmount,
        allocatedAmount,
        remainingAfterAllocation: Math.max(outstandingAmount - allocatedAmount, 0),
      };
    });

    return {
      selectedInvoices,
      selectedTotal,
      requestedAmount,
      allocationPreview,
    };
  }

  formatAttempt(attempt) {
    if (!attempt) return null;
    return {
      ...attempt,
      requestedAmount: toNumber(attempt.requestedAmount),
      confirmedAmount: attempt.confirmedAmount == null ? null : toNumber(attempt.confirmedAmount),
      selectedInvoices: (attempt.selectedInvoices || []).map((item) => ({
        ...item,
        invoiceOutstandingSnapshot: toNumber(item.invoiceOutstandingSnapshot),
      })),
      invoicePayment: attempt.invoicePayment
        ? {
            ...attempt.invoicePayment,
            amount: toNumber(attempt.invoicePayment.amount),
          }
        : null,
    };
  }

  async createAttempt({ vendorId, actorUserId, marketScopeId = null, invoiceIds = [], selectionMode, amount }) {
    const vendor = await this.getVendorCheckoutContext(vendorId);
    const selection = await this.buildSelection({
      vendorId,
      marketScopeId,
      invoiceIds,
      selectionMode,
      amount,
    });

    const attemptReference = this.generateAttemptReference();
    const hostedCheckout = await flutterwaveService.createHostedCheckout({
      amount: selection.requestedAmount,
      currency: 'UGX',
      txRef: attemptReference,
      customer: {
        email: vendor.stakeholder?.user?.email,
        name: vendor.businessName,
        phonenumber: vendor.stakeholder?.user?.phone || undefined,
      },
      customizations: {
        title: 'MMIS Rent Payment',
        description: `Rent payment for ${vendor.businessName}`,
      },
      meta: {
        vendorId,
        invoiceIds: selection.selectedInvoices.map((invoice) => invoice.id),
        selectionMode,
      },
    });

    const attempt = await prisma.paymentAttempt.create({
      data: {
        attemptReference,
        vendorId,
        marketId: selection.selectedInvoices[0].marketId,
        currencyCode: 'UGX',
        selectionMode,
        requestedAmount: selection.requestedAmount,
        status: 'INITIATED',
        provider: 'FLUTTERWAVE',
        providerTxRef: attemptReference,
        checkoutUrl: hostedCheckout.checkoutUrl,
        providerPayload: hostedCheckout.providerPayload,
        invoiceSelectionSnapshot: selection.selectedInvoices.map((invoice) => ({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          outstandingAmount: toNumber(invoice.outstandingAmount),
          dueDate: invoice.dueDate,
        })),
        allocationPreviewSnapshot: selection.allocationPreview,
        createdByUserId: actorUserId,
        metadata: {
          redirectUrl: hostedCheckout.redirectUrl,
          flutterwaveIdempotencyKey: hostedCheckout.idempotencyKey,
        },
        selectedInvoices: {
          create: selection.selectedInvoices.map((invoice, index) => ({
            invoiceId: invoice.id,
            invoiceNumberSnapshot: invoice.invoiceNumber,
            invoiceOutstandingSnapshot: toNumber(invoice.outstandingAmount),
            sortOrder: index,
          })),
        },
      },
      include: {
        selectedInvoices: true,
        invoicePayment: true,
      },
    });

    return this.formatAttempt(attempt);
  }

  async listVendorAttempts({ vendorId, status = null, limit = 20 }) {
    const attempts = await prisma.paymentAttempt.findMany({
      where: {
        vendorId,
        ...(status ? { status } : {}),
      },
      include: {
        selectedInvoices: true,
        invoicePayment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(Number(limit || 20), 1), 100),
    });

    return attempts.map((attempt) => this.formatAttempt(attempt));
  }

  async getVendorAttemptDetail({ vendorId, attemptId }) {
    const attempt = await prisma.paymentAttempt.findFirst({
      where: {
        id: attemptId,
        vendorId,
      },
      include: {
        selectedInvoices: {
          include: {
            invoice: true,
          },
        },
        invoicePayment: {
          include: {
            allocations: true,
          },
        },
        webhookEvents: true,
      },
    });
    if (!attempt) {
      throw new Error('Payment attempt not found.');
    }
    return this.formatAttempt(attempt);
  }

  async getVendorAttemptStatus({ vendorId, attemptId }) {
    const attempt = await prisma.paymentAttempt.findFirst({
      where: {
        id: attemptId,
        vendorId,
      },
      select: {
        id: true,
        attemptReference: true,
        status: true,
        failureReason: true,
        mismatchReason: true,
        checkoutUrl: true,
        verifiedAt: true,
        updatedAt: true,
        invoicePaymentId: true,
      },
    });
    if (!attempt) {
      throw new Error('Payment attempt not found.');
    }
    return attempt;
  }

  async listAdminAttempts({ marketId = null, status = null, search = null, limit = 50 }) {
    const attempts = await prisma.paymentAttempt.findMany({
      where: {
        ...(marketId ? { marketId } : {}),
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { attemptReference: { contains: search, mode: 'insensitive' } },
                { providerTxRef: { contains: search, mode: 'insensitive' } },
                { providerTransactionId: { contains: search, mode: 'insensitive' } },
                { vendor: { businessName: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        vendor: true,
        selectedInvoices: true,
        invoicePayment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(Number(limit || 50), 1), 100),
    });

    return attempts.map((attempt) => this.formatAttempt(attempt));
  }

  async getAdminAttemptDetail({ attemptId, marketId = null }) {
    const attempt = await prisma.paymentAttempt.findFirst({
      where: {
        id: attemptId,
        ...(marketId ? { marketId } : {}),
      },
      include: {
        vendor: true,
        selectedInvoices: {
          include: { invoice: true },
        },
        invoicePayment: {
          include: {
            allocations: {
              include: {
                invoice: true,
              },
            },
          },
        },
        webhookEvents: true,
      },
    });
    if (!attempt) {
      throw new Error('Payment attempt not found.');
    }
    return this.formatAttempt(attempt);
  }

  async updateAttemptStatus({ attemptId, status, failureReason = null, mismatchReason = null, confirmedAmount = null, providerTransactionId = null }) {
    const existing = await prisma.paymentAttempt.findUnique({ where: { id: attemptId } });
    if (!existing) {
      throw new Error('Payment attempt not found.');
    }
    if (FINAL_ATTEMPT_STATUSES.includes(existing.status) && existing.status !== status) {
      throw new Error(`Cannot move finalized payment attempt from ${existing.status} to ${status}.`);
    }

    const updated = await prisma.paymentAttempt.update({
      where: { id: attemptId },
      data: {
        status,
        failureReason: failureReason || existing.failureReason,
        mismatchReason: mismatchReason || existing.mismatchReason,
        confirmedAmount: confirmedAmount == null ? existing.confirmedAmount : confirmedAmount,
        providerTransactionId: providerTransactionId || existing.providerTransactionId,
        redirectedAt: status === 'REDIRECTED' && !existing.redirectedAt ? new Date() : existing.redirectedAt,
        verifiedAt: status === 'SUCCESSFUL' && !existing.verifiedAt ? new Date() : existing.verifiedAt,
      },
      include: {
        selectedInvoices: true,
        invoicePayment: true,
      },
    });
    return this.formatAttempt(updated);
  }

  async findAttemptByReference(attemptReference) {
    return prisma.paymentAttempt.findUnique({
      where: { attemptReference },
      include: {
        selectedInvoices: true,
        invoicePayment: true,
      },
    });
  }
}

module.exports = new PaymentAttemptService();
