const prisma = require('../prisma');
const IntegrationFactory = require('../integrations/IntegrationFactory');
const billingService = require('./billing.service');

class UnifiedPaymentService {
    constructor() {
        this.paymentProvider = IntegrationFactory.getPaymentProvider('FLUTTERWAVE');
        this.fiscalProvider = IntegrationFactory.getFiscalProvider('EFRIS_BUDDY');
    }

    async initializeOnlinePayment({ invoiceId, userId, amount, email }) {
        const invoice = await prisma.rentInvoice.findUnique({
            where: { id: invoiceId },
            include: { vendor: true }
        });

        if (!invoice) throw new Error('Invoice not found');

        const tx_ref = `MMIS-INV-${invoiceId}-${Date.now()}`;
        
        // Initialize with Flutterwave
        const result = await this.paymentProvider.initializePayment({
            amount,
            currency: 'UGX',
            email,
            tx_ref,
            meta: {
                invoiceId,
                vendorId: invoice.vendorId,
                userId
            }
        });

        if (result.status === 'success') {
            // Create a pending transaction
            await prisma.transaction.create({
                data: {
                    type: 'RENT_PAYMENT',
                    amount: amount,
                    status: 'PENDING',
                    paymentMethod: 'FLUTTERWAVE',
                    externalReference: tx_ref,
                    stakeholderId: invoice.vendor.stakeholderId,
                    metadata: {
                        invoiceId,
                        tx_ref
                    }
                }
            });
        }

        return result;
    }

    async verifyAndFinalizePayment(transactionId, status, tx_ref) {
        // Verify with Provider
        const verification = await this.paymentProvider.verifyPayment(transactionId);
        
        if (verification.status === 'success' && verification.data.status === 'successful') {
            // Update Transaction
            const transaction = await prisma.transaction.update({
                where: { externalReference: tx_ref },
                data: {
                    status: 'COMPLETED',
                    externalReference: transactionId, // Link to actual FLW ID
                }
            });

            // Allocate to Invoice
            const invoiceId = transaction.metadata.invoiceId;
            const billingServiceInstance = new (require('./billing.service'))();
            await billingServiceInstance.allocatePaymentToInvoices(transaction, transaction.metadata.vendorId, invoiceId);

            // Fiscalize with EFRIS
            await this.fiscalizeInvoice(invoiceId);

            return { status: 'success', message: 'Payment finalized and fiscalized' };
        }

        return { status: 'error', message: 'Payment verification failed' };
    }

    async fiscalizeInvoice(invoiceId) {
        const invoice = await prisma.rentInvoice.findUnique({
            where: { id: invoiceId },
            include: { 
                vendor: { include: { stakeholder: { include: { user: true } } } },
                lineItems: true
            }
        });

        if (!invoice) throw new Error('Invoice not found');

        const fiscalData = {
            customerName: invoice.vendor.businessName,
            customerTIN: invoice.vendor.tinNumber || '0000000000',
            items: invoice.lineItems.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitAmount,
                totalAmount: item.lineAmount
            })),
            totalAmount: invoice.totalAmount
        };

        const result = await this.fiscalProvider.registerInvoice(fiscalData);

        if (result.status === 'success') {
            // Update Invoice with EFRIS info
            await prisma.rentInvoice.update({
                where: { id: invoiceId },
                data: {
                    metadata: {
                        ...(invoice.metadata || {}),
                        efrisInvoiceNumber: result.invoiceNumber,
                        efrisQrCode: result.qrCode,
                        fiscalizedAt: new Date()
                    }
                }
            });
        }

        return result;
    }
}

module.exports = new UnifiedPaymentService();
