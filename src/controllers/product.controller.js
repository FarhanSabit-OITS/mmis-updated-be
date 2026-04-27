/**
 * Product Controller
 * 
 * Handles all product-related HTTP requests
 * Manages products: CRUD operations, bulk imports, stock tracking
 */

const { PrismaClient } = require('@prisma/client');
const productService = require('../services/product.service');
const { validateProductCreation, validateProductUpdate, validateBulkUploadRow } = require('../utils/product.validation');

const prisma = new PrismaClient();

/**
 * POST /api/vendors/:vendorId/products
 * Create a new product
 */
exports.createProduct = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const userId = req.user.id;

    // Check vendor exists and belongs to current user
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        stakeholder: {
          include: { user: true }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Auth check: Vendor can only create for themselves, Admin can create for any vendor
    const isAdmin = req.user.roleLevel && ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'DISTRICT_ADMIN', 'CITY_ADMIN', 'MARKET_MASTER'].includes(req.user.roleLevel);

    // Debug logging
    console.log(`[CreateProduct] UserID: ${userId}, VendorOwnerID: ${vendor.stakeholder.user.id}, IsAdmin: ${isAdmin}`);

    if (vendor.stakeholder.user.id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot create products for other vendors'
      });
    }

    // Validate input
    const validation = validateProductCreation(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check stall exists and belongs to vendor
    const stall = await prisma.stall.findUnique({
      where: { id: req.body.stallId }
    });

    if (!stall) {
      return res.status(404).json({
        success: false,
        message: 'Stall not found'
      });
    }

    if (stall.vendorId !== vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Stall does not belong to this vendor'
      });
    }

    // Check SKU uniqueness if provided
    if (req.body.sku) {
      const skuUnique = await productService.isSkuUnique(req.body.stallId, req.body.sku);
      if (!skuUnique) {
        return res.status(409).json({
          success: false,
          message: 'SKU already exists for this stall'
        });
      }
    }

    // Check barcode uniqueness if provided
    if (req.body.barcode) {
      const barcodeUnique = await productService.isBarcodeUnique(req.body.barcode);
      if (!barcodeUnique) {
        return res.status(409).json({
          success: false,
          message: 'Barcode already exists'
        });
      }
    }

    // Create product
    const product = await productService.createProduct(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

/**
 * GET /api/vendors/:vendorId/products
 * List all products for a vendor
 */
exports.listProducts = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const userId = req.user.id;

    // Check vendor exists and user has permission
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        stakeholder: {
          include: { user: true }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Auth check
    const isAdmin = req.user.roleLevel && ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'DISTRICT_ADMIN', 'CITY_ADMIN', 'MARKET_MASTER'].includes(req.user.roleLevel);
    if (vendor.stakeholder.user.id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot view other vendors products'
      });
    }

    // Build filters
    const filters = {
      stallId: req.query.stallId || null,
      category: req.query.category || '',
      status: req.query.status || 'ACTIVE',
      search: req.query.search || '',
      sort: req.query.sort || 'createdAt',
      order: req.query.order || 'DESC',
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 20, 100)
    };

    const result = await productService.getVendorProducts(vendorId, filters);

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination
    });
  } catch (err) {
    console.error('Error listing products:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

/**
 * GET /api/products/:productId
 * Get single product details
 */
exports.getProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Permission check: If user is vendor, can only view own products; Admin can view all
    if (userId) {
      const isAdmin = req.user.roleLevel && ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'DISTRICT_ADMIN', 'CITY_ADMIN', 'MARKET_MASTER'].includes(req.user.roleLevel);
      const isVendor = product.stall.vendor.stakeholder.user.id === userId;

      if (!isAdmin && !isVendor && !product.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Product not available'
        });
      }

      // Hide sensitive fields for non-vendors
      if (!isVendor && !isAdmin) {
        product.costPrice = undefined;
        product.wholesalePrice = undefined;
        product.supplierId = undefined;
      }
    } else {
      // Anonymous user - only see active products
      if (!product.isActive || !product.isApproved) {
        return res.status(403).json({
          success: false,
          message: 'Product not available'
        });
      }
      product.costPrice = undefined;
      product.wholesalePrice = undefined;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

/**
 * PATCH /api/products/:productId
 * Update product information
 */
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Get current product
    const currentProduct = await productService.getProductById(productId);

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Auth check: Vendor can only update own products, Admin can update any
    const isAdmin = req.user.roleLevel && ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'DISTRICT_ADMIN', 'CITY_ADMIN', 'MARKET_MASTER'].includes(req.user.roleLevel);
    if (currentProduct.stall.vendor.stakeholder.user.id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot update other vendors products'
      });
    }

    // Validate input
    const validation = validateProductUpdate(req.body, currentProduct);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Cannot change stallId or SKU/barcode after creation
    if (req.body.stallId && req.body.stallId !== currentProduct.stallId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change stall after product creation'
      });
    }

    if (req.body.sku && req.body.sku !== currentProduct.sku) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change SKU after product creation'
      });
    }

    if (req.body.barcode && req.body.barcode !== currentProduct.barcode) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change barcode after product creation'
      });
    }

    // Update product
    const updatedProduct = await productService.updateProduct(productId, req.body, userId);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

