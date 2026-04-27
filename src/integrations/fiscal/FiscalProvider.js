/**
 * @interface IFiscalProvider
 */
class FiscalProvider {
    /**
     * @param {Object} invoiceData
     * @returns {Promise<{status: string, invoiceNumber: string, qrCode: string, data: any}>}
     */
    async registerInvoice(invoiceData) {
        throw new Error('registerInvoice not implemented');
    }

    /**
     * @param {string} invoiceId
     * @returns {Promise<any>}
     */
    async getInvoiceDetails(invoiceId) {
        throw new Error('getInvoiceDetails not implemented');
    }
}

module.exports = FiscalProvider;
