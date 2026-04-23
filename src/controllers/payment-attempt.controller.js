class PaymentAttemptController {
  async createVendorAttempt(req, res) {
    res.status(501).json({ success: false, message: 'Create vendor payment attempt not implemented yet.' });
  }

  async listVendorAttempts(req, res) {
    res.status(501).json({ success: false, message: 'List vendor payment attempts not implemented yet.' });
  }

  async getVendorAttemptDetail(req, res) {
    res.status(501).json({ success: false, message: 'Get vendor payment attempt detail not implemented yet.' });
  }

  async getVendorAttemptStatus(req, res) {
    res.status(501).json({ success: false, message: 'Get vendor payment attempt status not implemented yet.' });
  }

  async downloadVendorReceiptPdf(req, res) {
    res.status(501).json({ success: false, message: 'Download vendor receipt PDF not implemented yet.' });
  }
}

module.exports = new PaymentAttemptController();
