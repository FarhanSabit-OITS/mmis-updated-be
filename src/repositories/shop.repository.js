const prisma = require('../shared/prisma')
module.exports = {
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
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          market: { select: { id: true, name: true, address: true, status: true } },
          member: { select: { id: true } },
        },
      }),
      prisma.shop.count({ where }),
    ]);

    return { shops, total };
  },
};