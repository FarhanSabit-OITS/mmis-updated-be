
const emailService = require('./email.service');
const socketService = require('./socket.service');

const prisma = require('../shared/prisma');

/**
 * Notification Service
 * Handles unified notification dispatch (In-App + Email)
 */

/**
 * Send a notification to a specific user or target group
 * @param {Object} params 
 * @param {string} [params.userId] - Individual recipient user ID
 * @param {string} [params.marketId] - Target specific market
 * @param {string} [params.targetRole] - Target specific administrative level (e.g. SUPER_ADMIN)
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification body
 * @param {string} [params.type='INFO'] - INFO, WARNING, SUCCESS, ERROR, SECURITY, BATCH
 * @param {string} [params.priority='MEDIUM'] - INFO, MEDIUM, HIGH, CRITICAL
 * @param {boolean} [params.requiresDismissal=false] - If true, persists until manually dismissed
 * @param {boolean} [params.sendEmail=false] - Whether to also send an email
 * @param {string} [params.actionUrl] - Optional URL for the user to visit
 * @param {Object} [params.metadata] - Additional structured data
 */
async function notify(params) {
    const { 
        userId = null,
        marketId = null,
        targetRole = null,
        title, 
        message, 
        type = 'INFO', 
        priority = 'MEDIUM',
        requiresDismissal = false,
        sendEmail = false, 
        actionUrl = null, 
        metadata = {} 
    } = params;

    try {
        // 1. Create In-App Notification (Persistent)
        const notification = await prisma.notification.create({
            data: {
                userId,
                marketId,
                targetRole,
                title,
                message,
                type,
                priority,
                requiresDismissal: requiresDismissal || priority === 'CRITICAL' || priority === 'HIGH',
                actionUrl,
                data: metadata
            }
        });

        // 2. Optional Email dispatch (Only if userId is provided)
        if (sendEmail && userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            });

            if (user && user.email) {
                await emailService.sendGenericNotificationEmail(
                    user.email,
                    title,
                    message,
                    actionUrl,
                    { 
                        name: user.profile?.firstName || 'User',
                        ctaTag: params.ctaTag 
                    }
                );
            }
        }

        // 3. Emit real-time WebSocket events
        if (userId) {
            socketService.emitToUser(userId, 'new_notification', notification);
        } else if (marketId) {
            socketService.emitToMarket(marketId, 'market_notification', notification);
        } else if (targetRole) {
            socketService.broadcast('role_notification', notification);
        } else {
            socketService.broadcast('system_notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('[NotificationService] Error sending notification:', error);
        throw error;
    }
}

/**
 * Mark a notification as read
 */
async function markAsRead(notificationId) {
    return await prisma.notification.update({
        where: { id: notificationId },
        data: { 
            isRead: true,
            readAt: new Date(),
            updatedAt: new Date()
        }
    });
}

/**
 * Manually dismiss a notification
 */
async function dismiss(notificationId) {
    return await prisma.notification.update({
        where: { id: notificationId },
        data: { 
            dismissedAt: new Date(),
            updatedAt: new Date()
        }
    });
}

/**
 * Get context-aware notifications for a user (Self + Market Broadcasts + Role Broadcasts)
 */
async function getUserNotifications(user, limit = 50) {
    const { id: userId, marketId, roleLevel } = user;

    return await prisma.notification.findMany({
        where: {
            OR: [
                { userId },
                { AND: [{ marketId }, { targetRole: null }] }, // Market broadast
                { AND: [{ marketId }, { targetRole: roleLevel }] }, // Market + Role specific
                { AND: [{ marketId: null }, { targetRole: roleLevel }] } // Global Role specific
            ],
            dismissedAt: null // Only show active/non-dismissed
        },
        orderBy: { createdAt: 'desc' },
        take: limit
    });
}

/**
 * Send a notification to all users in a specific market context
 */
async function notifyMarket(marketId, params) {
    return await notify({ ...params, marketId });
}

/**
 * Send a notification to all users with a specific role level
 */
async function notifyRole(targetRole, params) {
    return await notify({ ...params, targetRole });
}

module.exports = {
    notify,
    notifyMarket,
    notifyRole,
    markAsRead,
    dismiss,
    getUserNotifications
};
