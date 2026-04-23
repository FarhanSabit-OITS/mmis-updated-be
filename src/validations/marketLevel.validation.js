const { z } = require("zod");

const createMarketLevelSchema = z.object({
  marketId: z.string().uuid(),
  levelNumber: z.number().int().min(0),
  uniqueCode: z.string().max(50),
  name: z.string().max(100),
  description: z.string().optional(),

  accessType: z.string().optional(),
  hasElevator: z.boolean().optional(),
  hasEscalator: z.boolean().optional(),
  hasRestrooms: z.boolean().optional(),
  hasParking: z.boolean().optional(),

  wheelchairAccess: z.boolean().optional(),
  emergencyExits: z.number().int().optional(),

});

const updateMarketLevelSchema = createMarketLevelSchema.partial();

module.exports = {
  createMarketLevelSchema,
  updateMarketLevelSchema
};