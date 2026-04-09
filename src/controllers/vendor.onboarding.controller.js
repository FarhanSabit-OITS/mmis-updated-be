const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Helper to generate unique codes
const generateUniqueCode = (prefix) => {
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

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
                membershipNumber: generateUniqueCode('LLD'),
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
        const { marketId, shopName, stallNumber, monthlyRent } = req.body;
        const parsedMonthlyRent = Number(monthlyRent);

        if (!marketId || !shopName) {
            return res.status(400).json({
                success: false,
                message: 'Market selection and Shop Name are required'
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
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.stakeholder || user.stakeholder.stakeholderType !== 'VENDOR' || !user.stakeholder.vendor) {
            // Try to recover if they have the role but no record
            // This part assumes they SHOULD be a vendor
            return res.status(403).json({
                success: false,
                message: 'User is not recognized as a valid vendor. Please contact support.'
            });
        }

        const stakeholderId = user.stakeholder.id;
        const vendor = user.stakeholder.vendor;
        const vendorId = vendor.id;

        // 2. Perform Transaction
        const result = await prisma.$transaction(async (tx) => {
            // A. Create Member record if missing
            let memberId = user.stakeholder.member?.id;
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

            // C. Create Facility
            const level = await tx.marketLevel.findFirst({ where: { marketId } });
            const levelId = level ? level.id : null;

            const facilityUniqueCode = generateUniqueCode('FAC');
            const facilityNumberVal = stallNumber || `F-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

            const facility = await tx.facility.create({
                data: {
                    market: { connect: { id: marketId } },
                    createdBy: { connect: { id: userId } },
                    member: { connect: { id: memberId } },
                    vendors: { connect: { id: vendorId } },
                    ...(levelId ? { level: { connect: { id: levelId } } } : {}),
                    uniqueCode: facilityUniqueCode,
                    unitNumber: facilityNumberVal,
                    facilityName: shopName,
                    type: 'SHOP',
                    status: 'ACTIVE',
                    occupationStatus: 'OCCUPIED',
                    contractStartDate: new Date(),
                    contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    monthlyRent: parsedMonthlyRent.toFixed(2),
                    maintenanceFee: "0.00"
                }
            });

            const landlordMember = await ensureSystemLandlordMember(tx);
            await tx.rentContract.create({
                data: {
                    facilityId: facility.id,
                    landlordId: landlordMember.id,
                    tenantId: vendorId,
                    startDate: facility.contractStartDate,
                    endDate: facility.contractEndDate,
                    durationMonths: 12,
                    monthlyRent: parsedMonthlyRent.toFixed(2),
                    paymentDay: 1, // Defaulting to 1st
                    status: 'ACTIVE',
                    isActive: true,
                    contractNumber: generateUniqueCode('CTR'),
                    metadata: {
                        source: 'VENDOR_ONBOARDING',
                        autoGenerated: true
                    },
                    createdById: userId
                }
            });

            return { facility, vendor };
        }, {
            maxWait: 5000,
            timeout: 20000
        });

        // 3. Return updated info
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                stakeholder: {
                    include: {
                        vendor: { include: { facilities: true } }
                    }
                },
                userRoles: { include: { role: true } }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Facility created and vendor assigned successfully',
            data: {
                facilityId: result.facility.id,
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    role: updatedUser.userRoles[0]?.role?.name || 'Vendor',
                    status: 'ACTIVE',
                    vendorId: updatedUser.stakeholder?.vendor?.id,
                    facilities: updatedUser.stakeholder?.vendor?.facilities || [],
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
