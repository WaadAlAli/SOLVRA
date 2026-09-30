import { describe, expect, it } from 'vitest'

import {
  calculateCriterionScore,
  calculateTco,
} from '../src/services/evaluation-calculation.js'

const lowerBid = {
  totalPrice: 9000,
  maintenanceCost: 500,
  panelCapacityKw: 6,
  inverterSpec: 'Hybrid inverter',
  equipmentDetails: { panels: 12 },
  warrantyYears: 10,
  deliveryTimeDays: 60,
  paymentTerms: '50% upfront',
}

const higherBid = {
  ...lowerBid,
  totalPrice: 12000,
  maintenanceCost: 1000,
  warrantyYears: 5,
  deliveryTimeDays: 90,
}

describe('evaluation calculations', () => {
  it('includes maintenance cost in total cost of ownership', () => {
    expect(calculateTco(lowerBid)).toBe(9500)
  })

  it('scores lower TCO above higher TCO without changing backend authority', () => {
    expect(
      calculateCriterionScore('PRICE', lowerBid, [lowerBid, higherBid]),
    ).toBe(100)
    expect(
      calculateCriterionScore('PRICE', higherBid, [lowerBid, higherBid]),
    ).toBe(0)
  })

  it('scores technical compliance by the existing three checks', () => {
    expect(
      calculateCriterionScore(
        'TECHNICAL_COMPLIANCE',
        { ...lowerBid, equipmentDetails: null },
        [lowerBid],
      ),
    ).toBeCloseTo(200 / 3)
  })

  it('returns a neutral full score when every bid has the same value', () => {
    expect(
      calculateCriterionScore('WARRANTY', lowerBid, [lowerBid, lowerBid]),
    ).toBe(100)
  })
})
