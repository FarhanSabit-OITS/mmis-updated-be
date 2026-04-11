const { z } = require('zod');

exports.createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    category: z.enum(['TECHNICAL', 'BILLING', 'FACILITY', 'DISPUTE', 'GENERAL', 'ONBOARDING', 'COMPLIANCE']),
    marketId: z.string().uuid('Invalid Market ID').optional()
  })
});

exports.updateTicketSchema = z.object({
  body: z.object({
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    category: z.enum(['TECHNICAL', 'BILLING', 'FACILITY', 'DISPUTE', 'GENERAL', 'ONBOARDING', 'COMPLIANCE']).optional(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
    resolution: z.string().optional()
  }),
  params: z.object({
    id: z.string().uuid('Invalid Ticket ID')
  })
});
