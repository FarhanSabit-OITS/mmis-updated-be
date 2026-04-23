const prisma = require('../prisma');
const crypto = require('crypto');
const billingService = require('./billing.service');

const toNumber = (value) => Number(value || 0);
const startOfMonthUtc = (input) => {
  const date = input ? new Date(input) : new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
};
const endOfMonthUtc = (input) => {
  const date = input ? new Date(input) : new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
};
const toDecimal = (value) => Number(toNumber(value).toFixed(2));
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
const generateUniqueCode = (prefix) => {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};
const SYSTEM_LANDLORD_EMAIL = 'market.administration@marketmaster.local';
const calculateProratedAmount = (monthlyRent, billingStartDate, periodStart) => {
  const start = billingStartDate > periodStart ? billingStartDate : periodStart;
  const periodEnd = endOfMonthUtc(periodStart);
  const daysInMonth = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() + 1, 0)).getUTCDate();
  const billableDays = Math.max(0, Math.floor((periodEnd - start) / 86400000) + 1);
  const dailyRate = toNumber(monthlyRent) / daysInMonth;
  return {
    daysInMonth,
    billableDays,
    amount: toDecimal(dailyRate * billableDays),
    isProrated: billableDays > 0 && billableDays < daysInMonth,
  };
};
const computeLegacyRentTerms = (contract, periodStartInput) => {
  const periodStart = startOfMonthUtc(periodStartInput);
  const periodEnd = endOfMonthUtc(periodStart);
  const dueDay = Math.max(1, Math.min(Number(contract.paymentDay || 1), 28));
  const configuredDueDate = new Date(Date.UTC(
    periodStart.getUTCFullYear(),
    periodStart.getUTCMonth(),
    dueDay
  ));
  const billingStartDate = new Date(Math.max(
    periodStart.getTime(),
    new Date(contract.startDate).getTime(),
    new Date(contract.shop?.contractStartDate || contract.startDate).getTime()
  ));
  const isFirstMonth = monthKeyFromDate(billingStartDate) === monthKeyFromDate(periodStart);
  const proration = calculateProratedAmount(contract.monthlyRent, billingStartDate, periodStart);
  const amount = isFirstMonth ? proration.amount : toDecimal(contract.monthlyRent);
  const dueDate = isFirstMonth && billingStartDate > configuredDueDate ? billingStartDate : configuredDueDate;

  return {
    amount,
    periodStart,
    periodEnd,
    dueDate,
    billingStartDate,
    isFirstMonth,
    proration,
    noteSuffix: isFirstMonth && proration.isProrated
      ? `Prorated first month from ${billingStartDate.toISOString().slice(0, 10)} (${proration.billableDays}/${proration.daysInMonth} days).`
      : null,
  };
};

class PaymentService {
  async repairLegacyRentPaymentRow(payment) {
    if (!payment?.contract) return payment;

    const expected = computeLegacyRentTerms(payment.contract, payment.periodStart);
    const amountChanged = Math.abs(toNumber(payment.amount) - expected.amount) > 0.000001;
    const dueDateChanged = new Date(payment.dueDate).getTime() !== expected.dueDate.getTime();

    if (!amountChanged && !dueDateChanged) {
      return payment;
    }

    const enriched = await this.enrichRentPayments([payment]);
    const paidAmount = enriched[0]?.paidAmount || 0;
    const outstandingAmount = Math.max(expected.amount - paidAmount, 0);
    const nextStatus = outstandingAmount <= 0 ? 'PAID' : (expected.dueDate < new Date() ? 'OVERDUE' : 'PENDING');

    return prisma.rentPayment.update({
      where: { id: payment.id },
      data: {
        amount: expected.amount,
        dueDate: expected.dueDate,
        status: nextStatus,
        paymentDate: outstandingAmount <= 0 ? (payment.paymentDate || new Date()) : payment.paymentDate,
        notes: [
          payment.notes,
          expected.noteSuffix,
          'Legacy rent row auto-repaired to match first-month proration rules.',
        ].filter(Boolean).join('\n'),
      },
      include: { contract: { include: { shop: true, tenant: true } } },
    });
  }

