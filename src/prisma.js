const { PrismaClient } = require('@prisma/client');

/**
 * Prisma Client Singleton
 * 
 * Ensures only one instance of Prisma Client is created and reused across the application.
 * This prevents connection pool exhaustion and transaction issues.
 */
const prismaLogLevels = process.env.PRISMA_LOG_LEVELS
    ? process.env.PRISMA_LOG_LEVELS.split(',').map((level) => level.trim()).filter(Boolean)
    : ['error'];

const prisma = new PrismaClient({
    log: prismaLogLevels,
});

module.exports = prisma;
