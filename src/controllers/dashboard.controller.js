// src/controllers/dashboard.controller.js


const prisma = require('../shared/prisma');

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

    // 1. SuperAdmin: Count all active users (excluding self)
    if (roleName === 'SuperAdmin') {
      const count = await prisma.user.count({
        where: {
          status: 'ACTIVE',
          id: { not: currentUserId },
        },
      });

      return res.json({
        userId: currentUserId,
        scopeType: 'superadmin',
        underMeCount: count,
      });
    }

    // 2. Resolve Admin Scope (Market vs City vs District)
    const admin = await prisma.admin.findUnique({
      where: { userId: currentUserId },
      include: {
        marketMaster: true,
        pseudoMarketAdmin: true,
        cityAdmin: true,
        districtAdmin: true,
        nationalAdmin: true,
      },
    });

    let count = 0;
    let scopeType = 'invited'; // Default fallback

    if (admin) {
      if (admin.marketMaster) {
        // Market Master: Count Vendors in their Market
        scopeType = 'market';
        count = await prisma.vendor.count({
          where: { primaryMarketId: admin.marketMaster.marketId },
        });
      } else if (admin.pseudoMarketAdmin) {
        // Pseudo Admin (Gate/Stock/etc): Count Vendors in their Market
        scopeType = 'market';
        count = await prisma.vendor.count({
          where: { primaryMarketId: admin.pseudoMarketAdmin.marketId },
        });
      } else if (admin.cityAdmin) {
        // City Admin: Count Vendors in all Markets in the City
        scopeType = 'city';
        count = await prisma.vendor.count({
          where: {
            primaryMarket: {
              cityId: admin.cityAdmin.cityId,
            },
          },
        });
      } else if (admin.districtAdmin) {
        // District Admin: Count Vendors in all Markets in the District
        // Market -> City -> District
        scopeType = 'district';
        count = await prisma.vendor.count({
          where: {
            primaryMarket: {
              city: {
                districtId: admin.districtAdmin.districtId
              }
            }
          }
        });
      }
    }

    // 3. Fallback: If no admin scope matched (or count is 0?), checks for invitations?
    // The original code fell back to 'invited' only if no assignments were found.
    // Here, if we found an admin role but the count was 0, we still return 0 for that scope.
    // If we didn't find an admin role (e.g. regular User), we check invitations.

    if (!admin || (!admin.marketMaster && !admin.pseudoMarketAdmin && !admin.cityAdmin && !admin.districtAdmin && !admin.nationalAdmin)) {
      // Fallback: invitation-based scope (e.g. for regular users who invited others)
      // Note: 'invitedById' is not on User model in schema. User has 'sentInvitations'.
      // So we count invitations sent by this user that are ACCEPTED.
      scopeType = 'invited';

      const invitations = await prisma.invitation.count({
        where: {
          senderUserId: currentUserId,
          status: 'ACCEPTED'
        }
      });
      count = invitations;
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
