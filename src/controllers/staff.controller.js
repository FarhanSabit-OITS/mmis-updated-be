const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { validateEmail, validatePassword, normalizeEmail } = require('../utils/validation');

/**
 * GET /api/market/staff
 * Get all pseudo-staff members across markets (or filtered by market/role)
 */
exports.getAllStaff = async (req, res) => {
    try {
        const { roleName, marketId: managerMarketId } = req.user;
        const { marketId, role } = req.query;

        let whereClause = {};

        // RBAC: MarketMaster can only see their own market
        if (roleName === 'MarketMaster') {
            whereClause.marketId = managerMarketId;
        } else if (roleName === 'SuperAdmin') {
            if (marketId) whereClause.marketId = marketId;
        } else {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Optional Role filter (e.g., SECURITY_ADMIN, HEALTH_INSPECTOR)
        if (role) {
            whereClause.role = role;
        }

        const staff = await prisma.pseudoMarketAdmin.findMany({
            where: whereClause,
            include: {
                admin: {
                    include: {
                        user: {
                            include: { profile: true }
                        }
                    }
                },
                market: true
            }
        });

        const formatted = staff.map(s => ({
            id: s.id,
            role: s.role,
            userId: s.admin?.user?.id,
            name: `${s.admin?.user?.profile?.firstName || ''} ${s.admin?.user?.profile?.lastName || ''}`.trim(),
            email: s.admin?.user?.email,
            phone: s.admin?.user?.profile?.primaryPhone || 'N/A',
            marketName: s.market?.name,
            marketId: s.marketId,
            status: s.admin?.user?.status,
            assignedSection: s.assignedSection
        }));

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (err) {
        console.error('getAllStaff error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * GET /api/market/staff/gate-counters
 * Get gate counter(s) based on user role (Legacy support)
 */
exports.getGateCounters = async (req, res) => {
    req.query.role = 'GATE_COUNTER';
    return exports.getAllStaff(req, res);
};

/**
 * POST /api/market/staff
 * Create a specialized staff member (Security, Health, Stock, etc.)
 */
exports.createStaff = async (req, res) => {
    try {
        const { roleName, marketId: managerMarketId } = req.user;
        let { name, email, phone, password, marketId, role } = req.body;

        if (roleName === 'MarketMaster') marketId = managerMarketId;
        
        if (!marketId || !role) {
            return res.status(400).json({ success: false, message: 'Market ID and Role are required' });
        }

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing credentials' });
        }

        const normalizedEmail = normalizeEmail(email);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: normalizedEmail,
                    passwordHash: await bcrypt.hash(password, 10),
                    phone,
                    status: 'ACTIVE',
                    emailVerified: true,
                    profile: {
                        create: {
                            firstName: name.split(' ')[0],
                            lastName: name.split(' ').slice(1).join(' ') || ' ',
                            primaryPhone: phone || '',
                            primaryEmail: normalizedEmail
                        }
                    }
                }
            });

            const admin = await tx.admin.create({
                data: {
                    userId: user.id,
                    adminLevel: 'PSEUDO_MARKET_ADMIN'
                }
            });

            const pseudo = await tx.pseudoMarketAdmin.create({
                data: {
                    adminId: admin.id,
                    marketId,
                    role: role // e.g., SECURITY_ADMIN, HEALTH_INSPECTOR
                }
            });

            return pseudo;
        });

        return res.status(201).json({
            success: true,
            data: result
        });

    } catch (err) {
        console.error('createStaff error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * PATCH /api/market/staff/:id
 * Update staff duty/section
 */
exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedSection, role } = req.body;

        const updated = await prisma.pseudoMarketAdmin.update({
            where: { id },
            data: { 
                assignedSection,
                role 
            }
        });

        return res.status(200).json({
            success: true,
            data: updated
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * DELETE /api/market/staff/:id
 */
exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await prisma.pseudoMarketAdmin.findUnique({
            where: { id },
            include: { admin: true }
        });

        if (!staff) return res.status(404).json({ success: false, message: 'Not found' });

        await prisma.$transaction(async (tx) => {
            await tx.pseudoMarketAdmin.delete({ where: { id } });
            await tx.admin.delete({ where: { id: staff.adminId } });
            await tx.user.delete({ where: { id: staff.admin.userId } });
        });

        return res.status(200).json({ success: true, message: 'Staff removed' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error deleting staff' });
    }
};

// Legacy alias handlers for backward compatibility if needed
exports.createGateCounter = exports.createStaff;
exports.deleteGateCounter = exports.deleteStaff;
