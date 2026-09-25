export type RequestStep =
  | 'PROJECT'
  | 'ENERGY'
  | 'SITE'
  | 'PREFERENCES'
  | 'REVIEW'
  | 'SUBMIT'

export type PropertyType =
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'INSTITUTIONAL'

export type Currency = 'USD' | 'LBP'

export type RoofType =
  | 'FLAT'
  | 'SLOPED'
  | 'GROUND'
  | 'UNKNOWN'

export type PropertyOwnership =
  | 'OWNED'
  | 'RENTED'
  | 'OTHER'

export type RequestPriority =
  | 'LOWEST_PRICE'
  | 'BALANCED'
  | 'QUALITY'
  | 'RELIABILITY'

export type TargetTimeline =
  | 'ASAP'
  | 'ONE_TO_THREE_MONTHS'
  | 'THREE_TO_SIX_MONTHS'
  | 'SIX_TO_TWELVE_MONTHS'
  | 'FLEXIBLE'

export interface SolarRequestForm {
  projectTitle: string
  projectDescription: string
  propertyType: PropertyType | ''
  monthlyElectricityBill: string
  currency: Currency | ''
  averageMonthlyConsumption: string
  location: string
  roofType: RoofType | ''
  ownership: PropertyOwnership | ''
  budgetMin: string
  budgetMax: string
  priority: RequestPriority | ''
  targetTimeline: TargetTimeline | ''
}