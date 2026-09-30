import { z } from 'zod'

export const requirementExtractionSchema = z.object({
  hasRelevantAdditionalInfo: z.boolean(),

  relevanceReason: z.string().trim().min(1).max(300),

  occupantsOrUsers: z.number().int().nonnegative().nullable(),

  acUnitsCount: z.number().int().nonnegative().nullable(),

  applianceLoad: z.record(z.string(), z.unknown()).nullable(),

  usagePattern: z.record(z.string(), z.unknown()).nullable(),

  backupRequired: z.boolean(),

  currentElectricitySituation: z.string().trim().max(500).nullable(),

  goals: z.array(z.string().trim().min(1).max(200)),

  preferences: z.string().trim().max(500).nullable(),

  extractionConfidence: z.number().min(0).max(1),

  missingInformation: z.array(z.string().trim().min(1).max(200)),

  conflicts: z.array(z.string().trim().min(1).max(300)),
})

export type RequirementExtraction = z.infer<typeof requirementExtractionSchema>

export const insightsAnalysisSchema = z.object({
  summary: z.string().trim().min(1).max(2000),

  keyDifferences: z.array(
    z.object({
      bidId: z.string().uuid().nullable(),
      supplierName: z.string().trim().max(200).nullable(),
      insight: z.string().trim().min(1).max(500),
    }),
  ),

  missingInformation: z.array(
    z.object({
      bidId: z.string().uuid().nullable(),
      supplierName: z.string().trim().max(200).nullable(),
      item: z.string().trim().min(1).max(200),
      detail: z.string().trim().min(1).max(500),
    }),
  ),

  conflicts: z.array(
    z.object({
      bidId: z.string().uuid().nullable(),
      supplierName: z.string().trim().max(200).nullable(),
      issue: z.string().trim().min(1).max(500),
    }),
  ),

  considerations: z.array(
    z.object({
      bidId: z.string().uuid().nullable(),
      supplierName: z.string().trim().max(200).nullable(),
      item: z.string().trim().min(1).max(200),
      detail: z.string().trim().min(1).max(500),
    }),
  ),

  requiresConfirmation: z.boolean(),
})

export type InsightsAnalysis = z.infer<typeof insightsAnalysisSchema>
