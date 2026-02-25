const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PaymentService {
  // Get vendor payment summary
  async getVendorPaymentSummary(vendorId) {
    try {
      // Get vendor details
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: {
          primaryMarket: true,
          stakeholder: {
            include: {
              user: true
            }
          },
          rentContracts: {
            where: { isActive: true },
            include: {
              shop: true,
              payments: {
                where: {
                  status: { in: ['PENDING', 'OVERDUE'] }
                },
                orderBy: { dueDate: 'asc' }
              }
            }
          }
        }
      });

      if (!vendor) {
        throw new Error('Vendor not found');
      }

      // Get outstanding rent payments
      const outstandingRent = await this.calculateOutstandingRent(vendorId);

      // Get outstanding tax payments
      const outstandingTax = await this.calculateOutstandingTax(vendorId);

      // Get recent payment history
      const recentPayments = await this.getRecentPayments(vendorId);

      return {
        vendor: {
          id: vendor.id,
          name: vendor.businessName || vendor.stakeholder.user.name,
          market: vendor.primaryMarket?.name || 'Unknown Market',
          phone: vendor.stakeholder.user.phone || 'N/A'
        },
        outstandingRent,
        outstandingTax,
        totalOutstanding: outstandingRent.total + outstandingTax.total,
        recentPayments,
        nextDueDate: this.getNextDueDate(outstandingRent.payments, outstandingTax.payments)
      };
    } catch (error) {
      console.error('Error getting vendor payment summary:', error);
      throw error;
    }
  }

  // Calculate outstanding rent payments
  async calculateOutstandingRent(vendorId) {
    try {
      const rentPayments = await prisma.rentPayment.findMany({
        where: {
          contract: {
            tenantId: vendorId,
            status: 'ACTIVE'
          },
          status: { in: ['PENDING', 'OVERDUE'] }
        },
        include: {
          contract: {
            include: {
              shop: true
            }
          }
        },
        orderBy: { dueDate: 'asc' }
      });

      const total = rentPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      return {
        payments: rentPayments,
        total: total,
        count: rentPayments.length
      };
    } catch (error) {
      console.error('Error calculating outstanding rent:', error);
      throw error;
    }
  }

  // Calculate outstanding tax payments
  async calculateOutstandingTax(vendorId) {
    try {
      const taxPayments = await prisma.taxPayment.findMany({
        where: {
          vendorId: vendorId,
          status: { in: ['PENDING', 'OVERDUE'] }
        },
        include: {
          market: true
        },
        orderBy: { dueDate: 'asc' }
      });

      const total = taxPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      return {
        payments: taxPayments,
        total: total,
        count: taxPayments.length
      };
    } catch (error) {
      console.error('Error calculating outstanding tax:', error);
      throw error;
    }
  }

  // Get recent payment history
  async getRecentPayments(vendorId, limit = 10) {
    try {
      const rentPayments = await prisma.rentPayment.findMany({
        where: {
          contract: {
            tenantId: vendorId
          },
          status: 'PAID'
        },
        include: {
          contract: {
            include: {
              shop: true
            }
          }
        },
        orderBy: { paymentDate: 'desc' },
        take: limit
      });

      const taxPayments = await prisma.taxPayment.findMany({
        where: {
          vendorId: vendorId,
          status: 'PAID'
        },
        include: {
          market: true
        },
        orderBy: { paymentDate: 'desc' },
        take: limit
      });

      // Combine and sort by payment date
      const allPayments = [...rentPayments, ...taxPayments]
        .map(payment => ({
          id: payment.id,
          type: payment.contract ? 'RENT' : 'TAX',
          amount: parseFloat(payment.amount),
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          receiptNumber: payment.receiptNumber,
          shop: payment.contract?.shop?.shopNumber || null,
          taxType: payment.taxType || null,
          market: payment.market?.name || payment.contract?.shop?.market?.name
        }))
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, limit);

      return allPayments;
    } catch (error) {
      console.error('Error getting recent payments:', error);
      throw error;
    }
  }

  // Get next due date from outstanding payments
  getNextDueDate(rentPayments, taxPayments) {
    const allPayments = [...rentPayments, ...taxPayments];
    if (allPayments.length === 0) return null;

    const nextDue = allPayments
      .map(p => new Date(p.dueDate))
      .sort((a, b) => a - b)[0];

    return nextDue;
  }

  // Process rent payment
  async processRentPayment(paymentData) {
    try {
      const { contractId, amount, paymentMethod, transactionId, notes } = paymentData;

      // Get the contract and check if payment is valid
      const contract = await prisma.rentContract.findUnique({
        where: { id: contractId },
        include: {
          rentPayments: {
            where: { status: 'PENDING' },
            orderBy: { dueDate: 'asc' },
            take: 1
          }
        }
      });

      if (!contract) {
        throw new Error('Rent contract not found');
      }

      if (contract.status !== 'ACTIVE') {
        throw new Error('Contract is not active');
      }

      const pendingPayment = contract.rentPayments[0];
      if (!pendingPayment) {
        throw new Error('No pending rent payment found for this contract');
      }

      // Check if amount matches
      if (parseFloat(amount) !== parseFloat(pendingPayment.amount)) {
        throw new Error('Payment amount does not match the due amount');
      }

      // Update payment status
      const updatedPayment = await prisma.rentPayment.update({
        where: { id: pendingPayment.id },
        data: {
          status: 'PAID',
          paymentDate: new Date(),
          paymentMethod: paymentMethod,
          transactionId: transactionId,
          notes: notes
        }
      });

      return {
        success: true,
        payment: updatedPayment,
        receiptNumber: updatedPayment.receiptNumber
      };
    } catch (error) {
      console.error('Error processing rent payment:', error);
      throw error;
    }
  }

  // Process tax payment
  async processTaxPayment(paymentData) {
    try {
      const { taxPaymentId, amount, paymentMethod, transactionId, notes } = paymentData;

      // Get the tax payment
      const taxPayment = await prisma.taxPayment.findUnique({
        where: { id: taxPaymentId }
      });

      if (!taxPayment) {
        throw new Error('Tax payment not found');
      }

      if (taxPayment.status !== 'PENDING') {
        throw new Error('Tax payment is not pending');
      }

      // Check if amount matches
      if (parseFloat(amount) !== parseFloat(taxPayment.amount)) {
        throw new Error('Payment amount does not match the due amount');
      }

      // Update payment status
      const updatedPayment = await prisma.taxPayment.update({
        where: { id: taxPaymentId },
        data: {
          status: 'PAID',
          paymentDate: new Date(),
          paymentMethod: paymentMethod,
          transactionId: transactionId,
          collectionNotes: notes
        }
      });

      return {
        success: true,
        payment: updatedPayment,
        receiptNumber: updatedPayment.receiptNumber
      };
    } catch (error) {
      console.error('Error processing tax payment:', error);
      throw error;
    }
  }

  // Generate receipt number
  generateReceiptNumber(type = 'PAY') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${type}-${timestamp}-${random}`;
  }

  // Get admin payment collections summary
  async getAdminPaymentCollections(marketId, dateRange = null) {
    try {
      let dateFilter = {};
      if (dateRange) {
        dateFilter = {
          paymentDate: {
            gte: new Date(dateRange.start),
            lte: new Date(dateRange.end)
          }
        };
      }

      // Get rent payments
      const rentCollections = await prisma.rentPayment.findMany({
        where: {
          contract: {
            shop: {
              marketId: marketId
            }
          },
          status: 'PAID',
          ...dateFilter
        },
        include: {
          contract: {
            include: {
              tenant: true,
              shop: true
            }
          }
        }
      });

      // Get tax payments
      const taxCollections = await prisma.taxPayment.findMany({
        where: {
          marketId: marketId,
          status: 'PAID',
          ...dateFilter
        },
        include: {
          vendor: true
        }
      });

      const totalRent = rentCollections.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const totalTax = taxCollections.reduce((sum, p) => sum + parseFloat(p.amount), 0);

      return {
        rentCollections,
        taxCollections,
        totalRent,
        totalTax,
        totalCollections: totalRent + totalTax,
        period: dateRange || 'All time'
      };
    } catch (error) {
      console.error('Error getting admin payment collections:', error);
      throw error;
    }
  }

  // Get outstanding payments for admin
  async getOutstandingPayments(marketId) {
    try {
      // Get outstanding rent payments
      const outstandingRent = await prisma.rentPayment.findMany({
        where: {
          contract: {
            shop: {
              marketId: marketId
            },
            status: 'ACTIVE'
          },
          status: { in: ['PENDING', 'OVERDUE'] }
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

      // Get outstanding tax payments
      const outstandingTax = await prisma.taxPayment.findMany({
        where: {
          marketId: marketId,
          status: { in: ['PENDING', 'OVERDUE'] }
        },
        include: {
          vendor: true
        },
        orderBy: { dueDate: 'asc' }
      });

      const totalRent = outstandingRent.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const totalTax = outstandingTax.reduce((sum, p) => sum + parseFloat(p.amount), 0);

      return {
        outstandingRent,
        outstandingTax,
        totalOutstanding: totalRent + totalTax,
        rentCount: outstandingRent.length,
        taxCount: outstandingTax.length
      };
    } catch (error) {
      console.error('Error getting outstanding payments:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();