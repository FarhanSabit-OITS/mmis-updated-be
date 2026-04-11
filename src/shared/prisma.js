/**
 * ✅ CANONICAL PRISMA SINGLETON — src/shared/prisma.js
 *
 * This file exists because some modules (repositories, services) were created
 * using the import path `require('../shared/prisma')` while controllers used
 * `require('../prisma')`.
 *
 * RESOLUTION: Both paths now point to the SAME singleton instance.
 * The canonical instance lives in `src/prisma.js` (configurable log levels).
 * This file simply re-exports it to avoid a dual connection pool.
 *
 * Do NOT create a new PrismaClient() here. Use this file or src/prisma.js — both give you the same object.
 */
module.exports = require('../prisma');