// src/services/vendor.service.js
/**
 * Vendor Service
 * 
 * Business logic for vendor-related operations
 */

const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Build Prisma where clause from query parameters
 * @param {Object} queryParams - Query parameters from request
 * @returns {Object} Prisma where clause
 */
const buildVendorFilters = (queryParams) => {
    const where = {};

    // Search by vendor code, business name, or email
    if (queryParams.search) {
        const searchTerm = queryParams.search.trim();
        where.OR = [
            { vendorCode: { contains: searchTerm, mode: 'insensitive' } },
            { businessName: { contains: searchTerm, mode: 'insensitive' } },
            {
                stakeholder: {
                    user: {
                        email: { contains: searchTerm, mode: 'insensitive' }
                    }
                }
            }
        ];
    }

    // Filter by KYC status
    if (queryParams.kycStatus) {
        where.stakeholder = {
            ...where.stakeholder,
            kycStatus: queryParams.kycStatus
        };
    }

    // Filter by primary market
    if (queryParams.marketId) {
        where.primaryMarketId = queryParams.marketId;
    }

    // Filter by VAT registration
    if (queryParams.vatRegistered !== undefined) {
        where.vatRegistered = queryParams.vatRegistered === 'true';
    }

    // Exclude soft-deleted vendors (where user status is DELETED)
    where.stakeholder = {
        ...where.stakeholder,
        user: {
            ...where.stakeholder?.user,
            status: { not: 'DELETED' }
        }
    };

    return where;
};

/**
 * Build Prisma orderBy clause from query parameters
 * @param {string} sortBy - Field to sort by
 * @param {string} order - Sort order (asc/desc)
 * @returns {Object} Prisma orderBy clause
 */
const buildSortClause = (sortBy = 'vendorCode', order = 'desc') => {
    const validOrders = ['asc', 'desc'];
    const direction = validOrders.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';

    // Map sort fields to actual Vendor model fields
    // Note: Vendor model doesn't have createdAt/updatedAt directly
    switch (sortBy) {
        case 'createdAt':
        case 'updatedAt':
            // Sort by stakeholder's timestamp fields
            return {
                stakeholder: {
                    [sortBy]: direction
                }
            };
        case 'businessName':
            return { businessName: direction };
        case 'vendorCode':
            return { vendorCode: direction };
        default:
            // Default to vendorCode if invalid field
            return { vendorCode: direction };
    }
};

/**
 * Get all vendors with comprehensive details
 * @param {Object} filters - Query filters
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Vendors data with pagination
 */
