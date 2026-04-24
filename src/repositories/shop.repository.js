const prisma = require('../shared/prisma');
const { PaginationResponse } = require('../utils');
module.exports = {
  create: async (marketId, createdById, marketMasterId, input) => {
    const uniqueCode = `SHOP-${marketId.slice(0, 8).toUpperCase()}-${input.shopNumber}`;

    return prisma.shop.create({
      data: {
        marketId,
        memberId: input.memberId,
        levelId: input.levelId || null,
        sectionId: input.sectionId || null,

        uniqueCode,
        shopNumber: input.shopNumber,
        shopName: input.shopName,
        displayName: input.displayName || null,

        shopType: input.shopType || 'RETAIL',
        categoryTags: input.categoryTags || [],
        subType: input.subType || null,
        locationDescription: input.locationDescription || null,

        hasElectricity: input.hasElectricity ?? true,
        hasWaterSupply: input.hasWaterSupply ?? true,
        hasStorage: input.hasStorage ?? false,
        hasAirConditioning: input.hasAirConditioning ?? false,
        hasDisplayWindow: input.hasDisplayWindow ?? true,
        hasSecurityShutter: input.hasSecurityShutter ?? true,
        internetConnection: input.internetConnection ?? false,

        monthlyRent: String(input.monthlyRent),
        securityDeposit: input.securityDeposit ? String(input.securityDeposit) : null,
        maintenanceFee: input.maintenanceFee ? String(input.maintenanceFee) : null,
        electricityRate: input.electricityRate ? String(input.electricityRate) : null,
        waterRate: input.waterRate ? String(input.waterRate) : null,

        contractStartDate: new Date(input.contractStartDate),
        contractEndDate: new Date(input.contractEndDate),
        paymentDay: input.paymentDay || 1,
        gracePeriodDays: input.gracePeriodDays ?? 5,

        status: 'ACTIVE',
        occupationStatus: 'OCCUPIED',

        marketMasterId,
        createdById,
      },
      include: {
        market: { select: { id: true, name: true } },
        member: { select: { id: true, membershipNumber: true, businessName: true } },
        level: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        createdBy: { select: { id: true, email: true } },
      },
    });
  },

  getShopList: async ({ page = 1, limit = 10, search, marketId, status, occupationStatus, shopType, memberId }) => {
    const skip = (page - 1) * limit;
    const where = {
      ...(marketId && { marketId }),
      ...(status && { status }),
      ...(occupationStatus && { occupationStatus }),
      ...(shopType && { shopType }),
      ...(memberId && { memberId }),
      ...(search && {
        OR: [
          { shopName: { contains: search, mode: "insensitive" } },
          { shopNumber: { contains: search, mode: "insensitive" } },
          { uniqueCode: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          market: true,
          member:  true,
          level: true,
          section: true,
          createdBy: true,
          marketMaster: true,
          rentContracts: true,
          shopAssets: true
        },
      }),
      prisma.shop.count({ where }),
    ]);

    return {
      shops,
      pagination: new PaginationResponse(total, page, Number(limit))
    }
  },
  
  getShopDetailsById: async (shopId) => {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        market: {
          select: { id: true, name: true, address: true, status: true }
        },
        member: {
          include: {
            stakeholder: {
              include: {
                user: {
                  select: { id: true, email: true, phone: true }
                }
              }
            }
          }
        },
      },
    });

    return shop;
  },

  editShop: async (shopId, updateData) => {
    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: updateData,
      include: {
        market: {
          select: { id: true, name: true, address: true, status: true }
        },
        member: {
          include: {
            stakeholder: {
              include: {
                user: {
                  select: { id: true, email: true, phone: true }
                }
              }
            }
          }
        },
      },
    });

    return shop;
  },
  deleteShop: async (shopId) => {
    return prisma.shop.delete({
      where: { id: shopId },
      include: {
        market: {
          select: {
            id: true,
            name: true
          }
        },
        member: {
          select: {
            id: true,
            membershipNumber: true,
            businessName: true
          }
        }
      }
    });
  }
};