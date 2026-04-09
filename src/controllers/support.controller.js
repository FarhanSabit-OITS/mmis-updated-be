const { PrismaClient } = require('@prisma/client');
const { notify } = require('../services/notification.service');

const prisma = new PrismaClient();

/**
 * Support Ticket Controller
 * Handles user complaints and administrative ticketing
 */

/**
 * Create a new support ticket
 */
exports.createTicket = async (req, res) => {
    try {
        const { 
            subject, 
            description, 
            priority = 'MEDIUM', 
            category, 
            creatorId 
        } = req.body;

        // Generate a ticket number e.g., TKT-1712689200
        const ticketNumber = `TKT-${Date.now()}`;

        const ticket = await prisma.supportTicket.create({
            data: {
                ticketNumber,
                subject,
                description,
                priority,
                category,
                creatorId,
                status: 'OPEN'
            }
        });

        // Notify user
        await notify({
            userId: creatorId,
            title: 'Support Ticket Created',
            message: `Your ticket ${ticketNumber} has been received and is being processed.`,
            type: 'INFO'
        });

        return res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            data: ticket
        });
    } catch (error) {
        console.error('[SupportController] Error creating ticket:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get tickets (with filtering for admin/user)
 */
exports.getTickets = async (req, res) => {
    const { userId, status, priority, category } = req.query;

    try {
        const where = {};
        if (userId) where.creatorId = userId;
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (category) where.category = category;

        const tickets = await prisma.supportTicket.findMany({
            where,
            include: {
                creator: {
                    select: {
                        email: true,
                        profile: { select: { firstName: true, lastName: true } }
                    }
                },
                assignedTo: {
                    select: {
                        email: true,
                        profile: { select: { firstName: true, lastName: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            data: tickets
        });
    } catch (error) {
        console.error('[SupportController] Error fetching tickets:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update ticket (Assign, Close, or Resolve)
 */
exports.updateTicket = async (req, res) => {
    const { id } = req.params;
    const { status, assignedToId, resolution } = req.body;

    try {
        const oldTicket = await prisma.supportTicket.findUnique({ where: { id } });
        
        const ticket = await prisma.supportTicket.update({
            where: { id },
            data: {
                status,
                assignedToId,
                resolution,
                updatedAt: new Date()
            }
        });

        // Notify creator on status change
        if (status && status !== oldTicket.status) {
            await notify({
                userId: ticket.creatorId,
                title: 'Ticket Status Updated',
                message: `Your ticket ${ticket.ticketNumber} is now ${status}.`,
                type: 'INFO',
                actionUrl: `/support/tickets/${ticket.id}`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Ticket updated successfully',
            data: ticket
        });
    } catch (error) {
        console.error('[SupportController] Error updating ticket:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
