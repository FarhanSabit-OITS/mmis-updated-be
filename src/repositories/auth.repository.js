const prisma = require('../shared/prisma');

module.exports = {
  findUserByEmail: async (email) => {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true
          }
        },
        profile: true,
        stakeholder: {
          include: {
            vendor: true,
            supplier: true
          }
        },
        admin: {
          include: {
            marketMaster: true,
            cityAdmin: true,
            districtAdmin: true,
            pseudoMarketAdmin: true
          }
        }
      }
    });
  },

  findRoleByName: async (name) => {
    return await prisma.role.findUnique({
      where: { name }
    });
  },

  createUserWithInvitation: async (userData, invitationData) => {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: userData.email,
          passwordHash: userData.passwordHash,
          phone: userData.phone,
          status: 'PENDING',
          emailVerified: false,
          userRoles: {
            create: {
              roleId: userData.roleId
            }
          }
        },
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });

      const invitation = await tx.invitation.create({
        data: invitationData
      });

      return { user, invitation };
    });
  },

  findInvitationByToken: async (token) => {
    return await prisma.invitation.findUnique({
      where: { token }
    });
  },

  completeEmailVerification: async (invitationId, email, targetRoleName, metadata) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Find user
      const user = await tx.user.findUnique({
        where: { email },
        include: { userRoles: true }
      });

      if (!user) return null;

      // 2. Find target role
      const role = await tx.role.findUnique({
        where: { name: targetRoleName }
      });

      if (!role) throw new Error(`Role ${targetRoleName} not found.`);

      // 3. Update User
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          status: 'ACTIVE',
          emailVerified: true,
          userRoles: {
            deleteMany: {},
            create: { roleId: role.id }
          }
        },
        include: {
          userRoles: { include: { role: true } }
        }
      });

      // 4. Handle Stakeholder & Specific Entities
      if (['Vendor', 'Supplier', 'Member'].includes(targetRoleName)) {
        const stakeholderType = targetRoleName.toUpperCase();
        
        let stakeholder = await tx.stakeholder.upsert({
          where: { userId: user.id },
          update: { stakeholderType, kycStatus: 'UNDER_REVIEW' },
          create: {
            userId: user.id,
            stakeholderType,
            kycStatus: 'UNDER_REVIEW'
          }
        });

        if (targetRoleName === 'Vendor') {
          const vendorCode = `VND-${require('crypto').randomBytes(3).toString('hex').toUpperCase()}`;
          await tx.vendor.upsert({
            where: { stakeholderId: stakeholder.id },
            update: { primaryMarketId: metadata?.marketId },
            create: {
              stakeholderId: stakeholder.id,
              vendorCode,
              businessName: metadata?.businessName || metadata?.name || email,
              primaryMarketId: metadata?.marketId
            }
          });
        } else if (targetRoleName === 'Supplier') {
          const supplierCode = `SUP-${require('crypto').randomBytes(3).toString('hex').toUpperCase()}`;
          await tx.supplier.upsert({
            where: { stakeholderId: stakeholder.id },
            update: {},
            create: {
              stakeholderId: stakeholder.id,
              supplierCode,
              businessName: metadata?.businessName || metadata?.name || email,
              supplierType: 'WHOLESALER'
            }
          });
        }

        // 5. Send Notification to Market Admins
        if (metadata?.marketId) {
          const marketMasters = await tx.marketMaster.findMany({
            where: { marketId: metadata.marketId },
            include: { admin: { include: { user: true } } }
          });

          for (const mm of marketMasters) {
            if (mm.admin?.userId) {
              await tx.notification.create({
                data: {
                  userId: mm.admin.userId,
                  type: 'REGISTRATION_APPROVAL',
                  title: `Approval Needed: New ${targetRoleName}`,
                  message: `${metadata.name || email} has registered and awaits approval.`,
                  priority: 'HIGH',
                  data: {
                    registrantId: user.id,
                    registrantRole: targetRoleName,
                    marketId: metadata.marketId
                  }
                }
              });
            }
          }
        }
      }

      // 6. Complete Invitation
      await tx.invitation.update({
        where: { id: invitationId },
        data: { 
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          acceptedByUserId: user.id
        }
      });

      return { user: updatedUser };
    });
  },

  countRecentInvitations: async (email, timespan) => {
    const since = new Date(Date.now() - timespan);
    return await prisma.invitation.count({
      where: {
        email,
        invitationType: 'USER_REGISTRATION',
        createdAt: { gte: since }
      }
    });
  },

  invalidatePendingInvitations: async (email) => {
    return await prisma.invitation.updateMany({
      where: {
        email,
        invitationType: 'USER_REGISTRATION',
        status: 'PENDING'
      },
      data: { status: 'CANCELLED' }
    });
  },

  createInvitation: async (invitationData) => {
    return await prisma.invitation.create({
      data: invitationData
    });
  },

  createVerificationToken: async (userId, email, token, expiresAt) => {
    return await prisma.$transaction([
      prisma.verificationToken.updateMany({
        where: { userId, tokenType: 'PASSWORD_RESET', isUsed: false },
        data: { isUsed: true }
      }),
      prisma.verificationToken.create({
        data: {
          token,
          tokenType: 'PASSWORD_RESET',
          userId,
          email,
          expiresAt
        }
      })
    ]);
  },

  findVerificationToken: async (token) => {
    return await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    });
  },

  resetUserPassword: async (tokenId, userId, passwordHash) => {
    return await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash, lastPasswordChange: new Date() }
      }),
      prisma.verificationToken.update({
        where: { id: tokenId },
        data: { isUsed: true, usedAt: new Date() }
      }),
      prisma.userSession.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false, logoutReason: 'PASSWORD_RESET', loggedOutAt: new Date() }
      })
    ]);
  }
};
