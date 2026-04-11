const complianceService = require('../services/compliance.service');
const prisma = require('../shared/prisma'); // ✅ Shared singleton — avoids duplicate connection pool

/**
 * Compliance Controller
 * Handles administrative audit triggers and reports
 */

/**
 * Trigger a full market compliance audit
 * Scans for rent delinquency and document expiry
 */
exports.triggerAudit = async (req, res) => {
    try {
        console.log(`[ComplianceController] Audit triggered by admin: ${req.user?.userId || 'SYSTEM'}`);
        
        const rentResult = await complianceService.processRentCompliance();
        const docResult = await complianceService.checkDocumentCompliance();

        // ✅ NEW: Log administrative action in the AuditLog
        await complianceService.logAudit({
            action: 'COMPLIANCE_AUDIT_TRIGGERED',
            entityType: 'MARKET',
            entityId: req.user?.marketId || 'GLOBAL',
            userId: req.user?.userId,
            endpoint: '/api/compliance/audit',
            httpMethod: 'POST',
            newData: { rentProcessed: rentResult.processedCount, docsChecked: docResult.count },
            success: true
        });

        return res.status(200).json({
            success: true,
            message: 'Compliance audit completed successfully',
            data: {
                rentRecordsProcessed: rentResult.processedCount,
                expiringDocsNotified: docResult.count
            }
        });
    } catch (error) {
        console.error('[ComplianceController] Audit error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during compliance audit',
            error: error.message
        });
    }
};

/**
 * Get a high-level compliance dashboard for administrators
 */
exports.getComplianceDashboard = async (req, res) => {
    try {
        const now = new Date();
        
        // 1. Get Delinquency Stats
        const pendingPayments = await prisma.rentPayment.findMany({
            where: { status: 'PENDING', dueDate: { lt: now } },
            select: { dueDate: true }
        });

        const stats = {
            warning: 0,   // 10-20 days
            urgent: 0,    // 20-30 days
            critical: 0,  // 30-90 days
            terminated: 0 // handled by contract status check
        };

        pendingPayments.forEach(p => {
            const days = Math.floor((now - new Date(p.dueDate)) / (1000 * 60 * 60 * 24));
            if (days >= 30) stats.critical++;
            else if (days >= 20) stats.urgent++;
            else if (days >= 10) stats.warning++;
        });

        // 2. Count terminated contracts
        const terminatedCount = await prisma.rentContract.count({
            where: { status: 'TERMINATED' }
        });

        // 3. Count locked facilities
        const lockedCount = await prisma.facility.count({
            where: { occupationStatus: 'LOCKED' }
        });

        return res.status(200).json({
            success: true,
            data: {
                ...stats,
                terminated: terminatedCount,
                locked: lockedCount,
                totalOverdue: pendingPayments.length
            }
        });
    } catch (error) {
        console.error('[ComplianceController] Dashboard error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
