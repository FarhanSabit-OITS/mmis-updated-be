const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Helper to generate unique codes
const generateUniqueCode = (prefix) => {
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
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

            // C. Create Shop
            // Check for level (optional, default to null or find first)
            const level = await tx.marketLevel.findFirst({ where: { marketId } });
            const levelId = level ? level.id : null;

            const shopUniqueCode = generateUniqueCode('SHP');
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
            const stallUniqueCode = generateUniqueCode('STL');
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

            return { shop, stall, vendor };
        }, {
            maxWait: 5000, // default: 2000
            timeout: 20000 // default: 5000
        });

        // 3. Return updated info
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
