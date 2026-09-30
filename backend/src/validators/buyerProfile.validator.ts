import { z } from 'zod'

export const updateBuyerProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(150).optional(),

  buyerType: z.enum(['INDIVIDUAL', 'BUSINESS', 'INSTITUTION']).optional(),

  location: z.string().trim().min(2).max(200).optional(),

  phone: z.string().trim().max(30).nullable().optional(),
})
