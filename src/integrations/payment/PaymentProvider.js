/**
 * @interface IPaymentProvider
 */
class PaymentProvider {
    /**
     * @param {Object} params
     * @param {number} params.amount
     * @param {string} params.currency
     * @param {string} params.email
     * @param {string} params.tx_ref
     * @param {Object} [params.meta]
     * @returns {Promise<{status: string, message: string, data: any}>}
     */
    async initializePayment(params) {
        throw new Error('initializePayment not implemented');
    }

    /**
     * @param {string} transactionId
     * @returns {Promise<{status: string, message: string, data: any}>}
     */
    async verifyPayment(transactionId) {
        throw new Error('verifyPayment not implemented');
    }

    /**
     * @param {string} transactionId
     * @returns {Promise<boolean>}
     */
    async handleWebhook(data) {
        throw new Error('handleWebhook not implemented');
    }
}

module.exports = PaymentProvider;
