import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Bike, CheckCircle2, ChevronRight, Clock, MapPin, Route, Scale, Truck, Users, Wallet } from 'lucide-react'
import { useStore } from '../store'
import { RouteMap } from '../components/Maps'
import { UpiFlow } from '../components/Shared'
import { CountUp, FadeIn, GradePill, IconCircle, PhoneFrame, RoundBadge, StatusPill } from '../components/ui'
import { vill, type Listing } from '../data/seed'
import { inr, num } from '../lib/utils'

const AGENT_ID = 'a1'

export default function AgentPage() {
  return (
    <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-8 lg:grid-cols-[400px_1fr] lg:items-center">
      <div>
        <PhoneFrame className="h-[760px] max-h-[calc(100vh-110px)] min-h-[620px]">
          <AgentApp />
        </PhoneFrame>
      </div>
      <FadeIn>
        <div className="label">Agent app · rural youth jobs</div>
        <h1 className="mt-2 text-[36px] font-bold leading-tight text-forest">Collect, weigh, pay — and earn per pickup.</h1>
        <p className="mt-3 max-w-[540px] text-[16px] text-muted">
          Agents like Aman (22, Pundri) run clustered routes across nearby villages. Shared pickups cut transport cost, and the farmer is paid by UPI the moment the bales are weighed — trust built on the spot.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Route, t: 'Clustered routes', d: 'Several farms per trip, ordered by distance.' },
            { icon: Scale, t: 'Pay on weighing', d: 'Weight + moisture check, then instant UPI.' },
            { icon: Wallet, t: '₹150 per pickup', d: 'Steady income for village youth.' },
          ].map((p) => (
            <div key={p.t} className="card p-4">
              <IconCircle icon={p.icon} />
              <div className="mt-2 font-bold">{p.t}</div>
              <div className="text-[13px] text-muted">{p.d}</div>
            </div>
          ))}
        </div>
        <div className="mt-5"><RoundBadge>Live UPI gateway &amp; GPS routing — Round 3</RoundBadge></div>
      </FadeIn>
    </div>
  )
}

