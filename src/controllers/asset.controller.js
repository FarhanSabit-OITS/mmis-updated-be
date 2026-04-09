const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Asset Controller
 * Handles management of hardware, equipment, and CCTV streams
 */

/**
 * Create a new asset
 */
exports.createAsset = async (req, res) => {
    try {
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

        return res.status(201).json({
            success: true,
            message: 'Asset created successfully',
            data: asset
        });
    } catch (error) {
        console.error('[AssetController] Error creating asset:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all assets for a market
 */
exports.getMarketAssets = async (req, res) => {
    const { marketId } = req.params;
    const { type } = req.query;

    try {
        const where = { marketId };
        if (type) where.type = type;

        const assets = await prisma.asset.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            data: assets
        });
    } catch (error) {
        console.error('[AssetController] Error fetching assets:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update asset (e.g., status change or stream URL update)
 */
exports.updateAsset = async (req, res) => {
    const { id } = req.params;
    try {
        const asset = await prisma.asset.update({
            where: { id },
            data: {
                ...req.body,
                updatedAt: new Date()
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Asset updated successfully',
            data: asset
        });
    } catch (error) {
        console.error('[AssetController] Error updating asset:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete asset
 */
exports.deleteAsset = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.asset.delete({ where: { id } });
        return res.status(200).json({
            success: true,
            message: 'Asset deleted successfully'
        });
    } catch (error) {
        console.error('[AssetController] Error deleting asset:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
