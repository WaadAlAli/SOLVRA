import { hfClient } from './ai.client.js'
import { insightsAnalysisSchema } from '../../validators/ai.validator.js'

interface InsightPromptRequest {
  id: string
  title: string
  status: string
  location: string
  propertyType: string
  rawDescription: string
  budget: number | null
  currency: string | null
  monthlyElectricityBill: number | null
  averageMonthlyConsumption: number | null
  roofType: string | null
  ownership: string | null
  priority: string | null
  timeline: string | null
  requirementProfile: {
    confirmedByBuyer: boolean
    occupantsOrUsers: number | null
    acUnitsCount: number | null
    applianceLoad: Record<string, unknown> | null
    usagePattern: Record<string, unknown> | null
    backupRequired: boolean
    currentElectricitySituation: string | null
    goals: string[]
    preferences: string | null
    extractionConfidence: number | null
  } | null
}

interface InsightPromptBid {
  id: string
  status: string
  supplier: {
    companyName: string
  }
  latestVersion: {
    totalPrice: number | null
    currency?: string | null
    panelCapacityKw: number | null
    batteryCapacityKwh: number | null
    batteryType: string | null
    inverterSpec: string | null
    warrantyYears: number | null
    deliveryTimeDays: number | null
    paymentTerms: string | null
    changeSummary: string | null
    equipmentDetails: Record<string, unknown> | null
  } | null
}

export interface InsightPromptInput {
  request: InsightPromptRequest
  bids: InsightPromptBid[]
}

const MODEL = 'openai/gpt-oss-120b'

export async function analyzeRequestInsights(
  input: InsightPromptInput,
) {
  const { request, bids } = input

  const normalizedBids = bids.map((bid) => ({
    id: bid.id,
    supplierName: bid.supplier.companyName,
    status: bid.status,
    totalPrice: bid.latestVersion?.totalPrice ?? null,
    currency: bid.latestVersion?.currency ?? request.currency ?? null,
    systemCapacity: bid.latestVersion?.panelCapacityKw ?? null,
    batteryStorage: bid.latestVersion?.batteryCapacityKwh ?? null,
    inverter: bid.latestVersion?.inverterSpec ?? null,
    warrantyYears: bid.latestVersion?.warrantyYears ?? null,
    estimatedProduction: (() => {
      const equipment = bid.latestVersion?.equipmentDetails ?? {}
      const possible = [
        equipment.estimatedAnnualProduction,
        equipment.annualProduction,
        equipment.estimatedProduction,
        equipment.annualProductionKwh,
        equipment.productionKwh,
      ]

      const value = possible.find(
        (entry) =>
          entry !== null &&
          entry !== undefined &&
          entry !== '',
      )

      return value === undefined ? null : Number(value)
    })(),
    installationTimelineDays: bid.latestVersion?.deliveryTimeDays ?? null,
    paymentTerms: bid.latestVersion?.paymentTerms ?? null,
    supplierNotes: bid.latestVersion?.changeSummary ?? null,
    missingInformation: [
      bid.latestVersion?.totalPrice == null ? 'total price' : null,
      bid.latestVersion?.panelCapacityKw == null ? 'system capacity' : null,
      bid.latestVersion?.batteryCapacityKwh == null ? 'battery storage' : null,
      !bid.latestVersion?.inverterSpec ? 'inverter' : null,
      bid.latestVersion?.warrantyYears == null ? 'warranty' : null,
      bid.latestVersion?.deliveryTimeDays == null ? 'installation timeline' : null,
      !bid.latestVersion?.paymentTerms ? 'payment terms' : null,
      !bid.latestVersion?.changeSummary ? 'supplier notes' : null,
    ].filter(Boolean),
  }))

  const prompt = `
You are SOLVRA's buyer insight interpreter.

Your role is to explain how supplier proposals differ for a solar request.
You are not allowed to choose a supplier, declare a winner, rank bids,
award a supplier, or modify the request or bids.

Important rules:
1. Only interpret the provided request and bid data.
2. Do not invent values.
3. If a field is missing, label it as missing information instead of guessing.
4. Explain differences in plain language for a buyer.
5. Never provide a final supplier selection or ranking.
6. Keep the output valid JSON only.
7. Focus on differences, assumptions, missing information, risks, and buyer considerations.

REQUEST CONTEXT:
${JSON.stringify(
  {
    id: request.id,
    title: request.title,
    status: request.status,
    location: request.location,
    propertyType: request.propertyType,
    rawDescription: request.rawDescription,
    budget: request.budget,
    currency: request.currency,
    monthlyElectricityBill: request.monthlyElectricityBill,
    averageMonthlyConsumption: request.averageMonthlyConsumption,
    roofType: request.roofType,
    ownership: request.ownership,
    priority: request.priority,
    timeline: request.timeline,
    requirementProfile: request.requirementProfile,
  },
  null,
  2,
)}

PROPOSALS:
${JSON.stringify(normalizedBids, null, 2)}

Return only valid JSON with exactly this structure:
{
  "summary": "string",
  "keyDifferences": [
    {
      "bidId": "string|null",
      "supplierName": "string|null",
      "insight": "string"
    }
  ],
  "missingInformation": [
    {
      "bidId": "string|null",
      "supplierName": "string|null",
      "item": "string",
      "detail": "string"
    }
  ],
  "conflicts": [
    {
      "bidId": "string|null",
      "supplierName": "string|null",
      "issue": "string"
    }
  ],
  "considerations": [
    {
      "bidId": "string|null",
      "supplierName": "string|null",
      "item": "string",
      "detail": "string"
    }
  ],
  "requiresConfirmation": true
}

The summary should explain the request and the most important proposal differences without selecting a winner.
The keyDifferences should highlight a few meaningful contrasts between bids.
The missingInformation list should note where proposal details are absent or unclear.
The conflicts list should include mismatched assumptions or unresolved requirements.
The considerations list should highlight what the buyer should review before making a decision.

Keep the response concise. Use at most:
- 3 keyDifferences
- 5 missingInformation items
- 3 conflicts
- 4 considerations

Each insight/detail/issue should be no more than 2 short sentences.

Return the COMPLETE JSON object. Never stop in the middle of a JSON string or object.
`

  const response = await hfClient.chatCompletion({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0,
    max_tokens: 2500,
  })

  const content = response.choices[0]?.message?.content

  if (!content) {
    throw new Error('AI returned an empty response')
  }

  let parsed: unknown

  try {
    const cleanedContent = content
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    parsed = JSON.parse(cleanedContent)
  } catch (error) {
    console.error('AI insight JSON parsing error:', error)
    console.error('AI response content:', content)

    throw new Error('AI returned invalid JSON')
  }

  const validation = insightsAnalysisSchema.safeParse(parsed)

  if (!validation.success) {
    console.error('AI insight validation error:', validation.error.flatten())
    console.error('Parsed AI response:', parsed)

    throw new Error('AI returned an invalid insight structure')
  }

  return validation.data
}