function AgentApp() {
  const agents = useStore((s) => s.agents)
  const listings = useStore((s) => s.listings)
  const farmers = useStore((s) => s.farmers)
  const agent = agents.find((a) => a.id === AGENT_ID)!
  const [open, setOpen] = useState<Listing | null>(null)
  const home = vill(agent.village)

  const stops = useMemo(() => {
    const pending = listings.filter((l) => l.agentId === AGENT_ID && (l.status === 'Matched' || l.status === 'PickedUp'))
    // nearest-neighbour ordering from the agent's village
    const out: { l: Listing; lat: number; lng: number; farmer: (typeof farmers)[number] }[] = []
    let cur = { lat: home.lat, lng: home.lng }
    const left = pending.map((l) => {
      const f = farmers.find((x) => x.id === l.farmerId)!
      return { l, lat: f.lat, lng: f.lng, farmer: f }
    })
    while (left.length) {
      left.sort((a, b) => Math.hypot(a.lat - cur.lat, a.lng - cur.lng) - Math.hypot(b.lat - cur.lat, b.lng - cur.lng))
      const n = left.shift()!
      out.push(n)
      cur = n
    }
    return out
  }, [listings, farmers, home.lat, home.lng])

  const doneToday = listings.filter((l) => l.agentId === AGENT_ID && l.status === 'Paid' && Date.now() - (l.paidAt ?? 0) < 24 * 3600_000)

  return (
    <div className="relative flex h-full flex-col bg-cream">
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div key="detail" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }} transition={{ duration: 0.22 }} className="flex h-full flex-col">
            <div className="flex items-center gap-2 bg-forest px-4 pb-3 pt-9 text-white">
              <button onClick={() => setOpen(null)} className="rounded-full p-1 hover:bg-white/10"><ArrowLeft size={20} /></button>
              <div className="font-bold">Pickup · {farmers.find((f) => f.id === open.farmerId)?.village}</div>
            </div>
            <div className="thin-scroll flex-1 overflow-y-auto p-4">
              <UpiFlow listing={open} onCancel={() => setOpen(null)} onDone={() => setOpen(null)} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="home" initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} transition={{ duration: 0.22 }} className="flex h-full flex-col">
            <div className="bg-forest px-4 pb-5 pt-9 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mustard font-serif text-xl font-bold text-forest">{agent.name[0]}</div>
                <div className="flex-1 leading-tight">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-sage">KhetKamai Agent</div>
                  <div className="text-[17px] font-bold">{agent.name}, {agent.age} · {agent.village}</div>
                </div>
                <Bike className="text-mustard" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="col-span-1 rounded-xl bg-white/10 p-2.5">
                  <div className="text-[10.5px] text-white/70">Earned today</div>
                  <div className="font-serif text-[19px] font-bold text-mustard"><CountUp value={agent.earningsToday} prefix="₹" /></div>
                </div>
                <div className="rounded-xl bg-white/10 p-2.5">
                  <div className="text-[10.5px] text-white/70">Pickups done</div>
                  <div className="font-serif text-[19px] font-bold">{agent.pickupsDone}</div>
                </div>
                <div className="rounded-xl bg-white/10 p-2.5">
                  <div className="text-[10.5px] text-white/70">Remaining</div>
                  <div className="font-serif text-[19px] font-bold">{stops.length}</div>
                </div>
              </div>
            </div>
            <div className="thin-scroll flex-1 space-y-3 overflow-y-auto p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-forest"><Route size={16} /> Today’s cluster route</div>
                <span className="text-[11px] text-muted">{stops.length} stops</span>
              </div>
              <RouteMap start={home} stops={stops.map((s) => ({ lat: s.lat, lng: s.lng, label: `${s.farmer.name} · ${s.farmer.village}` }))} height={165} />
              {stops.length === 0 && (
                <div className="rounded-xl border border-dashed border-line bg-white p-4 text-center text-[13px] text-muted">
                  All pickups done 🎉 New ones appear when farmers accept offers.
                </div>
              )}
              {stops.map((s, i) => (
                <button key={s.l.id} onClick={() => setOpen(s.l)} className="flex w-full items-center gap-3 rounded-xl border border-line bg-white p-3 text-left shadow-card transition hover:-translate-y-0.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-[12px] font-bold text-white ring-2 ring-mustard">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-bold">{s.farmer.name} <GradePill grade={s.l.grade} className="!px-1.5 !text-[10px]" /></div>
                    <div className="flex items-center gap-1 text-[12px] text-muted"><MapPin size={11} /> {s.farmer.village} · ~{num(s.l.tonnes, 1)} t</div>
                  </div>
                  <ChevronRight size={18} className="text-muted" />
                </button>
              ))}
              {doneToday.length > 0 && (
                <>
                  <div className="pt-1 text-[12px] font-bold uppercase tracking-wider text-muted">Completed today</div>
                  {doneToday.map((l) => {
                    const f = farmers.find((x) => x.id === l.farmerId)!
                    return (
                      <div key={l.id} className="flex items-center gap-3 rounded-xl bg-white/60 p-3">
                        <CheckCircle2 size={20} className="text-leaf" />
                        <div className="flex-1 text-[13px]"><b>{f.name}</b> · {num(l.weighedTonnes ?? l.tonnes, 1)} t</div>
                        <div className="font-bold text-leaf">{inr(l.paidAmount ?? 0)}</div>
                      </div>
                    )
                  })}
                </>
              )}
              <div className="flex items-start gap-2 rounded-xl bg-sage/20 p-3 text-[12px] text-leaf">
                <Users size={14} className="mt-0.5 shrink-0" /> Clustered pickups share one tractor-trolley across 3–4 farms, cutting transport cost per tonne.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
