const FlutterwaveProvider = require('./payment/FlutterwaveProvider');
const EfrisBuddyProvider = require('./fiscal/EfrisBuddyProvider');

class IntegrationFactory {
    static getPaymentProvider(type = 'FLUTTERWAVE') {
        switch (type.toUpperCase()) {
            case 'FLUTTERWAVE':
                return new FlutterwaveProvider();
            default:
                throw new Error(`Unsupported payment provider: ${type}`);
        }
    }

    static getFiscalProvider(type = 'EFRIS_BUDDY') {
        switch (type.toUpperCase()) {
            case 'EFRIS_BUDDY':
                return new EfrisBuddyProvider();
            default:
                throw new Error(`Unsupported fiscal provider: ${type}`);
        }
    }
}

module.exports = IntegrationFactory;
