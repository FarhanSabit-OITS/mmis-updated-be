/**
 * Product Service
 * 
 * Business logic layer for product operations
 * Handles database operations for products and inventory records
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new product with initial inventory record
 * @param {object} productData - Product fields
 * @param {string} userId - User creating the product
 * @returns {object} - Created product
 */
const createProduct = async (productData, userId) => {
  const result = await prisma.$transaction(async (tx) => {
    // Create product
    const product = await tx.product.create({
      data: {
        stallId: productData.stallId,
        name: productData.name,
        description: productData.description || null,
        category: productData.category,
        subCategory: productData.subCategory || null,
        unit: productData.unit,
        price: parseFloat(productData.price),
        costPrice: productData.costPrice ? parseFloat(productData.costPrice) : null,
        wholesalePrice: productData.wholesalePrice ? parseFloat(productData.wholesalePrice) : null,
        sku: productData.sku || null,
        barcode: productData.barcode || null,
        currentStock: parseFloat(productData.currentStock) || 0,
        minStockLevel: productData.minStockLevel ? parseFloat(productData.minStockLevel) : null,
        maxStockLevel: productData.maxStockLevel ? parseFloat(productData.maxStockLevel) : null,
        isActive: true,
        isApproved: false,
        supplierId: productData.supplierId || null,
        createdById: userId
      },
      include: {
        createdBy: {
          select: { id: true, email: true }
        }
      }
    });

    // Create initial inventory record if stock > 0
    if (parseFloat(productData.currentStock) > 0) {
      await tx.inventoryRecord.create({
        data: {
          productId: product.id,
          recordType: 'INITIAL_STOCK',
          quantity: parseFloat(productData.currentStock),
          previousQuantity: null,
          newQuantity: parseFloat(productData.currentStock),
          referenceId: null,
          referenceType: 'INITIAL',
          notes: 'Initial stock on product creation',
          recordedById: userId
        }
      });
    }

    return product;
  });

  return result;
};

/**
 * Get product with related data
 * @param {string} productId - Product ID
 * @returns {object} - Product with relations
 */
const getProductById = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      stall: {
        include: {
          vendor: {
            include: {
              stakeholder: {
                include: {
                  user: {
                    select: { id: true, email: true }
                  }
                }
              }
            }
          }
        }
      },
      supplier: {
        select: {
          id: true,
          businessName: true
        }
      },
      createdBy: {
        select: { id: true, email: true }
      }
    }
  });

  return product;
};

/**
 * Update product fields
 * @param {string} productId - Product ID
 * @param {object} updateData - Fields to update
 * @param {string} userId - User performing update
 * @returns {object} - Updated product
 */
const updateProduct = async (productId, updateData, userId) => {
  const result = await prisma.$transaction(async (tx) => {
    // Get current product
    const currentProduct = await tx.product.findUnique({
      where: { id: productId }
    });

    if (!currentProduct) {
      throw new Error('Product not found');
    }

    // Build update data
    const dataToUpdate = {};
    if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.category !== undefined) dataToUpdate.category = updateData.category;
    if (updateData.subCategory !== undefined) dataToUpdate.subCategory = updateData.subCategory;
    if (updateData.price !== undefined) dataToUpdate.price = parseFloat(updateData.price);
    if (updateData.costPrice !== undefined) dataToUpdate.costPrice = updateData.costPrice ? parseFloat(updateData.costPrice) : null;
    if (updateData.wholesalePrice !== undefined) dataToUpdate.wholesalePrice = updateData.wholesalePrice ? parseFloat(updateData.wholesalePrice) : null;
    if (updateData.minStockLevel !== undefined) dataToUpdate.minStockLevel = updateData.minStockLevel ? parseFloat(updateData.minStockLevel) : null;
    if (updateData.maxStockLevel !== undefined) dataToUpdate.maxStockLevel = updateData.maxStockLevel ? parseFloat(updateData.maxStockLevel) : null;
    if (updateData.isActive !== undefined) dataToUpdate.isActive = updateData.isActive;

    // Update product
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: dataToUpdate,
      include: {
        createdBy: { select: { id: true, email: true } }
      }
    });

    return updatedProduct;
  });

  return result;
};

