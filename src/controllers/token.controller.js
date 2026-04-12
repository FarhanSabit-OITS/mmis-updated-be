const prisma = require('../prisma');
const crypto = require('crypto');
const complianceService = require('../services/compliance.service');

/**
 * Helper to generate a meaningful unique short code
 * Format: [MarketPrefix]-[RandomChars]
 */
async function generateShortCode(marketId) {
    const market = await prisma.market.findUnique({
        where: { id: marketId },
        select: { uniqueCode: true }
    });

    const prefix = market ? market.uniqueCode.substring(0, 3).toUpperCase() : 'MM';
    let code;
    let exists = true;

    while (exists) {
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        code = `${prefix}-${random}`;
        const existing = await prisma.marketToken.findUnique({
            where: { shortCode: code }
        });
        if (!existing) exists = false;
    }
    return code;
}

/**
 * Helper to calculate token expiry (Whichever is earlier: 24h or Midnight Today)
 */
function calculateExpiry() {
    const now = new Date();
    const twentyFourHours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);

    // If it's already past midnight technically (day change just happened) 
    // we use the end of the newly started day.
    return twentyFourHours < midnight ? twentyFourHours : midnight;
}

/**
 * Helper to ensure a market gate exists for operations
 */
async function getOrCreateGate(marketId, staffUserId) {
    let gate = await prisma.marketGate.findFirst({
        where: { marketId }
    });

    if (!gate) {
        const market = await prisma.market.findUnique({ where: { id: marketId } });
        gate = await prisma.marketGate.create({
            data: {
                marketId,
                uniqueCode: `${market?.uniqueCode || 'MKT'}-GATE-AUTO`,
                gateNumber: '01',
                gateName: 'Main Terminal',
                allowedVehicleTypes: ["Truck", "Van", "Pickup", "Car", "Motorcycle"],
                createdById: staffUserId
            }
        });
    }
    return gate;
}

/**
 * POST /api/market/tokens/entry
 * Generate a GATE_ENTRY token
 */
