const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();
const { generateUniqueCode } = require('../utils/identifier');

const SYSTEM_LANDLORD_EMAIL = 'market.administration@marketmaster.local';

const ensureSystemLandlordMember = async (tx) => {
    let user = await tx.user.findUnique({
        where: { email: SYSTEM_LANDLORD_EMAIL }
    });

    if (!user) {
        user = await tx.user.create({
            data: {
                email: SYSTEM_LANDLORD_EMAIL,
                passwordHash: crypto.randomBytes(32).toString('hex'),
                emailVerified: true,
                status: 'ACTIVE'
            }
        });
    }

    let stakeholder = await tx.stakeholder.findUnique({
        where: { userId: user.id }
    });

    if (!stakeholder) {
        stakeholder = await tx.stakeholder.create({
            data: {
                userId: user.id,
                stakeholderType: 'MEMBER',
                kycStatus: 'VERIFIED'
            }
        });
    }

    let member = await tx.member.findUnique({
        where: { stakeholderId: stakeholder.id }
    });

    if (!member) {
        member = await tx.member.create({
            data: {
                stakeholderId: stakeholder.id,
                membershipNumber: generateUniqueCode('MEMBER'),
                membershipType: 'FULL',
                businessName: 'Market Administration',
                registrationNumber: generateUniqueCode('LAND')
            }
        });
    }

    return member;
};

/**
 * Validates if the user is a vendor and processes their shop setup
 */
