const notificationService = require('../services/notification.service');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user);

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
        await notificationService.markAsRead(id);

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

exports.dismissNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await notificationService.dismiss(id);

        return res.status(200).json({
            success: true,
            message: 'Notification dismissed'
        });
    } catch (err) {
        console.error('dismissNotification error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
