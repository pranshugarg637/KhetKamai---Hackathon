export type Grade = 'A' | 'B' | 'C'
export type Status = 'Open' | 'Matched' | 'PickedUp' | 'Paid'
export type ResidueType = 'paddy' | 'wheat'
export type Lang = 'en' | 'hi'

export interface Village { name: string; lat: number; lng: number }
export interface Farmer { id: string; name: string; village: string; acres: number; lat: number; lng: number; upi: string; phone: string }
export interface Buyer { id: string; name: string; short: string; kind: string; lat: number; lng: number }
export interface Agent { id: string; name: string; age: number; village: string; phone: string; earningsToday: number; pickupsDone: number }
export interface GradeDetails {
  type: ResidueType
  grade: Grade
  dryness: number
  mould: 'none' | 'low' | 'high'
  dirt: 'low' | 'medium' | 'high'
  confidence: number
  source: 'sample' | 'photo'
}
export interface Listing {
  id: string
  farmerId: string
  residue: ResidueType
  grade: Grade
  tonnes: number
  status: Status
  createdAt: number
  details?: GradeDetails
  acceptedOfferId?: string
  agentId?: string
  pickupDate?: number
  weighedTonnes?: number
  paidAmount?: number
  txnId?: string
  paidAt?: number
}
export interface Offer { id: string; listingId: string; buyerId: string; price: number; createdAt: number }
export type EventType = 'photo' | 'grade' | 'listing' | 'offer' | 'accept' | 'pickup' | 'payment' | 'info'
export interface ActivityEvent { id: string; type: EventType; text: string; time: number }
export type MsgKind = 'text' | 'image' | 'sample' | 'voice' | 'analysing' | 'grade' | 'price' | 'pickup' | 'payment'
export interface ChatMsg {
  id: string
  from: 'bot' | 'farmer'
  kind: MsgKind
  key?: string
  params?: Record<string, string | number>
  text?: string
  image?: string
  sampleId?: string
  listingId?: string
  details?: GradeDetails
  time: number
}
export type Stage = 'start' | 'awaitPhoto' | 'awaitAcres' | 'grading' | 'priced' | 'accepted' | 'paid'
export interface ChatState {
  stage: Stage
  acres: number | null
  photo: { sampleId?: string; image?: string } | null
  listingId: string | null
  messages: ChatMsg[]
}
export interface Impact {
  tonnes: number
  farmersPaid: number
  rupees: number
  payments: number
  upiPayments: number
  jobs: number
  villageTonnes: Record<string, number>
}
export interface Settings { mandiRate: number; lang: Lang; activeBuyerId: string }

export const VILLAGES: Village[] = [
  { name: 'Kaithal', lat: 29.8, lng: 76.4 },
  { name: 'Pundri', lat: 29.76, lng: 76.56 },
  { name: 'Cheeka', lat: 30.05, lng: 76.34 },
  { name: 'Kalayat', lat: 29.68, lng: 76.26 },
  { name: 'Rajound', lat: 29.62, lng: 76.43 },
  { name: 'Siwan', lat: 29.89, lng: 76.27 },
  { name: 'Dhand', lat: 29.86, lng: 76.61 },
]
export const vill = (n: string) => VILLAGES.find((v) => v.name === n) ?? VILLAGES[0]

export const LIVE_FARMER_ID = 'f1'
export const LIVE_AGENT_ID = 'a1'

function farmer(id: string, name: string, village: string, acres: number, dLat: number, dLng: number, upi: string, phone: string): Farmer {
  const v = vill(village)
  return { id, name, village, acres, lat: v.lat + dLat, lng: v.lng + dLng, upi, phone }
}

const det = (type: ResidueType, grade: Grade, dryness: number, mould: GradeDetails['mould'], dirt: GradeDetails['dirt'], confidence: number): GradeDetails => ({
  type, grade, dryness, mould, dirt, confidence, source: 'photo',
})

