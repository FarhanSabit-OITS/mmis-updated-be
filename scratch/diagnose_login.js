
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function diagnose() {
  console.log('--- DIAGNOSTIC START ---');
  try {
    const email = 'superadmin@kabalemarket.ug';
    const password = 'Password@123';

    console.log(`Searching for user: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: { include: { role: true } },
        stakeholder: { include: { vendor: true, supplier: true } },
        admin: { include: { marketMaster: true, pseudoMarketAdmin: true } }
      }
    });

    if (!user) {
      console.error('ERROR: User not found in database.');
      return;
    }
    console.log('User fields:', Object.keys(user));
    const dbPassword = user.password || user.passwordHash;
    console.log('Password field present:', !!dbPassword);

    const match = await bcrypt.compare(password, dbPassword);
    console.log('Password match:', match);

    const roleName = user.userRoles[0]?.role?.name || 'Guest';
    console.log('Role Name:', roleName);

    // Test the MarketId logic
    const marketId = roleName === 'MarketMaster'
          ? user.admin?.marketMaster?.marketId
          : (roleName === 'GateCounter'
            ? user.admin?.pseudoMarketAdmin?.marketId
            : (user.stakeholder?.vendor?.primaryMarketId || null));
    console.log('Calculated MarketId:', marketId);

    console.log('Attempting to create session...');
    // Mock session creation with hashing
    const rawRefreshToken = 'diag-refresh-' + Date.now();
    const refreshTokenHash = require('crypto').createHash('sha256').update(rawRefreshToken).digest('hex');
    
    const sessionToken = 'diag-test-token-' + Date.now();
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken,
        refreshToken: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });
    console.log('Session created with HASH successfully:', session.id);

    // Verify lookup by hash (simulating the fix)
    const foundSession = await prisma.userSession.findUnique({
      where: { refreshToken: refreshTokenHash }
    });
    console.log('Session lookup by HASH successful:', !!foundSession);

    // Clean up
    await prisma.userSession.delete({ where: { id: session.id } });
    console.log('Cleanup successful.');

  } catch (err) {
    console.error('--- ERROR DETECTED ---');
    console.error(err);
  } finally {
    await prisma.$disconnect();
    console.log('--- DIAGNOSTIC END ---');
  }
}

diagnose();
