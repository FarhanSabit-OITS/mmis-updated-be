const prisma = require('../prisma');

/**
 * Application Controller
 * Handles vendor and staff application logic.
 */

exports.getAll = async (req, res) => {
    try {
        const { status, type } = req.query;
        // Search in KycSubmission as the proxy for "applications"
        const submissions = await prisma.kycSubmission.findMany({
            where: {
                status: status || undefined,
            },
            include: {
                stakeholder: {
                    include: {
                        user: {
                            include: {
                                profile: true
                            }
                        }
                    }
                }
            }
        });

        const formatted = submissions.map(s => ({
            id: s.id,
            type: s.stakeholder.stakeholderType,
            status: s.status,
            submittedAt: s.submittedAt,
            email: s.stakeholder.user.email,
            name: `${s.stakeholder.user.profile?.firstName || ''} ${s.stakeholder.user.profile?.lastName || ''}`.trim()
        }));

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (err) {
        console.error('getApplications error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.submit = async (req, res) => {
    try {
        const { userId } = req.user;
        const applicationData = req.body;

        // Implementation of submission logic
        // Find existing stakeholder
        const stakeholder = await prisma.stakeholder.findUnique({
            where: { userId }
        });

        if (!stakeholder) {
            return res.status(404).json({ success: false, message: 'Stakeholder profile not found' });
        }

        const submission = await prisma.kycSubmission.create({
            data: {
                stakeholderId: stakeholder.id,
                status: 'SUBMITTED',
                submittedAt: new Date(),
                documentUrls: applicationData.documents || {},
                metadata: applicationData
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: submission
        });
    } catch (err) {
        console.error('submitApplication error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.approve = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId: adminId } = req.user;

        const submission = await prisma.kycSubmission.update({
            where: { id },
            data: {
                status: 'VERIFIED',
                verifiedAt: new Date(),
                verifiedByAdminId: adminId // This assumes admin ID is correct from token
            }
        });

        // Also update stakeholder KYC status
        await prisma.stakeholder.update({
            where: { id: submission.stakeholderId },
            data: {
                kycStatus: 'VERIFIED',
                kycVerifiedAt: new Date()
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Application approved successfully',
            data: submission
        });
    } catch (err) {
        console.error('approveApplication error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.reject = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const submission = await prisma.kycSubmission.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: reason
            }
        });

        await prisma.stakeholder.update({
            where: { id: submission.stakeholderId },
            data: { kycStatus: 'REJECTED' }
        });

        return res.status(200).json({
            success: true,
            message: 'Application rejected successfully',
            data: submission
        });
    } catch (err) {
        console.error('rejectApplication error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
