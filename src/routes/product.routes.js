/**
 * Product Routes
 * 
 * Defines all product-related API endpoints
 * All routes require authentication via authMiddleware
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const productController = require('../controllers/product.controller');

// Middleware: All product routes require authentication
router.use(authMiddleware);

// =====================
// Product Management
// =====================

/**
 * Create a new product
 * POST /api/vendors/:vendorId/products
 */
router.post('/:vendorId/products', productController.createProduct);

/**
 * List all products for a vendor
 * GET /api/vendors/:vendorId/products
 * Query params: stallId, category, status, search, sort, order, page, limit
 */
router.get('/:vendorId/products', productController.listProducts);

/**
 * Bulk import products from CSV
 * POST /api/vendors/:vendorId/products/bulk-upload
 * File: multipart/form-data with 'file' field
 * Query params: dryRun, stopOnError
 */
router.post('/:vendorId/products/bulk-upload', productController.bulkUpload);

/**
 * Get single product details
 * GET /api/products/:productId
 */
router.get('/:productId', productController.getProduct);

/**
 * Update product information
 * PATCH /api/products/:productId
 */
router.patch('/:productId', productController.updateProduct);

/**
 * Soft delete (archive) product
 * DELETE /api/products/:productId
 */
router.delete('/:productId', productController.deleteProduct);

/**
 * Bulk import products from CSV
 * POST /api/vendors/:vendorId/products/bulk-upload
 * File: multipart/form-data with 'file' field
 * Query params: dryRun, stopOnError
 */
router.post('/:vendorId/products/bulk-upload', productController.bulkUpload);

module.exports = router;
