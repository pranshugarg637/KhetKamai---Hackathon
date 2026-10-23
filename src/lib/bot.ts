/**
 * The WhatsApp bot "brain" — a small conversation state machine.
 * Round 2 swaps this for a real WhatsApp Business API webhook running the same flow.
 */
import { useStore } from '../store'
import { LIVE_FARMER_ID } from '../data/seed'
import { gradeResidue, parseAcres } from './grading'
import { bestOffer, round1, seedOfferPrices, TONNES_PER_ACRE } from './pricing'
import { wait } from './utils'

const S = () => useStore.getState()
let busy = false

async function botSay(fn: () => void, delay = 900) {
  S().setTyping(true)
  await wait(delay)
  S().setTyping(false)
  fn()
}

const canStartSale = () => ['start', 'awaitPhoto', 'awaitAcres', 'paid'].includes(S().chat.stage)

function freshSaleIfPaid() {
  if (S().chat.stage === 'paid') S().setChat({ listingId: null, photo: null, acres: null })
}

export async function sendPhoto(photo: { sampleId?: string; image?: string }) {
  if (busy || !canStartSale()) return
  freshSaleIfPaid()
  S().addMsg({ from: 'farmer', kind: photo.image ? 'image' : 'sample', image: photo.image, sampleId: photo.sampleId })
  S().setChat({ photo })
  S().addEvent('photo', 'Rajbir uploaded a photo · Kaithal')
  if (S().chat.acres) {
    await runGrading()
  } else {
    busy = true
    await botSay(() => {
      S().addMsg({ from: 'bot', kind: 'text', key: 'askAcres' })
      S().setChat({ stage: 'awaitAcres' })
    })
    busy = false
  }
}

async function applyAcres(n: number) {
  freshSaleIfPaid()
  S().setChat({ acres: n })
  if (S().chat.photo && S().chat.stage === 'awaitAcres') return runGrading()
  busy = true
  await botSay(() => {
    S().addMsg({ from: 'bot', kind: 'text', key: 'gotAcres', params: { acres: n } })
    S().setChat({ stage: 'awaitPhoto' })
  })
  busy = false
}

export async function chooseAcres(n: number) {
  if (busy || !canStartSale()) return
  S().addMsg({ from: 'farmer', kind: 'text', key: n >= 10 ? 'acresTen' : 'acresN', params: { n } })
  await applyAcres(n)
}

export async function sendText(text: string, voice = false) {
  const clean = text.trim()
  if (!clean || busy) return
  S().addMsg({ from: 'farmer', kind: voice ? 'voice' : 'text', text: clean })
  if (!canStartSale()) {
    busy = true
    await botSay(() => S().addMsg({ from: 'bot', kind: 'text', key: 'busySale' }))
    busy = false
    return
  }
  const acres = parseAcres(clean)
  if (acres) return applyAcres(acres)
  busy = true
  await botSay(() => S().addMsg({ from: 'bot', kind: 'text', key: S().chat.stage === 'awaitAcres' ? 'notUnderstood' : 'hint' }))
  busy = false
}

async function runGrading() {
  busy = true
  try {
    const photo = S().chat.photo ?? { sampleId: 'dry' }
    const acres = S().chat.acres ?? 2
    S().setChat({ stage: 'grading' })
    await wait(400)
    const msgId = S().addMsg({ from: 'bot', kind: 'analysing', key: 'analysing' })
    const [details] = await Promise.all([gradeResidue(photo), wait(2000)])
    const tonnes = round1(acres * TONNES_PER_ACRE)
    S().updateMsg(msgId, { kind: 'grade', details, params: { acres, tonnes } })
    S().addEvent('grade', `AI graded Rajbir's parali: Grade ${details.grade}, ${details.confidence}% confidence`)
    const listingId = S().createListing({ farmerId: LIVE_FARMER_ID, residue: details.type, grade: details.grade, tonnes, details })
    await wait(700)
    const [pa, pb] = seedOfferPrices(details.grade, S().settings.mandiRate)
    S().makeOffer(listingId, 'b1', pa)
    S().makeOffer(listingId, 'b2', pb)
    await botSay(() => {
      S().addMsg({ from: 'bot', kind: 'text', key: 'offersIntro' })
      S().addMsg({ from: 'bot', kind: 'price', listingId })
      S().setChat({ stage: 'priced', listingId })
    }, 900)
  } finally {
    busy = false
  }
}

export async function acceptBest() {
  const lid = S().chat.listingId
  if (busy || !lid || S().chat.stage !== 'priced') return
  const best = bestOffer(S().offers, lid)
  if (!best) return
  S().addMsg({ from: 'farmer', kind: 'text', key: 'chipAccept' })
  S().acceptOffer(lid, best.id)
  S().setChat({ stage: 'accepted' })
  busy = true
  await botSay(() => S().addMsg({ from: 'bot', kind: 'pickup', listingId: lid }))
  busy = false
}

export async function waitForOffers() {
  const lid = S().chat.listingId
  if (busy || !lid || S().chat.stage !== 'priced') return
  S().addMsg({ from: 'farmer', kind: 'text', key: 'chipWait' })
  busy = true
  await botSay(() => S().addMsg({ from: 'bot', kind: 'text', key: 'waiting' }))
  busy = false
  // Simulate a competing processor reacting a few seconds later.
  await wait(3200)
  const st = S()
  if (st.chat.stage !== 'priced' || st.chat.listingId !== lid) return
  const best = bestOffer(st.offers, lid)
  st.makeOffer(lid, 'b3', (best?.price ?? 1400) + 50)
}

export async function sellMore() {
  if (busy) return
  S().addMsg({ from: 'farmer', kind: 'text', key: 'chipSellMore' })
  S().setChat({ listingId: null, photo: null, acres: null })
  busy = true
  await botSay(() => {
    S().addMsg({ from: 'bot', kind: 'text', key: 'sellMoreAsk' })
    S().setChat({ stage: 'awaitPhoto' })
  })
  busy = false
}

export async function mySales() {
  if (busy) return
  S().addMsg({ from: 'farmer', kind: 'text', key: 'chipSales' })
  const mine = S().listings.filter((l) => l.farmerId === LIVE_FARMER_ID)
  const paid = mine.filter((l) => l.status === 'Paid')
  const total = paid.reduce((a, l) => a + (l.paidAmount ?? 0), 0)
  const pending = mine.filter((l) => l.status === 'Matched' || l.status === 'PickedUp').length
  busy = true
  await botSay(() =>
    S().addMsg({ from: 'bot', kind: 'text', key: 'mySales', params: { count: paid.length, total: total.toLocaleString('en-IN'), pending } }),
  )
  busy = false
}