/**
 * DELETE /api/products/:productId
 * Soft delete (archive) product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    // Get current product
    const currentProduct = await productService.getProductById(productId);

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Auth check
    const isAdmin = req.user.roleLevel && ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'DISTRICT_ADMIN', 'CITY_ADMIN', 'MARKET_MASTER'].includes(req.user.roleLevel);
    if (currentProduct.stall.vendor.stakeholder.user.id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot delete other vendors products'
      });
    }

    // Soft delete
    const result = await productService.softDeleteProduct(productId, userId, reason || '');

    res.status(200).json({
      success: true,
      message: 'Product archived successfully',
      data: result
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

/**
 * POST /api/vendors/:vendorId/products/bulk-upload
 * Bulk import products from CSV
 */
exports.bulkUpload = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const userId = req.user.id;
    const { stopOnError = false, dryRun = false } = req.query;

    // Check file uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.files.file;

    // Validate file
    if (!['text/csv', 'application/vnd.ms-excel'].includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Please upload a CSV file.'
      });
    }

    if (file.size > 10 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }

    // Check vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { stakeholder: { include: { user: true } } }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Auth check
    const isAdmin = req.user.roleLevel && ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'DISTRICT_ADMIN', 'CITY_ADMIN', 'MARKET_MASTER'].includes(req.user.roleLevel);
    if (vendor.stakeholder.user.id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot import for other vendors'
      });
    }

    // Parse CSV
    const { parse } = require('csv-parse/sync');
    const fs = require('fs');

    // Read file from temp path since useTempFiles: true is set in middleware
    let fileContent;
    if (file.tempFilePath) {
      fileContent = fs.readFileSync(file.tempFilePath, 'utf8');
    } else {
      fileContent = file.data.toString('utf8');
    }

    console.log('Raw file content length:', fileContent.length);
    console.log('First 200 chars:', fileContent.substring(0, 200));

    // Remove empty lines and trim
    fileContent = fileContent.split('\n').filter(line => line.trim()).join('\n');

    console.log('After filtering, content length:', fileContent.length);
    console.log('After filtering, first 200 chars:', fileContent.substring(0, 200));

    let rows;

    try {
      rows = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      console.log('Successfully parsed. Rows:', rows.length);
      console.log('First row:', rows[0]);
    } catch (parseErr) {
      console.error('CSV Parse Error:', parseErr);
      return res.status(400).json({
        success: false,
        message: 'Invalid CSV format',
        error: parseErr.message
      });
    }

    console.log('Parsed rows count:', rows.length);
    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty'
      });
    }

    // Validate each row
    const validRows = [];
    const errors = [];
    const skuMap = new Set();
    const barcodeMap = new Set();

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // +2 because row 1 is header
      const row = rows[i];

      // Validate row structure
      const rowValidation = validateBulkUploadRow(row, rowNum);
      if (!rowValidation.isValid) {
        errors.push(...rowValidation.errors);
        if (stopOnError) break;
        continue;
      }

      // Check stall ownership
      const stall = await prisma.stall.findUnique({
        where: { id: row.stall_id }
      });

      if (!stall || stall.vendorId !== vendorId) {
        errors.push({
          row: rowNum,
          field: 'stall_id',
          message: 'Stall not found or does not belong to this vendor'
        });
        if (stopOnError) break;
        continue;
      }

      // Check SKU uniqueness (within file and database)
      if (row.sku) {
        if (skuMap.has(`${row.stall_id}|${row.sku}`)) {
          errors.push({
            row: rowNum,
            field: 'sku',
            message: 'SKU already exists in this upload'
          });
          if (stopOnError) break;
          continue;
        }

        const skuUnique = await productService.isSkuUnique(row.stall_id, row.sku);
        if (!skuUnique) {
          errors.push({
            row: rowNum,
            field: 'sku',
            message: 'SKU already exists in database'
          });
          if (stopOnError) break;
          continue;
        }

        skuMap.add(`${row.stall_id}|${row.sku}`);
      }

      // Check barcode uniqueness (within file and database)
      if (row.barcode) {
        if (barcodeMap.has(row.barcode)) {
          errors.push({
            row: rowNum,
            field: 'barcode',
            message: 'Barcode already exists in this upload'
          });
          if (stopOnError) break;
          continue;
        }

        const barcodeUnique = await productService.isBarcodeUnique(row.barcode);
        if (!barcodeUnique) {
          errors.push({
            row: rowNum,
            field: 'barcode',
            message: 'Barcode already exists in database'
          });
          if (stopOnError) break;
          continue;
        }

        barcodeMap.add(row.barcode);
      }

      validRows.push({ ...row, rowNum });
    }

    // Return early if dry run or has errors
    if (dryRun) {
      return res.status(200).json({
        success: true,
        message: `Dry run validation completed - ${errors.length} errors found`,
        data: {
          totalRows: rows.length,
          validRows: validRows.length,
          invalidRows: errors.length,
          errors,
          summary: {
            toCreate: validRows.length,
            toUpdate: 0,
            skipped: errors.length
          },
          dryRun: true
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Validation failed - ${errors.length} errors found`,
        data: {
          totalRows: rows.length,
          validRows: validRows.length,
          invalidRows: errors.length,
          errors
        }
      });
    }

    // Create products in transaction
    const createdProducts = [];

    const result = await prisma.$transaction(async (tx) => {
      for (const row of validRows) {
        const product = await tx.product.create({
          data: {
            stallId: row.stall_id,
            name: row.name,
            description: row.description || null,
            category: row.category,
            subCategory: row.subcategory || null,
            unit: row.unit,
            price: parseFloat(row.price),
            costPrice: row.cost_price ? parseFloat(row.cost_price) : null,
            wholesalePrice: row.wholesale_price ? parseFloat(row.wholesale_price) : null,
            sku: row.sku || null,
            barcode: row.barcode || null,
            currentStock: parseFloat(row.current_stock) || 0,
            minStockLevel: row.min_stock ? parseFloat(row.min_stock) : null,
            maxStockLevel: row.max_stock ? parseFloat(row.max_stock) : null,
            isActive: true,
            isApproved: false,
            supplierId: row.supplier_id || null,
            createdById: userId
          }
        });

        // Create inventory record if stock > 0
        if (parseFloat(row.current_stock) > 0) {
          await tx.inventoryRecord.create({
            data: {
              productId: product.id,
              recordType: 'BULK_IMPORT',
              quantity: parseFloat(row.current_stock),
              newQuantity: parseFloat(row.current_stock),
              notes: 'Imported via bulk upload',
              recordedById: userId
            }
          });
        }

        createdProducts.push({
          id: product.id,
          name: product.name,
          sku: product.sku
        });
      }
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdProducts.length} products`,
      data: {
        totalRows: rows.length,
        createdCount: createdProducts.length,
        updatedCount: 0,
        failedCount: errors.length,
        errors,
        createdProducts
      }
    });
  } catch (err) {
    console.error('Error in bulk upload:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

/**
 * POST /api/products/:productId/adjust-stock
 * Adjust stock level (Manual/Scanning)
 */
exports.adjustStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, type, notes } = req.body;
    const userId = req.user.id;

    if (quantity === undefined || !type) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and adjustment type are required'
      });
    }

    const updatedProduct = await productService.adjustStock(
      productId,
      quantity,
      type,
      null, // No referenceId for manual adjustment
      null, // No transaction
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Stock adjusted successfully',
      data: updatedProduct
    });
  } catch (err) {
    console.error('Error adjusting stock:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};