const getAllVendorsWithDetails = async (filters, pagination) => {
    const { page = 1, limit = 20 } = pagination;

    // Ensure limit is within bounds
    const safeLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const safePage = Math.max(1, parseInt(page));
    const skip = (safePage - 1) * safeLimit;

    // Build Stakeholder Where Clause
    const where = {};

    // 1. Search
    if (filters.search) {
        const searchTerm = filters.search.trim();
        where.OR = [
            { vendor: { vendorCode: { contains: searchTerm, mode: 'insensitive' } } },
            { vendor: { businessName: { contains: searchTerm, mode: 'insensitive' } } },
            { supplier: { supplierCode: { contains: searchTerm, mode: 'insensitive' } } },
            { supplier: { businessName: { contains: searchTerm, mode: 'insensitive' } } },
            { user: { email: { contains: searchTerm, mode: 'insensitive' } } }
        ];
    }

    // 2. KYC Status
    if (filters.kycStatus) {
        where.kycStatus = filters.kycStatus;
    }

    // 3. Market Filter (Complex: Vendor.primaryMarketId OR Supplier.invitation.metadata.marketId)
    if (filters.marketId) {
        const marketFilter = [
            { vendor: { primaryMarketId: filters.marketId } },
            {
                stakeholderType: 'SUPPLIER',
                user: {
                    acceptedInvitations: {
                        some: {
                            metadata: {
                                path: ['marketId'],
                                equals: filters.marketId
                            }
                        }
                    }
                }
            }
        ];

        if (where.OR) {
            // Combine existing search OR with market OR using AND
            where.AND = [
                { OR: where.OR },
                { OR: marketFilter }
            ];
            delete where.OR;
        } else {
            where.OR = marketFilter;
        }
    } else {
        // If no market filter, maybe just show all Vendors/Suppliers?
        // But usually we only want Vendors/Suppliers, not Members/MarketAuthorities
        if (!where.OR && !where.AND) {
            where.stakeholderType = { in: ['VENDOR', 'SUPPLIER'] };
        } else {
            where.AND = [
                ...(where.AND || []),
                { stakeholderType: { in: ['VENDOR', 'SUPPLIER'] } }
            ];
        }
    }

    // 4. VAT and Soft Delete
    if (filters.vatRegistered !== undefined) {
        // Only applies to Vendors really, but we can filter
        where.vendor = { vatRegistered: filters.vatRegistered === 'true' };
    }

    // User status check
    where.user = {
        ...where.user,
        status: { not: 'DELETED' }
    };

    // Sort
    let orderBy = {};
    if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
        orderBy[filters.sortBy] = filters.order || 'desc';
    } else {
        orderBy.createdAt = 'desc';
    }

    // Execute Query
    const [stakeholders, totalCount] = await Promise.all([
        prisma.stakeholder.findMany({
            where,
            include: {
                user: {
                    include: {
                        profile: true,
                        acceptedInvitations: true // verify metadata
                    }
                },
                vendor: {
                    include: {
                        primaryMarket: { include: { city: { include: { district: true } } } },
                        stalls: { include: { shop: true, market: true }, where: { status: { not: 'DELETED' } } },
                        approvedByMarketMaster: { include: { admin: { include: { user: { include: { profile: true } } } } } },
                        _count: { select: { stalls: true, gateEntries: true, taxPayments: true, rentContracts: true, marketTokens: true, invitations: true } }
                    }
                },
                supplier: {
                    include: {
                        invitations: true
                    }
                }
            },
            orderBy,
            skip,
            take: safeLimit
        }),
        prisma.stakeholder.count({ where })
    ]);

    // Map to unified structure
    const mappedResults = await Promise.all(stakeholders.map(async (sh) => {
        // Prepare base object
        const base = {
            id: sh.vendor?.id || sh.supplier?.id || sh.id, // Prefer specific ID
            vendorCode: sh.vendor?.vendorCode || sh.supplier?.supplierCode,
            businessName: sh.vendor?.businessName || sh.supplier?.businessName,
            businessType: sh.vendor?.businessType || sh.supplier?.supplierType,
            primaryMarketId: sh.vendor?.primaryMarketId || null,

            // Reconstruct the nested structure frontend expects
            stakeholder: {
                id: sh.id,
                kycStatus: sh.kycStatus,
                user: {
                    id: sh.user.id,
                    email: sh.user.email,
                    phone: sh.user.phone,
                    status: sh.user.status,
                    emailVerified: sh.user.emailVerified,
                    profile: sh.user.profile
                }
            },

            // Vendor specific
            stalls: sh.vendor?.stalls || [],
            stats: sh.vendor ? {
                totalStalls: sh.vendor._count.stalls,
                activeStalls: sh.vendor.stalls.filter(s => s.status === 'ACTIVE').length,
                totalGateEntries: sh.vendor._count.gateEntries
            } : {},

            approvedBy: sh.vendor?.approvedByMarketMaster ? {
                adminId: sh.vendor.approvedByMarketMaster.admin.id,
                marketMasterName: sh.vendor.approvedByMarketMaster.admin.user.profile?.firstName
            } : null,

            createdAt: sh.createdAt,
            updatedAt: sh.updatedAt
        };

        // If Supplier, try to find market from invitation for display (optional)
        if (sh.supplier && !base.primaryMarketId) {
            const marketInv = sh.user.acceptedInvitations.find(i => i.metadata?.marketId);
            if (marketInv && marketInv.metadata?.marketId) {
                // We could fetch market name here if crucial, but frontend just displays ID or "Pending"
                base.primaryMarketId = marketInv.metadata.marketId; // Hint for frontend
            }
        }

        return base;
    }));

    const totalPages = Math.ceil(totalCount / safeLimit);

    return {
        vendors: mappedResults, // Keep key 'vendors' for frontend compatibility
        pagination: {
            currentPage: safePage,
            totalPages,
            totalCount,
            limit: safeLimit,
            hasNext: safePage < totalPages,
            hasPrev: safePage > 1
        }
    };
};

/**
 * Create a new vendor with associated user and stakeholder
 * @param {Object} vendorData - Data for the new vendor
 * @returns {Promise<Object>} Created vendor data
 */
