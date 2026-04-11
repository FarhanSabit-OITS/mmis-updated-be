const prisma = require('../shared/prisma');
const { notify } = require('../services/notification.service');
const aiService = require('../services/ai.service');
const { ApiResponse, asyncHandler } = require('../utils');

/**
 * Support Ticket Controller
 * Handles user complaints and administrative ticketing
 */

/**
 * Create a new support ticket
 */
exports.createTicket = asyncHandler(async (req, res) => {
    const { 
        subject, 
        description, 
        priority = 'MEDIUM', 
        category, 
        creatorId,
        marketId
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
            marketId,
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

    return res.status(201).json(new ApiResponse({
        statusCode: 201,
        success: true,
        message: 'Ticket created successfully',
        data: ticket
    }));
});

/**
 * Get tickets (with filtering for admin/user)
 */
exports.getTickets = asyncHandler(async (req, res) => {
    const { userId, status, priority, category, marketId } = req.query;

    const where = {};
    if (userId) where.creatorId = userId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (marketId) where.marketId = marketId;

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

    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        data: tickets
    }));
});

/**
 * Update ticket (Assign, Close, or Resolve)
 */
exports.updateTicket = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, assignedToId, resolution } = req.body;

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

    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        message: 'Ticket updated successfully',
        data: ticket
    }));
});

/**
 * Summarize a ticket using AI
 */
exports.summarizeTicket = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
        return res.status(404).json(new ApiResponse({
            statusCode: 404,
            success: false,
            message: 'Ticket not found'
        }));
    }

    const summary = await aiService.summarizeTicket(ticket.description, ticket.resolution || '');

    const updatedTicket = await prisma.supportTicket.update({
        where: { id },
        data: { aiSummary: summary },
    });

    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        message: 'Ticket summarized by AI successfully',
        data: updatedTicket
    }));
});
