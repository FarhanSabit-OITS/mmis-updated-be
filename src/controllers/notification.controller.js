
const prisma = require('../shared/prisma');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (err) {
        console.error('getNotifications error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.update({
            where: { id },
            data: { isRead: true, readAt: new Date() }
        });

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (err) {
        console.error('markAsRead error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
