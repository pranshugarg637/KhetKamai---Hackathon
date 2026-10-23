import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Bike, Camera, Check, CircleDollarSign, Gavel, IndianRupee, Leaf, Layers, ScanSearch, ShieldCheck, Truck, Weight } from 'lucide-react'
import { useStore } from '../store'
import FarmerChat from '../components/FarmerChat'
import { ActivityFeed, OfferDialog, UpiModal, useListingRows } from '../components/Shared'
import { CountUp, GradePill, IconCircle, PhoneFrame, RoundBadge, StatusPill } from '../components/ui'
import { CO2_PER_TONNE } from '../lib/pricing'
import { cn, inr, num } from '../lib/utils'
import type { Stage } from '../data/seed'

const STEP_LABELS = [
  { label: 'Photo', icon: Camera },
  { label: 'Graded', icon: ScanSearch },
  { label: 'Offers', icon: Gavel },
  { label: 'Accepted', icon: ShieldCheck },
  { label: 'Paid', icon: CircleDollarSign },
]
const stageDone: Record<Stage, number> = { start: 0, awaitPhoto: 0, awaitAcres: 1, grading: 1, priced: 3, accepted: 4, paid: 5 }

export default function Live() {
  const stage = useStore((s) => s.chat.stage)
  const photo = useStore((s) => s.chat.photo)
  const impact = useStore((s) => s.impact)
  const done = stage === 'awaitPhoto' || stage === 'start' ? (photo ? 1 : 0) : stageDone[stage]

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col px-3 pb-4 lg:h-[calc(100vh-60px)] lg:px-4">
      {/* Tracker + counters */}
      <div className="flex flex-wrap items-center gap-3 py-2.5">
        <div className="flex flex-1 items-center gap-1 overflow-x-auto no-scrollbar">
          {STEP_LABELS.map((s, i) => {
            const isDone = i < done
            const active = i === done
            const Icon = s.icon
            return (
              <div key={s.label} className="flex items-center gap-1">
                <motion.div
                  animate={{ scale: active ? 1.04 : 1 }}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition-colors',
                    isDone ? 'border-leaf bg-leaf text-white' : active ? 'border-mustard bg-mustard/15 text-forest' : 'border-line bg-white text-muted',
                  )}
                >
                  {isDone ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                  {i + 1}. {s.label}
                </motion.div>
                {i < STEP_LABELS.length - 1 && <div className={cn('h-[2px] w-4 rounded xl:w-8', i < done - 1 ? 'bg-leaf' : 'bg-line')} />}
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <MiniStat icon={Layers} label="Tonnes diverted" value={<CountUp value={impact.tonnes} decimals={1} />} />
          <MiniStat icon={IndianRupee} label="Paid to farmers" value={<CountUp value={impact.rupees} prefix="₹" />} />
          <MiniStat icon={Leaf} label="CO₂ avoided" value={<CountUp value={impact.tonnes * CO2_PER_TONNE} decimals={0} suffix=" t" />} />
        </div>
      </div>

      {/* 3 columns */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,30%)_1fr_minmax(270px,25%)]">
        <div className="min-h-0 lg:h-full">
          <PhoneFrame className="h-[700px] lg:h-full lg:max-h-[760px]">
            <FarmerChat />
          </PhoneFrame>
        </div>
        <BuyerColumn />
        <RightColumn />
      </div>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 shadow-card">
      <Icon size={16} className="text-leaf" />
      <div className="leading-tight">
        <div className="font-serif text-[16px] font-bold text-forest">{value}</div>
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted">{label}</div>
      </div>
    </div>
  )
}

function BuyerColumn() {
  const rows = useListingRows()
  const buyers = useStore((s) => s.buyers)
  const activeBuyerId = useStore((s) => s.settings.activeBuyerId)
  const setActiveBuyer = useStore((s) => s.setActiveBuyer)
  const [offerFor, setOfferFor] = useState<string | null>(null)
  const open = rows.filter((r) => r.l.status === 'Open')
  const supply = open.reduce((a, r) => a + r.l.tonnes, 0)
  const avgOffer = open.filter((r) => r.best).reduce((a, r, _, arr) => a + (r.best!.price / arr.length), 0)
  const visible = rows.filter((r) => r.l.status !== 'Paid' || Date.now() - (r.l.paidAt ?? 0) < 30 * 60_000).slice(0, 9)

  return (
    <div className="card flex min-h-0 flex-col p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="label">Buyer dashboard · live</div>
          <h2 className="text-[20px] font-semibold text-forest">Residue marketplace</h2>
        </div>
        <div className="flex items-center gap-2">
          <select value={activeBuyerId} onChange={(e) => setActiveBuyer(e.target.value)} className="rounded-lg border border-line bg-white px-2 py-1.5 text-[13px] font-bold outline-none">
            {buyers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <span className="rounded-full bg-mustard px-2.5 py-1 text-[11px] font-black text-forest">PRO</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <Kpi label="Open supply" value={<CountUp value={supply} decimals={1} suffix=" t" />} />
        <Kpi label="Open listings" value={<CountUp value={open.length} />} />
        <Kpi label="Avg best offer" value={<CountUp value={avgOffer} prefix="₹" suffix="/t" />} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="label">Live listings</div>
        <div className="text-[11px] italic text-muted">Illustrative data</div>
      </div>
      <div className="thin-scroll mt-1.5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {visible.map((r) => (
            <motion.div
              key={r.l.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn('flex items-center gap-3 rounded-xl border p-2.5', r.isNew ? 'border-terracotta/50 bg-terracotta/[0.04]' : 'border-line bg-white')}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream font-serif text-[17px] font-bold text-forest">{r.farmer.name[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-bold">{r.farmer.name}</span>
                  {r.isNew && <span className="pulse-new rounded-full bg-terracotta px-1.5 py-[1px] text-[10px] font-black text-white">NEW</span>}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
                  {r.farmer.village} · {r.dist} km · {num(r.l.tonnes, 1)} t {r.l.residue === 'paddy' ? 'paddy' : 'wheat'}
                  <GradePill grade={r.l.grade} className="!px-1.5 !text-[10px]" />
                </div>
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted">{r.accepted ? 'Sold at' : 'Best offer'}</div>
                <div className="font-serif text-[16px] font-bold text-forest">{r.accepted ? inr(r.accepted.price) : r.best ? inr(r.best.price) : '—'}</div>
              </div>
              <div className="w-[112px] shrink-0 text-right">
                {r.l.status === 'Open' ? (
                  <button onClick={() => setOfferFor(r.l.id)} className="btn-primary w-full whitespace-nowrap !px-2 !py-1.5 !text-[12px]">
                    <Gavel size={13} /> Make offer
                  </button>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <StatusPill status={r.l.status} />
                    {r.l.verified === 'ok' && <span className="text-[10.5px] font-bold text-leaf">✓ Weighbridge</span>}
                    {r.l.status === 'Paid' && !r.l.verified && <span className="text-[10.5px] text-muted">In transit…</span>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <OfferDialog listingId={offerFor} onClose={() => setOfferFor(null)} />
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-cream px-3 py-2.5">
      <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted">{label}</div>
      <div className="font-serif text-[21px] font-bold text-forest">{value}</div>
    </div>
  )
}

function RightColumn() {
  const listings = useStore((s) => s.listings)
  const farmers = useStore((s) => s.farmers)
  const chatListingId = useStore((s) => s.chat.listingId)
  const agents = useStore((s) => s.agents)
  const [payFor, setPayFor] = useState<string | null>(null)
  const aman = agents.find((a) => a.id === 'a1')!

  const target = useMemo(() => {
    const chatL = listings.find((l) => l.id === chatListingId && l.status === 'Matched')
    return chatL ?? listings.find((l) => l.status === 'Matched' && l.agentId === 'a1')
  }, [listings, chatListingId])
  const farmer = farmers.find((f) => f.id === target?.farmerId)
  const isLive = target?.id === chatListingId

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="card flex min-h-0 flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-terracotta" />
            <div className="font-serif text-[18px] font-semibold text-forest">Live activity</div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-leaf"><span className="h-2 w-2 animate-pulse rounded-full bg-leaf" /> LIVE</span>
        </div>
        <div className="thin-scroll mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
          <ActivityFeed limit={25} compact />
        </div>
      </div>

      <div className="card shrink-0 overflow-hidden">
        <div className="flex items-center gap-2.5 bg-forest px-4 py-3 text-white">
          <IconCircle icon={Bike} bg="bg-mustard" fg="text-forest" size={34} />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sage">Agent app</div>
            <div className="font-bold">{aman.name}, {aman.age} · {aman.village}</div>
          </div>
          <div className="text-right leading-tight">
            <div className="text-[10.5px] text-white/70">Today</div>
            <div className="font-serif text-[17px] font-bold text-mustard"><CountUp value={aman.earningsToday} prefix="₹" /></div>
          </div>
        </div>
        <div className="p-4">
          {target && farmer ? (
            <>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-leaf" />
                <div className="text-[13px] font-bold">Pickup ready{isLive && <span className="ml-1.5 rounded-full bg-terracotta px-1.5 py-[1px] text-[10px] font-black text-white">LIVE</span>}</div>
              </div>
              <div className="mt-1 text-[13px] text-muted">{farmer.name} · {farmer.village} · ~{num(target.tonnes, 1)} t</div>
              <button onClick={() => setPayFor(target.id)} className="btn-mustard mt-3 w-full py-3 text-[14px]">
                <Weight size={16} /> Complete pickup & pay
              </button>
            </>
          ) : (
            <div className="py-2 text-center text-[13px] text-muted">No pickups waiting. Accept an offer in the farmer chat to create one.</div>
          )}
          <div className="mt-2 flex justify-center"><RoundBadge>UPI gateway · Round 3</RoundBadge></div>
        </div>
      </div>
      <UpiModal listingId={payFor} onClose={() => setPayFor(null)} />
    </div>
  )
}
