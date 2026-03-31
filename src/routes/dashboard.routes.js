// src/routes/dashboard.routes.js
const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/dashboard/users/under-me/count
router.get(
  '/users/under-me/count',
  authMiddleware,
  dashboardController.getUsersUnderMeCount
);

module.exports = router;