/**
 * Soft delete product (archive)
 * @param {string} productId - Product ID
 * @param {string} userId - User performing deletion
 * @param {string} reason - Reason for deletion
 * @returns {object} - Deleted product metadata
 */
const softDeleteProduct = async (productId, userId, reason = '') => {
  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId }
    });

    if (!currentProduct) {
      throw new Error('Product not found');
    }

    // Update product
    const deletedProduct = await tx.product.update({
      where: { id: productId },
      data: { isActive: false },
      include: {
        createdBy: { select: { id: true, email: true } }
      }
    });

    // Create inventory record for archive
    if (product.currentStock > 0) {
      await tx.inventoryRecord.create({
        data: {
          productId: productId,
          recordType: 'ARCHIVED',
          quantity: -product.currentStock,
          previousQuantity: product.currentStock,
          newQuantity: 0,
          referenceId: null,
          referenceType: 'ARCHIVE',
          notes: `Product archived: ${reason}`,
          recordedById: userId
        }
      });
    }

    return {
      id: deletedProduct.id,
      isActive: false,
      archivedAt: new Date()
    };
  });

  return result;
};

/**
 * Check SKU uniqueness within a stall
 * @param {string} stallId - Stall ID
 * @param {string} sku - SKU to check
 * @param {string} excludeProductId - Product ID to exclude (for updates)
 * @returns {boolean} - True if SKU is unique
 */
const isSkuUnique = async (stallId, sku, excludeProductId = null) => {
  const query = {
    where: {
      stallId: stallId,
      sku: sku,
      isActive: true
    }
  };

  if (excludeProductId) {
    query.where.NOT = { id: excludeProductId };
  }

  const existing = await prisma.product.findFirst(query);
  return !existing;
};

/**
 * Check barcode uniqueness globally
 * @param {string} barcode - Barcode to check
 * @param {string} excludeProductId - Product ID to exclude (for updates)
 * @returns {boolean} - True if barcode is unique
 */
const isBarcodeUnique = async (barcode, excludeProductId = null) => {
  const query = {
    where: {
      barcode: barcode,
      isActive: true
    }
  };

  if (excludeProductId) {
    query.where.NOT = { id: excludeProductId };
  }

  const existing = await prisma.product.findFirst(query);
  return !existing;
};

/**
 * Get products for vendor with filters
 * @param {string} vendorId - Vendor ID
 * @param {object} filters - Filter options
 * @returns {object} - Products and pagination
 */
const getVendorProducts = async (vendorId, filters = {}) => {
  const {
    stallId,
    category,
    status = 'ACTIVE',
    search = '',
    sort = 'createdAt',
    order = 'DESC',
    page = 1,
    limit = 20
  } = filters;

  // Build where clause
  const where = {
    stall: {
      vendor: {
        id: vendorId
      }
    }
  };

  if (stallId) {
    where.stallId = stallId;
  }

  if (category) {
    where.category = {
      contains: category,
      mode: 'insensitive'
    };
  }

  if (status === 'ACTIVE') {
    where.isActive = true;
  } else if (status === 'INACTIVE') {
    where.isActive = false;
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      },
      {
        description: {
          contains: search,
          mode: 'insensitive'
        }
      },
      {
        sku: {
          contains: search,
          mode: 'insensitive'
        }
      },
      {
        barcode: {
          contains: search,
          mode: 'insensitive'
        }
      }
    ];
  }

  // Get total count
  const total = await prisma.product.count({ where });

  // Calculate pagination
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);
  const hasMore = offset + limit < total;

  // Get products
  const products = await prisma.product.findMany({
    where,
    include: {
      stall: {
        select: { stallNumber: true }
      }
    },
    orderBy: {
      [sort]: order.toLowerCase()
    },
    skip: offset,
    take: parseInt(limit)
  });

  // Add stock status to each product
  const productsWithStatus = products.map(p => ({
    ...p,
    stockStatus: p.currentStock === 0 ? 'OUT_OF_STOCK' : (p.currentStock <= p.minStockLevel ? 'LOW_STOCK' : 'NORMAL')
  }));

  return {
    products: productsWithStatus,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasMore
    }
  };
};

module.exports = {
  createProduct,
  getProductById,
  updateProduct,
  softDeleteProduct,
  isSkuUnique,
  isBarcodeUnique,
  getVendorProducts
};
