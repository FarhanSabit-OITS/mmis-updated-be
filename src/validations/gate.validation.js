const { z } = require("zod");

const getGatesQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val) || 1),
  limit:  z.string().optional().transform((val) => parseInt(val) || 10),
  search: z.string().optional(),
  marketId: z.string().optional(),
  gateType: z.string().optional(),
  status: z.string().optional(),
});

const createGateSchema = z.object({
  body: z.object({
    marketId: z.string().uuid("Invalid Market ID"),
    name: z.string().min(1, "Gate name is required"),
    code: z.string().min(1, "Gate code is required"),
    gateType: z.enum(["MAIN", "PEDESTRIAN", "VEHICLE", "DELIVERY", "EMERGENCY"]).optional(),
    location: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    status: z.string().optional()
  }),
});

const updateGateSchema = z.object({
  body: createGateSchema.shape.body.partial()
});

module.exports = { 
  getGatesQuerySchema,
  createGateSchema,
  updateGateSchema
};
