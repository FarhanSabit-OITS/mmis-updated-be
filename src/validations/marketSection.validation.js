const { z } = require("zod");

const createMarketSectionSchema = z.object({
  marketId: z.string().uuid(),
  levelId: z.string().uuid().optional(),

  uniqueCode: z.string().max(50),
  name: z.string().max(100),

  sectionType: z.string(),
  subType: z.string().optional(),

  categoryTags: z.array(z.string()),

  supervisorId: z.string().uuid().optional(),

  createdById: z.string().uuid()
});

const updateMarketSectionSchema = createMarketSectionSchema.partial();

module.exports = {
  createMarketSectionSchema,
  updateMarketSectionSchema
};