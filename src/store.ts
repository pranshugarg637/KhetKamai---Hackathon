import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  makeSeed, type SeedData, type ChatMsg, type ChatState, type EventType, type GradeDetails, type Grade,
  type ResidueType, LIVE_AGENT_ID,
} from './data/seed'
import { uid, txnId, inr, num } from './lib/utils'
import { COMMISSION, AGENT_FEE, round1 } from './lib/pricing'

export const STORE_KEY = 'khetkamai-demo-v1'

interface Actions {
  setLang: (l: 'en' | 'hi') => void
  setMandiRate: (n: number) => void
  setActiveBuyer: (id: string) => void
  setTyping: (b: boolean) => void
  addMsg: (m: Omit<ChatMsg, 'id' | 'time'>) => string
  updateMsg: (id: string, patch: Partial<ChatMsg>) => void
  setChat: (patch: Partial<ChatState>) => void
  addEvent: (type: EventType, text: string) => void
  createListing: (l: { farmerId: string; residue: ResidueType; grade: Grade; tonnes: number; details: GradeDetails }) => string
  makeOffer: (listingId: string, buyerId: string, price: number) => void
  acceptOffer: (listingId: string, offerId: string) => void
  completePickup: (listingId: string, weighed: number) => { amount: number; txn: string } | null
  reset: () => void
}

export type StoreState = SeedData & { botTyping: boolean } & Actions

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...makeSeed(),
      botTyping: false,

      setLang: (lang) => set((s) => ({ settings: { ...s.settings, lang } })),
      setMandiRate: (mandiRate) => set((s) => ({ settings: { ...s.settings, mandiRate } })),
      setActiveBuyer: (activeBuyerId) => set((s) => ({ settings: { ...s.settings, activeBuyerId } })),
      setTyping: (botTyping) => set({ botTyping }),

      addMsg: (m) => {
        const id = uid('m')
        set((s) => ({ chat: { ...s.chat, messages: [...s.chat.messages, { ...m, id, time: Date.now() }] } }))
        return id
      },
      updateMsg: (id, patch) =>
        set((s) => ({ chat: { ...s.chat, messages: s.chat.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) } })),
      setChat: (patch) => set((s) => ({ chat: { ...s.chat, ...patch } })),

      addEvent: (type, text) => set((s) => ({ events: [{ id: uid('e'), type, text, time: Date.now() }, ...s.events].slice(0, 60) })),

      createListing: (l) => {
        const id = uid('l')
        const farmer = get().farmers.find((f) => f.id === l.farmerId)
        set((s) => ({ listings: [{ id, ...l, status: 'Open', createdAt: Date.now() }, ...s.listings] }))
        get().addEvent('listing', `New listing: ${num(l.tonnes, 1)} t ${l.residue === 'paddy' ? 'paddy' : 'wheat'} straw (Grade ${l.grade}) · ${farmer?.village ?? ''}`)
        return id
      },

      makeOffer: (listingId, buyerId, price) => {
        const s = get()
        const listing = s.listings.find((l) => l.id === listingId)
        const buyer = s.buyers.find((b) => b.id === buyerId)
        const farmer = s.farmers.find((f) => f.id === listing?.farmerId)
        if (!listing || !buyer || listing.status !== 'Open') return
        const existing = s.offers.find((o) => o.listingId === listingId && o.buyerId === buyerId)
        const offers = existing
          ? s.offers.map((o) => (o.id === existing.id ? { ...o, price, createdAt: Date.now() } : o))
          : [...s.offers, { id: uid('o'), listingId, buyerId, price, createdAt: Date.now() }]
        set({ offers })
        get().addEvent('offer', `${buyer.short} offered ${inr(price)}/t to ${farmer?.name.split(' ')[0] ?? 'farmer'}`)
        const chat = get().chat
        if (chat.listingId === listingId && chat.stage === 'priced') {
          get().addMsg({ from: 'bot', kind: 'text', key: 'newOffer', params: { buyer: buyer.short, price: price.toLocaleString('en-IN') } })
          get().addMsg({ from: 'bot', kind: 'price', listingId })
        }
      },

      acceptOffer: (listingId, offerId) => {
        const s = get()
        const offer = s.offers.find((o) => o.id === offerId)
        const listing = s.listings.find((l) => l.id === listingId)
        if (!offer || !listing) return
        const buyer = s.buyers.find((b) => b.id === offer.buyerId)
        const farmer = s.farmers.find((f) => f.id === listing.farmerId)
        set({
          listings: s.listings.map((l) =>
            l.id === listingId
              ? { ...l, status: 'Matched', acceptedOfferId: offerId, agentId: LIVE_AGENT_ID, pickupDate: Date.now() + 2 * 24 * 3600_000 }
              : l,
          ),
        })
        get().addEvent('accept', `${farmer?.name.split(' ')[0]} accepted ${inr(offer.price)}/t from ${buyer?.short}`)
      },

      completePickup: (listingId, weighed) => {
        const s = get()
        const listing = s.listings.find((l) => l.id === listingId)
        if (!listing || listing.status === 'Paid') return null
        const offer = s.offers.find((o) => o.id === listing.acceptedOfferId)
        const farmer = s.farmers.find((f) => f.id === listing.farmerId)
        const agent = s.agents.find((a) => a.id === (listing.agentId ?? LIVE_AGENT_ID))
        const price = offer?.price ?? 1200
        const w = round1(weighed)
        const amount = Math.round(w * price * (1 - COMMISSION))
        const txn = txnId()
        const village = farmer?.village ?? 'Kaithal'
        set({
          listings: s.listings.map((l) =>
            l.id === listingId ? { ...l, status: 'Paid', weighedTonnes: w, paidAmount: amount, txnId: txn, paidAt: Date.now() } : l,
          ),
          agents: s.agents.map((a) => (a.id === agent?.id ? { ...a, earningsToday: a.earningsToday + AGENT_FEE, pickupsDone: a.pickupsDone + 1 } : a)),
          impact: {
            ...s.impact,
            tonnes: round1(s.impact.tonnes + w),
            farmersPaid: s.impact.farmersPaid + 1,
            rupees: s.impact.rupees + amount,
            payments: s.impact.payments + 1,
            upiPayments: s.impact.upiPayments + 1,
            villageTonnes: { ...s.impact.villageTonnes, [village]: round1((s.impact.villageTonnes[village] ?? 0) + w) },
          },
        })
        get().addEvent('pickup', `${agent?.name ?? 'Agent'} picked up ${num(w, 1)} t · ${village}`)
        get().addEvent('payment', `${inr(amount)} paid via UPI to ${farmer?.name ?? 'farmer'}`)
        if (get().chat.listingId === listingId) {
          get().addMsg({ from: 'bot', kind: 'payment', listingId })
          get().setChat({ stage: 'paid' })
        }
        return { amount, txn }
      },

      reset: () => set({ ...makeSeed(), botTyping: false }),
    }),
    {
      name: STORE_KEY,
      version: 1,
      partialize: (s) => {
        const { botTyping, ...rest } = s
        return rest
      },
    },
  ),
)

// Keep two browser tabs (e.g. farmer phone + buyer laptop view) in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORE_KEY) useStore.persist.rehydrate()
  })
}
