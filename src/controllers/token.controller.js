const prisma = require('../prisma');
const crypto = require('crypto');

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
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
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
                expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
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
                    { shortCode: { endsWith: code } } // Allow searching by last digits
                ],
                marketId
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