exports.setupShop = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { 
            marketId, shopName, stallNumber, monthlyRent, taxIdNumber,
            bankName, bankAccountNumber, bankAccountName,
            mobileMoneyNumber, mobileMoneyNetwork
        } = req.body;
        const tinDocument = req.file;
        let parsedMonthlyRent = Number(monthlyRent);

        // Prefill rent from market if not provided
        if (!parsedMonthlyRent || isNaN(parsedMonthlyRent)) {
            const market = await prisma.market.findUnique({
                where: { id: marketId },
                select: { averageRent: true }
            });
            if (market && market.averageRent) {
                parsedMonthlyRent = Number(market.averageRent);
            } else {
                parsedMonthlyRent = 0; // Fallback if no rate set
            }
        }

        if (!marketId || !shopName || !taxIdNumber) {
            return res.status(400).json({
                success: false,
                message: 'Market selection, Shop Name, and TIN Number are required'
            });
        }

        if (!tinDocument) {
            return res.status(400).json({
                success: false,
                message: 'TIN Document upload is required for onboarding'
            });
        }

        if (!Number.isFinite(parsedMonthlyRent) || parsedMonthlyRent <= 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid monthly rent amount is required'
            });
        }

        // 1. Get User and Stakeholder info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                stakeholder: {
                    include: {
                        vendor: true,
                        member: true
                    }
                },
                profile: true
                ,
                userRoles: {
                    include: { role: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const hasVendorRole = user.userRoles.some((ur) => ur.role?.name === 'Vendor' && ur.isActive !== false);
        let stakeholder = user.stakeholder;
        let vendor = stakeholder?.vendor;

        if (!stakeholder || stakeholder.stakeholderType !== 'VENDOR' || !vendor) {
            if (!hasVendorRole) {
                return res.status(403).json({
                    success: false,
                    message: 'User is not recognized as a valid vendor. Please contact support.'
                });
            }

            const recovered = await prisma.$transaction(async (tx) => {
                let fixedStakeholder = stakeholder;
                if (!fixedStakeholder) {
                    fixedStakeholder = await tx.stakeholder.create({
                        data: {
                            userId,
                            stakeholderType: 'VENDOR',
                            kycStatus: 'VERIFIED'
                        }
                    });
                } else if (fixedStakeholder.stakeholderType !== 'VENDOR') {
                    fixedStakeholder = await tx.stakeholder.update({
                        where: { id: fixedStakeholder.id },
                        data: {
                            stakeholderType: 'VENDOR',
                            kycStatus: fixedStakeholder.kycStatus === 'NOT_SUBMITTED' ? 'VERIFIED' : fixedStakeholder.kycStatus
                        }
                    });
                }

                let fixedVendor = vendor;
                if (!fixedVendor) {
                    fixedVendor = await tx.vendor.create({
                        data: {
                            stakeholderId: fixedStakeholder.id,
                            vendorCode: generateUniqueCode('VND'),
                            businessName: shopName || user.profile?.firstName || user.email.split('@')[0],
                            businessType: 'Retail',
                            primaryMarketId: marketId
                        }
                    });
                }

                return { stakeholder: fixedStakeholder, vendor: fixedVendor };
            });

            stakeholder = {
                ...recovered.stakeholder,
                member: user.stakeholder?.member || null
            };
            vendor = recovered.vendor;
        }

        const stakeholderId = stakeholder.id;
        const vendorId = vendor.id;

        // 2. Perform Transaction
        const result = await prisma.$transaction(async (tx) => {
            // A. Create Member record if missing
            let memberId = stakeholder.member?.id;
            if (!memberId) {
                const membershipNumber = generateUniqueCode('MBR');
                const newMember = await tx.member.create({
                    data: {
                        stakeholder: { connect: { id: stakeholderId } },
                        membershipNumber,
                        membershipType: 'FULL',
                        businessName: shopName || user.profile?.firstName || 'My Business',
                        registrationNumber: generateUniqueCode('REG'),
                        membershipSince: new Date()
                    }
                });
                memberId = newMember.id;
            }

            // B. Update Vendor primary market if needed
            if (!vendor.primaryMarketId || vendor.primaryMarketId !== marketId) {
                await tx.vendor.update({
                    where: { id: vendorId },
                    data: { primaryMarketId: marketId }
                });
            }

            // C. Create Shop
            // Check for level (optional, default to null or find first)
            const level = await tx.marketLevel.findFirst({ where: { marketId } });
            const levelId = level ? level.id : null;

            const shopUniqueCode = generateUniqueCode('SHOP');
            const shopNumberVal = `SHOP-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

            const shop = await tx.shop.create({
                data: {
                    market: { connect: { id: marketId } },
                    createdBy: { connect: { id: userId } },
                    member: { connect: { id: memberId } },
                    ...(levelId ? { level: { connect: { id: levelId } } } : {}),
                    uniqueCode: shopUniqueCode,
                    shopNumber: shopNumberVal,
                    shopName: shopName,
                    shopType: 'RETAIL',
                    status: 'ACTIVE',
                    occupationStatus: 'OCCUPIED',
                    contractStartDate: new Date(),
                    contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    monthlyRent: parsedMonthlyRent.toFixed(2),
                    maintenanceFee: "0.00"
                }
            });

            // D. Create Stall
            const stallUniqueCode = generateUniqueCode('STALL');
            const stallNumVal = stallNumber || `S-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

            const stall = await tx.stall.create({
                data: {
                    vendor: { connect: { id: vendorId } },
                    market: { connect: { id: marketId } },
                    createdBy: { connect: { id: userId } },
                    shop: { connect: { id: shop.id } }, // Connect to the created shop
                    stallNumber: stallNumVal,
                    uniqueCode: stallUniqueCode,
                    displayName: shopName,
                    stallType: 'PERMANENT',
                    status: 'ACTIVE',
                    category: 'Retail',
                    dailyRate: "0.00", // Decimal as string is safer
                    monthlyRate: parsedMonthlyRent.toFixed(2),
                    contractStartDate: new Date(),
                    contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                }
            });

            // E. Create Document for TIN
            await tx.document.create({
                data: {
                    stakeholderId: stakeholderId,
                    documentType: 'TAX_REGISTRATION',
                    fileName: tinDocument.filename,
                    fileUrl: `/uploads/${tinDocument.filename}`,
                    fileSize: tinDocument.size,
                    mimeType: tinDocument.mimetype,
                    uploadedById: userId,
                    verificationStatus: 'PENDING',
                    metadata: {
                        field: 'TIN',
                        taxIdNumber: taxIdNumber
                    }
                }
            });

            // F. Update UserProfile with TIN and Payment Info
            await tx.userProfile.update({
                where: { userId },
                data: { 
                    taxIdNumber,
                    bankName,
                    bankAccountNumber,
                    bankAccountName,
                    mobileMoneyNumber,
                    mobileMoneyNetwork
                }
            });

            // G. Create Rent Contract
            const landlordMember = await ensureSystemLandlordMember(tx);
            const contract = await tx.rentContract.create({
                data: {
                    shopId: shop.id,
                    landlordId: landlordMember.id,
                    tenantId: vendorId,
                    startDate: shop.contractStartDate,
                    endDate: shop.contractEndDate,
                    durationMonths: 12,
                    monthlyRent: parsedMonthlyRent.toFixed(2),
                    paymentDay: shop.paymentDay || 1,
                    status: 'ACTIVE',
                    isActive: true,
                    contractNumber: generateUniqueCode('CONTRACT'),
                    metadata: {
                        source: 'VENDOR_ONBOARDING',
                        autoGenerated: true
                    },
                    createdById: userId
                }
            });

            // H. Create Initial Rent Invoice
            await tx.rentInvoice.create({
                data: {
                    shopId: shop.id,
                    contractId: contract.id,
                    amount: parsedMonthlyRent.toFixed(2),
                    taxAmount: (parsedMonthlyRent * 0.18).toFixed(2), // Assume 18% VAT
                    totalAmount: (parsedMonthlyRent * 1.18).toFixed(2),
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Due in 7 days
                    periodStart: new Date(),
                    periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    status: 'PENDING',
                    invoiceNumber: generateUniqueCode('INV'),
                    marketId: marketId
                }
            });

            // I. Upgrade Role to Vendor if it was Guest
            const vendorRole = await tx.role.findUnique({ where: { name: 'Vendor' } });
            if (vendorRole) {
                // Check if user already has Vendor role
                const hasVendorRole = await tx.userRole.findFirst({
                    where: { userId, roleId: vendorRole.id }
                });

                if (!hasVendorRole) {
                    // Remove old roles (like Guest)
                    await tx.userRole.deleteMany({ where: { userId } });
                    // Add Vendor role
                    await tx.userRole.create({
                        data: {
                            userId,
                            roleId: vendorRole.id
                        }
                    });
                }
            }

            return { shop, stall, vendor };
        }, {
            maxWait: 5000,
            timeout: 20000
        });

        // 3. Notify Market Masters for TIN Verification
        try {
            const marketMasters = await prisma.marketMaster.findMany({
                where: { marketId },
                include: { stakeholder: { include: { user: true } } }
            });

            const notificationPromises = marketMasters.map(mm => {
                return prisma.notification.create({
                    data: {
                        userId: mm.stakeholder.userId,
                        title: 'New TIN Verification Required',
                        message: `Vendor "${shopName}" has completed onboarding. Please verify their TIN: ${taxIdNumber}`,
                        type: 'KYC_PENDING',
                        priority: 'HIGH',
                        metadata: {
                            vendorId: result.vendor.id,
                            shopId: result.shop.id,
                            taxIdNumber
                        }
                    }
                });
            });
            await Promise.all(notificationPromises);
        } catch (notifError) {
            console.error("Failed to send onboarding notifications:", notifError);
            // Don't fail the whole request if notifications fail
        }

        // 4. Return updated info
        // Fetch refreshed user data to return exact same structure as login
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                stakeholder: {
                    include: {
                        vendor: { include: { stalls: true } }
                    }
                },
                userRoles: { include: { role: true } }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Shop and Stall created successfully',
            data: {
                shopId: result.shop.id,
                stallId: result.stall.id,
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    role: updatedUser.userRoles[0]?.role?.name || 'Vendor',
                    status: 'ACTIVE',
                    vendorId: updatedUser.stakeholder?.vendor?.id,
                    stalls: updatedUser.stakeholder?.vendor?.stalls || [],
                    kycStatus: updatedUser.stakeholder?.kycStatus
                }
            }
        });

    } catch (error) {
        console.error('Setup Shop Error Full Stack:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create shop: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

/**
 * Setup Supplier Profile for new or seeded Supplier
 * POST /api/suppliers/setup-profile
 * Body: { marketId, businessName, businessType, taxIdNumber }
 * File: tinDocument
 */
exports.setupSupplier = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { 
            marketId, businessName, businessType, taxIdNumber,
            bankName, bankAccountNumber, bankAccountName,
            mobileMoneyNumber, mobileMoneyNetwork
        } = req.body;
        const tinDocument = req.file;

        if (!marketId || !businessName || !taxIdNumber) {
            return res.status(400).json({
                success: false,
                message: 'Market selection, Business Name, and TIN Number are required'
            });
        }

        if (!tinDocument) {
            return res.status(400).json({
                success: false,
                message: 'TIN Document upload is required for onboarding'
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Ensure Stakeholder exists
            const stakeholder = await tx.stakeholder.upsert({
                where: { userId: userId },
                update: {
                    displayName: businessName,
                    stakeholderType: 'ORGANIZATION'
                },
                create: {
                    userId: userId,
                    displayName: businessName,
                    stakeholderType: 'ORGANIZATION',
                    kycStatus: 'PENDING'
                }
            });

            const stakeholderId = stakeholder.id;

            // 2. Create/Update Supplier record
            const supplier = await tx.supplier.upsert({
                where: { stakeholderId: stakeholderId },
                update: {
                    companyName: businessName,
                    supplierType: businessType || 'GENERAL',
                    status: 'ACTIVE'
                },
                create: {
                    stakeholderId: stakeholderId,
                    companyName: businessName,
                    supplierCode: `SUP-${Date.now().toString().slice(-6)}`,
                    supplierType: businessType || 'GENERAL',
                    status: 'ACTIVE'
                }
            });

            // 3. Update UserProfile with TIN and Payment Info
            await tx.userProfile.update({
                where: { userId },
                data: { 
                    taxIdNumber,
                    bankName,
                    bankAccountNumber,
                    bankAccountName,
                    mobileMoneyNumber,
                    mobileMoneyNetwork
                }
            });

            // 4. Create Document for TIN
            await tx.document.create({
                data: {
                    stakeholderId: stakeholderId,
                    documentType: 'TAX_REGISTRATION',
                    fileName: tinDocument.filename,
                    fileUrl: `/uploads/${tinDocument.filename}`,
                    fileSize: tinDocument.size,
                    mimeType: tinDocument.mimetype,
                    uploadedById: userId,
                    verificationStatus: 'PENDING',
                    metadata: {
                        field: 'TIN',
                        taxIdNumber: taxIdNumber,
                        onboardingType: 'SUPPLIER'
                    }
                }
            });

            // 5. Upgrade Role to Supplier if it was Guest
            const supplierRole = await tx.role.findUnique({ where: { name: 'Supplier' } });
            if (supplierRole) {
                // Remove old roles (like Guest)
                await tx.userRole.deleteMany({ where: { userId } });
                // Add Supplier role
                await tx.userRole.create({
                    data: {
                        userId,
                        roleId: supplierRole.id
                    }
                });
            }

            return { supplier };
        }, {
            maxWait: 5000,
            timeout: 20000
        });

        // 6. Return updated info
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                stakeholder: {
                    include: {
                        supplier: true
                    }
                },
                userRoles: { include: { role: true } }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Supplier profile setup successfully',
            data: {
                supplierId: result.supplier.id,
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    role: updatedUser.userRoles[0]?.role?.name || 'Supplier',
                    status: 'ACTIVE',
                    supplierId: updatedUser.stakeholder?.supplier?.id,
                    kycStatus: updatedUser.stakeholder?.kycStatus
                }
            }
        });

    } catch (error) {
        console.error('Setup Supplier Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to setup supplier profile: ' + error.message
        });
    }
};
