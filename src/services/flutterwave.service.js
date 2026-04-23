class FlutterwaveService {
  async createHostedCheckout() {
    throw new Error('Flutterwave hosted checkout integration is not implemented yet.');
  }

  async verifyTransaction() {
    throw new Error('Flutterwave transaction verification is not implemented yet.');
  }

  validateWebhookSignature() {
    throw new Error('Flutterwave webhook signature validation is not implemented yet.');
  }

  normalizeVerificationResponse() {
    throw new Error('Flutterwave response normalization is not implemented yet.');
  }
}

module.exports = new FlutterwaveService();
