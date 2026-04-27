
const prisma = require('../prisma');
const { sendSystemEmail } = require('./email.service');
const { renderInvoicePdf } = require('../utils/pdf/invoice.jsx')

const toNumber = (value) => Number(value || 0);
const toDecimal = (value) => Number(toNumber(value).toFixed(2));
const monthKey = (date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};
const startOfMonthUtc = (year, month) => new Date(Date.UTC(year, month - 1, 1));
const endOfMonthUtc = (year, month) => new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
const parseMonthInput = (year, month) => ({
  year: Number(year),
  month: Number(month),
});
const addMonthsUtc = (date, offset) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
const issueDateForMonth = (year, month) => new Date(Date.UTC(year, month - 1, 1));
const dueDateForMonth = (year, month) => new Date(Date.UTC(year, month - 1, 10, 23, 59, 59, 999));
const generateRef = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

function calculateProratedAmount(monthlyRent, billingStartDate, targetYear, targetMonth) {
  const periodStart = startOfMonthUtc(targetYear, targetMonth);
  const periodEnd = endOfMonthUtc(targetYear, targetMonth);
  const start = billingStartDate > periodStart ? billingStartDate : periodStart;
  const daysInMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const billableDays = Math.max(0, Math.floor((periodEnd - start) / 86400000) + 1);
  const dailyRate = toNumber(monthlyRent) / daysInMonth;
  return {
    daysInMonth,
    billableDays,
    amount: toDecimal(dailyRate * billableDays),
    isProrated: billableDays > 0 && billableDays < daysInMonth,
  };
}

async function notifyUsers(userIds, payload) {
  if (!userIds.length) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      priority: payload.priority || 'MEDIUM',
      actionUrl: payload.actionUrl || null,
      actionLabel: payload.actionLabel || null,
      data: payload.data || null,
    })),
    skipDuplicates: false,
  });
}

async function emailUsers(users, payload) {
  await Promise.allSettled(users
    .filter((user) => user?.email)
    .map((user) => sendSystemEmail({
      to: user.email,
      subject: payload.subject,
      intro: payload.intro,
      actionUrl: payload.actionUrl,
      actionText: payload.actionText,
      outro: payload.outro,
      name: user.profile?.firstName || user.email.split('@')[0] || 'User',
      ctaTag: payload.ctaTag,
      heroTitle: payload.heroTitle,
    })));
}

class BillingService {
  async refreshOverdueStatuses(filters = {}) {
    await prisma.rentInvoice.updateMany({
      where: {
        dueDate: { lt: new Date() },
        outstandingAmount: { gt: 0 },
        status: { in: ['OPEN', 'PARTIALLY_PAID'] },
        ...(filters.vendorId ? { vendorId: filters.vendorId } : {}),
        ...(filters.marketId ? { marketId: filters.marketId } : {}),
      },
      data: {
        status: 'OVERDUE',
      },
    });
  }

