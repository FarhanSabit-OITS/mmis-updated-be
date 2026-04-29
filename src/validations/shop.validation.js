const { z } = require("zod");

const getShopsQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val) || 1),
  limit:  z.string().optional().transform((val) => parseInt(val) || 10),
  search: z.string().optional(),
  marketId: z.string().optional(),
  levelId: z.string().optional(),
  sectionId: z.string().optional(),
  status: z.string().optional(),
  occupationStatus: z.string().optional(),
  shopType: z.string().optional(),
  memberId: z.string().optional(),
});

const createShopSchema = z.object({
  body: z.object({
    marketId: z.string().uuid("Invalid Market ID"),
    memberId: z.string().uuid("Invalid Member ID"),
    levelId: z.string().uuid("Invalid Level ID").optional().nullable(),
    sectionId: z.string().uuid("Invalid Section ID").optional().nullable(),
    shopNumber: z.string().min(1, "Shop number is required"),
    displayName: z.string().optional().nullable(),
    shopName: z.string().min(1, "Shop name is required"),
    shopType: z.enum([
      "RETAIL", "WHOLESALE", "SERVICE", "FOOD", "ELECTRONICS", 
      "CLOTHING", "FURNITURE", "JEWELRY", "PHARMACY", "STATIONERY", "OTHER"
    ]).optional(),
    subType: z.string().optional().nullable(),
    categoryTags: z.array(z.string()).optional(),
    locationDescription: z.string().optional().nullable(),
    accessPoints: z.array(z.string()).optional(),
    
    // Utilities & Amenities
    hasElectricity: z.boolean().optional(),
    hasWaterSupply: z.boolean().optional(),
    hasStorage: z.boolean().optional(),
    hasAirConditioning: z.boolean().optional(),
    hasDisplayWindow: z.boolean().optional(),
    hasSecurityShutter: z.boolean().optional(),
    electricityMeterNumber: z.string().optional().nullable(),
    waterMeterNumber: z.string().optional().nullable(),
    internetConnection: z.boolean().optional(),
    
    // Financials
    monthlyRent: z.number().min(0, "Monthly rent must be >= 0"),
    securityDeposit: z.number().optional().nullable(),
    maintenanceFee: z.number().optional().nullable(),
    electricityRate: z.number().optional().nullable(),
    waterRate: z.number().optional().nullable(),
    
    // Contract
    contractStartDate: z.string().datetime("Invalid ISO date string"),
    contractEndDate: z.string().datetime("Invalid ISO date string"),
    paymentDay: z.number().min(1).max(31).optional(),
    gracePeriodDays: z.number().min(0).optional(),
    
    // Status
    status: z.string().optional(),
    occupationStatus: z.string().optional(),
    
    marketMasterId: z.string().uuid("Invalid Market Master ID").optional().nullable()
  }),
});

const updateShopSchema = z.object({
  body: createShopSchema.shape.body.partial()
});

module.exports = { 
  getShopsQuerySchema,
  createShopSchema,
  updateShopSchema
};
