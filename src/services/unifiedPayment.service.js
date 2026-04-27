const prisma = require('../prisma');
const IntegrationFactory = require('../integrations/IntegrationFactory');
const billingService = require('./billing.service');

class UnifiedPaymentService {
    constructor() {
        this.paymentProvider = IntegrationFactory.getPaymentProvider('FLUTTERWAVE');
        this.fiscalProvider = IntegrationFactory.getFiscalProvider('EFRIS_BUDDY');
    }

    /**
     * Initialize a payment attempt for one or more invoices.
     */
    async initializeOnlinePayment({ invoiceIds, userId, vendorId, amount, email }) {
        const invoices = await prisma.rentInvoice.findMany({
            where: { id: { in: invoiceIds } },
            include: { market: true }
        });

        if (invoices.length === 0) throw new Error('Invoices not found');
        const marketId = invoices[0].marketId;

        // 1. Create Payment Attempt Reference
        const attemptReference = `MMIS-PAY-${Date.now()}`;
        
        // 2. Persist Attempt in DB
        const attempt = await prisma.paymentAttempt.create({
            data: {
                attemptReference,
                vendorId,
                marketId,
                selectionMode: invoiceIds.length > 1 ? 'MULTIPLE_INVOICES' : 'SINGLE_INVOICE',
                requestedAmount: amount,
                currencyCode: 'UGX',
                status: 'INITIATED',
                createdByUserId: userId,
                selectedInvoices: {
                    create: invoices.map(inv => ({
                        invoiceId: inv.id,
                        invoiceNumberSnapshot: inv.invoiceNumber,
                        invoiceOutstandingSnapshot: inv.outstandingAmount
                    }))
                }
            }
        });

        // 3. Initialize with Provider
        const result = await this.paymentProvider.initializePayment({
            amount,
            currency: 'UGX',
            email,
            tx_ref: attemptReference,
            meta: {
                attemptId: attempt.id,
                vendorId,
                userId
            }
        });

        if (result.status === 'success') {
            // Update attempt with provider info
            await prisma.paymentAttempt.update({
                where: { id: attempt.id },
                data: {
                    checkoutUrl: result.data.link,
                    providerTxRef: attemptReference,
                }
            });
        } else {
            await prisma.paymentAttempt.update({
                where: { id: attempt.id },
                data: {
                    status: 'FAILED',
                    failureReason: result.message || 'Initialization failed'
                }
            });
        }

        return result;
    }

    /**
     * Verify and finalize a payment attempt.
     */
    async verifyAndFinalizePayment(attemptId, actorUserId = null) {
        const attempt = await prisma.paymentAttempt.findUnique({
            where: { id: attemptId },
            include: { selectedInvoices: true }
        });

        if (!attempt) throw new Error('Payment attempt not found');
        if (attempt.status === 'SUCCESSFUL') return { status: 'success', message: 'Already processed' };

        // 1. Verify with Provider
        const verification = await this.paymentProvider.verifyPayment(attempt.attemptReference);
        
        if (verification.status === 'success' && verification.data.status === 'successful') {
            const confirmedAmount = verification.data.amount;

            // 2. Create Invoice Payment Record
            const payment = await prisma.invoicePayment.create({
                data: {
                    vendorId: attempt.vendorId,
                    marketId: attempt.marketId,
                    paymentAttemptId: attempt.id,
                    amount: confirmedAmount,
                    paymentMethod: 'ONLINE',
                    paymentChannel: 'FLUTTERWAVE',
                    provider: 'FLUTTERWAVE',
                    providerReference: verification.data.id.toString(),
                    providerPayload: verification.data,
                    status: 'CONFIRMED',
                    paymentDate: new Date(),
                    recordedByUserId: actorUserId || attempt.createdByUserId,
                    notes: 'Confirmed via UnifiedPaymentService'
                }
            });

            // 3. Allocate to Invoices
            const billingServiceInstance = new (require('./billing.service'))();
            await billingServiceInstance.allocatePaymentToInvoices(payment, attempt.vendorId, {
                selectedInvoiceIds: attempt.selectedInvoices.map(si => si.invoiceId),
                restrictToSelected: true
            });

            // 4. Update Attempt Status
            await prisma.paymentAttempt.update({
                where: { id: attempt.id },
                data: {
                    status: 'SUCCESSFUL',
                    confirmedAmount,
                    verifiedAt: new Date(),
                    providerTransactionId: verification.data.id.toString()
                }
            });

            // 5. Trigger Fiscalization for each affected invoice
            for (const si of attempt.selectedInvoices) {
                await this.fiscalizeInvoice(si.invoiceId);
            }

            return { status: 'success', message: 'Payment finalized, allocated, and fiscalized' };
        } else if (verification.data && verification.data.status === 'pending') {
            await prisma.paymentAttempt.update({
                where: { id: attempt.id },
                data: { status: 'PENDING_VERIFICATION' }
            });
            return { status: 'pending', message: 'Payment is still pending' };
        }

        await prisma.paymentAttempt.update({
            where: { id: attempt.id },
            data: { 
                status: 'FAILED',
                failureReason: verification.message || 'Verification failed'
            }
        });

        return { status: 'error', message: 'Payment verification failed' };
    }

    /**
     * Register invoice with EFRIS
     */
    async fiscalizeInvoice(invoiceId) {
        const invoice = await prisma.rentInvoice.findUnique({
            where: { id: invoiceId },
            include: { 
                vendor: true,
                lineItems: true
            }
        });

        if (!invoice) return;

        const fiscalData = {
            customerName: invoice.vendor.businessName,
            customerTIN: invoice.vendor.taxIdNumber || '0000000000',
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
