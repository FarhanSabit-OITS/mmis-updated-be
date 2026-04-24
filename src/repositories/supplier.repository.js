const prisma = require('../shared/prisma');
const { PaginationResponse } = require('../utils');

module.exports = {
  getSupplierList: async ({ page = 1, limit = 10, search, status, supplierType }) => {
    const skip = (page - 1) * limit;
    
    const where = {
      ...(status && { status }),
      ...(supplierType && { supplierType }),
      ...(search && {
        OR: [
          { supplierCode: { contains: search, mode: "insensitive" } },
          { companyName: { contains: search, mode: "insensitive" } },
          { stakeholder: { 
            user: {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } }
              ]
            }
          }}
        ],
      }),
    };

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          stakeholder: { include: { user: { include: { profile: true } } } },
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      suppliers,
      pagination: new PaginationResponse(total, page, Number(limit))
    }
  },
  
  getSupplierDetailsById: async (supplierId) => {
    return await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        stakeholder: { 
          include: { 
            user: { include: { profile: true } },
            documents: true,
          } 
        },
        deliveries: {
          take: 5,
          orderBy: { createdAt: "desc" }
        }
      },
    });
  },

  createSupplier: async (supplierData) => {
    return await prisma.supplier.create({
      data: supplierData,
      include: { stakeholder: true }
    });
  },

  editSupplier: async (supplierId, updateData) => {
    return await prisma.supplier.update({
      where: { id: supplierId },
      data: updateData,
    });
  },

  deleteSupplier: async (supplierId) => {
    return await prisma.supplier.update({
      where: { id: supplierId },
      data: { status: "INACTIVE" }
    });
  }
};
