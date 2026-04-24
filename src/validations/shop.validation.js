const { z } = require("zod");

const getShopsQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val) || 1),
  limit:  z.string().optional().transform((val) => parseInt(val) || 10),
  search: z.string().optional(),
  marketId: z.string().optional(),
  status: z.string().optional(),
  occupationStatus: z.string().optional(),
  shopType: z.string().optional(),
  memberId: z.string().optional(),
});

const createShopSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required').max(200),
  shopNumber: z.string().min(1, 'Shop number is required').max(20),
  marketId: z.string().min(1, 'Market ID is required'),
  memberId: z.string(), 
  monthlyRent: z.number().positive('Monthly rent must be positive'),
  contractStartDate: z.string().datetime('Invalid contract start date'),
  contractEndDate: z.string().datetime('Invalid contract end date'),
  
  // Optional fields
  displayName: z.string().max(150).optional(),
  levelId: z.string().optional(),
  sectionId: z.string().optional(),
  shopType: z.string().optional(),
  categoryTags: z.array(z.string()).optional(),
  subType: z.string().max(100).optional(),
  locationDescription: z.string().max(500).optional(),
  
  // Features
  hasElectricity: z.boolean().optional(),
  hasWaterSupply: z.boolean().optional(),
  hasStorage: z.boolean().optional(),
  hasAirConditioning: z.boolean().optional(),
  hasDisplayWindow: z.boolean().optional(),
  hasSecurityShutter: z.boolean().optional(),
  internetConnection: z.boolean().optional(),
  
  // Financial details
  securityDeposit: z.number().optional(),
  maintenanceFee: z.number().optional(),
  electricityRate: z.number().optional(),
  waterRate: z.number().optional(),
  
  // Contract terms
  paymentDay: z.number().int().min(1).max(31).optional(),
  gracePeriodDays: z.number().int().min(0).optional(),
});

module.exports = { getShopsQuerySchema, createShopSchema };