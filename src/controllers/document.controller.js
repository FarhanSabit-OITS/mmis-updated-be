const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all documents across the system with filtering
 */
exports.getDocuments = async (req, res) => {
    try {
        const { marketId, type, status, stakeholderId, search } = req.query;

        const where = {};
        if (marketId) {
            // Document is linked to stakeholder, who might be linked to market
            where.stakeholder = {
                vendor: { marketId },
                // or other stakeholder types if they have marketId
            };
        }
        if (type) where.documentType = type;
        if (status) where.verificationStatus = status;
        if (stakeholderId) where.stakeholderId = stakeholderId;
        if (search) {
            where.fileName = { contains: search, mode: 'insensitive' };
        }

        const documents = await prisma.document.findMany({
            where,
            include: {
                stakeholder: {
                    include: {
                        user: {
                            include: { profile: true }
                        },
                        vendor: true,
                        supplier: true
                    }
                }
            },
            orderBy: { uploadedAt: 'desc' }
        });

        return res.status(200).json({ success: true, data: documents });
    } catch (error) {
        console.error('[DocumentController] Error fetching documents:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve documents' });
    }
};

/**
 * Verify or Reject a document
 */
exports.verifyDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, verifiedById, expiryDate } = req.body;

        const updatedDoc = await prisma.document.update({
            where: { id },
            data: {
                verificationStatus: status, // VERIFIED, REJECTED
                verificationNotes: notes,
                verifiedById,
                verificationDate: new Date(),
                expiryDate: expiryDate ? new Date(expiryDate) : undefined
            }
        });

        return res.status(200).json({ success: true, data: updatedDoc });
    } catch (error) {
        console.error('[DocumentController] Error verifying document:', error);
        return res.status(500).json({ success: false, message: 'Failed to update document status' });
    }
};

/**
 * Get Compliance Alerts (Expiring/Expired documents)
 */
exports.getComplianceAlerts = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const threshold = new Date();
        threshold.setDate(threshold.getDate() + parseInt(days));

        const alerts = await prisma.document.findMany({
            where: {
                expiryDate: {
                    lte: threshold
                },
                verificationStatus: 'VERIFIED'
            },
            include: {
                stakeholder: {
                    include: {
                        user: { include: { profile: true } }
                    }
                }
            },
            orderBy: { expiryDate: 'asc' }
        });

        return res.status(200).json({ success: true, data: alerts });
    } catch (error) {
        console.error('[DocumentController] Compliance alerts error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch compliance alerts' });
    }
};
