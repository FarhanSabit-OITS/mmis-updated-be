const prisma = require('../shared/prisma');
const { PaginationResponse } = require('../utils');
module.exports = {
  getShopList: async ({ page = 1, limit = 10, search, marketId, levelId, sectionId, status, occupationStatus, shopType, memberId }) => {
    const skip = (page - 1) * limit;
    const where = {
      ...(marketId && { marketId }),
      ...(levelId && { levelId }),
      ...(sectionId && { sectionId }),
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

  createShop: async (shopData) => {
    return await prisma.shop.create({
      data: shopData,
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
  },

  deleteShop: async (shopId) => {
    // We soft-delete or hard delete. For shops, let's just mark status as INACTIVE
    return await prisma.shop.update({
      where: { id: shopId },
      data: { status: "INACTIVE" }
    });
  }
};