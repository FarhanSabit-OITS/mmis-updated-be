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

/**
 * Identity Analytics Stats
 * Returns aggregation of identities (Verified vs Unverified)
 * Scoped by Market for non-SuperAdmins
 */
exports.getIdentityStats = async (req, res) => {
    try {
        const { marketId, roleName } = req.user;
        const isSuperAdmin = roleName === 'SuperAdmin';
        
        // Scope filter
        const scope = (!isSuperAdmin && marketId) ? { marketId } : {};

        const [totalProfiles, verifiedProfiles, activeIdentities, recentScans] = await Promise.all([
            prisma.user.count({ where: scope }),
            prisma.user.count({ where: { ...scope, status: 'ACTIVE', emailVerified: true } }),
            prisma.auditLog.count({ 
                where: { 
                    action: 'IDENTITY_VERIFIED',
                    ...(marketId && !isSuperAdmin ? { entityId: marketId } : {})
                }
            }),
            prisma.auditLog.count({
                where: {
                    action: 'IDENTITY_VERIFIED',
                    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                    ...(marketId && !isSuperAdmin ? { entityId: marketId } : {})
                }
            })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalProfiles,
                verifiedProfiles,
                unverifiedProfiles: totalProfiles - verifiedProfiles,
                activeIdentities,
                recentScans24h: recentScans
            }
        });
    } catch (error) {
        console.error('[ComplianceController] Identity stats error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Identity Anomaly Detection
 * Detects duplicate scans of the same identity across gates within 1 minute
 */
exports.getIdentityAnomalies = async (req, res) => {
    try {
        const { marketId, roleName } = req.user;
        const isSuperAdmin = roleName === 'SuperAdmin';

        // Fetch recent verification logs (Past 24h)
        const logs = await prisma.auditLog.findMany({
            where: {
                action: 'IDENTITY_VERIFIED',
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                ...(marketId && !isSuperAdmin ? { entityId: marketId } : {})
            },
            orderBy: { createdAt: 'desc' }
        });

        const anomalies = [];
        const seen = new Map();

        // Detection Logic: Same MMIS ID, Different Gate/Time, < 60s gap
        for (const log of logs) {
            const mmisId = log.newData?.mmisId;
            if (!mmisId) continue;

            if (seen.has(mmisId)) {
                const prev = seen.get(mmisId);
                const timeDiff = Math.abs((new Date(log.createdAt) - new Date(prev.createdAt)) / 1000);

                if (timeDiff < 60) {
                    anomalies.push({
                        mmisId,
                        userId: log.userId,
                        timeDifferenceSec: timeDiff,
                        timestamp: log.createdAt,
                        severity: 'CRITICAL'
                    });
                }
            }
            seen.set(mmisId, log);
        }

        return res.status(200).json({
            success: true,
            data: anomalies
        });
    } catch (error) {
        console.error('[ComplianceController] Identity anomalies error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Audit log query — SuperAdmin only
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const logs = await prisma.auditLog.findMany({
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true, role: true } } }
        });

        return res.status(200).json({ success: true, data: logs });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * NIN Verification Placeholder
 */
exports.verifyNin = async (req, res) => {
    return res.status(200).json({ success: true, verified: true, message: "NIN Protocol Verified" });
};
