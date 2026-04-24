const prisma = require("../shared/prisma");
const { asyncHandler, ApiResponse } = require("../utils");
const { NotFoundError } = require("../errors/app.errors");
const crypto = require("crypto");
const { generateUniqueCode } = require("../utils/identifier");

const GATE_FEES = {
  MOTORCYCLE: 1000,
  CAR: 3000,
  VAN: 5000,
  PICKUP: 7000,
  TRUCK: 15000,
  OTHER: 2000
};

const VAT_RATE = 0.18;

module.exports = {
  getFees: asyncHandler(async (req, res) => {
    const { category } = req.query;
    const base = GATE_FEES[category?.toUpperCase()] || GATE_FEES.OTHER;
    const vat = Math.round(base * VAT_RATE);
    const total = base + vat;

    res.status(200).json({
      success: true,
      data: { base, vat, total }
    });
  }),

  createEntry: asyncHandler(async (req, res) => {
    const { plate, category, paymentRef } = req.body;
    const marketId = req.user.marketId || req.body.marketId; // Fallback if admin

    if (!marketId) {
        return res.status(400).json({ success: false, message: "Market ID is required" });
    }

    // Generate token using centralized utility
    const tokenCode = generateUniqueCode('GATE_TOKEN');
    const shortCode = `G-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const token = await prisma.marketToken.create({
      data: {
        tokenCode,
        shortCode,
        tokenType: "GATE_ENTRY",
        marketId,
        vehicleNumber: plate,
        vehicleType: category,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        createdById: req.user.id,
        metadata: { paymentRef, plate, category }
      }
    });

    // Create entry operation
    await prisma.gateOperation.create({
      data: {
        operationType: "ENTRY",
        tokenId: token.id,
        vehicleNumber: plate,
        vehicleType: category,
        recordedById: req.user.id,
        status: "COMPLETED"
      }
    });

    res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        success: true,
        data: {
          id: token.id,
          tokenCode: token.tokenCode,
          shortCode: token.shortCode,
          plate,
          category,
          entryTime: token.createdAt,
          qrPayload: require("../utils/identifier").generateQrPayload('GATE_TOKEN', {
            tokenCode: token.tokenCode,
            shortCode: token.shortCode,
            plate,
            category,
            marketId,
            issuedAt: token.createdAt
          })
        },
        message: "Entry token generated successfully"
      })
    );
  }),

  scanExit: asyncHandler(async (req, res) => {
    const { tokenCode } = req.body;

    const token = await prisma.marketToken.findFirst({
      where: { 
        OR: [
            { tokenCode },
            { shortCode: tokenCode }
        ],
        status: "ACTIVE" 
      }
    });

    if (!token) {
      throw new NotFoundError("Active token not found");
    }

    const durationMs = Date.now() - new Date(token.createdAt).getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Logic: Free for 2 hours, then 2000 per hour
    let overstayFee = 0;
    if (durationHours > 2) {
        overstayFee = Math.ceil(durationHours - 2) * 2000;
    }

    res.status(200).json({
      success: true,
      data: {
        token: {
          id: token.id,
          tokenCode: token.tokenCode,
          shortCode: token.shortCode,
          plate: token.vehicleNumber,
          category: token.vehicleType,
          entryTime: token.createdAt
        },
        overstayFee,
        duration: Math.round(durationHours * 10) / 10
      }
    });
  }),

  processExit: asyncHandler(async (req, res) => {
    const { tokenCode } = req.body;

    const token = await prisma.marketToken.findFirst({
      where: { 
        OR: [
            { tokenCode },
            { shortCode: tokenCode }
        ],
        status: "ACTIVE" 
      }
    });

    if (!token) {
      throw new NotFoundError("Active token not found");
    }

    await prisma.$transaction([
      prisma.marketToken.update({
        where: { id: token.id },
        data: { 
          status: "USED",
          usedAt: new Date()
        }
      }),
      prisma.gateOperation.create({
        data: {
          operationType: "EXIT",
          tokenId: token.id,
          vehicleNumber: token.vehicleNumber,
          vehicleType: token.vehicleType,
          recordedById: req.user.id,
          exitTime: new Date(),
          status: "COMPLETED"
        }
      })
    ]);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        message: "Exit processed successfully"
      })
    );
  }),

  getLogs: asyncHandler(async (req, res) => {
    const marketId = req.user.marketId;
    
    const logs = await prisma.marketToken.findMany({
      where: { 
        tokenType: "GATE_ENTRY",
        ...(marketId ? { marketId } : {})
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: logs,
        message: "Gate logs fetched successfully"
      })
    );
  })
};