const createVendor = async (vendorData) => {
    const {
        email,
        firstName,
        lastName,
        businessName,
        businessType,
        primaryMarketId,
        vatRegistered = false,
        vatNumber,
        phone
    } = vendorData;

    const normalizedEmail = email.toLowerCase().trim();
    // Generate a temporary random password for the account pending email verification
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Pre-check for unique constraints
    if (phone) {
        const existingPhone = await prisma.user.findUnique({
            where: { phone }
        });
        if (existingPhone) {
            throw new Error(`Phone number ${phone} is already registered to another user.`);
        }
    }

    const existingEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail }
    });
    if (existingEmail) {
        throw new Error(`Email ${normalizedEmail} is already registered.`);
    }

    return await prisma.$transaction(async (tx) => {
        // 1. Find the Vendor role
        const vendorRole = await tx.role.findUnique({
            where: { name: 'Vendor' }
        });

        if (!vendorRole) {
            throw new Error('Vendor role not found in database');
        }

        // 2. Create User with PENDING status and email NOT verified
        const user = await tx.user.create({
            data: {
                email: normalizedEmail,
                passwordHash,
                phone: phone || null,
                status: 'PENDING', // Status is PENDING until email is verified
                emailVerified: false, // Not verified yet
                userRoles: {
                    create: {
                        roleId: vendorRole.id
                    }
                },
                profile: {
                    create: {
                        firstName,
                        lastName,
                        primaryPhone: phone || '',
                        primaryEmail: normalizedEmail
                    }
                }
            }
        });

        // 3. Create Stakeholder
        const stakeholder = await tx.stakeholder.create({
            data: {
                userId: user.id,
                stakeholderType: 'VENDOR',
                kycStatus: 'NOT_SUBMITTED'
            }
        });

        // 4. Generate Vendor Code
        const uniqueSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
        const vendorCode = `VND-${uniqueSuffix}`;

        // 5. Create Vendor
        const vendor = await tx.vendor.create({
            data: {
                stakeholderId: stakeholder.id,
                vendorCode,
                businessName,
                businessType,
                primaryMarketId,
                vatRegistered,
                vatNumber
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
                },
                primaryMarket: true
            }
        });

        // 6. Create Invitation token for email verification
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1); // Expires in 24 hours

        const invitation = await tx.invitation.create({
            data: {
                email: normalizedEmail,
                token: verificationToken,
                invitationType: 'VENDOR_REGISTRATION',
                status: 'PENDING',
                expiresAt,
                metadata: {
                    purpose: 'VENDOR_EMAIL_VERIFY_AND_SET_PASSWORD',
                    firstName,
                    lastName,
                    businessName,
                    vendorId: vendor.id,
                    stakeholderId: stakeholder.id
                }
            }
        });

        // Return vendor with invitation token info for email sending
        return {
            vendor,
            verificationToken: invitation.token,
            verificationEmail: normalizedEmail
        };
    }, {
        timeout: 30000 // 30 seconds
    });
};

/**
 * Delete a vendor (Soft delete by updating user status)
 * @param {string} vendorId - ID of the vendor to delete
 * @returns {Promise<Object>} Updated vendor or user data
 */
const deleteVendor = async (vendorId) => {
    const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: {
            stakeholder: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!vendor) {
        throw new Error('Vendor not found');
    }

    // Soft delete by updating the user status
    return await prisma.user.update({
        where: { id: vendor.stakeholder.userId },
        data: {
            status: 'DELETED',
            deletedAt: new Date()
        }
    });
};

/**
 * Approve a pending registration
 * @param {string} userId - ID of the user to approve
 * @param {string} adminId - ID of the Admin performing the approval
 * @returns {Promise<Object>} Updated user data
 */
