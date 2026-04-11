
const emailService = require('./email.service');
const socketService = require('./socket.service');

const prisma = require('../shared/prisma');

/**
 * Notification Service
 * Handles unified notification dispatch (In-App + Email)
 */

/**
 * Send a notification to a specific user
 * @param {Object} params 
 * @param {string} params.userId - Recipient user ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification body
 * @param {string} [params.type='INFO'] - INFO, WARNING, SUCCESS, ERROR
 * @param {boolean} [params.sendEmail=false] - Whether to also send an email
 * @param {string} [params.actionUrl] - Optional URL for the user to visit
 * @param {Object} [params.metadata] - Additional structured data
 */
async function notify(params) {
    const { 
        userId, 
        title, 
        message, 
        type = 'INFO', 
        sendEmail = false, 
        actionUrl = null, 
        metadata = {} 
    } = params;

    try {
        // 1. Create In-App Notification
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                actionUrl,
                data: metadata
            }
        });

        // 2. Optional Email dispatch
        if (sendEmail) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            });

            if (user && user.email) {
                console.log(`[NotificationService] Dispatching email to ${user.email}`);
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

        // 3. Emit real-time WebSocket event
        socketService.emitToUser(userId, 'new_notification', notification);

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
            updatedAt: new Date()
        }
    });
}

/**
 * Get user notifications
 */
async function getUserNotifications(userId, limit = 20) {
    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
    });
}

/**
 * Send a notification to all users in a specific market (e.g. all market admins/staff)
 * @param {string} marketId - ID of the market to broadcast to
 * @param {Object} params - Notification parameters (title, message, etc.)
 */
async function notifyMarket(marketId, params) {
    const { title, message, type = 'INFO', actionUrl = null, metadata = {} } = params;

    try {
        // Emit real-time WebSocket event to the market room
        socketService.emitToMarket(marketId, 'market_broadcast', {
            title,
            message,
            type,
            actionUrl,
            metadata,
            timestamp: new Date()
        });

        console.log(`[NotificationService] Market-wide broadcast sent to market_${marketId}`);
    } catch (error) {
        console.error('[NotificationService] Error broadcasting to market:', error);
    }
}

module.exports = {
    notify,
    notifyMarket,
    markAsRead,
    getUserNotifications
};
