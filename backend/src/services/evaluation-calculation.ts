type EvaluationVersion = {
  totalPrice: unknown
  maintenanceCost: unknown
  panelCapacityKw: unknown
  inverterSpec: unknown
  equipmentDetails: unknown
  warrantyYears: unknown
  deliveryTimeDays: unknown
  paymentTerms: unknown
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) {
    return 100
  }

  return ((value - min) / (max - min)) * 100
}

function inverseNormalize(value: number, min: number, max: number): number {
  if (max === min) {
    return 100
  }

  return ((max - value) / (max - min)) * 100
}

export function calculateTco(version: EvaluationVersion): number {
  const totalPrice = Number(version.totalPrice ?? 0)
  const maintenanceCost = Number(version.maintenanceCost ?? 0)

  return totalPrice + maintenanceCost
}

export function calculateCriterionScore(
  criterion: string,
  version: EvaluationVersion,
  allVersions: EvaluationVersion[],
): number {
  switch (criterion) {
    case 'PRICE': {
      const values = allVersions.map(calculateTco)

      return inverseNormalize(
        calculateTco(version),
        Math.min(...values),
        Math.max(...values),
      )
    }

    case 'TECHNICAL_COMPLIANCE': {
      const checks = [
        Number(version.panelCapacityKw ?? 0) > 0,
        Boolean(version.inverterSpec),
        Boolean(version.equipmentDetails),
      ]

      const passed = checks.filter(Boolean).length

      return (passed / checks.length) * 100
    }

    case 'WARRANTY': {
      const values = allVersions.map((item) => Number(item.warrantyYears ?? 0))

      return normalize(
        Number(version.warrantyYears ?? 0),
        Math.min(...values),
        Math.max(...values),
      )
    }

    case 'DELIVERY': {
      const values = allVersions.map((item) =>
        Number(item.deliveryTimeDays ?? 0),
      )

      return inverseNormalize(
        Number(version.deliveryTimeDays ?? 0),
        Math.min(...values),
        Math.max(...values),
      )
    }

    case 'MAINTENANCE': {
      const values = allVersions.map((item) =>
        Number(item.maintenanceCost ?? 0),
      )

      return inverseNormalize(
        Number(version.maintenanceCost ?? 0),
        Math.min(...values),
        Math.max(...values),
      )
    }

    case 'PAYMENT_TERMS':
      return version.paymentTerms ? 100 : 50

    case 'CUSTOM':
      return 50

    default:
      return 0
  }
}
