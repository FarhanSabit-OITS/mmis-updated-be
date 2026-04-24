const QRCode = require('qrcode');
const { asyncHandler, ApiResponse } = require("../utils");
const prisma = require("../shared/prisma");
const { NotFoundError } = require("../errors/app.errors");

module.exports = {
  /**
   * POST /api/qrcodes/generate
   * Generates a QR Code for a Gate, Shop, Stall, or User
   */
  generateQrCode: asyncHandler(async (req, res) => {
    const { entityId, entityType, marketId } = req.body;
    // entityType: MARKET, SHOP, STALL, GATE, VENDOR, MEMBER

    // Ensure config exists
    const config = await prisma.qrGenerationConfig.create({
      data: {
        entityId,
        entityType,
        marketId,
        configParams: { color: { dark: '#000000', light: '#ffffff' } },
        isActive: true,
      }
    });

    const qrData = JSON.stringify({
      entityId,
      entityType,
      marketId,
      configId: config.id
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        success: true,
        data: {
          qrCodeDataUrl,
          configId: config.id
        },
        message: "QR Code generated successfully"
      })
    );
  }),

  /**
   * POST /api/qrcodes/scan
   * Process a scanned QR code
   */
  scanQrCode: asyncHandler(async (req, res) => {
    const { qrData } = req.body;
    
    // Parse the QR data string
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid QR Code format" });
    }

    const { entityId, entityType, configId } = parsedData;

    // Verify config
    const config = await prisma.qrGenerationConfig.findUnique({ where: { id: configId } });
    if (!config || !config.isActive) {
      return res.status(400).json({ success: false, message: "Invalid or inactive QR Code" });
    }

    // Return the entity data based on type
    let entityData = null;
    switch(entityType) {
      case 'SHOP':
        entityData = await prisma.shop.findUnique({ where: { id: entityId }, include: { member: true } });
        break;
      case 'STALL':
        entityData = await prisma.stall.findUnique({ where: { id: entityId }, include: { vendor: true } });
        break;
      case 'GATE':
        entityData = await prisma.marketGate.findUnique({ where: { id: entityId } });
        break;
      // Add other entities if needed
    }

    if (!entityData) {
      return res.status(404).json({ success: false, message: `${entityType} not found` });
    }

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: {
          entityType,
          entityData
        },
        message: "QR Code scanned successfully"
      })
    );
  }),

  /**
   * GET /api/qrcodes/:configId
   */
  getQrCodeConfig: asyncHandler(async (req, res) => {
    const { configId } = req.params;
    
    const config = await prisma.qrGenerationConfig.findUnique({
      where: { id: configId }
    });

    if (!config) throw new NotFoundError("QR Config not found");

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: config,
        message: "QR Code config fetched successfully"
      })
    );
  })
};