  async ensureCurrentMonthRentRowsForContracts(contracts) {
    if (!contracts?.length) return;

    const currentMonthStart = startOfMonthUtc();
    const currentMonthKey = monthKeyFromDate(currentMonthStart);

    for (const contract of contracts) {
      const existingForMonth = contract.payments?.some((payment) => (
        payment?.periodStart && monthKeyFromDate(payment.periodStart) === currentMonthKey
      ));

      if (existingForMonth) continue;

      const monthlyRent = toNumber(contract.monthlyRent);
      if (monthlyRent <= 0) continue;

      const expected = computeLegacyRentTerms(contract, currentMonthStart);
      const created = await prisma.rentPayment.create({
        data: {
          contractId: contract.id,
          amount: expected.amount,
          periodStart: expected.periodStart,
          periodEnd: expected.periodEnd,
          dueDate: expected.dueDate,
          paymentMethod: 'CASH',
          status: 'PENDING',
          notes: ['Auto-generated current month rent due row', expected.noteSuffix].filter(Boolean).join('\n')
        }
      });

      if (Array.isArray(contract.payments)) {
        contract.payments.push(created);
      }
    }
  }

  async ensureSystemLandlordMember(client = prisma) {
    const user = await client.user.upsert({
      where: { email: SYSTEM_LANDLORD_EMAIL },
      update: {
        emailVerified: true,
        status: 'ACTIVE'
      },
      create: {
        email: SYSTEM_LANDLORD_EMAIL,
        passwordHash: crypto.randomBytes(32).toString('hex'),
        emailVerified: true,
        status: 'ACTIVE'
      }
    });

    const stakeholder = await client.stakeholder.upsert({
      where: { userId: user.id },
      update: {
        stakeholderType: 'MEMBER',
        kycStatus: 'VERIFIED'
      },
      create: {
        userId: user.id,
        stakeholderType: 'MEMBER',
        kycStatus: 'VERIFIED'
      }
    });

    return client.member.upsert({
      where: { stakeholderId: stakeholder.id },
      update: {
        businessName: 'Market Administration',
        membershipType: 'FULL'
      },
      create: {
        stakeholderId: stakeholder.id,
        membershipNumber: generateUniqueCode('LLD'),
        membershipType: 'FULL',
        businessName: 'Market Administration',
        registrationNumber: generateUniqueCode('LAND')
      }
    });
  }

