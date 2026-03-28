const prisma = require('../prisma');

const toNumber = (value) => Number(value || 0);
const startOfMonthUtc = (input) => {
  const date = input ? new Date(input) : new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
};
const endOfMonthUtc = (input) => {
  const date = input ? new Date(input) : new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
};
const monthKeyFromDate = (date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};
const normalizePeriodMonth = (input) => {
  if (!input) return null;
  if (input instanceof Date) return startOfMonthUtc(input);
  if (/^\d{4}-\d{2}$/.test(input)) return startOfMonthUtc(`${input}-01`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return startOfMonthUtc(input);
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(input)) {
    const [y, m, d] = input.split('/');
    return startOfMonthUtc(`${y}-${m}-${d}`);
  }
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : startOfMonthUtc(parsed);
};

class PaymentService {
  async getAdminPaymentCollections(marketId, dateRange = null) {
    const txWhere = {
      type: 'RENT_PAYMENT',
      status: 'COMPLETED',
      ...(marketId ? { metadata: { path: ['marketId'], equals: marketId } } : {})
    };

    if (dateRange?.start && dateRange?.end) {
      txWhere.createdAt = {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end),
      };
    }

    const [transactions, duePayments, paidThisMonth] = await Promise.all([
      prisma.transaction.findMany({
        where: txWhere,
        orderBy: { createdAt: 'desc' },
        include: {
          stakeholder: { include: { user: true, vendor: true } }
        }
      }),
      prisma.rentPayment.findMany({
        where: {
          contract: {
            ...(marketId ? { shop: { marketId } } : {})
          }
        },
        include: {
          contract: {
            include: {
              tenant: true,
              shop: { include: { market: true } }
            }
          }
        }
      }),
      prisma.transaction.findMany({
        where: {
          type: 'RENT_PAYMENT',
          status: 'COMPLETED',
          createdAt: {
            gte: startOfMonthUtc(),
            lte: endOfMonthUtc(),
          },
          ...(marketId ? { metadata: { path: ['marketId'], equals: marketId } } : {})
        }
      })
    ]);

    const obligations = await this.enrichRentPayments(duePayments);
    const totalRevenue = transactions.reduce((sum, tx) => sum + toNumber(tx.amount), 0);
    const monthlyRevenue = paidThisMonth.reduce((sum, tx) => sum + toNumber(tx.amount), 0);
    const pendingPayments = obligations.filter((item) => item.status === 'PENDING').reduce((sum, item) => sum + item.outstandingAmount, 0);
    const overduePayments = obligations.filter((item) => item.status === 'OVERDUE').reduce((sum, item) => sum + item.outstandingAmount, 0);
    const expectedPayments = obligations.reduce((sum, item) => sum + item.amount, 0);
    const vendorTotals = new Map();

    for (const tx of transactions) {
      const vendorId = tx.metadata?.vendorId || tx.stakeholder?.vendor?.id || tx.stakeholderId;
      const vendorName = tx.metadata?.vendorName || tx.stakeholder?.vendor?.businessName || tx.stakeholder?.user?.email || 'Unknown Vendor';
      const current = vendorTotals.get(vendorId) || { vendorId, vendorName, totalPaid: 0 };
      current.totalPaid += toNumber(tx.amount);
      vendorTotals.set(vendorId, current);
    }

    const recentPayments = transactions.slice(0, 10).map((tx) => ({
      id: tx.id,
      type: 'RENT',
      amount: toNumber(tx.amount),
      paymentDate: tx.createdAt,
      status: 'PAID',
      method: tx.paymentMethod || 'CASH',
      transactionId: tx.externalReference || tx.referenceId || tx.id,
      description: tx.metadata?.description || `Rent payment for ${tx.metadata?.periodLabel || 'scheduled period'}`,
      reference: tx.externalReference || tx.referenceId || tx.id,
    }));