exports.generateEntryToken = async (req, res) => {
    try {
        const { marketId, userId: staffUserId } = req.user;
        const { isRegistered, supplierIdentifier, fullName, identificationNumber, vehicleNumber, vehicleType } = req.body;

        if (!marketId) {
            return res.status(400).json({ success: false, message: 'Market ID required' });
        }

        let tokenData = {
            tokenCode: crypto.randomBytes(16).toString('hex'),
            tokenType: 'GATE_ENTRY',
            shortCode: await generateShortCode(marketId),
            marketId,
            createdById: staffUserId,
            expiresAt: calculateExpiry(), 
            status: 'ACTIVE',
            vehicleNumber,
            vehicleType
        };

        if (isRegistered) {
            // Find supplier by email or code
            const supplier = await prisma.supplier.findFirst({
                where: {
                    OR: [
                        { supplierCode: supplierIdentifier },
                        { stakeholder: { user: { email: supplierIdentifier } } }
                    ]
                },
                include: { stakeholder: { include: { user: true } } }
            });

            if (!supplier) {
                return res.status(404).json({ success: false, message: 'Registered supplier not found' });
            }

            tokenData.userId = supplier.stakeholder.userId;
            tokenData.visitorName = `${supplier.stakeholder.user.profile?.firstName || ''} ${supplier.stakeholder.user.profile?.lastName || ''}`.trim() || supplier.stakeholder.user.email;
        } else {
            // Guest / Unregistered
            tokenData.visitorName = fullName;
            tokenData.visitorType = 'UNREGISTERED_SUPPLIER';
            tokenData.metadata = { identificationNumber };
        }

        const token = await prisma.marketToken.create({
            data: tokenData
        });

        // Log entry operation
        const gate = await getOrCreateGate(marketId, staffUserId);
        await prisma.gateOperation.create({
            data: {
                gateId: gate.id,
                operationType: 'ENTRY',
                tokenId: token.id,
                entityType: isRegistered ? 'SUPPLIER' : 'GUEST',
                entityName: tokenData.visitorName,
                vehicleNumber,
                vehicleType,
                recordedById: staffUserId
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Token generated successfully. Paper printout and Email payloads available.',
            data: {
                id: token.id,
                shortCode: token.shortCode,
                visitorName: token.visitorName,
                expiresAt: token.expiresAt,
                // Print and Email augmented payloads
                printUrl: `/api/market/tokens/${token.id}/print`,
                emailPayload: {
                    subject: 'Your Market Gate Entry Token',
                    body: `Hello ${tokenData.visitorName},\n\nYour Gate Entry Token is ${token.shortCode}.\nShow this QR code at the gate.`
                }
            }
        });

    } catch (err) {
        console.error('generateEntryToken error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * POST /api/market/tokens/supplier-delivery
 * Generate a token for a specific Supplier Delivery
 */
exports.generateSupplierDeliveryToken = async (req, res) => {
    try {
        const { deliveryId, gateId } = req.body;
        const { userId: staffUserId, marketId } = req.user;

        const delivery = await prisma.delivery.findUnique({
            where: { id: deliveryId },
            include: { supplier: { include: { stakeholder: true } } }
        });

        if (!delivery) {
            return res.status(404).json({ success: false, message: 'Delivery note not found' });
        }

        const tokenCode = crypto.randomBytes(16).toString('hex');
        const shortCode = await generateShortCode(marketId);

        const token = await prisma.marketToken.create({
            data: {
                tokenCode,
                tokenType: 'SUPPLIER_DELIVERY',
                shortCode,
                marketId,
                userId: delivery.supplier.stakeholder.userId,
                visitorName: delivery.supplier.businessName,
                vehicleNumber: delivery.vehicleNumber,
                createdById: staffUserId,
                expiresAt: calculateExpiry(), 
                status: 'ACTIVE',
                metadata: {
                    deliveryId: delivery.id,
                    orderId: delivery.orderId,
                    driverName: delivery.driverName,
                    driverPhone: delivery.driverPhone
                }
            }
        });

        // Log operation
        const gate = gateId ? await prisma.marketGate.findUnique({ where: { id: gateId } }) : await getOrCreateGate(marketId, staffUserId);
        
        await prisma.gateOperation.create({
            data: {
                gateId: gate.id,
                operationType: 'ENTRY',
                tokenId: token.id,
                entityType: 'SUPPLIER',
                entityName: delivery.supplier.businessName,
                vehicleNumber: delivery.vehicleNumber,
                recordedById: staffUserId
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Supplier delivery token generated',
            data: token
        });

    } catch (err) {
        console.error('generateSupplierDeliveryToken error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * GET /api/market/tokens/:code
 * Get token details by shortCode
 */
exports.getTokenDetails = async (req, res) => {
    try {
        const { code } = req.params;
        const { marketId } = req.user;

        const token = await prisma.marketToken.findFirst({
            where: {
                OR: [
                    { shortCode: code },
                    { shortCode: { endsWith: code } }
                ],
                ...req.jurisdiction
            },
            include: {
                user: { include: { profile: true } },
                gateOperations: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!token) {
            return res.status(404).json({ success: false, message: 'Token not found' });
        }

        return res.status(200).json({
            success: true,
            data: token
        });
    } catch (err) {
        console.error('getTokenDetails error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * POST /api/market/tokens/dispatch
 * Record stock dispatch (sale of goods) with VAT calculation
 */
exports.recordStockDispatch = async (req, res) => {
    try {
        const { tokenId, items, totalPrice } = req.body;
        const { userId: staffUserId, marketId } = req.user;

        const token = await prisma.marketToken.findUnique({
            where: { id: tokenId }
        });

        if (!token || token.status === 'USED' || token.status === 'EXPIRED') {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Get Market VAT Rate (Default to 18% as per user request)
        const market = await prisma.market.findUnique({
            where: { id: marketId },
            select: { vatRate: true }
        });
        const vatRate = market?.vatRate || 18;

        const totalExclVat = parseFloat(totalPrice) / (1 + (vatRate / 100));
        const vatAmount = parseFloat(totalPrice) - totalExclVat;

        await prisma.$transaction(async (tx) => {
            // 1. Create GateOperation for dispatch
            const gate = await getOrCreateGate(marketId, staffUserId);
            await tx.gateOperation.create({
                data: {
                    gateId: gate.id,
                    operationType: 'STOCK_DISPATCH',
                    tokenId: token.id,
                    goodsDescription: items.join(', '),
                    recordedById: staffUserId,
                    amount: totalPrice,
                    status: 'COMPLETED'
                }
            });

            // 2. Create Tax Record log
            await tx.gateOperation.create({
                data: {
                    gateId: gate.id,
                    operationType: 'TAX_COLLECTED',
                    tokenId: token.id,
                    recordedById: staffUserId,
                    amount: vatAmount,
                    inspectionNotes: `VAT collected at ${vatRate}%`
                }
            });

            // 3. Update Token status & Metadata
            await tx.marketToken.update({
                where: { id: token.id },
                data: {
                    status: 'ACTIVE',
                    tokenType: 'STOCK_DISPATCH',
                    amount: totalPrice,
                    metadata: {
                        ...(token.metadata || {}),
                        dispatched: true,
                        dispatchTime: new Date(),
                        totalPrice,
                        vatRate,
                        vatAmount: vatAmount.toFixed(2),
                        totalExclVat: totalExclVat.toFixed(2),
                        currency: 'UGX'
                    }
                }
            });
        });

        return res.status(200).json({
            success: true,
            message: 'Stock dispatch and VAT recorded successfully',
            receipt: {
                totalPrice,
                vatAmount: vatAmount.toFixed(2),
                vatRate
            }
        });

    } catch (err) {
        console.error('recordStockDispatch error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * POST /api/market/tokens/exit
 * Record exit and finalize token
 */
exports.recordExit = async (req, res) => {
    try {
        const { tokenId } = req.body;
        const { userId: staffUserId, marketId } = req.user;

        const token = await prisma.marketToken.findUnique({
            where: { id: tokenId }
        });

        if (!token) {
            return res.status(404).json({ success: false, message: 'Token not found' });
        }

        await prisma.$transaction(async (tx) => {
            const gate = await getOrCreateGate(marketId, staffUserId);
            await tx.gateOperation.create({
                data: {
                    gateId: gate.id,
                    operationType: 'EXIT',
                    tokenId: token.id,
                    recordedById: staffUserId,
                    exitTime: new Date()
                }
            });

            await tx.marketToken.update({
                where: { id: tokenId },
                data: {
                    status: 'USED',
                    tokenType: 'GATE_EXIT',
                    usedAt: new Date()
                }
            });
        });

        return res.status(200).json({
            success: true,
            message: 'Exit recorded successfully, token invalidated'
        });
    } catch (err) {
        console.error('recordExit error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * POST /api/market/tokens/tax
 * Record VAT/Tax collection
 */
exports.recordTax = async (req, res) => {
    try {
        const { tokenId, taxAmount } = req.body;
        const { userId: staffUserId, marketId } = req.user;

        const gate = await getOrCreateGate(marketId, staffUserId);
        await prisma.gateOperation.create({
            data: {
                gateId: gate.id,
                operationType: 'TAX_COLLECTED',
                tokenId,
                recordedById: staffUserId,
                amount: taxAmount
            }
        });

        return res.status(200).json({ success: true, message: 'Tax recorded successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * POST /api/market/tokens/parking
 * Assign vehicle to a parking or unloading zone
 */
exports.recordParking = async (req, res) => {
    try {
        const { tokenId, zoneId } = req.body;
        const { userId: staffUserId, marketId } = req.user;

        const gate = await getOrCreateGate(marketId, staffUserId);
        await prisma.gateOperation.create({
            data: {
                gateId: gate.id,
                operationType: 'PARKING_ASSIGNED',
                tokenId,
                recordedById: staffUserId,
                inspectionNotes: `Assigned to zone ${zoneId}`
            }
        });

        return res.status(200).json({ success: true, message: 'Parking assigned successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * POST /api/market/tokens/receipt
 * Authorize delivery receipt by Vendor/Stock Counter
 */
exports.recordStockReceipt = async (req, res) => {
    try {
        const { tokenId, itemsReceived } = req.body;
        const { userId: staffUserId, marketId } = req.user;

        const gate = await getOrCreateGate(marketId, staffUserId);
        await prisma.gateOperation.create({
            data: {
                gateId: gate.id,
                operationType: 'STOCK_RECEIPT',
                tokenId,
                goodsDescription: JSON.stringify(itemsReceived),
                recordedById: staffUserId,
                status: 'COMPLETED'
            }
        });

        return res.status(200).json({ success: true, message: 'Stock receipt verified' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ── NEW: Download Gate Token as PDF ──────────────────────────────────────────
const tokenPdfService = require('../services/token.pdf.service');

exports.downloadTokenPdf = async (req, res) => {
    try {
        const { code } = req.params;

        const token = await prisma.marketToken.findUnique({
            where: { shortCode: code },
            include: {
                vendor: { include: { primaryMarket: true } },
                market: true,
                recordedBy: { include: { profile: true } }
            }
        });

        if (!token) {
            return res.status(404).json({ success: false, message: 'Token not found' });
        }

        const pdfBuffer = await tokenPdfService.generateGateToken({
            tokenCode:    token.shortCode,
            tokenType:    token.tokenType   || 'ENTRY',
            vendorName:   token.vendor?.businessName || token.holderName || 'N/A',
            vendorCode:   token.vendor?.vendorCode   || token.identificationNumber || 'N/A',
            marketName:   token.market?.name         || 'MarketMaster Market',
            facilityName: token.facilityName || 'N/A',
            validFrom:    token.issuedAt    || token.createdAt,
            validUntil:   token.expiresAt,
            issuedBy:     token.recordedBy
                ? `${token.recordedBy.profile?.firstName || ''} ${token.recordedBy.profile?.lastName || ''}`.trim()
                : 'Gate Authority',
            payload: token.payload || {}
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Token-${code}.pdf"`);
        return res.send(pdfBuffer);
    } catch (err) {
        console.error('[TokenController] Token PDF error:', err);
        return res.status(500).json({ success: false, message: 'Failed to generate token PDF' });
    }
};

// ── NEW: Download KYC Verification Certificate PDF ────────────────────────────
exports.downloadKycCertificate = async (req, res) => {
    try {
        const { stakeholderId } = req.params;

        const stakeholder = await prisma.stakeholder.findUnique({
            where: { id: stakeholderId },
            include: {
                user:     { include: { profile: true } },
                vendor:   true,
                supplier: true,
                kycSubmissions: {
                    where:   { status: 'VERIFIED' },
                    orderBy: { reviewedAt: 'desc' },
                    take: 1,
                    include: { reviewedBy: { include: { user: { include: { profile: true } } } } }
                }
            }
        });

        if (!stakeholder) {
            return res.status(404).json({ success: false, message: 'Stakeholder not found' });
        }
        if (stakeholder.kycStatus !== 'VERIFIED') {
            return res.status(400).json({ success: false, message: 'KYC not yet verified for this stakeholder' });
        }

        const submission = stakeholder.kycSubmissions[0];
        const profile    = stakeholder.user?.profile;
        const vendor     = stakeholder.vendor;
        const supplier   = stakeholder.supplier;

        const pdfBuffer = await tokenPdfService.generateKycCertificate({
            vendorName:       profile ? `${profile.firstName} ${profile.lastName}` : vendor?.businessName || supplier?.businessName || 'N/A',
            vendorCode:       vendor?.vendorCode       || supplier?.supplierCode || 'N/A',
            nidNumber:        profile?.nationalId      || submission?.metadata?.nidNumber || '—',
            tinNumber:        profile?.taxIdNumber     || vendor?.taxIdNumber || submission?.metadata?.tinNumber || '—',
            binnNumber:       vendor?.businessLicenseNumber || submission?.metadata?.binnNumber || '—',
            verifiedAt:       submission?.reviewedAt   || stakeholder.kycVerifiedAt,
            verifiedBy:       submission?.reviewedBy
                ? `${submission.reviewedBy.user?.profile?.firstName || ''} ${submission.reviewedBy.user?.profile?.lastName || ''}`.trim()
                : 'Market Administrator',
            marketName:       'MarketMaster Market Authority',
            tokenCode:        `KYC-CERT-${stakeholderId.slice(0, 8).toUpperCase()}`,
            stakeholderType:  vendor ? 'VENDOR' : supplier ? 'SUPPLIER' : 'MEMBER',
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="KYC-Certificate-${stakeholderId}.pdf"`);
        return res.send(pdfBuffer);
    } catch (err) {
        console.error('[TokenController] KYC certificate error:', err);
        return res.status(500).json({ success: false, message: 'Failed to generate KYC certificate' });
    }
};

/**
 * GET /api/gate/parking-status
 * Synthesize parking slot data from ACTIVE tokens
 */
exports.getParkingStatus = async (req, res) => {
    try {
        const { marketId } = req.user;
        
        // Find all ACTIVE tokens for this jurisdiction that have a vehicleNumber
        const activeVehicles = await prisma.marketToken.findMany({
            where: {
                ...req.jurisdiction,
                status: 'ACTIVE',
                vehicleNumber: { not: null }
            },
            select: {
                id: true,
                vehicleNumber: true,
                vehicleType: true,
                visitorName: true,
                shortCode: true
            }
        });

        // Synthesize parking slots
        // Zone A: 1-12 (Heavy)
        // Zone B: 1-12 (Light)
        const slots = [];
        
        // Fill Zone A (Heavy Trucks / large vehicles)
        const heavyVehicles = activeVehicles.filter(v => 
            v.vehicleType?.toLowerCase().includes('truck') || 
            v.vehicleType?.toLowerCase().includes('van') ||
            v.vehicleType?.toLowerCase().includes('pickup')
        );
        
        for (let i = 1; i <= 12; i++) {
            const vehicle = heavyVehicles[i-1];
            slots.push({
                id: `A-${i}`,
                number: `A-${i.toString().padStart(2, '0')}`,
                zone: 'A',
                status: vehicle ? 'OCCUPIED' : 'OPEN',
                vehiclePlate: vehicle ? vehicle.vehicleNumber : null
            });
        }

        // Fill Zone B (Others)
        const smallVehicles = activeVehicles.filter(v => 
            !v.vehicleType?.toLowerCase().includes('truck') && 
            !v.vehicleType?.toLowerCase().includes('van') &&
            !v.vehicleType?.toLowerCase().includes('pickup')
        );
        
        for (let i = 1; i <= 12; i++) {
            const vehicle = smallVehicles[i-1];
            slots.push({
                id: `B-${i}`,
                number: `B-${i.toString().padStart(2, '0')}`,
                zone: 'B',
                status: vehicle ? 'OCCUPIED' : 'OPEN',
                vehiclePlate: vehicle ? vehicle.vehicleNumber : null
            });
        }

        return res.status(200).json({
            success: true,
            data: slots
        });

    } catch (err) {
        console.error('getParkingStatus error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


/**
 * POST /api/market/tokens/verify-identity
 * Trust Handshake: Verify identity by NIN or secondary identifier
 */
exports.verifyIdentity = async (req, res) => {
    try {
        const { identifier } = req.body;
        const { marketId } = req.user;

        if (!identifier) {
            return res.status(400).json({ success: false, message: 'Identity identifier (NIN/ID) is required' });
        }

        // Search for the profile by nationalId, passportNumber, taxIdNumber, OR mmisId/qr
        const profile = await prisma.userProfile.findFirst({
            where: {
                OR: [
                    { nationalId: identifier },
                    { passportNumber: identifier },
                    { taxIdNumber: identifier },
                    { mmisId: identifier },
                    { personalQRCode: identifier }
                ]
            },
            include: {
                user: {
                    include: {
                        stakeholder: {
                            include: {
                                vendor: {
                                    include: {
                                        rentContracts: {
                                            where: { status: 'ACTIVE' },
                                            include: {
                                                payments: {
                                                    orderBy: { periodEnd: 'desc' },
                                                    take: 1
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Identity record not found in system'
            });
        }

        const user = profile.user;
        const vendor = user.stakeholder?.vendor;
        const activeContract = vendor?.rentContracts?.[0];
        const lastPayment = activeContract?.payments?.[0];

        // Synthesize Trust Status
        let trustLevel = 'LOW';
        let verificationStatus = 'UNVERIFIED';
        let paymentStatus = 'UNKNOWN';

        if (profile.verificationLevel === 'GOLD' || profile.verificationLevel === 'VERIFIED') {
            trustLevel = 'HIGH';
            verificationStatus = 'VERIFIED';
        } else if (profile.verificationLevel === 'BASIC') {
            trustLevel = 'MEDIUM';
            verificationStatus = 'PARTIAL';
        }

        if (activeContract) {
            if (vendor.isDelinquent) {
                paymentStatus = 'DELINQUENT';
                trustLevel = 'CRITICAL_RISK';
            } else if (lastPayment && new Date(lastPayment.periodEnd) > new Date()) {
                paymentStatus = 'PAID_UP';
            } else {
                paymentStatus = 'PENDING_PAYMENT';
            }
        }

        // Log Audit for Verification
        await complianceService.logAudit({
            action: 'IDENTITY_VERIFIED',
            entityType: 'IDENTITY',
            entityId: user.id,
            newData: { mmisId: profile.mmisId, identifierUsed: identifier },
            userId: req.user.id, // The staff member performing the verification
            endpoint: '/api/market/tokens/verify-identity',
            httpMethod: 'POST'
        });

        return res.status(200).json({
            success: true,
            data: {
                fullName: `${profile.firstName} ${profile.lastName}`,
                photoUrl: profile.profilePictureUrl,
                nationalId: profile.nationalId,
                role: user.stakeholder ? 'VENDOR' : 'CITIZEN',
                verificationStatus,
                trustLevel,
                financials: {
                    isVendor: !!vendor,
                    businessName: vendor?.businessName,
                    paymentStatus,
                    lastPaymentDate: lastPayment?.paymentDate,
                    isDelinquent: vendor?.isDelinquent || false
                },
                handshakeVerifiedAt: new Date()
            }
        });

    } catch (err) {
        console.error('verifyIdentity error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error during handshake' });
    }
};