export function makeSeed() {
  const now = Date.now()
  const H = 3600_000
  const D = 24 * H
  const M = 60_000

  const farmers: Farmer[] = [
    farmer('f1', 'Rajbir Singh', 'Kaithal', 2, 0.012, -0.01, 'rajbir@upi', '+91 94160 23781'),
    farmer('f2', 'Gurmeet Kaur', 'Cheeka', 4, -0.01, 0.015, 'gurmeet.kaur@upi', '+91 98960 11245'),
    farmer('f3', 'Sukhwinder Singh', 'Pundri', 6, 0.014, 0.01, 'sukhwinder@upi', '+91 99910 54302'),
    farmer('f4', 'Ramesh Kumar', 'Kalayat', 3, -0.012, 0.012, 'ramesh.k@upi', '+91 94661 78120'),
    farmer('f5', 'Jagdeep Malik', 'Rajound', 5, 0.01, -0.014, 'jagdeep@upi', '+91 98121 36654'),
    farmer('f6', 'Baljit Singh', 'Siwan', 8, -0.008, 0.01, 'baljit@upi', '+91 97290 44017'),
    farmer('f7', 'Naresh Sharma', 'Dhand', 3, 0.01, 0.008, 'naresh.s@upi', '+91 94163 90271'),
    farmer('f8', 'Harpreet Kaur', 'Cheeka', 2.5, 0.016, -0.012, 'harpreet@upi', '+91 98132 67490'),
  ]

  const buyers: Buyer[] = [
    { id: 'b1', name: 'Kaithal Bio-CNG Plant', short: 'Kaithal Bio-CNG', kind: 'Biogas', lat: 29.825, lng: 76.375 },
    { id: 'b2', name: 'Haryana Agro Paper Mill', short: 'Haryana Agro Paper', kind: 'Paper mill', lat: 29.78, lng: 76.45 },
    { id: 'b3', name: 'GreenCap Mushroom Farm', short: 'GreenCap Mushroom', kind: 'Mushroom', lat: 29.745, lng: 76.53 },
    { id: 'b4', name: 'Desi Gau Cattle Feed', short: 'Desi Gau Feed', kind: 'Cattle feed', lat: 30.03, lng: 76.36 },
  ]

  const agents: Agent[] = [
    { id: 'a1', name: 'Aman', age: 22, village: 'Pundri', phone: '+91 98120 45671', earningsToday: 450, pickupsDone: 3 },
    { id: 'a2', name: 'Vikas', age: 24, village: 'Cheeka', phone: '+91 99960 21834', earningsToday: 300, pickupsDone: 2 },
    { id: 'a3', name: 'Sunny', age: 21, village: 'Kalayat', phone: '+91 97284 66019', earningsToday: 600, pickupsDone: 4 },
  ]

  const listings: Listing[] = [
    { id: 'l1', farmerId: 'f2', residue: 'paddy', grade: 'A', tonnes: 10, status: 'Open', createdAt: now - 2 * H, details: det('paddy', 'A', 91, 'none', 'low', 93) },
    { id: 'l2', farmerId: 'f3', residue: 'paddy', grade: 'B', tonnes: 15, status: 'Matched', createdAt: now - 20 * H, details: det('paddy', 'B', 79, 'low', 'medium', 88), acceptedOfferId: 'o3', agentId: 'a1', pickupDate: now + 2 * H },
    { id: 'l3', farmerId: 'f4', residue: 'wheat', grade: 'B', tonnes: 7.5, status: 'Open', createdAt: now - 5 * H, details: det('wheat', 'B', 84, 'low', 'low', 90) },
    { id: 'l4', farmerId: 'f5', residue: 'paddy', grade: 'A', tonnes: 12.5, status: 'Matched', createdAt: now - 26 * H, details: det('paddy', 'A', 90, 'none', 'low', 94), acceptedOfferId: 'o5', agentId: 'a1', pickupDate: now + 4 * H },
    { id: 'l5', farmerId: 'f6', residue: 'paddy', grade: 'C', tonnes: 20, status: 'Paid', createdAt: now - 3 * D, details: det('paddy', 'C', 58, 'high', 'medium', 86), acceptedOfferId: 'o6', agentId: 'a3', weighedTonnes: 19.6, paidAmount: 17318, txnId: '428917305512', paidAt: now - 1 * D },
    { id: 'l6', farmerId: 'f7', residue: 'paddy', grade: 'A', tonnes: 7.5, status: 'PickedUp', createdAt: now - 30 * H, details: det('paddy', 'A', 92, 'none', 'low', 95), acceptedOfferId: 'o7', agentId: 'a2', weighedTonnes: 7.7 },
    { id: 'l7', farmerId: 'f1', residue: 'wheat', grade: 'B', tonnes: 5, status: 'Paid', createdAt: now - 180 * D, details: det('wheat', 'B', 85, 'low', 'low', 89), acceptedOfferId: 'o8', agentId: 'a1', weighedTonnes: 5, paidAmount: 5687, txnId: '410298374651', paidAt: now - 178 * D },
    { id: 'l8', farmerId: 'f8', residue: 'paddy', grade: 'A', tonnes: 6.25, status: 'Open', createdAt: now - 40 * M, details: det('paddy', 'A', 89, 'none', 'low', 91) },
  ]

  const offers: Offer[] = [
    { id: 'o1', listingId: 'l1', buyerId: 'b1', price: 1450, createdAt: now - 100 * M },
    { id: 'o2', listingId: 'l1', buyerId: 'b4', price: 1390, createdAt: now - 80 * M },
    { id: 'o3', listingId: 'l2', buyerId: 'b2', price: 1230, createdAt: now - 19 * H },
    { id: 'o4', listingId: 'l3', buyerId: 'b4', price: 1210, createdAt: now - 4 * H },
    { id: 'o5', listingId: 'l4', buyerId: 'b1', price: 1460, createdAt: now - 25 * H },
    { id: 'o6', listingId: 'l5', buyerId: 'b2', price: 940, createdAt: now - 3 * D },
    { id: 'o7', listingId: 'l6', buyerId: 'b3', price: 1440, createdAt: now - 29 * H },
    { id: 'o8', listingId: 'l7', buyerId: 'b4', price: 1210, createdAt: now - 179 * D },
    { id: 'o9', listingId: 'l8', buyerId: 'b3', price: 1420, createdAt: now - 25 * M },
  ]

  const events: ActivityEvent[] = [
    { id: 'e1', type: 'payment', text: '₹17,318 paid via UPI to Baljit Singh · Siwan', time: now - 1 * D },
    { id: 'e2', type: 'pickup', text: 'Sunny picked up 19.6 t · Siwan', time: now - 1 * D - 20 * M },
    { id: 'e3', type: 'accept', text: 'Sukhwinder accepted ₹1,230/t from Haryana Agro Paper', time: now - 19 * H },
    { id: 'e4', type: 'pickup', text: 'Vikas picked up 7.7 t · Dhand', time: now - 6 * H },
    { id: 'e5', type: 'listing', text: 'New listing: 7.5 t wheat straw · Kalayat', time: now - 5 * H },
    { id: 'e6', type: 'offer', text: 'Desi Gau Feed offered ₹1,210/t to Ramesh', time: now - 4 * H },
    { id: 'e7', type: 'listing', text: 'New listing: 10 t paddy straw (Grade A) · Cheeka', time: now - 2 * H },
    { id: 'e8', type: 'offer', text: 'Kaithal Bio-CNG offered ₹1,450/t to Gurmeet', time: now - 100 * M },
    { id: 'e9', type: 'listing', text: 'New listing: 6.25 t paddy straw (Grade A) · Cheeka', time: now - 40 * M },
    { id: 'e10', type: 'offer', text: 'GreenCap Mushroom offered ₹1,420/t to Harpreet', time: now - 25 * M },
  ].reverse() as ActivityEvent[]

  const impact: Impact = {
    tonnes: 38,
    farmersPaid: 12,
    rupees: 49800,
    payments: 14,
    upiPayments: 13,
    jobs: 7,
    villageTonnes: { Kaithal: 2, Pundri: 8, Cheeka: 7, Kalayat: 5, Rajound: 3, Siwan: 12, Dhand: 1 },
  }

  const days = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed']
  const offersTrend = [1250, 1270, 1290, 1300, 1340, 1390, 1440]
  const priceTrend = days.map((day, i) => ({ day, offer: offersTrend[i], mandi: 1200 }))

  const chat: ChatState = {
    stage: 'start',
    acres: null,
    photo: null,
    listingId: null,
    messages: [{ id: 'm0', from: 'bot', kind: 'text', key: 'greet', time: now }],
  }

  const settings: Settings = { mandiRate: 1200, lang: 'hi', activeBuyerId: 'b1' }

  return { farmers, buyers, agents, listings, offers, events, impact, priceTrend, chat, settings }
}

export type SeedData = ReturnType<typeof makeSeed>
