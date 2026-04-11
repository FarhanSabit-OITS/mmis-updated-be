const prisma = require('../shared/prisma');
const { ApiResponse, asyncHandler } = require('../utils');

/**
 * Asset Controller
 * Handles management of hardware, equipment, and CCTV streams
 */

/**
 * Create a new asset
 */
exports.createAsset = asyncHandler(async (req, res) => {
    const { 
        name, 
        type, 
        status, 
        serialNumber, 
        marketId, 
        location, 
        purchaseDate, 
        warrantyExpiry,
        streamUrl,
        specifications
    } = req.body;

    const asset = await prisma.asset.create({
        data: {
            name,
            type,
            status: status || 'ACTIVE',
            serialNumber,
            marketId,
            location,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
            warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
            streamUrl,
            specifications
        }
    });

    return res.status(201).json(new ApiResponse({
        statusCode: 201,
        success: true,
        message: 'Asset created successfully',
        data: asset
    }));
});

/**
 * Get all assets for a market
 */
exports.getMarketAssets = asyncHandler(async (req, res) => {
    const { marketId } = req.params;
    const { type } = req.query;

    const where = { marketId };
    if (type) where.type = type;

    const assets = await prisma.asset.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        data: assets
    }));
});

/**
 * Get CCTV assets for a market
 */
exports.getMarketCCTV = asyncHandler(async (req, res) => {
    const { marketId } = req.params;

    const assets = await prisma.asset.findMany({
        where: { 
            marketId,
            type: { in: ['CCTV', 'SAFETY', 'SECURITY'] }
        },
        orderBy: { name: 'asc' }
    });

    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        data: assets,
        message: "Market CCTV streams fetched successfully"
    }));
});

/**
 * Update asset (e.g., status change or stream URL update)
 */
exports.updateAsset = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const asset = await prisma.asset.update({
        where: { id },
        data: {
            ...req.body,
            updatedAt: new Date()
        }
    });

    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        message: 'Asset updated successfully',
        data: asset
    }));
});

/**
 * Delete asset
 */
exports.deleteAsset = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.asset.delete({ where: { id } });
    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        message: 'Asset deleted successfully'
    }));
});
