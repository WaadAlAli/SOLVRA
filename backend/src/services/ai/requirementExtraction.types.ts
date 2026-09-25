export interface RequirementExtractionResult {
  occupantsOrUsers: number | null
  acUnitsCount: number | null
  applianceLoad: Record<string, unknown> | null
  usagePattern: Record<string, unknown> | null
  backupRequired: boolean
  currentElectricitySituation: string | null
  goals: string[]
  preferences: string | null
  extractionConfidence: number
  missingInformation: string[]
  conflicts: string[]
}