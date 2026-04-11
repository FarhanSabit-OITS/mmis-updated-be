const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../shared/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

module.exports = {
  generateTokens: async (user, roleName) => {
    // 1. Generate Access Token
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: roleName 
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // 2. Generate Refresh Token
    const refreshToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        type: 'refresh' 
      },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // 3. Store Session/Refresh Token
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    const expiryDays = REFRESH_TOKEN_EXPIRY.includes('d') ? parseInt(REFRESH_TOKEN_EXPIRY) : 7;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken,
        refreshToken: refreshTokenHash,
        expiresAt,
        isActive: true
      }
    });

    return {
      accessToken,
      refreshToken,
      sessionToken,
      expiresIn: expiryDays * 24 * 60 * 60 * 1000
    };
  },

  verifyRefreshToken: async (token) => {
    try {
      // 1. JWT verification
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // 2. Database verification (active session)
      const refreshTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const session = await prisma.userSession.findUnique({
        where: { refreshToken: refreshTokenHash },
        include: { user: { include: { userRoles: { include: { role: true } } } } }
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        if (session && session.isActive) {
          await prisma.userSession.update({
            where: { id: session.id },
            data: { isActive: false, logoutReason: 'Token expired' }
          });
        }
        return null;
      }

      return session.user;
    } catch (err) {
      console.error('Refresh token verification failed:', err.message);
      return null;
    }
  },

  revokeSession: async (token) => {
    try {
      const refreshTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await prisma.userSession.updateMany({
        where: { refreshToken: refreshTokenHash },
        data: { isActive: false, logoutReason: 'User logout' }
      });
      return true;
    } catch (err) {
      console.error('Session revocation failed:', err.message);
      return false;
    }
  }
};
