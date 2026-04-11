const { z } = require('zod');

exports.createStaffSchema = z.object({
  body: z.object({
    email: z.string().email(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phoneNumber: z.string().optional(),
    role: z.enum(['ADMIN', 'SUPER_ADMIN', 'MARKET_MASTER', 'GATE_COUNTER', 'STOCK_COUNTER', 'TAX_OFFICER', 'SECURITY', 'MAINTENANCE', 'SUPPORT', 'AUDITOR']),
    marketId: z.string().uuid('Invalid Market ID'),
    assignedSection: z.string().optional()
  })
});

exports.updateStaffSchema = z.object({
  body: z.object({
    role: z.enum(['ADMIN', 'SUPER_ADMIN', 'MARKET_MASTER', 'GATE_COUNTER', 'STOCK_COUNTER', 'TAX_OFFICER', 'SECURITY', 'MAINTENANCE', 'SUPPORT', 'AUDITOR']).optional(),
    assignedSection: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    marketId: z.string().uuid('Invalid Market ID').optional()
  })
});
