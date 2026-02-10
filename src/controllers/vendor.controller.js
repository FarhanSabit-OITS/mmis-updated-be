// src/controllers/vendor.controller.js
/**
 * Vendor Controller
 * 
 * Handles vendor-related API endpoints for SuperAdmin
 */

const vendorService = require('../services/vendor.service');

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
            marketId,
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
 * - password: Password (optional, defaults to Vendor@123)
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

        return res.status(201).json({
            success: true,
            message: 'Vendor created successfully',
            data: result
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
