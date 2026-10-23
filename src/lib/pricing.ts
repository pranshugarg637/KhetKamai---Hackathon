import type { Grade, Offer } from '../data/seed'

export const GRADE_MULT: Record<Grade, number> = { A: 1, B: 0.85, C: 0.65 }
export const COMMISSION = 0.06
export const CO2_PER_TONNE = 1.46
export const AGENT_FEE = 150
export const TONNES_PER_ACRE = 2.5

export const round10 = (n: number) => Math.round(n / 10) * 10
export const round1 = (n: number) => Math.round(n * 10) / 10

/** Local mandi / benchmark rate for a grade */
export const localRate = (grade: Grade, mandi: number) => round10(mandi * GRADE_MULT[grade])
/** Seeded opening offers (Buyer A, Buyer B) for a grade */
export const seedOfferPrices = (grade: Grade, mandi = 1200) => [
  round10(mandi * (1450 / 1200) * GRADE_MULT[grade]),
  round10(mandi * (1380 / 1200) * GRADE_MULT[grade]),
]
/** Buyer pre-pays estimate + 10% buffer into escrow when the farmer accepts */
export const ESCROW_BUFFER = 0.1
/** Max allowed gap between agent weight and factory weighbridge */
export const WEIGH_TOLERANCE = 0.03
/** Suggested fair price for a buyer's offer dialog */
export const fairPrice = (grade: Grade, mandi: number) => round10(mandi * GRADE_MULT[grade] * 1.15)
export const pctVsLocal = (best: number, local: number) => Math.round(((best - local) / local) * 100)
export const farmerNet = (tonnes: number, price: number) => Math.round(tonnes * price * (1 - COMMISSION))

export const offersFor = (offers: Offer[], listingId: string) =>
  offers.filter((o) => o.listingId === listingId).sort((a, b) => b.price - a.price)
export const bestOffer = (offers: Offer[], listingId: string): Offer | undefined => offersFor(offers, listingId)[0]
