// src/controllers/dashboard.controller.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/dashboard/users/under-me/count
 *
 * Returns how many users fall "under" the logged-in user.
 * Rule:
 *  - If the user has MarketAssignments:
 *      scopeType = "city"
 *      -> count all active users in markets in those cities
 *  - Else:
 *      scopeType = "invited"
 *      -> count all active users where invitedById = currentUserId
 */
exports.getUsersUnderMeCount = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const roleName = req.user?.roleName;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized: No user in request context' });
    }

    if (roleName === 'SuperAdmin') {
      const count = await prisma.user.count({
        where: {
          isActive: true,
          id: { not: currentUserId },  // exclude self
        },
      });

      return res.json({
        userId: currentUserId,
        scopeType: 'superadmin',
        underMeCount: count,
      });
    }

    // Finding market assignments for the current user
    const assignments = await prisma.marketAssignment.findMany({
      where: { userId: currentUserId },
      include: { market: true }, // gives market.cityId
    });

    let scopeType;
    let count = 0;

    if (assignments.length > 0) {
      // Primary: city-based scope 
      scopeType = 'city';

      // get unique cityIds
      const cityIds = [
        ...new Set(assignments.map((a) => a.market?.cityId).filter(Boolean)),
      ];

      if (cityIds.length === 0) {
        count = 0;
      } else {
        // Count users with at least one marketAssignment whose market.cityId is in cityIds
        count = await prisma.user.count({
          where: {
            isActive: true,
            marketAssignments: {
              some: {
                market: {
                  cityId: { in: cityIds },
                },
              },
            },
          },
        });
      }
    } else {
      //  Fallback: invitation-based scope 
      scopeType = 'invited';

      count = await prisma.user.count({
        where: {
          invitedById: currentUserId,
          isActive: true,
        },
      });
    }

    return res.json({
      userId: currentUserId,
      scopeType,
      underMeCount: count,
    });
  } catch (err) {
    console.error('Error in getUsersUnderMeCount:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
