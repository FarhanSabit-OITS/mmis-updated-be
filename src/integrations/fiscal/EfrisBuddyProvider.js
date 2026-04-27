const FiscalProvider = require('./FiscalProvider');

class EfrisBuddyProvider extends FiscalProvider {
    constructor() {
        super();
        this.apiKey = process.env.EFRIS_BUDDY_API_KEY;
        this.baseUrl = process.env.EFRIS_BUDDY_BASE_URL || 'https://api.efrisbuddy.com/v1';
    }

    async registerInvoice(invoiceData) {
        try {
            // In a real scenario, we would map MMIS internal invoice to EFRIS format
            // Here we simulate the call to Efris Buddy Aggregator
            
            // Simulation of production-ready logging
            console.log(`[EFRIS_BUDDY] Registering invoice for ${invoiceData.customerName || 'Walking Customer'}`);

            // Mock response if no API key is provided (Sandbox Mode)
            if (!this.apiKey) {
                return {
                    status: 'success',
                    invoiceNumber: `EFRIS-${Date.now()}`,
                    fdn: `FDN-${Math.random().toString(36).substring(7).toUpperCase()}`,
                    verificationCode: Math.random().toString().slice(2, 8),
                    qrCode: 'https://www.ura.go.ug/efris/verify?id=' + Date.now(),
                    isMock: true
                };
            }

            const response = await fetch(`${this.baseUrl}/invoices/register`, {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(invoiceData)
            });

            const data = await response.json();
            return {
                status: data.status === 'success' ? 'success' : 'error',
                invoiceNumber: data.efris_invoice_number,
                qrCode: data.qr_url,
                data: data
            };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}

module.exports = EfrisBuddyProvider;
