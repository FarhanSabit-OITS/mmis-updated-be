const prisma = require('../shared/prisma');
const { PaginationResponse } = require('../utils');
module.exports = {
  getFacilityList: async ({ page = 1, limit = 10, search, marketId, status, occupationStatus, type, memberId }) => {
    const skip = (page - 1) * limit;
    const where = {
      ...(marketId && { marketId }),
      ...(status && { status }),
      ...(occupationStatus && { occupationStatus }),
      ...(type && { type }),
      ...(memberId && { memberId }),
      ...(search && {
        OR: [
          { facilityName: { contains: search, mode: "insensitive" } },
          { unitNumber: { contains: search, mode: "insensitive" } },
          { uniqueCode: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [facilities, total] = await Promise.all([
      prisma.facility.findMany({
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
          assets: true,
          vendors: {
            include: {
              stakeholder: {
                include: {
                  user: {
                    select: { id: true, email: true, phone: true }
                  }
                }
              }
            }
          }
        },
      }),
      prisma.facility.count({ where }),
    ]);

    return {
      facilities,
      pagination: new PaginationResponse(total, page, Number(limit))
    }
  },
  
  getFacilityDetailsById: async (facilityId) => {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
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
        vendors: {
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
        assets: true,
        rentContracts: true
      },
    });

    return facility;
  },

  editFacility: async (facilityId, updateData) => {
    const facility = await prisma.facility.update({
      where: { id: facilityId },
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

    return facility;
  },
};
