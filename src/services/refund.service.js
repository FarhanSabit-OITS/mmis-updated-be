const crypto = require('crypto');
const prisma = require('../prisma');

const toNumber = (value) => Number(value || 0);
const ALLOWED_REFUND_STATUSES = ['REQUESTED', 'APPROVED', 'PROCESSED', 'REJECTED'];

class RefundService {
  buildInternalReference() {
    return `RFD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }

  formatRefund(refund) {
    if (!refund) return null;
    return {
      ...refund,
      amount: toNumber(refund.amount),
      invoicePayment: refund.invoicePayment
        ? {
            ...refund.invoicePayment,
            amount: toNumber(refund.invoicePayment.amount),
          }
        : null,
    };
  }

  async listRefunds({ marketId = null, status = null, vendorId = null, limit = 50 }) {
    const refunds = await prisma.refundRecord.findMany({
      where: {
        ...(marketId ? { marketId } : {}),
        ...(status ? { status } : {}),
        ...(vendorId ? { vendorId } : {}),
      },
      include: {
        vendor: true,
        invoicePayment: true,
      },
      orderBy: { requestedAt: 'desc' },
      take: Math.min(Math.max(Number(limit || 50), 1), 100),
    });

    return refunds.map((refund) => this.formatRefund(refund));
  }

  async createRefundRecord({ invoicePaymentId, amount, reason, notes = null, actorUserId }) {
    if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
      throw new Error('Refund amount must be a whole-number UGX value greater than zero.');
    }
    if (!reason?.trim()) {
      throw new Error('Refund reason is required.');
    }

    const payment = await prisma.invoicePayment.findUnique({
      where: { id: invoicePaymentId },
      include: { vendor: true },
    });
    if (!payment) {
      throw new Error('Source invoice payment not found.');
    }
    if (payment.status !== 'CONFIRMED') {
      throw new Error('Refunds can only be recorded against confirmed payments.');
    }

    const existingRefunds = await prisma.refundRecord.findMany({
      where: {
        invoicePaymentId,
        status: { in: ['REQUESTED', 'APPROVED', 'PROCESSED'] },
      },
      select: { amount: true },
    });
    const alreadyTracked = existingRefunds.reduce((sum, refund) => sum + toNumber(refund.amount), 0);
    const nextAmount = Number(amount);
    if (alreadyTracked + nextAmount > toNumber(payment.amount)) {
      throw new Error('Refund amount exceeds the remaining refundable amount tracked for this payment.');
    }

    const refund = await prisma.refundRecord.create({
      data: {
        invoicePaymentId,
        vendorId: payment.vendorId,
        marketId: payment.marketId,
        amount: nextAmount,
        currencyCode: payment.currencyCode,
        status: 'REQUESTED',
        reason: reason.trim(),
        internalReference: this.buildInternalReference(),
        requestedByUserId: actorUserId,
        requestedAt: new Date(),
        notes: notes || null,
        metadata: {
          phase: 'MMIS_TRACKED_MANUAL_REFUND',
        },
      },
      include: {
        vendor: true,
        invoicePayment: true,
      },
    });

    return this.formatRefund(refund);
  }

  async updateRefundStatus({ refundId, status, notes = null, actorUserId, marketId = null }) {
    if (!ALLOWED_REFUND_STATUSES.includes(status)) {
      throw new Error('Invalid refund status.');
    }

    const refund = await prisma.refundRecord.findFirst({
      where: {
        id: refundId,
        ...(marketId ? { marketId } : {}),
      },
      include: {
        vendor: true,
        invoicePayment: true,
      },
    });
    if (!refund) {
      throw new Error('Refund record not found.');
    }

    const data = {
      status,
      notes: notes ? [refund.notes, notes].filter(Boolean).join('\n') : refund.notes,
    };

    if (status === 'APPROVED') {
      data.approvedAt = new Date();
      data.approvedByUserId = actorUserId;
    }
    if (status === 'PROCESSED') {
      data.processedAt = new Date();
      data.processedByUserId = actorUserId;
    }
    if (status === 'REJECTED') {
      data.approvedAt = null;
      data.processedAt = null;
    }

    const updated = await prisma.refundRecord.update({
      where: { id: refundId },
      data,
      include: {
        vendor: true,
        invoicePayment: true,
      },
    });

    return this.formatRefund(updated);
  }
}

module.exports = new RefundService();
