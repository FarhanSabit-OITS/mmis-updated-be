const { PrismaClient } = require('@prisma/client');
const notificationService = require('./notification.service');

const prisma = new PrismaClient();

/**
 * Compliance Service
 * Handles Rent Delinquency Tiered Alerts and Facility Lockdown logic
 */

const STAGES = {
    GRACE_PERIOD: 10,
    WARNING: 10,
    URGENT: 20,
    FINAL_NOTICE: 30,
    TERMINATION: 93,
    LOCKOUT: 95
};

/**
 * Scan all pending rent payments and process their delinquency lifecycle
 */
async function processRentCompliance() {
    console.log('[ComplianceService] Starting Rent Compliance Audit...');
    const now = new Date();

    try {
        // 1. Fetch all pending rent payments with their contracts and facilities
        const pendingPayments = await prisma.rentPayment.findMany({
            where: {
                status: 'PENDING',
                dueDate: { lt: now }
            },
            include: {
                contract: {
                    include: {
                        tenant: { include: { user: true } },
                        facility: true
                    }
                }
            }
        });

        console.log(`[ComplianceService] Found ${pendingPayments.length} overdue payments.`);

        for (const payment of pendingPayments) {
            const dueDate = new Date(payment.dueDate);
            const daysPastDue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
            
            await handlePaymentDelinquency(payment, daysPastDue);
        }

        return { success: true, processedCount: pendingPayments.length };
    } catch (error) {
        console.error('[ComplianceService] Error in processRentCompliance:', error);
        throw error;
    }
}

/**
 * Process a single payment based on its delinquency stage
 */
async function handlePaymentDelinquency(payment, daysPastDue) {
    const { contract } = payment;
    const tenant = contract.tenant;
    const userId = tenant.userId;
    const facilityId = contract.facilityId;

    // Logic for skipping if recently notified (e.g., weekly)
    const lastAlertDate = payment.metadata?.lastAlertSentAt ? new Date(payment.metadata.lastAlertSentAt) : null;
    const isWeeklyElapsed = !lastAlertDate || (Date.now() - lastAlertDate.getTime()) > (7 * 24 * 60 * 60 * 1000);

    if (daysPastDue >= STAGES.LOCKOUT) {
        // Stage 95+: Theoretical Full Lockout
        // Handled via gatekeeper, but we can update metadata
    } 
    
    if (daysPastDue >= STAGES.TERMINATION) {
        // Stage 93: Hard Termination
        if (contract.status !== 'TERMINATED') {
            console.log(`[ComplianceService] Terminating contract ${contract.contractNumber} due to ${daysPastDue} days delinquency.`);
            
            await prisma.$transaction([
                // Terminate contract
                prisma.rentContract.update({
                    where: { id: contract.id },
                    data: { status: 'TERMINATED', isActive: false, terminationDate: new Date(), terminationReason: 'Unpaid dues > 90 days' }
                }),
                // Vacate facility
                prisma.facility.update({
                    where: { id: facilityId },
                    data: { occupationStatus: 'VACANT' }
                }),
                // Notify
                notificationService.notify({
                    userId,
                    title: 'CRITICAL: Contract Terminated',
                    message: `Your contract for ${contract.facility.name} has been terminated due to long-term delinquency (90+ days). The facility has been vacated.`,
                    type: 'ERROR',
                    sendEmail: true,
                    ctaTag: 'TERMINATION NOTICE'
                })
            ]);
        }
        return;
    }

    // Weekly Alerts for Day 10 to 92
    if (daysPastDue >= STAGES.WARNING && isWeeklyElapsed) {
        let title, message, type = 'WARNING';
        
        if (daysPastDue >= STAGES.FINAL_NOTICE) {
            title = 'FINAL NOTICE: Rent Delinquency';
            message = `URGENT: Your rent for ${contract.facility.name} is ${daysPastDue} days overdue. You are in the Final Notice stage. Failure to pay will result in contract termination at 93 days.`;
            type = 'ERROR';
        } else if (daysPastDue >= STAGES.URGENT) {
            title = 'Urgent: Rent Payment Required';
            message = `Notice: Rent for ${contract.facility.name} is ${daysPastDue} days overdue. Please clear your balance to avoid escalation.`;
        } else {
            title = 'Notice: Rent Due';
            message = `Your rent for ${contract.facility.name} is ${daysPastDue} days past due. Please ignore if already paid.`;
        }

        await notificationService.notify({
            userId,
            title,
            message,
            type,
            sendEmail: true,
            actionUrl: `/payments/rent/${payment.id}`,
            ctaTag: daysPastDue >= 30 ? 'FINAL NOTICE' : (daysPastDue >= 20 ? 'URGENT PAYMENT' : 'RENT DUE')
        });

        // Update last alert metadata
        await prisma.rentPayment.update({
            where: { id: payment.id },
            data: {
                metadata: {
                    ...(payment.metadata || {}),
                    lastAlertSentAt: new Date().toISOString(),
                    delinquencyStage: daysPastDue >= 30 ? 'FINAL' : (daysPastDue >= 20 ? 'URGENT' : 'WARNING')
                }
            }
        });
    }
}

/**
 * Audit Document Compliance
 */
async function checkDocumentCompliance() {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    try {
        const expiringDocs = await prisma.document.findMany({
            where: {
                expiryDate: {
                    gt: now,
                    lt: thirtyDaysFromNow
                },
                verificationStatus: 'VERIFIED'
            },
            include: { stakeholder: { include: { user: true } } }
        });

        for (const doc of expiringDocs) {
            const userId = doc.stakeholder.userId;
            const daysRemaining = Math.ceil((doc.expiryDate - now) / (1000 * 60 * 60 * 24));

            // Only notify at 30, 14, and 7 days
            if ([30, 14, 7, 3, 1].includes(daysRemaining)) {
                await notificationService.notify({
                    userId,
                    title: 'Document Expiring Soon',
                    message: `Your document "${doc.fileName}" (${doc.documentType}) expires in ${daysRemaining} days. Please upload a renewal.`,
                    type: 'WARNING',
                    actionUrl: '/compliance/documents'
                });
            }
        }
        
        return { success: true, count: expiringDocs.length };
    } catch (error) {
        console.error('[ComplianceService] Error in checkDocumentCompliance:', error);
        throw error;
    }
}

module.exports = {
    processRentCompliance,
    checkDocumentCompliance
};
