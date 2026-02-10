const { PrismaClient } = require('@prisma/client');

/**
 * Prisma Client Singleton
 * 
 * Ensures only one instance of Prisma Client is created and reused across the application.
 * This prevents connection pool exhaustion and transaction issues.
 */
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
