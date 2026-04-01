const { z } = require("zod");

const getShopsQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val) || 1),
  limit: z.string().optional().transform((val) => parseInt(val) || 10),
  search: z.string().optional(),
  marketId: z.string().optional(),
  status: z.string().optional(),
  occupationStatus: z.string().optional(),
  shopType: z.string().optional(),
  memberId: z.string().optional(),
});

module.exports = { getShopsQuerySchema };