const approveRegistration = async (userId, adminId, approverRoleName = 'MarketMaster') => {
    return await prisma.$transaction(async (tx) => {
        // 1. Get user with stakeholder info
        const user = await tx.user.findUnique({
            where: { id: userId },
            include: {
                stakeholder: {
                    include: {
                        vendor: true,
                        supplier: true
                    }
                }
            }
        });

        if (!user) throw new Error('User not found');
        if (!user.stakeholder) throw new Error('Stakeholder record not found');
        if (user.stakeholder.kycStatus !== 'UNDER_REVIEW' && user.stakeholder.kycStatus !== 'PENDING') {
            // Allow PENDING too just in case it wasn't marked UNDER_REVIEW properly
            console.log(`Current status: ${user.stakeholder.kycStatus}`);
        }

        // Determine target role (Vendor or Supplier)
        let targetRoleName = user.stakeholder.stakeholderType === 'VENDOR' ? 'Vendor' : 'Supplier';

        // 2. Find the role
        const role = await tx.role.findUnique({ where: { name: targetRoleName } });
        if (!role) throw new Error(`${targetRoleName} role not found`);

        // 3. Update User Role (promote from Guest)
        // Find Guest role ID first to be safe
        const guestRole = await tx.role.findUnique({ where: { name: 'Guest' } });
        if (guestRole) {
            await tx.userRole.deleteMany({
                where: {
                    userId: user.id,
                    roleId: guestRole.id
                }
            });
        }

        // Check if user already has the target role to avoid unique constraint error
        const existingTargetRole = await tx.userRole.findUnique({
            where: {
                userId_roleId: {
                    userId: user.id,
                    roleId: role.id
                }
            }
        });

        if (!existingTargetRole) {
            await tx.userRole.create({
                data: {
                    userId: user.id,
                    roleId: role.id
                }
            });
        }

        // 4. Update Stakeholder status
        const stakeholderUpdateData = {
            kycStatus: 'VERIFIED',
            kycVerifiedAt: new Date()
        };

        if (adminId) {
            stakeholderUpdateData.kycVerifiedByAdminId = adminId;
        }

        await tx.stakeholder.update({
            where: { id: user.stakeholder.id },
            data: stakeholderUpdateData
        });

        // 5. Update Vendor approval link if applicable
        if (targetRoleName === 'Vendor' && user.stakeholder.vendor && adminId) {
            const marketMaster = await tx.marketMaster.findUnique({
                where: { adminId: adminId }
            });

            if (marketMaster) {
                await tx.vendor.update({
                    where: { id: user.stakeholder.vendor.id },
                    data: { marketMasterApprovalId: marketMaster.id }
                });
            }
        }

        // 6. Notify user
        await tx.notification.create({
            data: {
                userId: user.id,
                type: 'REGISTRATION_APPROVED',
                title: 'Welcome: Registration Approved!',
                message: `Congratulations! Your registration as a ${targetRoleName} has been approved by the ${approverRoleName === 'SuperAdmin' ? 'Super Admin' : 'Market Administrator'}. You now have full access to your respective portal.`,
                priority: 'HIGH',
                actionLabel: 'Go to Dashboard',
                actionUrl: '/dashboard'
            }
        });

        return user;
    }, {
        timeout: 30000 // 30 seconds
    });
};

/**
 * Reject a pending registration
 * @param {string} userId - ID of the user to reject
 * @param {string|null} adminId - ID of the Admin performing the rejection
 * @param {string} approverRoleName - Role name of the approver
 * @returns {Promise<Object>} Updated user data
 */
const rejectRegistration = async (userId, adminId, approverRoleName = 'MarketMaster') => {
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: userId },
            include: {
                stakeholder: {
                    include: {
                        vendor: true,
                        supplier: true
                    }
                }
            }
        });

        if (!user) throw new Error('User not found');
        if (!user.stakeholder) throw new Error('Stakeholder record not found');

        const stakeholderUpdateData = {
            kycStatus: 'REJECTED'
        };

        if (adminId) {
            stakeholderUpdateData.kycVerifiedByAdminId = adminId;
        }

        await tx.stakeholder.update({
            where: { id: user.stakeholder.id },
            data: stakeholderUpdateData
        });

        await tx.notification.create({
            data: {
                userId: user.id,
                type: 'REGISTRATION_REJECTED',
                title: 'Registration Rejected',
                message: `Your registration has been rejected by the ${approverRoleName === 'SuperAdmin' ? 'Super Admin' : 'Market Administrator'}. Please contact support for next steps.`,
                priority: 'HIGH',
                actionLabel: 'Contact Support',
                actionUrl: '/support'
            }
        });

        return user;
    }, {
        timeout: 30000
    });
};

module.exports = {
    getAllVendorsWithDetails,
    createVendor,
    deleteVendor,
    approveRegistration,
    rejectRegistration,
    buildVendorFilters,
    buildSortClause
};
