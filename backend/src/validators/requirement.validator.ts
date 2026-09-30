import { z } from 'zod'

export const confirmRequirementSchema = z.object({
  occupantsOrUsers: z.number().int().nonnegative().nullable().optional(),

  acUnitsCount: z.number().int().nonnegative().nullable().optional(),

  applianceLoad: z.record(z.string(), z.unknown()).nullable().optional(),

  usagePattern: z.record(z.string(), z.unknown()).nullable().optional(),

  backupRequired: z.boolean().optional(),

  currentElectricitySituation: z.string().trim().max(500).nullable().optional(),

  goals: z.array(z.string().trim().min(1).max(200)).default([]),

  preferences: z.string().trim().max(500).nullable().optional(),

  extractionConfidence: z.number().min(0).max(1).optional(),

  missingInformation: z.array(z.string().trim().min(1).max(200)).default([]),

  conflicts: z.array(z.string().trim().min(1).max(300)).default([]),

  confirmedByBuyer: z.literal(true),
})

export type ConfirmRequirementInput = z.infer<typeof confirmRequirementSchema>
