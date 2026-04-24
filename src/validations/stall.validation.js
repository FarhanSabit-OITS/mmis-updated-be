const { z } = require("zod");

const getStallsQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val) || 1),
  limit:  z.string().optional().transform((val) => parseInt(val) || 10),
  search: z.string().optional(),
  marketId: z.string().optional(),
  shopId: z.string().optional(),
  vendorId: z.string().optional(),
  status: z.string().optional(),
  occupationStatus: z.string().optional(),
  stallType: z.string().optional(),
});

const createStallSchema = z.object({
  body: z.object({
    marketId: z.string().uuid("Invalid Market ID"),
    vendorId: z.string().uuid("Invalid Vendor ID").optional().nullable(),
    shopId: z.string().uuid("Invalid Shop ID").optional().nullable(),
    levelId: z.string().uuid("Invalid Level ID").optional().nullable(),
    sectionId: z.string().uuid("Invalid Section ID").optional().nullable(),
    aisleId: z.string().uuid("Invalid Aisle ID").optional().nullable(),
    
    stallNumber: z.string().min(1, "Stall number is required"),
    stallName: z.string().optional().nullable(),
    
    stallType: z.enum(["PERMANENT", "TEMPORARY", "SEASONAL", "POP_UP", "KIOSK"]).optional(),
    
    // Status
    status: z.string().optional(),
    occupationStatus: z.string().optional(),
    
    // Config
    isRentable: z.boolean().optional(),
    monthlyRent: z.number().min(0).optional().nullable(),
    
    marketMasterId: z.string().uuid("Invalid Market Master ID").optional().nullable()
  }),
});

const updateStallSchema = z.object({
  body: createStallSchema.shape.body.partial()
});

module.exports = { 
  getStallsQuerySchema,
  createStallSchema,
  updateStallSchema
};
