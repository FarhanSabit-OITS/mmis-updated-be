// src/services/vendor.service.js
/**
 * Vendor Service
 * 
 * Business logic for vendor-related operations
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = new PrismaClient();

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

    const where = buildVendorFilters(filters);
    const orderBy = buildSortClause(filters.sortBy, filters.order);

    // Execute queries in parallel
    const [vendors, totalCount] = await Promise.all([
        prisma.vendor.findMany({
            where,
            include: {
                stakeholder: {
                    include: {
                        user: {
                            include: {
                                profile: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        nationalId: true,
                                        primaryPhone: true,
                                        city: true,
                                        district: true,
                                        profilePictureUrl: true
                                    }
                                }
                            }
                        }
                    }
                },
                primaryMarket: {
                    select: {
                        id: true,
                        name: true,
                        uniqueCode: true,
                        address: true,
                        city: {
                            select: {
                                name: true,
                                district: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                stalls: {
                    include: {
                        shop: {
                            select: {
                                shopNumber: true,
                                shopName: true,
                                uniqueCode: true
                            }
                        },
                        market: {
                            select: {
                                name: true,
                                uniqueCode: true
                            }
                        }
                    },
                    where: {
                        status: { not: 'DELETED' }
                    }
                },
                approvedByMarketMaster: {
                    include: {
                        admin: {
                            include: {
                                user: {
                                    include: {
                                        profile: {
                                            select: {
                                                firstName: true,
                                                lastName: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        stalls: true,
                        gateEntries: true,
                        taxPayments: true,
                        rentContracts: true,
                        marketTokens: true,
                        invitations: true
                    }
                }
            },
            orderBy,
            skip,
            take: safeLimit
        }),
        prisma.vendor.count({ where })
    ]);

    // Get last gate entry for each vendor
    const vendorsWithStats = await Promise.all(
        vendors.map(async (vendor) => {
            const lastGateEntry = await prisma.gateEntry.findFirst({
                where: { vendorId: vendor.id },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true }
            });

            // Count active stalls
            const activeStallsCount = vendor.stalls.filter(
                stall => stall.status === 'ACTIVE'
            ).length;

            return {
                id: vendor.id,
                vendorCode: vendor.vendorCode,
                businessName: vendor.businessName,
                businessType: vendor.businessType,
                businessLicenseNumber: vendor.businessLicenseNumber,
                taxIdNumber: vendor.taxIdNumber,
                vatRegistered: vendor.vatRegistered,
                vatNumber: vendor.vatNumber,
                yearsInBusiness: vendor.yearsInBusiness,
                preferredMarkets: vendor.preferredMarkets,
                primaryMarket: vendor.primaryMarket,
                stakeholder: {
                    id: vendor.stakeholder.id,
                    kycStatus: vendor.stakeholder.kycStatus,
                    kycVerifiedAt: vendor.stakeholder.kycVerifiedAt,
                    businessRating: vendor.stakeholder.businessRating,
                    taxComplianceStatus: vendor.stakeholder.taxComplianceStatus,
                    user: {
                        id: vendor.stakeholder.user.id,
                        email: vendor.stakeholder.user.email,
                        phone: vendor.stakeholder.user.phone,
                        status: vendor.stakeholder.user.status,
                        emailVerified: vendor.stakeholder.user.emailVerified,
                        phoneVerified: vendor.stakeholder.user.phoneVerified,
                        lastLogin: vendor.stakeholder.user.lastLogin,
                        profile: vendor.stakeholder.user.profile
                    }
                },
                stalls: vendor.stalls.map(stall => ({
                    id: stall.id,
                    stallNumber: stall.stallNumber,
                    uniqueCode: stall.uniqueCode,
                    displayName: stall.displayName,
                    category: stall.category,
                    stallType: stall.stallType,
                    status: stall.status,
                    operationalStatus: stall.operationalStatus,
                    dailyRate: stall.dailyRate,
                    monthlyRate: stall.monthlyRate,
                    contractStartDate: stall.contractStartDate,
                    contractEndDate: stall.contractEndDate,
                    shop: stall.shop,
                    market: stall.market
                })),
                stats: {
                    totalStalls: vendor._count.stalls,
                    activeStalls: activeStallsCount,
                    totalGateEntries: vendor._count.gateEntries,
                    totalTaxPayments: vendor._count.taxPayments,
                    totalRentContracts: vendor._count.rentContracts,
                    totalMarketTokens: vendor._count.marketTokens,
                    totalInvitations: vendor._count.invitations,
                    lastGateEntry: lastGateEntry?.createdAt || null
                },
                approvedBy: vendor.approvedByMarketMaster ? {
                    adminId: vendor.approvedByMarketMaster.admin.id,
                    marketMasterName: `${vendor.approvedByMarketMaster.admin.user.profile?.firstName || ''} ${vendor.approvedByMarketMaster.admin.user.profile?.lastName || ''}`.trim() || vendor.approvedByMarketMaster.admin.user.email
                } : null,
                createdAt: vendor.stakeholder.createdAt,
                updatedAt: vendor.stakeholder.updatedAt
            };
        })
    );

    const totalPages = Math.ceil(totalCount / safeLimit);

    return {
        vendors: vendorsWithStats,
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
        password = 'Vendor@123', // Default password
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
    const passwordHash = await bcrypt.hash(password, 10);

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

        // 2. Create User
        const user = await tx.user.create({
            data: {
                email: normalizedEmail,
                passwordHash,
                phone: phone || null,
                status: 'ACTIVE',
                emailVerified: true,
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

        return vendor;
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

module.exports = {
    getAllVendorsWithDetails,
    createVendor,
    deleteVendor,
    buildVendorFilters,
    buildSortClause
};
