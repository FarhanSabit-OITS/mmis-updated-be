/**
 * Category Service
 * 
 * Universal Category Framework (UCF) Logic
 * Handles hierarchical categorization for Products, Vendors, Shops, and Markets.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

/**
 * Get all categories of a specific type
 * @param {string} type - CategoryType (PRODUCT, VENDOR, etc.)
 * @returns {Promise<Array>} - List of categories
 */
const getAll = async (type) => {
  return await prisma.category.findMany({
    where: { type },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { children: true, assignments: true }
      }
    }
  });
};

/**
 * Get categories as a nested tree
 * @param {string} type - CategoryType
 * @returns {Promise<Array>} - Recursive tree structure
 */
const getTree = async (type) => {
  const allCategories = await prisma.category.findMany({
    where: { type },
    orderBy: { name: 'asc' }
  });

  const buildTree = (parentId = null) => {
    return allCategories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat,
        children: buildTree(cat.id)
      }));
  };

  return buildTree(null);
};

/**
 * Create a new category
 * @param {object} data - Category data
 * @returns {Promise<object>} - Created category
 */
const create = async (data) => {
  const slug = data.slug || slugify(data.name, { lower: true, strict: true });
  
  // Check slug uniqueness
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    throw new Error(`Category with slug '${slug}' already exists.`);
  }

  return await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      type: data.type,
      parentId: data.parentId || null,
      metadata: data.metadata || {}
    }
  });
};

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {object} data - Update data
 * @returns {Promise<object>} - Updated category
 */
const update = async (id, data) => {
  const updateData = { ...data };
  
  if (data.name && !data.slug) {
    updateData.slug = slugify(data.name, { lower: true, strict: true });
  }

  return await prisma.category.update({
    where: { id },
    data: updateData
  });
};

/**
 * Delete a category
 * @param {string} id - Category ID
 * @returns {Promise<object>} - Deleted category
 */
const remove = async (id) => {
  // Check for children
  const childrenCount = await prisma.category.count({
    where: { parentId: id }
  });

  if (childrenCount > 0) {
    throw new Error('Cannot delete category with children. Move or delete children first.');
  }

  // Check for assignments
  const assignmentsCount = await prisma.categoryAssignment.count({
    where: { categoryId: id }
  });

  if (assignmentsCount > 0) {
    throw new Error('Cannot delete category with active assignments.');
  }

  return await prisma.category.delete({
    where: { id }
  });
};

/**
 * Assign an entity to a category
 * @param {string} categoryId 
 * @param {string} entityId 
 * @param {string} entityType 
 * @returns {Promise<object>}
 */
const assignToCategory = async (categoryId, entityId, entityType) => {
  return await prisma.categoryAssignment.upsert({
    where: {
      categoryId_entityId_entityType: {
        categoryId,
        entityId,
        entityType
      }
    },
    update: {},
    create: {
      categoryId,
      entityId,
      entityType
    }
  });
};

module.exports = {
  getAll,
  getTree,
  create,
  update,
  remove,
  assignToCategory
};
