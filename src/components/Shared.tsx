import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import {
  Camera, CheckCircle2, CircleDollarSign, Droplets, Gavel, Loader2, MapPin, PackageCheck, ScanSearch, ShieldCheck, Sprout, Truck, Upload,
} from 'lucide-react'
import { useStore } from '../store'
import type { EventType, Listing } from '../data/seed'
import { bestOffer, fairPrice, farmerNet, round1 } from '../lib/pricing'
import { cn, fmtTime, inr, km, num, timeAgo } from '../lib/utils'
import { GradePill, IconCircle, Modal, RoundBadge, StatusPill } from './ui'

export const fireConfetti = () => {
  const colors = ['#E3A62F', '#215C3A', '#D5573B', '#8DB580', '#ffffff']
  confetti({ particleCount: 110, spread: 75, origin: { y: 0.65 }, colors, zIndex: 2000 })
  setTimeout(() => confetti({ particleCount: 70, spread: 110, origin: { y: 0.55 }, colors, zIndex: 2000 }), 250)
}

/* ---------------- Offer dialog ---------------- */
export function OfferDialog({ listingId, onClose }: { listingId: string | null; onClose: () => void }) {
  const listing = useStore((s) => s.listings.find((l) => l.id === listingId))
  const farmers = useStore((s) => s.farmers)
  const buyers = useStore((s) => s.buyers)
  const offers = useStore((s) => s.offers)
  const mandi = useStore((s) => s.settings.mandiRate)
  const activeBuyerId = useStore((s) => s.settings.activeBuyerId)
  const makeOffer = useStore((s) => s.makeOffer)
  const [price, setPrice] = useState('')

  const buyer = buyers.find((b) => b.id === activeBuyerId)
  const farmer = farmers.find((f) => f.id === listing?.farmerId)
  const best = listing ? bestOffer(offers, listing.id) : undefined
  const fair = listing ? fairPrice(listing.grade, mandi) : 0

  useEffect(() => {
    if (listing) setPrice(String(Math.max(fair, (best?.price ?? 0) + 50)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId])

  const submit = () => {
    const p = Math.round(Number(price))
    if (!listing || !p || p < 100) return toast.error('Enter a valid price per tonne')
    makeOffer(listing.id, activeBuyerId, p)
    toast.success(`Offer of ${inr(p)}/t sent to ${farmer?.name.split(' ')[0]} on WhatsApp`)
    onClose()
  }

  return (
    <Modal open={!!listing} onClose={onClose} title="Make an offer">
      {listing && (
        <div>
          <div className="flex items-center justify-between rounded-xl bg-cream p-3">
            <div>
              <div className="font-bold">{farmer?.name}</div>
              <div className="text-[13px] text-muted">{farmer?.village} · {num(listing.tonnes, 1)} t {listing.residue === 'paddy' ? 'paddy' : 'wheat'} straw</div>
            </div>
            <GradePill grade={listing.grade} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
            <div className="rounded-xl border border-line p-3">
              <div className="label">Current best</div>
              <div className="mt-1 font-serif text-xl font-bold">{best ? inr(best.price) : '—'}<span className="text-sm font-sans font-normal text-muted">/t</span></div>
            </div>
            <div className="rounded-xl border border-line p-3">
              <div className="label">Suggested fair price</div>
              <div className="mt-1 font-serif text-xl font-bold text-leaf">{inr(fair)}<span className="text-sm font-sans font-normal text-muted">/t</span></div>
            </div>
          </div>
          <label className="mt-4 block">
            <span className="label">Your offer as {buyer?.short} (₹ per tonne)</span>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} className="input mt-1.5 font-bold text-lg" autoFocus />
          </label>
          <div className="mt-2 text-[12.5px] text-muted">
            Farmer would receive about <b className="text-forest">{inr(farmerNet(listing.tonnes, Number(price) || 0))}</b> after the 6% platform fee.
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button onClick={submit} className="btn-primary flex-1"><Gavel size={16} /> Send offer</button>
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ---------------- Rows used by buyer views ---------------- */
export function useListingRows() {
  const listings = useStore((s) => s.listings)
  const farmers = useStore((s) => s.farmers)
  const offers = useStore((s) => s.offers)
  const buyers = useStore((s) => s.buyers)
  const activeBuyerId = useStore((s) => s.settings.activeBuyerId)
  const buyer = buyers.find((b) => b.id === activeBuyerId) ?? buyers[0]
  return useMemo(
    () =>
      [...listings]
        .filter((l) => Date.now() - l.createdAt < 60 * 24 * 3600_000)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((l) => {
          const farmer = farmers.find((f) => f.id === l.farmerId)!
          const best = bestOffer(offers, l.id)
          const accepted = offers.find((o) => o.id === l.acceptedOfferId)
          return {
            l,
            farmer,
            best,
            accepted,
            bestBuyer: buyers.find((b) => b.id === best?.buyerId),
            dist: km(buyer, farmer),
            isNew: l.status === 'Open' && Date.now() - l.createdAt < 3 * 60_000,
            mineBest: best?.buyerId === buyer.id,
          }
        }),
    [listings, farmers, offers, buyers, buyer],
  )
}
export type ListingRow = ReturnType<typeof useListingRows>[number]

/* ---------------- Activity feed ---------------- */
const evIcon: Record<EventType, { icon: any; bg: string }> = {
  photo: { icon: Camera, bg: 'bg-leaf' },
  grade: { icon: ScanSearch, bg: 'bg-mustard' },
  listing: { icon: Sprout, bg: 'bg-sage' },
  offer: { icon: Gavel, bg: 'bg-[#2F7A4D]' },
  accept: { icon: ShieldCheck, bg: 'bg-forest' },
  pickup: { icon: Truck, bg: 'bg-leaf' },
  payment: { icon: CircleDollarSign, bg: 'bg-terracotta' },
  info: { icon: MapPin, bg: 'bg-muted' },
}

export function ActivityFeed({ limit = 30, compact }: { limit?: number; compact?: boolean }) {
  const events = useStore((s) => s.events)
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 30_000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="relative">
      <div className="absolute bottom-2 left-[15px] top-2 w-px bg-line" />
      <AnimatePresence initial={false}>
        {events.slice(0, limit).map((e) => {
          const m = evIcon[e.type]
          return (
            <motion.div key={e.id} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className={cn('relative flex gap-2.5', compact ? 'py-1.5' : 'py-2')}>
              <IconCircle icon={m.icon} bg={m.bg} size={30} />
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="text-[13px] font-semibold leading-snug">{e.text}</div>
                <div className="text-[11px] text-muted">{Date.now() - e.time < 3600_000 ? timeAgo(e.time) : fmtTime(e.time)}</div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

/* ---------------- UPI pickup + payment flow ---------------- */
export function UpiFlow({ listing, onDone, onCancel, dense }: { listing: Listing; onDone?: () => void; onCancel?: () => void; dense?: boolean }) {
  const farmers = useStore((s) => s.farmers)
  const offers = useStore((s) => s.offers)
  const buyers = useStore((s) => s.buyers)
  const completePickup = useStore((s) => s.completePickup)
  const farmer = farmers.find((f) => f.id === listing.farmerId)!
  const offer = offers.find((o) => o.id === listing.acceptedOfferId)
  const buyer = buyers.find((b) => b.id === offer?.buyerId)
  const [step, setStep] = useState<'weigh' | 'processing' | 'success'>('weigh')
  const [weight, setWeight] = useState(String(round1(listing.tonnes * 1.02)))
  const [moistureOk, setMoistureOk] = useState(true)
  const [photo, setPhoto] = useState(false)
  const [result, setResult] = useState<{ amount: number; txn: string } | null>(null)
  const price = offer?.price ?? 1200
  const w = Math.max(0, Number(weight) || 0)
  const amount = farmerNet(w, price)

  const pay = async () => {
    if (w <= 0) return toast.error('Enter the weighed tonnes')
    setStep('processing')
    await new Promise((r) => setTimeout(r, 1500))
    const res = completePickup(listing.id, w)
    setResult(res)
    setStep('success')
    fireConfetti()
    toast.success(`${inr(res?.amount ?? amount)} paid to ${farmer.name} via UPI`)
  }

  if (step === 'processing')
    return (
      <div className={cn('flex flex-col items-center justify-center text-center', dense ? 'py-6' : 'py-14')}>
        <Loader2 size={46} className="animate-spin text-leaf" />
        <div className="mt-4 font-serif text-xl font-semibold text-forest">Paying {inr(amount)}</div>
        <div className="text-[13px] text-muted">to {farmer.upi} · secure UPI</div>
      </div>
    )

  if (step === 'success')
    return (
      <div className={cn('flex flex-col items-center text-center', dense ? 'py-3' : 'py-8')}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }} className="flex h-20 w-20 items-center justify-center rounded-full bg-leaf text-white shadow-lift">
          <CheckCircle2 size={44} />
        </motion.div>
        <div className="mt-4 text-[13px] font-bold uppercase tracking-wider text-leaf">Payment successful</div>
        <div className="font-serif text-[34px] font-bold text-forest">{inr(result?.amount ?? amount)}</div>
        <div className="text-[13px] text-muted">paid to {farmer.name} · {farmer.upi}</div>
        <div className="mt-3 w-full space-y-1.5 rounded-xl bg-cream p-3 text-left text-[13px]">
          <div className="flex justify-between"><span className="text-muted">UPI Ref</span><span className="font-mono font-bold">{result?.txn}</span></div>
          <div className="flex justify-between"><span className="text-muted">Weighed</span><span className="font-bold">{num(w, 1)} t × {inr(price)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Agent fee earned</span><span className="font-bold text-leaf">+ ₹150</span></div>
        </div>
        <RoundBadge className="mt-3">Live UPI gateway — Round 3</RoundBadge>
        {onDone && <button onClick={onDone} className="btn-primary mt-4 w-full">Done</button>}
      </div>
    )

  return (
    <div>
      <div className="flex items-center justify-between rounded-xl bg-cream p-3">
        <div>
          <div className="font-bold">{farmer.name}</div>
          <div className="text-[12.5px] text-muted">{farmer.village} · sold to {buyer?.short ?? '—'} @ {inr(price)}/t</div>
        </div>
        <GradePill grade={listing.grade} />
      </div>
      <label className="mt-3 block">
        <span className="label">Weighed tonnes (estimate {num(listing.tonnes, 1)} t)</span>
        <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="input mt-1.5 text-lg font-bold" />
      </label>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={() => setMoistureOk((v) => !v)} className={cn('flex items-center gap-2 rounded-xl border p-2.5 text-left text-[12.5px] font-bold transition', moistureOk ? 'border-leaf bg-leaf/10 text-leaf' : 'border-line text-muted')}>
          <Droplets size={16} /> Moisture OK {moistureOk ? '✓' : ''}
        </button>
        <button onClick={() => { setPhoto(true); toast.success('Bale photo attached') }} className={cn('flex items-center gap-2 rounded-xl border p-2.5 text-left text-[12.5px] font-bold transition', photo ? 'border-leaf bg-leaf/10 text-leaf' : 'border-line text-muted')}>
          {photo ? <PackageCheck size={16} /> : <Upload size={16} />} {photo ? 'Bale photo ✓' : 'Add bale photo'}
        </button>
      </div>
      <div className="mt-3 flex items-end justify-between rounded-xl border border-dashed border-leaf/40 p-3">
        <div className="text-[12.5px] text-muted">Farmer receives<br /><span className="text-[11px]">after 6% platform fee</span></div>
        <div className="font-serif text-[28px] font-bold leading-none text-forest">{inr(amount)}</div>
      </div>
      <div className="mt-4 flex gap-2">
        {onCancel && <button onClick={onCancel} className="btn-ghost">Back</button>}
        <button onClick={pay} className="btn-primary flex-1 py-3 text-[15px]">
          <ShieldCheck size={18} /> Confirm weight & pay via UPI
        </button>
      </div>
    </div>
  )
}

export function UpiModal({ listingId, onClose }: { listingId: string | null; onClose: () => void }) {
  const listing = useStore((s) => s.listings.find((l) => l.id === listingId))
  const [snapshot, setSnapshot] = useState<Listing | null>(null)
  useEffect(() => {
    if (listing && listing.status !== 'Paid') setSnapshot(listing)
    if (!listingId) setSnapshot(null)
  }, [listingId, listing])
  return (
    <Modal open={!!listingId && !!snapshot} onClose={onClose} title="Agent · pickup & pay">
      {snapshot && <UpiFlow listing={snapshot} onDone={onClose} onCancel={onClose} dense />}
    </Modal>
  )
}
