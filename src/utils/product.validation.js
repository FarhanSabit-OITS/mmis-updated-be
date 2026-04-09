/**
 * Product Validation Utilities
 * 
 * Provides validation functions for product creation, updates, and bulk operations
 * Used across product controller endpoints
 */

/**
 * Validate product creation request
 * @param {object} body - Request body
 * @returns {object} - { isValid: boolean, errors: array }
 */
const validateProductCreation = (body) => {
  const errors = [];

  // Check if body exists
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'Request body is required and must be valid JSON' }]
    };
  }

  // Name validation
  if (!body.name || typeof body.name !== 'string') {
    errors.push({ field: 'name', message: 'Product name is required and must be a string' });
  } else if (body.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Product name must be at least 2 characters' });
  } else if (body.name.length > 200) {
    errors.push({ field: 'name', message: 'Product name must be 200 characters or less' });
  }

  // Category validation
  if (!body.category || typeof body.category !== 'string') {
    errors.push({ field: 'category', message: 'Category is required and must be a string' });
  } else if (body.category.length > 100) {
    errors.push({ field: 'category', message: 'Category must be 100 characters or less' });
  }

  // Unit validation
  if (!body.unit || typeof body.unit !== 'string') {
    errors.push({ field: 'unit', message: 'Unit is required (e.g., kg, pcs, liters)' });
  }

  // Price validation
  if (body.price === undefined || body.price === null) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else {
    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      errors.push({ field: 'price', message: 'Price must be a number greater than 0' });
    }
  }

  // Current Stock validation
  if (body.currentStock === undefined || body.currentStock === null) {
    errors.push({ field: 'currentStock', message: 'Current stock is required' });
  } else {
    const stock = parseFloat(body.currentStock);
    if (isNaN(stock) || stock < 0) {
      errors.push({ field: 'currentStock', message: 'Current stock must be a number >= 0' });
    }
  }

  // Facility ID validation
  if (!body.facilityId || typeof body.facilityId !== 'string') {
    errors.push({ field: 'facilityId', message: 'Facility ID is required' });
  }

  // Cost Price validation (optional but if provided, must be < price)
  if (body.costPrice !== undefined && body.costPrice !== null) {
    const costPrice = parseFloat(body.costPrice);
    if (isNaN(costPrice)) {
      errors.push({ field: 'costPrice', message: 'Cost price must be a valid number' });
    } else if (costPrice < 0) {
      errors.push({ field: 'costPrice', message: 'Cost price cannot be negative' });
    } else if (body.price && costPrice >= parseFloat(body.price)) {
      errors.push({ field: 'costPrice', message: 'Cost price must be less than selling price' });
    }
  }

  // Wholesale Price validation (optional)
  if (body.wholesalePrice !== undefined && body.wholesalePrice !== null) {
    const wholesalePrice = parseFloat(body.wholesalePrice);
    if (isNaN(wholesalePrice)) {
      errors.push({ field: 'wholesalePrice', message: 'Wholesale price must be a valid number' });
    } else if (wholesalePrice < 0) {
      errors.push({ field: 'wholesalePrice', message: 'Wholesale price cannot be negative' });
    } else if (body.costPrice && wholesalePrice <= parseFloat(body.costPrice)) {
      errors.push({ field: 'wholesalePrice', message: 'Wholesale price must be greater than cost price' });
    } else if (body.price && wholesalePrice > parseFloat(body.price)) {
      errors.push({ field: 'wholesalePrice', message: 'Wholesale price cannot exceed retail price' });
    }
  }

  // Min/Max Stock Level validation (optional)
  if (body.minStockLevel !== undefined && body.maxStockLevel !== undefined) {
    const minStock = parseFloat(body.minStockLevel);
    const maxStock = parseFloat(body.maxStockLevel);
    if (isNaN(minStock) || isNaN(maxStock)) {
      errors.push({ field: 'stockLevels', message: 'Min and max stock levels must be valid numbers' });
    } else if (minStock < 0 || maxStock < 0) {
      errors.push({ field: 'stockLevels', message: 'Stock levels cannot be negative' });
    } else if (minStock >= maxStock) {
      errors.push({ field: 'stockLevels', message: 'Minimum stock level must be less than maximum stock level' });
    }
  }

  // SKU validation (optional but if provided, must be unique - checked at DB level)
  if (body.sku && typeof body.sku !== 'string') {
    errors.push({ field: 'sku', message: 'SKU must be a string' });
  } else if (body.sku && body.sku.length > 100) {
    errors.push({ field: 'sku', message: 'SKU must be 100 characters or less' });
  }

  // Barcode validation (optional but if provided, must be unique - checked at DB level)
  if (body.barcode && typeof body.barcode !== 'string') {
    errors.push({ field: 'barcode', message: 'Barcode must be a string' });
  } else if (body.barcode && body.barcode.length > 100) {
    errors.push({ field: 'barcode', message: 'Barcode must be 100 characters or less' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate product update request
 * @param {object} body - Request body (all fields optional)
 * @param {object} currentProduct - Current product data for comparison
 * @returns {object} - { isValid: boolean, errors: array }
 */
const validateProductUpdate = (body, currentProduct = {}) => {
  const errors = [];

  // Name validation (optional)
  if (body.name !== undefined) {
    if (typeof body.name !== 'string') {
      errors.push({ field: 'name', message: 'Product name must be a string' });
    } else if (body.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Product name must be at least 2 characters' });
    } else if (body.name.length > 200) {
      errors.push({ field: 'name', message: 'Product name must be 200 characters or less' });
    }
  }

  // Category validation (optional)
  if (body.category !== undefined && body.category !== null) {
    if (typeof body.category !== 'string') {
      errors.push({ field: 'category', message: 'Category must be a string' });
    } else if (body.category.length > 100) {
      errors.push({ field: 'category', message: 'Category must be 100 characters or less' });
    }
  }

  // Price validation (optional)
  if (body.price !== undefined && body.price !== null) {
    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      errors.push({ field: 'price', message: 'Price must be a number greater than 0' });
    }
  }

  // Cost Price validation (optional)
  if (body.costPrice !== undefined && body.costPrice !== null) {
    const costPrice = parseFloat(body.costPrice);
    if (isNaN(costPrice)) {
      errors.push({ field: 'costPrice', message: 'Cost price must be a valid number' });
    } else if (costPrice < 0) {
      errors.push({ field: 'costPrice', message: 'Cost price cannot be negative' });
    }
    
    // Compare with price (either from body or current product)
    const priceToCompare = body.price !== undefined ? parseFloat(body.price) : currentProduct.price;
    if (priceToCompare && costPrice >= priceToCompare) {
      errors.push({ field: 'costPrice', message: 'Cost price must be less than selling price' });
    }
  }

  // Wholesale Price validation (optional)
  if (body.wholesalePrice !== undefined && body.wholesalePrice !== null) {
    const wholesalePrice = parseFloat(body.wholesalePrice);
    if (isNaN(wholesalePrice)) {
      errors.push({ field: 'wholesalePrice', message: 'Wholesale price must be a valid number' });
    } else if (wholesalePrice < 0) {
      errors.push({ field: 'wholesalePrice', message: 'Wholesale price cannot be negative' });
    }

    // Compare with cost and retail prices
    const costPriceToCompare = body.costPrice !== undefined ? parseFloat(body.costPrice) : currentProduct.costPrice;
    const priceToCompare = body.price !== undefined ? parseFloat(body.price) : currentProduct.price;
    
    if (costPriceToCompare && wholesalePrice <= costPriceToCompare) {
      errors.push({ field: 'wholesalePrice', message: 'Wholesale price must be greater than cost price' });
    }
    if (priceToCompare && wholesalePrice > priceToCompare) {
      errors.push({ field: 'wholesalePrice', message: 'Wholesale price cannot exceed retail price' });
    }
  }

  // Stock levels validation (optional)
  if (body.minStockLevel !== undefined || body.maxStockLevel !== undefined) {
    const minStock = body.minStockLevel !== undefined ? parseFloat(body.minStockLevel) : currentProduct.minStockLevel;
    const maxStock = body.maxStockLevel !== undefined ? parseFloat(body.maxStockLevel) : currentProduct.maxStockLevel;

    if (minStock !== undefined && maxStock !== undefined) {
      if (isNaN(minStock) || isNaN(maxStock)) {
        errors.push({ field: 'stockLevels', message: 'Stock levels must be valid numbers' });
      } else if (minStock < 0 || maxStock < 0) {
        errors.push({ field: 'stockLevels', message: 'Stock levels cannot be negative' });
      } else if (minStock >= maxStock) {
        errors.push({ field: 'stockLevels', message: 'Minimum stock level must be less than maximum stock level' });
      }
    }
  }

  // isActive validation (optional)
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
    errors.push({ field: 'isActive', message: 'isActive must be a boolean' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate CSV row for bulk upload
 * @param {object} row - CSV row data
 * @param {number} rowIndex - Row number (for error reporting)
 * @returns {object} - { isValid: boolean, errors: array }
 */
const validateBulkUploadRow = (row, rowIndex) => {
  const errors = [];
  const fieldErrors = [];

  // Required fields check
  if (!row.facility_id || row.facility_id.trim() === '') {
    fieldErrors.push('facility_id is required');
  }
  if (!row.name || row.name.trim() === '') {
    fieldErrors.push('name is required');
  }
  if (!row.category || row.category.trim() === '') {
    fieldErrors.push('category is required');
  }
  if (!row.unit || row.unit.trim() === '') {
    fieldErrors.push('unit is required');
  }
  if (row.price === undefined || row.price === '') {
    fieldErrors.push('price is required');
  }
  if (row.current_stock === undefined || row.current_stock === '') {
    fieldErrors.push('current_stock is required');
  }

  // If missing required fields, return early
  if (fieldErrors.length > 0) {
    return {
      isValid: false,
      errors: fieldErrors.map(msg => ({
        row: rowIndex,
        message: msg
      }))
    };
  }

  // Numeric validations
  const price = parseFloat(row.price);
  if (isNaN(price) || price <= 0) {
    errors.push({ row: rowIndex, field: 'price', message: 'Price must be a number greater than 0' });
  }

  const currentStock = parseFloat(row.current_stock);
  if (isNaN(currentStock) || currentStock < 0) {
    errors.push({ row: rowIndex, field: 'current_stock', message: 'Current stock must be a non-negative number' });
  }

  if (row.cost_price !== undefined && row.cost_price !== '') {
    const costPrice = parseFloat(row.cost_price);
    if (isNaN(costPrice)) {
      errors.push({ row: rowIndex, field: 'cost_price', message: 'Cost price must be a valid number' });
    } else if (costPrice >= price) {
      errors.push({ row: rowIndex, field: 'cost_price', message: 'Cost price must be less than price' });
    }
  }

  if (row.wholesale_price !== undefined && row.wholesale_price !== '') {
    const wholesalePrice = parseFloat(row.wholesale_price);
    if (isNaN(wholesalePrice)) {
      errors.push({ row: rowIndex, field: 'wholesale_price', message: 'Wholesale price must be a valid number' });
    }
  }

  if (row.min_stock !== undefined && row.min_stock !== '' && row.max_stock !== undefined && row.max_stock !== '') {
    const minStock = parseFloat(row.min_stock);
    const maxStock = parseFloat(row.max_stock);
    if (!isNaN(minStock) && !isNaN(maxStock) && minStock >= maxStock) {
      errors.push({ row: rowIndex, field: 'stock_levels', message: 'Min stock must be less than max stock' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateProductCreation,
  validateProductUpdate,
  validateBulkUploadRow
};
