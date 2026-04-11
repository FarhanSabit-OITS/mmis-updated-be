const crypto = require('crypto');
const marketRepository = require('../repositories/market.repository');
const AppError = require('../errors/AppError');

module.exports = {
  getActiveMarkets: async () => {
    return await marketRepository.findAllActive();
  },

  generateGateToken: async (supplierId, gateId, adminId) => {
    if (!gateId) {
      throw new AppError('Gate ID is required', 400);
    }

    // 1. Verify Gate and Market
    const gate = await marketRepository.findGateById(gateId);
    if (!gate) {
      throw new AppError('Gate not found', 404);
    }

    // 2. Identify Target (Supplier or Generic User)
    let targetUserId;
    let targetData = {};
    let isGenericUser = false;

    const supplier = await marketRepository.findSupplierById(supplierId);

    if (supplier) {
      if (!supplier.stakeholder || !supplier.stakeholder.userId) {
        throw new AppError('Supplier is not linked to a valid user account', 400);
      }
      targetUserId = supplier.stakeholder.userId;
      targetData = {
        id: supplier.id,
        code: supplier.supplierCode,
        name: supplier.businessName
      };
    } else {
      // Fallback: direct User lookup
      const user = await marketRepository.findUserById(supplierId);
      if (!user) {
        throw new AppError('Supplier or User not found', 404);
      }
      targetUserId = user.id;
      targetData = {
        id: user.id,
        code: 'GENERIC_USER',
        name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email
      };
      isGenericUser = true;
    }

    // 3. Logic for Code Generation
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const tokenCode = `SUP_${gate.market.uniqueCode}_${gate.gateNumber}_${randomSuffix}`;

    // 4. Calculate Expiry (End of Day)
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    // 5. Create Token via Repository
    const token = await marketRepository.createMarketToken({
      tokenCode,
      tokenType: 'GATE_ENTRY',
      status: 'PENDING',
      marketId: gate.marketId,
      gateId: gate.id,
      userId: targetUserId,
      createdById: adminId,
      expiresAt,
      metadata: {
        supplierId: targetData.id,
        supplierCode: targetData.code,
        generatedBy: 'API',
        isGenericUser
      }
    });

    return {
      tokenCode: token.tokenCode,
      expiresAt: token.expiresAt,
      supplier: {
        name: targetData.name,
        code: targetData.code
      },
      gate: {
        name: gate.gateName,
        number: gate.gateNumber,
        market: gate.market.name
      }
    };
  }
};