
const prisma = require('../shared/prisma');
const emailService = require('../services/email.service');
const crypto = require('crypto');

/**
 * Super Admin generates an invitation for a new Admin
 */
exports.generateInvitation = async (req, res) => {
    try {
        const { email, recipientName, adminLevel, marketId, ttlHours = 48, roleId, manualPassword } = req.body;

        // 1. Validation
        if (!email.endsWith('@mmis.ug')) {
            return res.status(400).json({ message: "Only @mmis.ug domains are allowed for admin onboarding." });
        }

        // 2. Generate unique token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + (ttlHours * 60 * 60 * 1000));

        // 3. Create Invitation Record
        const invitation = await prisma.invitation.create({
            data: {
                email,
                recipientName,
                invitationType: 'ADMIN_ONBOARDING',
                token,
                status: 'PENDING',
                expiresAt,
                marketScopeId: marketId,
                roleId,
                sentByAdminId: req.user.id, // Using standard id from authMiddleware
                metadata: {
                    level: adminLevel,
                    temporaryPassword: manualPassword || crypto.randomBytes(8).toString('hex')
                }
            }
        });

        // 4. Send Email
        await emailService.sendAdminInvitationEmail({
            email,
            name: recipientName,
            token,
            tempPassword: invitation.metadata.temporaryPassword,
            expiresAt
        });

        res.status(201).json({ 
            message: "Invitation sent successfully", 
            invitationId: invitation.id,
            expiresAt 
        });

    } catch (error) {
        console.error("Invitation Error:", error);
        res.status(500).json({ message: "Error generating invitation", error: error.message });
    }
};

/**
 * Provisional Admin verifies the physical Handshake Code from Market Authority
 */
exports.verifyHandshake = async (req, res) => {
    try {
        const { invitationToken, handshakeCode } = req.body;

        // 1. Find the invitation
        const invitation = await prisma.invitation.findUnique({
            where: { token: invitationToken },
            include: { handshakeCode: true }
        });

        if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid or expired invitation token." });
        }

        // 2. Validate Handshake Code
        const validCode = await prisma.handshakeCode.findFirst({
            where: {
                invitationId: invitation.id,
                code: handshakeCode,
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });

        if (!validCode) {
            return res.status(400).json({ message: "Invalid or expired handshake code." });
        }

        // 3. Mark code as used
        await prisma.handshakeCode.update({
            where: { id: validCode.id },
            data: { isUsed: true, usedAt: new Date() }
        });

        res.status(200).json({ message: "Handshake verified. You can now set your password." });

    } catch (error) {
        res.status(500).json({ message: "Verification Error", error: error.message });
    }
};

/**
 * Market Authority worker Task: Issue code to a person after physical NIN verification
 */
exports.generateHandshakeCode = async (req, res) => {
    try {
        const { invitationId } = req.body;

        // Check if invitation exists
        const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
        if (!invitation) return res.status(404).json({ message: "Invitation not found" });

        // Generate a simple 6-digit numeric code for physical handover
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const handshake = await prisma.handshakeCode.upsert({
            where: { invitationId },
            update: {
                code,
                expiresAt: new Date(Date.now() + (2 * 60 * 60 * 1000)), // 2 hours
                isUsed: false
            },
            create: {
                invitationId,
                code,
                issuedById: req.user.id, // MA Personnel
                expiresAt: new Date(Date.now() + (2 * 60 * 60 * 1000))
            }
        });

        res.status(200).json({ 
            message: "Handshake code generated", 
            code, // MA person gives this code to the candidate physically
            expiresAt: handshake.expiresAt 
        });

    } catch (error) {
        res.status(500).json({ message: "Code Generation Error", error: error.message });
    }
};

/**
 * Market Authority Emergency Lock
 * Instantly revokes an invitation and locks associated provisional accounts
 */
exports.emergencyLock = async (req, res) => {
    try {
        const { invitationId, reason } = req.body;

        const invitation = await prisma.invitation.update({
            where: { id: invitationId },
            data: {
                status: 'REVOKED',
                metadata: {
                    lockedBy: req.user.id,
                    lockReason: reason,
                    lockedAt: new Date()
                }
            }
        });

        // If an admin record was already created but is PROVISIONAL, we should lock it too
        // This requires an Admin search by email from the invitation
        await prisma.admin.updateMany({
            where: { 
                email: invitation.email,
                status: 'PROVISIONAL' 
            },
            data: { 
                status: 'LOCKED',
                metadata: {
                    lockReason: `Emergency lock by MA: ${reason}`
                }
            }
        });

        res.status(200).json({ 
            success: true,
            message: "Emergency lock engaged. Invitation revoked and provisional access terminated." 
        });

    } catch (error) {
        res.status(500).json({ message: "Emergency Lock Error", error: error.message });
    }
};

/**
 * GET /api/onboarding/requests
 * Get all pending onboarding and verification requests globally
 */
exports.getPendingRequests = async (req, res) => {
    try {
        const { marketId } = req.query;

        const invitations = await prisma.invitation.findMany({
            where: {
                status: 'PENDING',
                ...(marketId && { marketScopeId: marketId })
            },
            include: {
                handshakeCode: true,
                marketScope: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to a unified 'Request' format
        const requests = invitations.map(inv => ({
            id: inv.id,
            type: 'USER_ONBOARDING',
            source: inv.email,
            subject: inv.recipientName,
            status: inv.status,
            market: inv.marketScope?.name || 'GLOBAL',
            date: inv.createdAt,
            hasHandshake: !!inv.handshakeCode
        }));

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
