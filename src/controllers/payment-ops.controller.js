class PaymentOpsController {
  async receiveFlutterwaveWebhook(req, res) {
    res.status(501).json({ success: false, message: 'Flutterwave webhook endpoint not implemented yet.' });
  }

  async listAdminOnlinePayments(req, res) {
    res.status(501).json({ success: false, message: 'Admin online payments list not implemented yet.' });
  }

  async getAdminOnlinePaymentDetail(req, res) {
    res.status(501).json({ success: false, message: 'Admin online payment detail not implemented yet.' });
  }

  async reverifyAttempt(req, res) {
    res.status(501).json({ success: false, message: 'Admin payment re-verification not implemented yet.' });
  }

  async listWebhookEvents(req, res) {
    res.status(501).json({ success: false, message: 'Webhook event listing not implemented yet.' });
  }

  async reprocessWebhookEvent(req, res) {
    res.status(501).json({ success: false, message: 'Webhook reprocessing not implemented yet.' });
  }
}

module.exports = new PaymentOpsController();
