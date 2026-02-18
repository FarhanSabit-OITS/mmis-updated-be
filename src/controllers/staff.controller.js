const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { validateEmail, validatePassword, normalizeEmail } = require('../utils/validation');

/**
 * GET /api/market/staff/gate-counters
 * Get gate counter(s) based on user role
 */
exports.getGateCounters = async (req, res) => {
    try {
        const { roleName, marketId } = req.user;

        let whereClause = {
            role: 'GATE_COUNTER'
        };

        // If MarketMaster, only show for their market
        if (roleName === 'MarketMaster') {
            if (!marketId) {
                return res.status(400).json({
                    success: false,
                    message: 'Market identification failed for this manager.'
                });
            }
            whereClause.marketId = marketId;
        }
        // If SuperAdmin, showing all (or filter by query param)
        else if (roleName === 'SuperAdmin') {
            const filterMarketId = req.query.marketId;
            if (filterMarketId) {
                whereClause.marketId = filterMarketId;
            }
        } else {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to staff management.'
            });
        }

        const gateCounters = await prisma.pseudoMarketAdmin.findMany({
            where: whereClause,
            include: {
                admin: {
                    include: {
                        user: {
                            include: {
                                profile: true
                            }
                        }
                    }
                },
                market: true
            }
        });

        const formatted = gateCounters.map(gc => ({
            id: gc.id,
            userId: gc.admin?.user?.id,
            name: `${gc.admin?.user?.profile?.firstName || ''} ${gc.admin?.user?.profile?.lastName || ''}`.trim() || gc.admin?.user?.email.split('@')[0],
            email: gc.admin?.user?.email,
            phone: gc.admin?.user?.phone || gc.admin?.user?.profile?.primaryPhone || 'N/A',
            marketName: gc.market?.name,
            marketId: gc.marketId,
            status: gc.admin?.user?.status,
            assignedSection: gc.assignedSection
        }));

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (err) {
        console.error('getGateCounters error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * POST /api/market/staff/gate-counters
 * Create a new gate counter
 */
exports.createGateCounter = async (req, res) => {
    try {
        const { roleName, marketId: managerMarketId } = req.user;
        let { name, email, phone, password, marketId } = req.body;

        // RBAC check for marketId
        if (roleName === 'MarketMaster') {
            marketId = managerMarketId;
        } else if (roleName !== 'SuperAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (!marketId) {
            return res.status(400).json({
                success: false,
                message: 'Market ID is required'
            });
        }

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be 8-64 characters'
            });
        }

        const normalizedEmail = normalizeEmail(email);

        // Check if market already has a gate counter
        const existingStaff = await prisma.pseudoMarketAdmin.findFirst({
            where: {
                marketId,
                role: 'GATE_COUNTER'
            }
        });

        if (existingStaff) {
            return res.status(400).json({
                success: false,
                message: 'This market already has a Gate Counter assigned.'
            });
        }

        // Check email uniqueness
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already in use'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const firstName = name.split(' ')[0];
        const lastName = name.split(' ').slice(1).join(' ') || ' ';

        // Get GateCounter Role
        const gcRole = await prisma.role.findUnique({
            where: { name: 'GateCounter' }
        });

        if (!gcRole) {
            return res.status(500).json({
                success: false,
                message: 'GateCounter role not found in system'
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    email: normalizedEmail,
                    passwordHash,
                    phone,
                    status: 'ACTIVE',
                    emailVerified: true, // Auto-verify for administrative accounts
                    profile: {
                        create: {
                            firstName,
                            lastName,
                            primaryPhone: phone || '',
                            primaryEmail: normalizedEmail
                        }
                    },
                    userRoles: {
                        create: {
                            roleId: gcRole.id
                        }
                    }
                }
            });

            // 2. Create Admin record
            const admin = await tx.admin.create({
                data: {
                    userId: user.id,
                    adminLevel: 'PSEUDO_MARKET_ADMIN'
                }
            });

            // 3. Create PseudoMarketAdmin record
            const pseudo = await tx.pseudoMarketAdmin.create({
                data: {
                    adminId: admin.id,
                    marketId,
                    role: 'GATE_COUNTER'
                }
            });

            return pseudo;
        });

        return res.status(201).json({
            success: true,
            message: 'Gate Counter created successfully',
            data: result
        });

    } catch (err) {
        console.error('createGateCounter error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * DELETE /api/market/staff/gate-counters/:id
 * Remove a gate counter
 */
exports.deleteGateCounter = async (req, res) => {
    try {
        const { id } = req.params;
        const { roleName, marketId } = req.user;

        const staff = await prisma.pseudoMarketAdmin.findUnique({
            where: { id },
            include: { admin: true }
        });

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // RBAC: MarketMaster can only delete from their market
        if (roleName === 'MarketMaster' && staff.marketId !== marketId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Delete in transaction
        await prisma.$transaction(async (tx) => {
            // Delete Pseudo record
            await tx.pseudoMarketAdmin.delete({ where: { id } });

            // Delete Admin record
            await tx.admin.delete({ where: { id: staff.adminId } });

            // Delete User record (optional, but keep it clean for these pseudo admins?)
            await tx.user.delete({ where: { id: staff.admin.userId } });
        });

        return res.status(200).json({
            success: true,
            message: 'Gate Counter removed successfully'
        });
    } catch (err) {
        console.error('deleteGateCounter error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