  async getFallbackActorUserId(explicitUserId = null) {
    if (explicitUserId) return explicitUserId;
    const superAdmin = await prisma.user.findFirst({
      where: {
        userRoles: {
          some: {
            isActive: true,
            role: { name: 'SuperAdmin' },
          },
        },
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    if (superAdmin?.id) return superAdmin.id;
    const anyUser = await prisma.user.findFirst({ select: { id: true }, orderBy: { createdAt: 'asc' } });
    return anyUser?.id || null;
  }

  async getBillingRecipients(marketId) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            userRoles: {
              some: {
                isActive: true,
                role: { name: 'SuperAdmin' },
              },
            },
          },
          {
            admin: {
              marketMaster: {
                marketId,
              },
            },
          },
        ],
      },
      include: { profile: true },
    });
    const deduped = new Map(users.map((user) => [user.id, user]));
    return Array.from(deduped.values());
  }

  async resolveBillableContracts({ scopeType = 'ALL', scopeId = null, actorUserId = null }) {
    const paymentService = require('./payment.service');
    const effectiveActorUserId = await this.getFallbackActorUserId(actorUserId);
    if (scopeType === 'VENDOR' && scopeId) {
      await paymentService.bootstrapMissingRentContract(scopeId, effectiveActorUserId);
    }

    const contractWhere = {
      isActive: true,
      ...(scopeType === 'MARKET' && scopeId ? { shop: { marketId: scopeId } } : {}),
      ...(scopeType === 'VENDOR' && scopeId ? { tenantId: scopeId } : {}),
    };

    let contracts = await prisma.rentContract.findMany({
      where: contractWhere,
      include: {
        tenant: { include: { stakeholder: { include: { user: true } }, billingStatus: true } },
        shop: { include: { market: true } },
        payments: true,
      },
    });

    if (scopeType !== 'VENDOR') {
      const vendorWhere = scopeType === 'MARKET'
        ? { OR: [{ primaryMarketId: scopeId }, { stalls: { some: { marketId: scopeId } } }] }
        : {};
      const vendorsNeedingBackfill = await prisma.vendor.findMany({
        where: vendorWhere,
        include: {
          rentContracts: { where: { isActive: true } },
          stalls: {
            where: {
              status: { not: 'DELETED' },
              ...(scopeType === 'MARKET' && scopeId ? { marketId: scopeId } : {}),
            },
            include: { shop: true },
          },
        },
      });
      for (const vendor of vendorsNeedingBackfill) {
        if (!vendor.rentContracts.length && vendor.stalls.some((stall) => stall.shop)) {
          await paymentService.bootstrapMissingRentContract(vendor.id, effectiveActorUserId, scopeType === 'MARKET' ? scopeId : null);
        }
      }

      contracts = await prisma.rentContract.findMany({
        where: contractWhere,
        include: {
          tenant: { include: { stakeholder: { include: { user: true } }, billingStatus: true } },
          shop: { include: { market: true } },
          payments: true,
        },
      });
    }

    return contracts;
  }

  async ensureRentPaymentRow(contract, targetYear, targetMonth) {
    const targetKey = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    let rentPayment = contract.payments?.find((item) => monthKey(item.periodStart) === targetKey) || null;
    if (rentPayment) return rentPayment;

    rentPayment = await prisma.rentPayment.create({
      data: {
        contractId: contract.id,
        amount: contract.monthlyRent,
        periodStart: startOfMonthUtc(targetYear, targetMonth),
        periodEnd: endOfMonthUtc(targetYear, targetMonth),
        dueDate: dueDateForMonth(targetYear, targetMonth),
        paymentMethod: 'CASH',
        status: 'PENDING',
        notes: 'Created during invoice generation',
      },
    });

    contract.payments = [...(contract.payments || []), rentPayment];
    return rentPayment;
  }

  async computeInvoiceAmounts(contract, targetYear, targetMonth) {
    const periodStart = startOfMonthUtc(targetYear, targetMonth);
    const periodEnd = endOfMonthUtc(targetYear, targetMonth);
    const billingStartDate = new Date(Math.max(
      periodStart.getTime(),
      new Date(contract.startDate).getTime(),
      new Date(contract.shop?.contractStartDate || contract.startDate).getTime()
    ));
    const proration = calculateProratedAmount(contract.monthlyRent, billingStartDate, targetYear, targetMonth);
    const isFirstMonth = monthKey(billingStartDate) === `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    const baseRentAmount = toDecimal(contract.monthlyRent);
    const proratedAmount = isFirstMonth ? proration.amount : baseRentAmount;

    const priorInvoices = await prisma.rentInvoice.findMany({
      where: {
        rentContractId: contract.id,
        OR: [
          { billingYear: { lt: targetYear } },
          { billingYear: targetYear, billingMonth: { lt: targetMonth } },
        ],
        status: { in: ['OPEN', 'PARTIALLY_PAID', 'OVERDUE'] },
      },
      select: { outstandingAmount: true },
    });
    const arrearsAmount = toDecimal(priorInvoices.reduce((sum, item) => sum + toNumber(item.outstandingAmount), 0));

    const credits = await prisma.vendorCredit.findMany({
      where: {
        vendorId: contract.tenantId,
        status: { in: ['AVAILABLE', 'PARTIALLY_USED'] },
        amountRemaining: { gt: 0 },
      },
      orderBy: { createdAt: 'asc' },
    });
    const availableCredit = toDecimal(credits.reduce((sum, item) => sum + toNumber(item.amountRemaining), 0));

    const grossAmount = toDecimal(proratedAmount + arrearsAmount);
    const creditAppliedAmount = Math.min(grossAmount, availableCredit);
    return {
      periodStart,
      periodEnd,
      billingStartDate,
      baseRentAmount,
      proratedAmount,
      arrearsAmount,
      creditAppliedAmount: toDecimal(creditAppliedAmount),
      totalAmount: toDecimal(grossAmount - creditAppliedAmount),
      prorationMeta: proration,
      credits,
    };
  }

  async applyCreditsToInvoice(invoiceId, credits, amountToApply) {
    let remaining = toDecimal(amountToApply);
    for (const credit of credits) {
      if (remaining <= 0) break;
      const nextBalance = Math.max(0, toNumber(credit.amountRemaining) - remaining);
      const used = Math.min(toNumber(credit.amountRemaining), remaining);
      remaining = toDecimal(remaining - used);
      await prisma.vendorCredit.update({
        where: { id: credit.id },
        data: {
          amountRemaining: nextBalance,
          status: nextBalance <= 0 ? 'CONSUMED' : 'PARTIALLY_USED',
          metadata: {
            ...(credit.metadata || {}),
            lastAppliedInvoiceId: invoiceId,
          },
        },
      });
    }
  }

  async createOrRegenerateInvoiceForContract(contract, targetYear, targetMonth, options) {
    const existingInvoices = await prisma.rentInvoice.findMany({
      where: {
        rentContractId: contract.id,
        billingYear: targetYear,
        billingMonth: targetMonth,
      },
      orderBy: { invoiceVersion: 'desc' },
    });
    const activeExisting = existingInvoices.find((item) => !['SUPERSEDED', 'VOID'].includes(item.status));

    if (activeExisting && options.mode !== 'FORCE_REGENERATION') {
      return { result: 'SKIPPED_ALREADY_EXISTS', invoice: activeExisting, reason: 'Invoice already exists for contract/month.' };
    }

    const amounts = await this.computeInvoiceAmounts(contract, targetYear, targetMonth);
    const rentPayment = await this.ensureRentPaymentRow(contract, targetYear, targetMonth);
    const invoiceVersion = (existingInvoices[0]?.invoiceVersion || 0) + 1;
    const carriedForwardPaidAmount = activeExisting && options.mode === 'FORCE_REGENERATION'
      ? toDecimal(activeExisting.paidAmount)
      : 0;
    const effectiveCreditAppliedAmount = toDecimal(amounts.creditAppliedAmount + carriedForwardPaidAmount);
    const effectiveTotalAmount = Math.max(0, toDecimal(amounts.proratedAmount + amounts.arrearsAmount - effectiveCreditAppliedAmount));

    const invoice = await prisma.rentInvoice.create({
      data: {
        invoiceNumber: generateRef(`INV-${targetYear}${String(targetMonth).padStart(2, '0')}`),
        vendorId: contract.tenantId,
        marketId: contract.shop.marketId,
        rentContractId: contract.id,
        shopId: contract.shop.id,
        rentPaymentId: rentPayment.id,
        billingYear: targetYear,
        billingMonth: targetMonth,
        invoiceVersion,
        periodStart: amounts.periodStart,
        periodEnd: amounts.periodEnd,
        billingStartDate: amounts.billingStartDate,
        issueDate: issueDateForMonth(targetYear, targetMonth),
        dueDate: dueDateForMonth(targetYear, targetMonth),
        baseRentAmount: amounts.baseRentAmount,
        proratedAmount: amounts.proratedAmount,
        arrearsAmount: amounts.arrearsAmount,
        creditAppliedAmount: effectiveCreditAppliedAmount,
        totalAmount: effectiveTotalAmount,
        outstandingAmount: effectiveTotalAmount,
        status: effectiveTotalAmount <= 0 ? 'PAID' : 'OPEN',
        generationMode: options.mode,
        generationRunId: options.generationRunId,
        replacedInvoiceId: activeExisting?.id || null,
        isForcedRegeneration: options.mode === 'FORCE_REGENERATION',
        notes: options.reason || null,
        metadata: {
          scopeType: options.scopeType,
          scopeId: options.scopeId || null,
          proration: amounts.prorationMeta,
          carriedForwardPaidAmount,
        },
        lineItems: {
          create: [
            {
              lineType: amounts.prorationMeta.isProrated ? 'PRORATED_RENT' : 'MONTHLY_RENT',
              description: amounts.prorationMeta.isProrated
                ? `Prorated rent for ${contract.shop.shopNumber} billed from ${amounts.billingStartDate.toISOString().slice(0, 10)}`
                : `Monthly rent for ${contract.shop.shopNumber}`,
              periodStart: amounts.periodStart,
              periodEnd: amounts.periodEnd,
              quantity: 1,
              unitAmount: amounts.proratedAmount,
              lineAmount: amounts.proratedAmount,
              sortOrder: 1,
              metadata: {
                billingStartDate: amounts.billingStartDate,
                daysInMonth: amounts.prorationMeta.daysInMonth,
                billableDays: amounts.prorationMeta.billableDays,
              },
            },
            ...(amounts.arrearsAmount > 0 ? [{
              lineType: 'ARREARS',
              description: 'Outstanding arrears carried forward',
              lineAmount: amounts.arrearsAmount,
              sortOrder: 2,
            }] : []),
            ...(amounts.creditAppliedAmount > 0 ? [{
              lineType: 'CREDIT_APPLIED',
              description: 'Available vendor credit applied',
              lineAmount: -Math.abs(amounts.creditAppliedAmount),
              sortOrder: 3,
            }] : []),
            ...(carriedForwardPaidAmount > 0 ? [{
              lineType: 'ADJUSTMENT',
              description: 'Previously approved payments preserved from superseded invoice',
              lineAmount: -Math.abs(carriedForwardPaidAmount),
              sortOrder: 4,
            }] : []),
          ],
        },
      },
      include: {
        lineItems: true,
        vendor: { include: { stakeholder: { include: { user: true } } } },
        shop: true,
      },
    });

    if (activeExisting && options.mode === 'FORCE_REGENERATION') {
      await prisma.rentInvoice.update({
        where: { id: activeExisting.id },
        data: {
          status: 'SUPERSEDED',
          notes: [activeExisting.notes, `Superseded by ${invoice.id}`].filter(Boolean).join('\n'),
        },
      });
    }

    if (amounts.creditAppliedAmount > 0) {
      await this.applyCreditsToInvoice(invoice.id, amounts.credits, amounts.creditAppliedAmount);
    }

    await this.dispatchInvoiceGeneratedNotifications(invoice, activeExisting ? 'invoice.regenerated' : 'invoice.generated');
    return {
      result: activeExisting && options.mode === 'FORCE_REGENERATION' ? 'REGENERATED' : 'CREATED',
      invoice,
      reason: null,
    };
  }

  async dispatchInvoiceGeneratedNotifications(invoice, eventType) {
    const recipients = await this.getBillingRecipients(invoice.marketId);
    const recipientIds = recipients.map((user) => user.id);
    const vendorUserId = invoice.vendor?.stakeholder?.user?.id;
    if (vendorUserId) recipientIds.push(vendorUserId);
    const dedupedIds = Array.from(new Set(recipientIds));

    const title = eventType === 'invoice.regenerated' ? 'Rent invoice regenerated' : 'Rent invoice generated';
    const message = `${invoice.vendor.businessName} has a ${toNumber(invoice.totalAmount).toLocaleString()} UGX invoice for ${invoice.billingYear}-${String(invoice.billingMonth).padStart(2, '0')}.`;

    await notifyUsers(dedupedIds, {
      type: eventType,
      title,
      message,
      actionUrl: `/payments-admin`,
      actionLabel: 'View invoice',
      data: {
        invoiceId: invoice.id,
        vendorId: invoice.vendorId,
      },
    });

    await emailUsers([...recipients, invoice.vendor.stakeholder.user], {
      subject: title,
      intro: message,
      actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`,
      actionText: 'Open MMIS',
      outro: `Invoice ${invoice.invoiceNumber} is due on ${new Date(invoice.dueDate).toLocaleDateString('en-UG')}.`,
      ctaTag: 'Billing',
      heroTitle: title,
    });
  }

  async runInvoiceGeneration({ targetMonth, targetYear, scopeType = 'ALL', scopeId = null, mode = 'AUTOMATIC', reason = null, triggeredByUserId = null }) {
    const { month, year } = parseMonthInput(targetYear, targetMonth);
    const generationRun = await prisma.invoiceGenerationRun.create({
      data: {
        runMonth: month,
        runYear: year,
        scopeType,
        scopeId,
        triggerType: mode,
        triggeredByUserId,
        reason,
      },
    });

    const summary = { created: 0, skipped: 0, regenerated: 0, failed: 0 };
    try {
      const contracts = await this.resolveBillableContracts({ scopeType, scopeId, actorUserId: triggeredByUserId });
      for (const contract of contracts) {
        try {
          const result = await this.createOrRegenerateInvoiceForContract(contract, year, month, {
            mode,
            reason,
            generationRunId: generationRun.id,
            scopeType,
            scopeId,
          });
          if (result.result === 'CREATED') summary.created += 1;
          else if (result.result === 'REGENERATED') summary.regenerated += 1;
          else summary.skipped += 1;
          await prisma.invoiceGenerationRunItem.create({
            data: {
              generationRunId: generationRun.id,
              vendorId: contract.tenantId,
              rentContractId: contract.id,
              invoiceId: result.invoice?.id || null,
              result: result.result,
              reason: result.reason,
            },
          });
        } catch (error) {
          summary.failed += 1;
          await prisma.invoiceGenerationRunItem.create({
            data: {
              generationRunId: generationRun.id,
              vendorId: contract.tenantId,
              rentContractId: contract.id,
              result: 'FAILED',
              reason: error.message,
            },
          });
        }
      }

      const status = summary.failed > 0 ? (summary.created || summary.regenerated ? 'PARTIAL_FAILURE' : 'FAILED') : 'COMPLETED';
      return prisma.invoiceGenerationRun.update({
        where: { id: generationRun.id },
        data: {
          status,
          completedAt: new Date(),
          summaryJson: summary,
        },
        include: {
          items: true,
        },
      });
    } catch (error) {
      await prisma.invoiceGenerationRun.update({
        where: { id: generationRun.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          summaryJson: { ...summary, error: error.message },
        },
      });
      throw error;
    }
  }

  async listGenerationRuns(filters = {}) {
    return prisma.invoiceGenerationRun.findMany({
      where: {
        ...(filters.year ? { runYear: Number(filters.year) } : {}),
        ...(filters.month ? { runMonth: Number(filters.month) } : {}),
        ...(filters.scopeType ? { scopeType: filters.scopeType } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { startedAt: 'desc' },
      include: {
        items: true,
      },
    });
  }

  async getGenerationRun(id) {
    const run = await prisma.invoiceGenerationRun.findUnique({
      where: { id },
      include: { items: true, invoices: true },
    });
    if (!run) throw new Error('Generation run not found');
    return run;
  }

  async listInvoices(filters = {}) {
    await this.refreshOverdueStatuses(filters);
    return prisma.rentInvoice.findMany({
      where: {
        ...(filters.vendorId ? { vendorId: filters.vendorId } : {}),
        ...(filters.marketId ? { marketId: filters.marketId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.year ? { billingYear: Number(filters.year) } : {}),
        ...(filters.month ? { billingMonth: Number(filters.month) } : {}),
      },
      include: {
        vendor: { include: { stakeholder: { include: { user: true } }, billingStatus: true } },
        shop: true,
        lineItems: true,
        allocations: true,
      },
      orderBy: [{ billingYear: 'desc' }, { billingMonth: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getInvoiceById(invoiceId) {
    await this.refreshOverdueStatuses();
    const invoice = await prisma.rentInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        vendor: { include: { stakeholder: { include: { user: true } }, billingStatus: true } },
        market: true,
        shop: true,
        rentContract: true,
        lineItems: true,
        paymentClaims: true,
        allocations: {
          include: {
            payment: true,
          },
        },
        replacedInvoice: true,
        replacementInvoices: true,
      },
    });
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }

  async generateInvoicePdf(invoiceId) {
    const invoice = await this.getInvoiceById(invoiceId);
    
    return {
      fileName: `${invoice.invoiceNumber || `invoice-${invoice.id}`}.pdf`,
      buffer: await renderInvoicePdf(invoice),
      invoice,
    };
  }

  async uploadClaimDocument({ vendorId, uploadedById, file }) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { stakeholder: true },
    });
    if (!vendor?.stakeholderId) throw new Error('Vendor not found');

    const path = require('path');
    const fs = require('fs');
    const uploadDir = path.join(process.cwd(), 'uploads', 'payment-claims');
    fs.mkdirSync(uploadDir, { recursive: true });
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fullPath = path.join(uploadDir, safeName);
    await file.mv(fullPath);

    return prisma.document.create({
      data: {
        stakeholderId: vendor.stakeholderId,
        documentType: 'OTHER',
        fileName: file.name,
        fileUrl: `/uploads/payment-claims/${safeName}`,
        fileSize: file.size,
        mimeType: file.mimetype || 'application/octet-stream',
        uploadedById,
        metadata: {
          vendorId,
          purpose: 'PAYMENT_CLAIM_PROOF',
        },
      },
    });
  }

  async createPaymentClaim({ vendorId, amount, paymentDate, paymentMethod, claimedForInvoiceId, claimedForBillingMonth, externalReference, notes, submittedByUserId, proofFile }) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        stakeholder: { include: { user: true } },
        primaryMarket: true,
        rentContracts: {
          where: { isActive: true },
          include: { shop: true },
        },
      },
    });
    if (!vendor) throw new Error('Vendor not found');
    const claimedInvoice = claimedForInvoiceId
      ? await prisma.rentInvoice.findUnique({ where: { id: claimedForInvoiceId } })
      : null;
    const resolvedMarketId = vendor.primaryMarketId || claimedInvoice?.marketId || vendor.rentContracts[0]?.shop?.marketId;
    if (!resolvedMarketId) {
      throw new Error('Vendor market could not be resolved for payment claim');
    }
    const proofDocument = proofFile ? await this.uploadClaimDocument({ vendorId, uploadedById: submittedByUserId, file: proofFile }) : null;
    const claim = await prisma.paymentClaim.create({
      data: {
        vendorId,
        marketId: resolvedMarketId,
        claimReference: generateRef('PCL'),
        amount,
        paymentDate: new Date(paymentDate),
        paymentMethod,
        claimedForInvoiceId: claimedForInvoiceId || null,
        claimedForBillingMonth: claimedForBillingMonth || null,
        externalReference: externalReference || null,
        notes: notes || null,
        proofDocumentId: proofDocument?.id || null,
        submittedByUserId,
        status: 'SUBMITTED',
      },
      include: {
        claimedForInvoice: true,
        proofDocument: true,
      },
    });

    const recipients = await this.getBillingRecipients(claim.marketId);
    const recipientIds = Array.from(new Set([...recipients.map((user) => user.id), vendor.stakeholder.user.id]));
    await notifyUsers(recipientIds, {
      type: 'payment_claim.submitted',
      title: 'Payment claim submitted',
      message: `${vendor.businessName} submitted a payment claim for ${toNumber(amount).toLocaleString()} UGX.`,
      actionUrl: '/payments-admin',
      actionLabel: 'Review claim',
      data: { paymentClaimId: claim.id, vendorId },
    });
    await emailUsers([...recipients, vendor.stakeholder.user], {
      subject: 'Payment claim submitted',
      intro: `${vendor.businessName} submitted a payment claim for ${toNumber(amount).toLocaleString()} UGX.`,
      actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`,
      actionText: 'Open MMIS',
      outro: claim.claimedForBillingMonth ? `Claimed billing month: ${claim.claimedForBillingMonth}` : undefined,
      ctaTag: 'Billing',
      heroTitle: 'Payment claim submitted',
    });

    return claim;
  }

  async listPaymentClaims(filters = {}) {
    return prisma.paymentClaim.findMany({
      where: {
        ...(filters.vendorId ? { vendorId: filters.vendorId } : {}),
        ...(filters.marketId ? { marketId: filters.marketId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: {
        vendor: { include: { stakeholder: { include: { user: true } } } },
        claimedForInvoice: true,
        proofDocument: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentClaim(id) {
    const claim = await prisma.paymentClaim.findUnique({
      where: { id },
      include: {
        vendor: { include: { stakeholder: { include: { user: true } } } },
        claimedForInvoice: true,
        proofDocument: true,
      },
    });
    if (!claim) throw new Error('Payment claim not found');
    return claim;
  }

  async refreshInvoiceState(invoiceId) {
    const invoice = await prisma.rentInvoice.findUnique({
      where: { id: invoiceId },
      include: { allocations: true },
    });
    if (!invoice) return null;
    const paidAmount = toDecimal(invoice.allocations.reduce((sum, item) => sum + toNumber(item.allocatedAmount), 0));
    const outstandingAmount = Math.max(0, toDecimal(toNumber(invoice.totalAmount) - paidAmount));
    let status = 'OPEN';
    if (outstandingAmount <= 0) status = 'PAID';
    else if (paidAmount > 0) status = 'PARTIALLY_PAID';
    else if (new Date(invoice.dueDate) < new Date()) status = 'OVERDUE';
    return prisma.rentInvoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount,
        outstandingAmount,
        status,
      },
    });
  }

  async updateRentPaymentFromInvoice(invoiceId) {
    const invoice = await prisma.rentInvoice.findUnique({
      where: { id: invoiceId },
      include: { rentPayment: true },
    });
    if (!invoice?.rentPaymentId) return;
    let nextStatus = 'PENDING';
    if (toNumber(invoice.outstandingAmount) <= 0) nextStatus = 'PAID';
    else if (new Date(invoice.dueDate) < new Date()) nextStatus = 'OVERDUE';
    await prisma.rentPayment.update({
      where: { id: invoice.rentPaymentId },
      data: {
        status: nextStatus,
        paymentDate: toNumber(invoice.outstandingAmount) <= 0 ? new Date() : invoice.rentPayment.paymentDate,
      },
    });
  }

  async allocatePaymentToInvoices(payment, vendorId, allocationOptions = null) {
    const normalizedOptions = typeof allocationOptions === 'string'
      ? { explicitInvoiceId: allocationOptions, selectedInvoiceIds: null, restrictToSelected: false }
      : {
          explicitInvoiceId: allocationOptions?.explicitInvoiceId || null,
          selectedInvoiceIds: allocationOptions?.selectedInvoiceIds || null,
          restrictToSelected: Boolean(allocationOptions?.restrictToSelected),
        };
    let remaining = toDecimal(payment.amount);
    const allocations = [];
    const invoices = await prisma.rentInvoice.findMany({
      where: {
        vendorId,
        status: { in: ['OPEN', 'PARTIALLY_PAID', 'OVERDUE'] },
        ...(normalizedOptions.selectedInvoiceIds?.length
          ? normalizedOptions.restrictToSelected
            ? { id: { in: normalizedOptions.selectedInvoiceIds } }
            : {}
          : {}),
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    });

    let orderedInvoices = invoices;
    if (normalizedOptions.selectedInvoiceIds?.length) {
      const selectedOrder = new Map(normalizedOptions.selectedInvoiceIds.map((id, index) => [id, index]));
      const selectedInvoices = invoices
        .filter((invoice) => selectedOrder.has(invoice.id))
        .sort((a, b) => {
          const aIdx = selectedOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
          const bIdx = selectedOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
          if (aIdx !== bIdx) return aIdx - bIdx;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });

      orderedInvoices = normalizedOptions.restrictToSelected
        ? selectedInvoices
        : [
            ...selectedInvoices,
            ...invoices.filter((invoice) => !selectedOrder.has(invoice.id)),
          ];
    }

    if (normalizedOptions.explicitInvoiceId) {
      orderedInvoices = [
        ...orderedInvoices.filter((invoice) => invoice.id === normalizedOptions.explicitInvoiceId),
        ...orderedInvoices.filter((invoice) => invoice.id !== normalizedOptions.explicitInvoiceId),
      ];
    }

    for (const invoice of orderedInvoices) {
      if (remaining <= 0) break;
      const allocatable = Math.min(remaining, toNumber(invoice.outstandingAmount));
      if (allocatable <= 0) continue;
      const allocation = await prisma.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          invoiceId: invoice.id,
          allocatedAmount: allocatable,
        },
      });
      allocations.push(allocation);
      remaining = toDecimal(remaining - allocatable);
      await this.refreshInvoiceState(invoice.id);
      await this.updateRentPaymentFromInvoice(invoice.id);
    }

    if (remaining > 0) {
      await prisma.vendorCredit.create({
        data: {
          vendorId,
          marketId: payment.marketId,
          sourcePaymentId: payment.id,
          amountRemaining: remaining,
          status: 'AVAILABLE',
          notes: 'Automatically created from overpayment',
        },
      });
    }

    return { allocations, remainingCredit: remaining };
  }

  async createCompatibilityTransactionsForAllocations(payment, allocations, actorUserId) {
    for (const allocation of allocations) {
      const invoice = await prisma.rentInvoice.findUnique({
        where: { id: allocation.invoiceId },
        include: { vendor: { include: { stakeholder: true } }, shop: true, rentPayment: true },
      });
      if (!invoice?.vendor?.stakeholderId || !invoice.rentPaymentId) continue;
      await prisma.transaction.create({
        data: {
          stakeholderId: invoice.vendor.stakeholderId,
          type: 'RENT_PAYMENT',
          amount: allocation.allocatedAmount,
          status: 'COMPLETED',
          referenceId: `alloc-${allocation.id}`,
          externalReference: payment.providerReference || payment.id,
          paymentMethod: payment.paymentMethod,
          paymentGateway: payment.provider || null,
          metadata: {
            vendorId: invoice.vendorId,
            vendorName: invoice.vendor.businessName,
            contractId: invoice.rentContractId,
            rentPaymentId: invoice.rentPaymentId,
            marketId: invoice.marketId,
            shopNumber: invoice.shop.shopNumber,
            periodLabel: `${invoice.billingYear}-${String(invoice.billingMonth).padStart(2, '0')}`,
            documentId: payment.documentId || null,
            invoiceId: invoice.id,
            paymentId: payment.id,
            enteredByUserId: actorUserId,
          },
        },
      });
    }
  }

  async evaluateVendorBillingStatus(vendorId) {
    const invoices = await prisma.rentInvoice.findMany({
      where: {
        vendorId,
        status: { not: 'SUPERSEDED' },
      },
      orderBy: [{ billingYear: 'desc' }, { billingMonth: 'desc' }],
    });

    const monthSummary = new Map();
    for (const invoice of invoices) {
      const key = `${invoice.billingYear}-${String(invoice.billingMonth).padStart(2, '0')}`;
      if (!monthSummary.has(key)) {
        monthSummary.set(key, { totalPaid: 0, invoiceCount: 0 });
      }
      const current = monthSummary.get(key);
      current.totalPaid += toNumber(invoice.paidAmount);
      current.invoiceCount += 1;
    }

    const months = Array.from(monthSummary.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    let streak = 0;
    for (const [, value] of months) {
      if (value.invoiceCount > 0 && value.totalPaid <= 0) streak += 1;
      else break;
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { primaryMarket: true },
    });
    const billingAccessState = streak >= 3 ? 'BILLING_ONLY_RESTRICTED' : 'ACTIVE';
    const adminContacts = await this.getBillingRecipients(vendor?.primaryMarketId || null);
    const contactEmail = adminContacts.find((user) => user.email)?.email || null;
    const contactPhone = adminContacts.find((user) => user.phone)?.phone || null;

    const status = await prisma.vendorBillingStatus.upsert({
      where: { vendorId },
      update: {
        billingAccessState,
        restrictionReason: billingAccessState === 'BILLING_ONLY_RESTRICTED' ? 'Three consecutive invoice months with zero approved payment.' : null,
        restrictedAt: billingAccessState === 'BILLING_ONLY_RESTRICTED' ? new Date() : null,
        unrestrictedAt: billingAccessState === 'ACTIVE' ? new Date() : null,
        consecutiveZeroPaymentMonths: streak,
        lastEvaluatedMonth: months[0]?.[0] || null,
        contactAdminEmail: contactEmail,
        contactAdminPhone: contactPhone,
      },
      create: {
        vendorId,
        billingAccessState,
        restrictionReason: billingAccessState === 'BILLING_ONLY_RESTRICTED' ? 'Three consecutive invoice months with zero approved payment.' : null,
        restrictedAt: billingAccessState === 'BILLING_ONLY_RESTRICTED' ? new Date() : null,
        unrestrictedAt: billingAccessState === 'ACTIVE' ? new Date() : null,
        consecutiveZeroPaymentMonths: streak,
        lastEvaluatedMonth: months[0]?.[0] || null,
        contactAdminEmail: contactEmail,
        contactAdminPhone: contactPhone,
      },
    });

    return status;
  }

  async approvePaymentClaim(paymentClaimId, { notes = null, explicitInvoiceId = null }, actorUserId) {
    const claim = await this.getPaymentClaim(paymentClaimId);
    if (claim.status !== 'SUBMITTED' && claim.status !== 'UNDER_REVIEW') {
      throw new Error('Only submitted payment claims can be approved');
    }

    const payment = await prisma.invoicePayment.create({
      data: {
        vendorId: claim.vendorId,
        marketId: claim.marketId,
        paymentClaimId: claim.id,
        amount: claim.amount,
        currencyCode: claim.currencyCode,
        paymentMethod: claim.paymentMethod,
        paymentChannel: 'OFFLINE_CLAIM',
        status: 'CONFIRMED',
        paymentDate: claim.paymentDate,
        recordedByUserId: actorUserId,
        approvedByUserId: actorUserId,
        documentId: claim.proofDocumentId,
        notes,
        metadata: {
          externalReference: claim.externalReference,
          claimedForBillingMonth: claim.claimedForBillingMonth,
        },
      },
    });

    const allocationResult = await this.allocatePaymentToInvoices(payment, claim.vendorId, explicitInvoiceId || claim.claimedForInvoiceId);
    await this.createCompatibilityTransactionsForAllocations(payment, allocationResult.allocations, actorUserId);

    await prisma.paymentClaim.update({
      where: { id: claim.id },
      data: {
        status: 'APPROVED',
        reviewedByUserId: actorUserId,
        reviewedAt: new Date(),
        notes: [claim.notes, notes].filter(Boolean).join('\n'),
      },
    });

    const billingStatus = await this.evaluateVendorBillingStatus(claim.vendorId);
    const vendorUser = claim.vendor.stakeholder.user;
    const recipients = await this.getBillingRecipients(claim.marketId);
    const recipientIds = Array.from(new Set([...recipients.map((user) => user.id), vendorUser.id]));
    await notifyUsers(recipientIds, {
      type: 'payment_claim.approved',
      title: 'Payment claim approved',
      message: `${claim.vendor.businessName} payment claim for ${toNumber(claim.amount).toLocaleString()} UGX was approved.`,
      actionUrl: '/payments-admin',
      actionLabel: 'View payments',
      data: { paymentClaimId: claim.id, paymentId: payment.id },
    });
    await emailUsers([...recipients, vendorUser], {
      subject: 'Payment claim approved',
      intro: `${claim.vendor.businessName} payment claim for ${toNumber(claim.amount).toLocaleString()} UGX has been approved.`,
      actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`,
      actionText: 'Open MMIS',
      outro: billingStatus.billingAccessState === 'BILLING_ONLY_RESTRICTED'
        ? 'Vendor remains restricted to billing pages until payment behavior improves.'
        : 'Invoice balances were updated automatically.',
      ctaTag: 'Billing',
      heroTitle: 'Payment claim approved',
    });

    return {
      payment,
      allocations: allocationResult.allocations,
      remainingCredit: allocationResult.remainingCredit,
      billingStatus,
    };
  }

  async rejectPaymentClaim(paymentClaimId, { reason }, actorUserId) {
    const claim = await this.getPaymentClaim(paymentClaimId);
    const updated = await prisma.paymentClaim.update({
      where: { id: paymentClaimId },
      data: {
        status: 'REJECTED',
        reviewedByUserId: actorUserId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });
    const recipients = await this.getBillingRecipients(claim.marketId);
    const vendorUser = claim.vendor.stakeholder.user;
    const recipientIds = Array.from(new Set([...recipients.map((user) => user.id), vendorUser.id]));
    await notifyUsers(recipientIds, {
      type: 'payment_claim.rejected',
      title: 'Payment claim rejected',
      message: `${claim.vendor.businessName} payment claim was rejected.`,
      actionUrl: '/payments-admin',
      actionLabel: 'Review claim',
      data: { paymentClaimId: claim.id },
    });
    await emailUsers([...recipients, vendorUser], {
      subject: 'Payment claim rejected',
      intro: `${claim.vendor.businessName} payment claim was rejected.`,
      actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`,
      actionText: 'Open MMIS',
      outro: reason,
      ctaTag: 'Billing',
      heroTitle: 'Payment claim rejected',
    });
    return updated;
  }

  async syncInvoiceAfterLegacyPayment({ vendorId, rentPaymentId, actorUserId, paymentDate, amount, paymentMethod, transactionId, documentId, notes }) {
    const rentPayment = await prisma.rentPayment.findUnique({
      where: { id: rentPaymentId },
      include: {
        contract: {
          include: {
            shop: true,
            tenant: true,
          },
        },
      },
    });
    if (!rentPayment?.contract) return null;

    const billingYear = new Date(rentPayment.periodStart).getUTCFullYear();
    const billingMonth = new Date(rentPayment.periodStart).getUTCMonth() + 1;
    const existingInvoice = await prisma.rentInvoice.findFirst({
      where: {
        rentPaymentId,
        status: { not: 'SUPERSEDED' },
      },
      orderBy: { invoiceVersion: 'desc' },
    });

    let invoice = existingInvoice;
    if (!invoice) {
      const created = await this.createOrRegenerateInvoiceForContract({
        ...rentPayment.contract,
        payments: [rentPayment],
      }, billingYear, billingMonth, {
        mode: 'MANUAL',
        reason: 'Auto-created while syncing legacy admin payment',
        generationRunId: null,
        scopeType: 'VENDOR',
        scopeId: vendorId,
      });
      invoice = created.invoice;
    }

    const payment = await prisma.invoicePayment.create({
      data: {
        vendorId,
        marketId: rentPayment.contract.shop.marketId,
        amount,
        currencyCode: 'UGX',
        paymentMethod,
        paymentChannel: 'OFFLINE_CLAIM',
        providerReference: transactionId || null,
        status: 'CONFIRMED',
        paymentDate: new Date(paymentDate || new Date()),
        recordedByUserId: actorUserId,
        approvedByUserId: actorUserId,
        documentId: documentId || null,
        notes: notes || 'Synced from legacy admin rent payment recording',
        metadata: {
          legacyRentPaymentId: rentPaymentId,
        },
      },
    });
    await prisma.paymentAllocation.create({
      data: {
        paymentId: payment.id,
        invoiceId: invoice.id,
        allocatedAmount: amount,
      },
    });
    await this.refreshInvoiceState(invoice.id);
    await this.updateRentPaymentFromInvoice(invoice.id);
    await this.evaluateVendorBillingStatus(vendorId);
    return payment;
  }
}

module.exports = new BillingService();
