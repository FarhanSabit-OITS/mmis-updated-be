class RefundController {
  async listRefunds(req, res) {
    res.status(501).json({ success: false, message: 'Refund listing not implemented yet.' });
  }

  async createRefundRecord(req, res) {
    res.status(501).json({ success: false, message: 'Refund creation not implemented yet.' });
  }

  async updateRefundStatus(req, res) {
    res.status(501).json({ success: false, message: 'Refund status update not implemented yet.' });
  }
}

module.exports = new RefundController();
