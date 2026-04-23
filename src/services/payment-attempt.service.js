const prisma = require('../prisma');

class PaymentAttemptService {
  async createAttempt() {
    throw new Error('Payment attempt creation is not implemented yet.');
  }

  async listVendorAttempts() {
    throw new Error('Vendor payment attempt listing is not implemented yet.');
  }

  async getVendorAttemptDetail() {
    throw new Error('Vendor payment attempt detail is not implemented yet.');
  }

  async getVendorAttemptStatus() {
    throw new Error('Vendor payment attempt status lookup is not implemented yet.');
  }

  async listAdminAttempts() {
    throw new Error('Admin online payment attempt listing is not implemented yet.');
  }

  async getAdminAttemptDetail() {
    throw new Error('Admin online payment attempt detail is not implemented yet.');
  }

  async updateAttemptStatus() {
    throw new Error('Payment attempt status updates are not implemented yet.');
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
