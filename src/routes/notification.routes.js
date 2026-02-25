const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller');

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
