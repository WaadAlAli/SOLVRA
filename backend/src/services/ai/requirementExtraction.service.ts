import { hfClient } from './ai.client.js'
import { requirementExtractionSchema } from '../../validators/ai.validator.js'

const MODEL = 'openai/gpt-oss-120b'

interface RequirementExtractionInput {
  description: string
  propertyType: string
  monthlyElectricityBill: number | null
  averageMonthlyConsumption: number | null
  location: string
  roofType: string | null
  ownership: string | null
  budget: number | null
  currency: string | null
  priority: string | null
  timeline: string | null
}

export async function extractRequirements(input: RequirementExtractionInput) {
  const {
    description,
    propertyType,
    monthlyElectricityBill,
    averageMonthlyConsumption,
    location,
    roofType,
    ownership,
    budget,
    currency,
    priority,
    timeline,
  } = input

  const prompt = `
You are SOLVRA's AI requirement interpretation engine.

SOLVRA is a solar procurement platform.

Your job is to interpret the buyer's natural-language project
description and identify ONLY useful solar-related information
that is NOT already represented by the structured request fields.

IMPORTANT RESPONSIBILITY BOUNDARY:

The structured request fields below are already collected directly
from the buyer and should be treated as authoritative.

Do NOT duplicate those fields in your interpretation.

Do NOT design a solar system.

Do NOT calculate system size.

Do NOT recommend solar panels, batteries, inverters, or suppliers.

Do NOT evaluate suppliers.

Do NOT rank proposals.

Do NOT make purchasing decisions.

Your role is ONLY to extract additional factual requirements
from the buyer's free-text description.

STRUCTURED REQUEST DATA ALREADY KNOWN:

Property type:
${propertyType}

Monthly electricity bill:
${monthlyElectricityBill ?? 'Not provided'}

Average monthly consumption:
${averageMonthlyConsumption ?? 'Not provided'}

Location:
${location}

Roof type:
${roofType ?? 'Not provided'}

Property ownership:
${ownership ?? 'Not provided'}

Budget:
${budget ?? 'Not provided'} ${currency ?? ''}

Priority:
${priority ?? 'Not provided'}

Target timeline:
${timeline ?? 'Not provided'}

BUYER'S FREE-TEXT DESCRIPTION:

${description}

EXTRACTION RULES:

1. Extract only factual information explicitly stated or clearly
   expressed in the buyer's description.

2. Never invent, estimate, or assume information.

3. The structured request fields are authoritative.

4. Do not repeat information that is already represented by
   the structured request fields unless the description provides
   an important additional detail.

5. Focus on additional buyer-level requirements such as:
   - number of occupants or users
   - number of AC units
   - specific appliances
   - appliance usage
   - daily or seasonal usage patterns
   - backup power requirements
   - current electricity problems
   - project goals
   - buyer preferences
   - operational requirements

6. applianceLoad must be null when the buyer does not identify
   specific appliances.

7. Never use values such as "unspecified", "unknown", or
   "not mentioned" inside applianceLoad.

8. missingInformation should contain only important buyer-level
   information that could improve understanding of the project.

9. Do NOT request technical system-design information such as:
   - solar panel size
   - inverter size
   - battery capacity
   - battery chemistry
   - panel configuration
   - technical system architecture

   These are supplier/system-design concerns and should not be
   treated as missing buyer requirements.

10. If the description provides no useful additional solar
    requirements, set hasRelevantAdditionalInfo to false.

11. An irrelevant or vague description does NOT make the request
    invalid.

12. If the description is unrelated to solar procurement,
    return null/empty additional requirements.

13. If information is already captured by structured fields,
    do not report it as a new missing requirement.

14. conflicts should contain only genuine contradictions:
    - inside the buyer's description, or
    - between the description and structured request fields.

15. extractionConfidence must be between 0 and 1.

16. Keep extracted information concise and factual.

17. Return ONLY valid JSON.

Return exactly this structure:

{
  "hasRelevantAdditionalInfo": boolean,
  "relevanceReason": string,
  "occupantsOrUsers": number | null,
  "acUnitsCount": number | null,
  "applianceLoad": object | null,
  "usagePattern": object | null,
  "backupRequired": boolean,
  "currentElectricitySituation": string | null,
  "goals": string[],
  "preferences": string | null,
  "extractionConfidence": number,
  "missingInformation": string[],
  "conflicts": string[]
}
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
    max_tokens: 1200,
  })

  const content = response?.choices?.[0]?.message?.content

  if (!content?.trim()) {
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
  } catch {
    throw new Error('AI returned invalid JSON')
  }

  const validation = requirementExtractionSchema.safeParse(parsed)

  if (!validation.success) {
    throw new Error('AI returned an invalid requirement structure')
  }

  return validation.data
}
