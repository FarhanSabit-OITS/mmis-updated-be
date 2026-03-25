// src/controllers/vendor.controller.js
/**
 * Vendor Controller
 * 
 * Handles vendor-related API endpoints for SuperAdmin
 */

const vendorService = require('../services/vendor.service');
const emailService = require('../services/email.service');
const prisma = require('../prisma');

/**
 * GET /api/superadmin/vendors
 * Get all vendors with comprehensive data
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20, max: 100)
 * - search: Search by vendor code, business name, or email
 * - kycStatus: Filter by KYC status
 * - marketId: Filter by primary market
 * - vatRegistered: Filter by VAT registration (true/false)
 * - sortBy: Sort field (createdAt, businessName, vendorCode)
 * - order: Sort order (asc/desc)
 */
exports.getAllVendors = async (req, res) => {
    try {
        const {
            page,
            limit,
            search,
            kycStatus,
            marketId,
            vatRegistered,
            sortBy,
            order
        } = req.query;

        // Validate KYC status if provided
        const validKycStatuses = [
            'NOT_SUBMITTED',
            'PENDING',
            'UNDER_REVIEW',
            'VERIFIED',
            'REJECTED',
            'EXPIRED'
        ];

        if (kycStatus && !validKycStatuses.includes(kycStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid kycStatus. Must be one of: ${validKycStatuses.join(', ')}`
            });
        }

        // Build filters object
        const filters = {
            search,
            kycStatus,
            marketId: req.user.roleName === 'MarketMaster' ? req.user.marketId : marketId,
            vatRegistered,
            sortBy,
            order
        };

        // Build pagination object
        const pagination = {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20
        };

        // Validate pagination
        if (pagination.page < 1) {
            return res.status(400).json({
                success: false,
                message: 'Page number must be greater than 0'
            });
        }

        if (pagination.limit < 1 || pagination.limit > 100) {
            return res.status(400).json({
                success: false,
                message: 'Limit must be between 1 and 100'
            });
        }

        // Get vendors data
        const result = await vendorService.getAllVendorsWithDetails(filters, pagination);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Get all vendors error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

/**
 * POST /api/superadmin/vendors
 * Create a new vendor
 * 
 * Request body:
 * - email: Vendor email (required)
 * - firstName: First name (required)
 * - lastName: Last name (required)
 * - businessName: Business name (required)
 * - businessType: Business type
 * - primaryMarketId: Primary market ID
 * - vatRegistered: Boolean
 * - vatNumber: VAT number
 * - phone: Phone number
 */
exports.createVendor = async (req, res) => {
    try {
        const {
            email,
            firstName,
            lastName,
            businessName
        } = req.body;

        // Basic validation
        if (!email || !firstName || !lastName || !businessName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, firstName, lastName, businessName'
            });
        }

        const result = await vendorService.createVendor(req.body);

        // Send verification email
        try {
            const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?token=${result.verificationToken}&tokenType=vendor-password-setup`;
            
            const emailHtml = `
                <div style="font-family:system-ui,Segoe UI,Arial,sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1e293b; margin-bottom: 16px;">Welcome to MarketMaster, ${firstName}!</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                        Your vendor account has been created by the SuperAdmin. To activate your account and start managing your business, please verify your email and set a secure password.
                    </p>
                    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                        <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">
                            <strong>Business:</strong> ${businessName}
                        </p>
                        <p style="color: #64748b; font-size: 14px; margin: 0;">
                            <strong>Email:</strong> ${email}
                        </p>
                    </div>
                    <p style="margin-bottom: 20px;">
                        <a href="${verifyUrl}"
                           style="background:#2563eb;color:#fff;padding: 12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight: bold;font-size: 14px;">
                           Verify Email & Set Password
                        </a>
                    </p>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">If the button doesn't work, copy and paste this URL into your browser:</p>
                    <p style="word-break:break-all; color: #2563eb; font-size: 12px;">${verifyUrl}</p>
                    <p style="margin-top:32px;font-size:12px;color:#94a3b8;border-top: 1px solid #f1f5f9; padding-top: 16px;">
                        This verification link is valid for 24 hours. For security reasons, do not share this link with anyone else.
                    </p>
                </div>
            `;

            await emailService.sendVerificationEmail(email, verifyUrl);
            console.log(`✅ Verification email sent to ${email}`);
        } catch (emailErr) {
            console.error('Failed to send verification email:', emailErr);
            // Don't fail the request if email fails, but log it
        }

        return res.status(201).json({
            success: true,
            message: 'Vendor created successfully. Verification email sent.',
            data: {
                vendor: result.vendor,
                message: 'A verification email has been sent to ' + result.verificationEmail
            }
        });
    } catch (err) {
        console.error('Create vendor error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

/**
 * DELETE /api/superadmin/vendors/:id
 * Delete (deactivate) a vendor
 */
exports.deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Vendor ID is required'
            });
        }

        await vendorService.deleteVendor(id);

        return res.status(200).json({
            success: true,
            message: 'Vendor deleted successfully'
        });
    } catch (err) {
        console.error('Delete vendor error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

/**
 * POST /api/superadmin/vendors/:id/approve
 * Approve a pending vendor/supplier registration
 */
exports.approveVendor = async (req, res) => {
    try {
        const { id } = req.params; // This is the user ID to approve

        let adminId = null;

        if (req.user.roleName === 'MarketMaster') {
            const admin = await prisma.admin.findUnique({
                where: { userId: req.user.userId }
            });

            if (!admin) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden. You are not registered as an administrator.'
                });
            }

            adminId = admin.id;
        } else if (req.user.roleName !== 'SuperAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. Admin privileges required.'
            });
        }

        const result = await vendorService.approveRegistration(id, adminId, req.user.roleName);

        return res.status(200).json({
            success: true,
            message: 'Registration approved successfully',
            data: result
        });
    } catch (err) {
        console.error('Approve vendor error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Internal server error',
        });
    }
};

/**
 * POST /api/superadmin/vendors/:id/reject
 * Reject a pending vendor/supplier registration
 */
exports.rejectVendor = async (req, res) => {
    try {
        const { id } = req.params;

        let adminId = null;

        if (req.user.roleName === 'MarketMaster') {
            const admin = await prisma.admin.findUnique({
                where: { userId: req.user.userId }
            });

            if (!admin) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden. You are not registered as an administrator.'
                });
            }

            adminId = admin.id;
        } else if (req.user.roleName !== 'SuperAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. Admin privileges required.'
            });
        }

        const result = await vendorService.rejectRegistration(id, adminId, req.user.roleName);

        return res.status(200).json({
            success: true,
            message: 'Registration rejected successfully',
            data: result
        });
    } catch (err) {
        console.error('Reject vendor error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Internal server error',
        });
    }
};


