/**
 * Category Routes
 * 
 * Defines all endpoints for the Universal Category Framework (UCF)
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

/**
 * Public/Protected Routes for categories
 */

// Get category tree by type (e.g., PRODUCT, VENDOR)
router.get('/tree/:type', categoryController.getCategoryTree);

// Get flat list of categories by type
router.get('/all/:type', categoryController.getAllCategories);

// Admin-only CRUD operations
// Use authMiddleware and optionally roleMiddleware for high-level roles
router.post('/', authMiddleware, categoryController.createCategory);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;
