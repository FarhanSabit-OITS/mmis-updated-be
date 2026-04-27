const PaymentProvider = require('./PaymentProvider');

class FlutterwaveProvider extends PaymentProvider {
    constructor() {
        super();
        this.secretKey = process.env.FLW_SECRET_KEY;
        this.baseUrl = 'https://api.flutterwave.com/v3';
    }

    async initializePayment({ amount, currency = 'UGX', email, tx_ref, meta }) {
        try {
            const response = await fetch(`${this.baseUrl}/payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tx_ref,
                    amount,
                    currency,
                    redirect_url: process.env.FLW_REDIRECT_URL,
                    customer: { email },
                    meta,
                    customizations: {
                        title: 'MarketMaster MMIS Payment',
                        logo: process.env.APP_LOGO_URL
                    }
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                return {
                    status: 'success',
                    message: 'Payment initialized',
                    data: {
                        link: data.data.link
                    }
                };
            }
            return { status: 'error', message: data.message };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }

    async verifyPayment(transactionId) {
        try {
            const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            return {
                status: data.status,
                message: data.message,
                data: data.data
            };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}

module.exports = FlutterwaveProvider;
