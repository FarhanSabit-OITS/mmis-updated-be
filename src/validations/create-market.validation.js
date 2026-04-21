const {z} = require('zod')

const createMarketSchema = z.object({
  name: z.string().min(1).max(200),

  cityId: z.string().uuid(),

  address: z.string().min(1).max(500),

  marketType: z.enum(['PERMANENT', 'TEMPORARY']).default('PERMANENT'),

  description: z.string().max(5000).optional(),

  website: z.string().url().optional(),

  status: z.string().default('ACTIVE'),

  openingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format HH:mm')
    .default('06:00'),

  closingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format HH:mm')
    .default('20:00'),

  operatingDays: z
    .array(
      z.enum([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY',
      ])
    )
    .min(1),

  is24Hours: z.boolean().default(false),

  totalLevels: z.number().int().min(1).default(1),

  totalSections: z.number().int().min(0).default(0),
});

module.exports = {
    createMarketSchema
}
const updateMarketSchema = z.object({
  name: z.string().min(1).max(200).optional(),

  cityId: z.string().uuid().optional(),

  address: z.string().min(1).max(500).optional(),

  marketType: z.enum(['PERMANENT', 'TEMPORARY']).optional(),

  description: z.string().max(5000).optional(),

  website: z.string().url().optional(),

  status: z.string().optional(),

  openingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format HH:mm')
    .optional(),

  closingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format HH:mm')
    .optional(),

  operatingDays: z
    .array(
      z.enum([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY',
      ])
    )
    .optional(),

  is24Hours: z.boolean().optional(),

  totalLevels: z.number().int().min(1).optional(),

  totalSections: z.number().int().min(0).optional(),
});

module.exports = {
    createMarketSchema,
    updateMarketSchema
};
