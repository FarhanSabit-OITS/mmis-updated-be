const { z } = require('zod');

exports.movementSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid Product ID'),
    marketId: z.string().uuid('Invalid Market ID'),
    movementType: z.enum(['INBOUND', 'OUTBOUND', 'STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'TRANSFER', 'SPOILAGE', 'RETURN']),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    source: z.string().optional(),
    destination: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional()
  })
});