    return {
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      overduePayments,
      collectionRate: expectedPayments > 0 ? (totalRevenue / expectedPayments) * 100 : 100,
      topPayingVendors: Array.from(vendorTotals.values()).sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 5),
      recentPayments,
    };
  }

  async getOutstandingPayments(marketId) {
    const duePayments = await prisma.rentPayment.findMany({
      where: {
        contract: {
          ...(marketId ? { shop: { marketId } } : {})
        }
      },
      include: {
        contract: {
          include: {
            tenant: true,
            shop: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const obligations = await this.enrichRentPayments(duePayments);
    return obligations
      .filter((item) => item.outstandingAmount > 0)
      .map((item) => ({
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        shopNumber: item.shopNumber,
        amountDue: item.outstandingAmount,
        dueDate: item.dueDate,
        daysOverdue: item.daysOverdue,
        paymentType: 'RENT',
        status: item.status,
        periodLabel: item.periodLabel,
      }));
  }

  async getScopedVendorsWithPayments(marketId = null, pagination = {}) {
    const page = Math.max(Number(pagination.page || 1), 1);
    const limit = Math.min(Math.max(Number(pagination.limit || 20), 1), 100);
    const search = pagination.search?.trim();
    const vendorWhere = {
      ...(marketId ? { primaryMarketId: marketId } : {}),
      ...(search ? {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { vendorCode: { contains: search, mode: 'insensitive' } },
          { stakeholder: { user: { email: { contains: search, mode: 'insensitive' } } } }
        ]
      } : {})
    };

    const [vendors, totalCount] = await Promise.all([
      prisma.vendor.findMany({
        where: vendorWhere,
        include: {
          primaryMarket: true,
          stakeholder: { include: { user: true } },
          rentContracts: {
            where: { isActive: true },
            include: {
              shop: { include: { market: true } },
              payments: true
            }
          }
        },
        orderBy: { businessName: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.vendor.count({ where: vendorWhere })
    ]);

    const rows = await Promise.all(vendors.map(async (vendor) => {
      const ledger = await this.getVendorPaymentSummary(vendor.id, marketId);
      const firstContractMarket = vendor.rentContracts.find((contract) => contract.shop?.market)?.shop?.market;
      return {
        vendorId: vendor.id,
        vendorCode: vendor.vendorCode,
        vendorName: vendor.businessName,
        marketId: vendor.primaryMarketId || firstContractMarket?.id || null,
        marketName: vendor.primaryMarket?.name || firstContractMarket?.name || 'Unknown Market',
        shopNumbers: vendor.rentContracts.map((contract) => contract.shop?.shopNumber).filter(Boolean),
        totalOutstanding: ledger.totalOutstanding,
        totalPaid: ledger.totalPaid,
        overdueAmount: ledger.totalOverdue,
        pendingAmount: ledger.totalPending,
        paymentStatus: ledger.totalOutstanding > 0 ? (ledger.totalOverdue > 0 ? 'OVERDUE' : 'PENDING') : 'PAID',
      };
    }));

    return {
      rows,
      pagination: {
        currentPage: page,
        totalPages: Math.max(Math.ceil(totalCount / limit), 1),
        totalCount,
        limit,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    };
  }

  async getVendorPaymentSummary(vendorId, marketScopeId = null) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        primaryMarket: true,
        stakeholder: { include: { user: true } },
        rentContracts: {
          where: {
            isActive: true,
            ...(marketScopeId ? { shop: { marketId: marketScopeId } } : {}),
          },
          include: {
            shop: true,
            payments: { orderBy: { dueDate: 'asc' } }
          }
        }
      }
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const rentLedger = await this.calculateOutstandingRent(vendorId, marketScopeId);
    const obligations = rentLedger.payments;
    const paymentHistory = await this.getRecentPayments(vendorId, 25, marketScopeId);
    const totalOutstanding = obligations.reduce((sum, item) => sum + item.outstandingAmount, 0);
    const totalOverdue = obligations.filter((item) => item.status === 'OVERDUE').reduce((sum, item) => sum + item.outstandingAmount, 0);
    const totalPending = obligations.filter((item) => item.status === 'PENDING').reduce((sum, item) => sum + item.outstandingAmount, 0);
    const paidThisMonth = paymentHistory
      .filter((item) => new Date(item.paymentDate) >= startOfMonthUtc())
      .reduce((sum, item) => sum + item.amount, 0);
    const nextPayment = obligations.find((item) => item.outstandingAmount > 0);

    return {
      vendor: {
        id: vendor.id,
        name: vendor.businessName || vendor.stakeholder.user.email,
        market: vendor.primaryMarket?.name || 'Unknown Market',
        phone: vendor.stakeholder.user.phone || 'N/A',
      },
      totalRentDue: totalOutstanding,
      totalTaxDue: 0,
      totalPaidThisMonth: paidThisMonth,
      totalOverdue,
      totalPending,
      totalOutstanding,
      totalPaid: paymentHistory.reduce((sum, item) => sum + item.amount, 0),
      nextPaymentDue: nextPayment?.dueDate || null,
      obligations,
      recentPayments: paymentHistory,
    };
  }

  async calculateOutstandingRent(vendorId, marketScopeId = null) {
    const payments = await prisma.rentPayment.findMany({
      where: {
        contract: {
          tenantId: vendorId,
          ...(marketScopeId ? { shop: { marketId: marketScopeId } } : {})
        }
      },
      include: {
        contract: { include: { shop: true, tenant: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    const obligations = await this.enrichRentPayments(payments);
    return {
      payments: obligations,
      total: obligations.reduce((sum, item) => sum + item.outstandingAmount, 0),
      count: obligations.length
    };
  }

  async calculateOutstandingTax() {
    return { payments: [], total: 0, count: 0 };
  }

  async getRecentPayments(vendorId, limit = 10, marketScopeId = null) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { stakeholder: true }
    });
    if (!vendor?.stakeholderId) return [];

    const transactions = await prisma.transaction.findMany({
      where: {
        stakeholderId: vendor.stakeholderId,
        type: 'RENT_PAYMENT',
        status: 'COMPLETED',
        ...(marketScopeId ? { metadata: { path: ['marketId'], equals: marketScopeId } } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const documentIds = Array.from(new Set(transactions.map((tx) => tx.metadata?.documentId).filter(Boolean)));
    const docs = documentIds.length
      ? await prisma.document.findMany({
          where: {
            id: { in: documentIds }
          }
        })
      : [];
    const docMap = new Map(docs.map((doc) => [doc.id, doc]));

    return transactions.map((tx) => ({
      id: tx.id,
      type: 'RENT',
      amount: toNumber(tx.amount),
      paymentDate: tx.createdAt,
      status: 'PAID',
      method: tx.paymentMethod || 'CASH',
      transactionId: tx.externalReference || tx.referenceId || tx.id,
      description: tx.metadata?.description || 'Rent payment',
      reference: tx.externalReference || tx.referenceId || tx.id,
      periodLabel: tx.metadata?.periodLabel || null,
      receiptDocument: tx.metadata?.documentId ? docMap.get(tx.metadata.documentId) || null : null,
    }));
  }

  async uploadPaymentEvidence({ vendorId, uploadedById, file }) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { stakeholder: true }
    });
    if (!vendor?.stakeholderId) {
      throw new Error('Vendor not found');
    }

    const path = require('path');
    const fs = require('fs');
    const uploadDir = path.join(process.cwd(), 'uploads', 'payment-receipts');
    fs.mkdirSync(uploadDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fullPath = path.join(uploadDir, safeName);
    await file.mv(fullPath);

    const document = await prisma.document.create({
      data: {
        stakeholderId: vendor.stakeholderId,
        documentType: 'OTHER',
        fileName: file.name,
        fileUrl: `/uploads/payment-receipts/${safeName}`,
        fileSize: file.size,
        mimeType: file.mimetype || 'application/octet-stream',
        uploadedById,
        metadata: {
          vendorId,
          purpose: 'PAYMENT_RECEIPT',
          category: 'RENT_PAYMENT_EVIDENCE'
        }
      }
    });

    return document;
  }

  async createOrUpdateRentPaymentEntry({
    vendorId,
    actorUserId,
    marketScopeId = null,
    contractId,
    rentPaymentId,
    amount,
    paymentDate,
    paymentMethod,
    transactionId,
    notes,
    documentId,
    periodMonth
  }) {
    if (!documentId) {
      throw new Error('Payment evidence document is required before recording rent');
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        stakeholder: true,
        rentContracts: {
          where: {
            isActive: true,
            ...(marketScopeId ? { shop: { marketId: marketScopeId } } : {})
          },
          include: {
            shop: true,
            payments: true
          }
        }
      }
    });

    if (!vendor?.stakeholderId) {
      throw new Error('Vendor not found');
    }

    const contract = contractId
      ? vendor.rentContracts.find((item) => item.id === contractId)
      : null;

    if (contractId && !contract) {
      throw new Error('Requested rent contract was not found for this vendor');
    }

    if (!vendor.rentContracts.length) {
      throw new Error('Active rent contract not found for this vendor');
    }

    const targetMonth = normalizePeriodMonth(periodMonth || paymentDate || new Date());
    if (!targetMonth) {
      throw new Error('Invalid period month. Use YYYY-MM or YYYY-MM-01.');
    }
    const targetMonthKey = monthKeyFromDate(targetMonth);

    const allCandidatePayments = vendor.rentContracts.flatMap((item) =>
      item.payments.map((payment) => ({
        ...payment,
        contract: {
          id: item.id,
          shop: item.shop,
          tenant: { id: vendor.id, businessName: vendor.businessName }
        }
      }))
    );

    let paymentRow = null;
    if (rentPaymentId) {
      paymentRow = await prisma.rentPayment.findUnique({
        where: { id: rentPaymentId },
        include: { contract: { include: { shop: true, tenant: true } } }
      });
    } else {
      const sameMonthCandidates = allCandidatePayments
        .filter((item) => monthKeyFromDate(item.periodStart) === targetMonthKey)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      if (sameMonthCandidates.length === 1) {
        paymentRow = sameMonthCandidates[0];
      } else if (sameMonthCandidates.length > 1) {
        const enrichedCandidates = await this.enrichRentPayments(sameMonthCandidates);
        const unpaidCandidate = enrichedCandidates
          .filter((item) => item.outstandingAmount > 0)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
        paymentRow = sameMonthCandidates.find((item) => item.id === unpaidCandidate?.id) || sameMonthCandidates[0];
      }
    }

    const resolvedContract = paymentRow
      ? vendor.rentContracts.find((item) => item.id === paymentRow.contractId) || contract
      : contract || (() => {
          const sortedContracts = [...vendor.rentContracts].sort((a, b) => {
            const aDue = a.payments.map((p) => new Date(p.dueDate).getTime()).sort()[0] || Number.MAX_SAFE_INTEGER;
            const bDue = b.payments.map((p) => new Date(p.dueDate).getTime()).sort()[0] || Number.MAX_SAFE_INTEGER;
            return aDue - bDue;
          });
          return sortedContracts[0];
        })();

    if (!paymentRow) {
      paymentRow = await prisma.rentPayment.create({
        data: {
          contractId: resolvedContract.id,
          amount: resolvedContract.monthlyRent,
          periodStart: targetMonth,
          periodEnd: endOfMonthUtc(targetMonth),
          dueDate: new Date(Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth(), resolvedContract.paymentDay || 1)),
          paymentMethod: paymentMethod || 'CASH',
          status: 'PENDING',
          notes: notes || null,
        },
        include: { contract: { include: { shop: true, tenant: true } } }
      });
    }

    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      throw new Error('Uploaded receipt document not found');
    }

    const tx = await prisma.transaction.create({
      data: {
        stakeholderId: vendor.stakeholderId,
        type: 'RENT_PAYMENT',
        amount,
        status: 'COMPLETED',
        referenceId: `rent-${paymentRow.id}-${Date.now()}`,
        externalReference: transactionId || null,
        paymentMethod,
        metadata: {
          vendorId,
          vendorName: vendor.businessName,
          contractId: paymentRow.contractId,
          rentPaymentId: paymentRow.id,
          marketId: paymentRow.contract.shop.marketId,
          shopNumber: paymentRow.contract.shop.shopNumber,
          periodLabel: `${targetMonth.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}`,
          documentId,
          description: `Rent payment for ${paymentRow.contract.shop.shopNumber}`,
          notes: notes || null,
          enteredByUserId: actorUserId,
        }
      }
    });

    const obligation = (await this.enrichRentPayments([paymentRow]))[0];
    const currentPaid = obligation.paidAmount;
    const outstandingAmount = Math.max(obligation.amount - currentPaid, 0);
    const nextStatus = outstandingAmount <= 0 ? 'PAID' : (new Date(paymentRow.dueDate) < new Date() ? 'OVERDUE' : 'PENDING');

    const updatedPayment = await prisma.rentPayment.update({
      where: { id: paymentRow.id },
      data: {
        status: nextStatus,
        paymentDate: outstandingAmount <= 0 ? new Date(paymentDate || new Date()) : paymentRow.paymentDate,
        paymentMethod: paymentMethod || paymentRow.paymentMethod,
        transactionId: transactionId || paymentRow.transactionId,
        receiptNumber: outstandingAmount <= 0 ? (paymentRow.receiptNumber || `RCPT-${Date.now()}`) : paymentRow.receiptNumber,
        notes: notes || paymentRow.notes,
      },
      include: { contract: { include: { shop: true, tenant: true } } }
    });

    const refreshedObligation = (await this.enrichRentPayments([updatedPayment]))[0];
    return {
      transaction: tx,
      payment: updatedPayment,
      ledgerItem: refreshedObligation,
      receiptDocument: document,
    };
  }

  async enrichRentPayments(rentPayments) {
    if (!rentPayments.length) return [];

    const paymentIds = rentPayments.map((item) => item.id);
    const vendorIds = Array.from(new Set(rentPayments.map((item) => item.contract?.tenantId).filter(Boolean)));

    const vendors = await prisma.vendor.findMany({
      where: { id: { in: vendorIds } },
      include: { stakeholder: true }
    });
    const stakeholderByVendorId = new Map(vendors.map((vendor) => [vendor.id, vendor.stakeholderId]));

    const stakeholderIds = Array.from(new Set(Array.from(stakeholderByVendorId.values()).filter(Boolean)));
    const transactions = stakeholderIds.length
      ? await prisma.transaction.findMany({
          where: {
            stakeholderId: { in: stakeholderIds },
            type: 'RENT_PAYMENT',
            status: 'COMPLETED',
          },
          orderBy: { createdAt: 'asc' }
        })
      : [];

    const txByPaymentId = new Map();
    for (const tx of transactions) {
      const paymentId = tx.metadata?.rentPaymentId;
      if (!paymentId || !paymentIds.includes(paymentId)) continue;
      const list = txByPaymentId.get(paymentId) || [];
      list.push(tx);
      txByPaymentId.set(paymentId, list);
    }

    return rentPayments.map((payment) => {
      const installments = (txByPaymentId.get(payment.id) || []).map((tx) => ({
        id: tx.id,
        amount: toNumber(tx.amount),
        paymentDate: tx.createdAt,
        method: tx.paymentMethod,
        reference: tx.externalReference || tx.referenceId || tx.id,
        documentId: tx.metadata?.documentId || null,
      }));
      const paidAmount = installments.reduce((sum, tx) => sum + tx.amount, 0);
      const amount = toNumber(payment.amount);
      const outstandingAmount = Math.max(amount - paidAmount, 0);
      const now = new Date();
      const status = outstandingAmount <= 0 ? 'PAID' : (new Date(payment.dueDate) < now ? 'OVERDUE' : 'PENDING');
      const daysOverdue = status === 'OVERDUE' ? Math.max(0, Math.floor((now - new Date(payment.dueDate)) / 86400000)) : 0;

      return {
        id: payment.id,
        contractId: payment.contractId,
        vendorId: payment.contract?.tenantId || null,
        vendorName: payment.contract?.tenant?.businessName || 'Unknown Vendor',
        amount,
        paidAmount,
        outstandingAmount,
        periodStart: payment.periodStart,
        periodEnd: payment.periodEnd,
        periodLabel: new Date(payment.periodStart).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
        dueDate: payment.dueDate,
        paymentDate: payment.paymentDate,
        status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        isLate: status === 'OVERDUE',
        gracePeriodDays: payment.gracePeriodDays || 0,
        lateFee: toNumber(payment.lateFee),
        shopNumber: payment.contract?.shop?.shopNumber || 'N/A',
        landlordName: 'Market Administration',
        daysOverdue,
        installments,
        notes: payment.notes || null,
      };
    });
  }
}

module.exports = new PaymentService();