  async bootstrapMissingRentContract(vendorId, actorUserId, marketScopeId = null) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        stakeholder: true,
        rentContracts: {
          where: {
            isActive: true,
            ...(marketScopeId ? { shop: { marketId: marketScopeId } } : {})
          }
        },
        stalls: {
          where: {
            status: { not: 'DELETED' },
            ...(marketScopeId ? { marketId: marketScopeId } : {})
          },
          include: {
            shop: true
          }
        }
      }
    });

    if (!vendor?.stakeholderId || vendor.rentContracts.length) {
      return;
    }

    const member = await prisma.member.findUnique({
      where: { stakeholderId: vendor.stakeholderId }
    });
    const primaryStall = vendor.stalls.find((stall) => stall.shop);

    if (!member || !primaryStall?.shop) {
      return;
    }

    const inferredMonthlyRent = toNumber(primaryStall.monthlyRate || primaryStall.shop.monthlyRent);
    if (inferredMonthlyRent <= 0) {
      return;
    }

    const existingContract = await prisma.rentContract.findFirst({
      where: {
        tenantId: vendor.id,
        shopId: primaryStall.shop.id,
        isActive: true
      }
    });

    if (existingContract) {
      return;
    }

    const landlordMember = await this.ensureSystemLandlordMember();

    await prisma.rentContract.create({
      data: {
        shopId: primaryStall.shop.id,
        landlordId: landlordMember.id,
        tenantId: vendor.id,
        startDate: primaryStall.shop.contractStartDate || primaryStall.contractStartDate || new Date(),
        endDate: primaryStall.shop.contractEndDate || primaryStall.contractEndDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        durationMonths: 12,
        monthlyRent: inferredMonthlyRent,
        paymentDay: primaryStall.shop.paymentDay || 1,
        status: 'ACTIVE',
        isActive: true,
        contractNumber: generateUniqueCode('CTR'),
        metadata: {
          source: 'PAYMENT_SERVICE_BACKFILL',
          autoGenerated: true
        },
        createdById: actorUserId
      }
    });
  }

  buildScopedVendorRows(vendors, obligationsByVendorId, paymentsByVendorId) {
    return vendors.map((vendor) => {
      const obligations = obligationsByVendorId.get(vendor.id) || [];
      const payments = paymentsByVendorId.get(vendor.id) || [];
      const firstContractMarket = vendor.rentContracts.find((contract) => contract.shop?.market)?.shop?.market;
      const totalOutstanding = obligations.reduce((sum, item) => sum + item.outstandingAmount, 0);
      const totalOverdue = obligations
        .filter((item) => item.status === 'OVERDUE')
        .reduce((sum, item) => sum + item.outstandingAmount, 0);
      const totalPending = obligations
        .filter((item) => item.status === 'PENDING')
        .reduce((sum, item) => sum + item.outstandingAmount, 0);
      const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);

      return {
        vendorId: vendor.id,
        vendorCode: vendor.vendorCode,
        vendorName: vendor.businessName,
        marketId: vendor.primaryMarketId || firstContractMarket?.id || null,
        marketName: vendor.primaryMarket?.name || firstContractMarket?.name || 'Unknown Market',
        shopNumbers: vendor.rentContracts.map((contract) => contract.shop?.shopNumber).filter(Boolean),
        totalOutstanding,
        totalPaid,
        overdueAmount: totalOverdue,
        pendingAmount: totalPending,
        paymentStatus: totalOutstanding > 0 ? (totalOverdue > 0 ? 'OVERDUE' : 'PENDING') : 'PAID',
      };
    });
  }

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

    const repairedDuePayments = [];
    for (const payment of duePayments) {
      repairedDuePayments.push(await this.repairLegacyRentPaymentRow(payment));
    }

    const obligations = await this.enrichRentPayments(repairedDuePayments);
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

  async getOutstandingPayments(marketId, pagination = {}) {
    const page = Math.max(Number(pagination.page || 1), 1);
    const limit = Math.min(Math.max(Number(pagination.limit || 10), 1), 100);
    const search = pagination.search?.trim().toLowerCase();

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

    const repairedDuePayments = [];
    for (const payment of duePayments) {
      repairedDuePayments.push(await this.repairLegacyRentPaymentRow(payment));
    }

    const obligations = await this.enrichRentPayments(repairedDuePayments);
    const rows = obligations
      .filter((item) => item.outstandingAmount > 0)
      .filter((item) => {
        if (!search) return true;
        return [
          item.vendorName,
          item.shopNumber,
          item.periodLabel,
        ].filter(Boolean).some((value) => value.toLowerCase().includes(search));
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
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

    const totalCount = rows.length;
    const pagedRows = rows.slice((page - 1) * limit, page * limit);

    return {
      rows: pagedRows,
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

  async getScopedVendorsWithPayments(marketId = null, pagination = {}) {
    const page = Math.max(Number(pagination.page || 1), 1);
    const limit = Math.min(Math.max(Number(pagination.limit || 10), 1), 100);
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

    await this.ensureCurrentMonthRentRowsForContracts(vendors.flatMap((vendor) => vendor.rentContracts));

    const scopedPayments = vendors.flatMap((vendor) =>
      vendor.rentContracts.flatMap((contract) =>
        contract.payments.map((payment) => ({
          ...payment,
          contract: {
            id: contract.id,
            tenantId: vendor.id,
            startDate: contract.startDate,
            paymentDay: contract.paymentDay,
            monthlyRent: contract.monthlyRent,
            tenant: { id: vendor.id, businessName: vendor.businessName },
            shop: contract.shop,
          }
        }))
      )
    );

    const repairedScopedPayments = [];
    for (const payment of scopedPayments) {
      repairedScopedPayments.push(await this.repairLegacyRentPaymentRow(payment));
    }

    const enrichedPayments = await this.enrichRentPayments(repairedScopedPayments);
    const obligationsByVendorId = new Map();
    for (const payment of enrichedPayments) {
      const list = obligationsByVendorId.get(payment.vendorId) || [];
      list.push(payment);
      obligationsByVendorId.set(payment.vendorId, list);
    }

    const stakeholderIds = vendors.map((vendor) => vendor.stakeholderId).filter(Boolean);
    const transactions = stakeholderIds.length
      ? await prisma.transaction.findMany({
          where: {
            stakeholderId: { in: stakeholderIds },
            type: 'RENT_PAYMENT',
            status: 'COMPLETED',
            ...(marketId ? { metadata: { path: ['marketId'], equals: marketId } } : {})
          },
          select: {
            stakeholderId: true,
            amount: true,
          }
        })
      : [];
    const vendorIdByStakeholderId = new Map(vendors.map((vendor) => [vendor.stakeholderId, vendor.id]));
    const paymentsByVendorId = new Map();
    for (const transaction of transactions) {
      const vendorId = vendorIdByStakeholderId.get(transaction.stakeholderId);
      if (!vendorId) continue;
      const list = paymentsByVendorId.get(vendorId) || [];
      list.push({ amount: toNumber(transaction.amount) });
      paymentsByVendorId.set(vendorId, list);
    }

    const rows = this.buildScopedVendorRows(vendors, obligationsByVendorId, paymentsByVendorId);

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

    await this.ensureCurrentMonthRentRowsForContracts(vendor.rentContracts);

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
    const activeContracts = await prisma.rentContract.findMany({
      where: {
        tenantId: vendorId,
        isActive: true,
        ...(marketScopeId ? { shop: { marketId: marketScopeId } } : {})
      },
      include: {
        shop: true,
        tenant: true,
        payments: true
      }
    });

    await this.ensureCurrentMonthRentRowsForContracts(activeContracts);

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

    const repairedPayments = [];
    for (const payment of payments) {
      repairedPayments.push(await this.repairLegacyRentPaymentRow(payment));
    }

    const obligations = await this.enrichRentPayments(repairedPayments);
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
      await this.bootstrapMissingRentContract(vendorId, actorUserId, marketScopeId);
      const refreshedVendor = await prisma.vendor.findUnique({
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

      if (!refreshedVendor?.rentContracts?.length) {
        throw new Error('Active rent contract not found for this vendor');
      }

      vendor.rentContracts = refreshedVendor.rentContracts;
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
      const expected = computeLegacyRentTerms(resolvedContract, targetMonth);
      paymentRow = await prisma.rentPayment.create({
        data: {
          contractId: resolvedContract.id,
          amount: expected.amount,
          periodStart: expected.periodStart,
          periodEnd: expected.periodEnd,
          dueDate: expected.dueDate,
          paymentMethod: paymentMethod || 'CASH',
          status: 'PENDING',
          notes: [notes, expected.noteSuffix].filter(Boolean).join('\n') || null,
        },
        include: { contract: { include: { shop: true, tenant: true } } }
      });
    } else {
      paymentRow = await this.repairLegacyRentPaymentRow(paymentRow);
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
    await billingService.syncInvoiceAfterLegacyPayment({
      vendorId,
      rentPaymentId: paymentRow.id,
      actorUserId,
      paymentDate,
      amount,
      paymentMethod,
      transactionId,
      documentId,
      notes,
    });
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
