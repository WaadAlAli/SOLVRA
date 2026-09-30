import { z } from 'zod'

export const createRequestSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Project title must be at least 3 characters')
      .max(150),

    propertyType: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INSTITUTIONAL']),

    location: z.string().trim().min(2, 'Location is required').max(200),

    rawDescription: z
      .string()
      .trim()
      .min(10, 'Project description must be at least 10 characters')
      .max(5000),

    currency: z.enum(['USD', 'LBP']).optional(),

    monthlyElectricityBill: z.coerce.number().nonnegative().optional(),

    averageMonthlyConsumption: z.coerce.number().nonnegative().optional(),

    roofType: z.enum(['FLAT', 'SLOPED', 'GROUND', 'UNKNOWN']).optional(),

    ownership: z.enum(['OWNED', 'RENTED', 'OTHER']).optional(),

    budgetMin: z.coerce.number().nonnegative().optional(),

    budgetMax: z.coerce.number().nonnegative().optional(),

    priority: z
      .enum(['LOWEST_PRICE', 'BALANCED', 'QUALITY', 'RELIABILITY'])
      .optional(),

    timeline: z
      .enum([
        'ASAP',
        'ONE_TO_THREE_MONTHS',
        'THREE_TO_SIX_MONTHS',
        'SIX_TO_TWELVE_MONTHS',
        'FLEXIBLE',
      ])
      .optional(),

    status: z.enum(['DRAFT', 'OPEN']).default('DRAFT'),
  })
  .refine(
    (data) =>
      data.budgetMin === undefined ||
      data.budgetMax === undefined ||
      data.budgetMin <= data.budgetMax,
    {
      message: 'Minimum budget cannot exceed maximum budget',
      path: ['budgetMax'],
    },
  )

export const updateRequestSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),

    propertyType: z
      .enum(['RESIDENTIAL', 'COMMERCIAL', 'INSTITUTIONAL'])
      .optional(),

    location: z.string().trim().min(2).max(200).optional(),

    rawDescription: z.string().trim().min(10).max(5000).optional(),

    currency: z.enum(['USD', 'LBP']).optional(),

    monthlyElectricityBill: z.number().nonnegative().optional(),

    averageMonthlyConsumption: z.number().nonnegative().optional(),

    roofType: z.enum(['FLAT', 'SLOPED', 'GROUND', 'UNKNOWN']).optional(),

    ownership: z.enum(['OWNED', 'RENTED', 'OTHER']).optional(),

    budgetMin: z.number().nonnegative().optional(),

    budgetMax: z.number().nonnegative().optional(),

    priority: z
      .enum(['LOWEST_PRICE', 'BALANCED', 'QUALITY', 'RELIABILITY'])
      .optional(),

    timeline: z
      .enum([
        'ASAP',
        'ONE_TO_THREE_MONTHS',
        'THREE_TO_SIX_MONTHS',
        'SIX_TO_TWELVE_MONTHS',
        'FLEXIBLE',
      ])
      .optional(),
  })
  .refine(
    (data) =>
      data.budgetMin === undefined ||
      data.budgetMax === undefined ||
      data.budgetMin <= data.budgetMax,
    {
      message: 'Minimum budget cannot exceed maximum budget',
      path: ['budgetMax'],
    },
  )
