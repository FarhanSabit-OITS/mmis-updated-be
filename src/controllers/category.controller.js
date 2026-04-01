/**
 * Category Controller
 * 
 * Handles all category-related HTTP requests
 * Uses CategoryService for business logic
 */

const categoryService = require('../services/category.service');

/**
 * GET /api/categories/tree/:type
 * Get hierarchical tree of categories
 */
exports.getCategoryTree = async (req, res) => {
  try {
    const { type } = req.params;
    const tree = await categoryService.getTree(type.toUpperCase());
    
    res.status(200).json({
      success: true,
      data: tree
    });
  } catch (err) {
    console.error('Error fetching category tree:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

/**
 * GET /api/categories/all/:type
 * Get flat list of all categories of a type
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { type } = req.params;
    const categories = await categoryService.getAll(type.toUpperCase());
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (err) {
    console.error('Error fetching flat categories:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

/**
 * POST /api/categories
 * Create a new category
 */
exports.createCategory = async (req, res) => {
  try {
    const category = await categoryService.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * PUT /api/categories/:id
 * Update an existing category
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryService.update(id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * DELETE /api/categories/:id
 * Delete a category
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryService.remove(id);
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
