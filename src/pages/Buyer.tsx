import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Factory, Gavel, Layers, MapPin, SearchX, Star, TrendingUp, Wallet } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store'
import { OfferDialog, useListingRows } from '../components/Shared'
import { ListingsMap } from '../components/Maps'
import { CountUp, FadeIn, GradePill, IconCircle, RoundBadge, StatusPill } from '../components/ui'
import type { Grade } from '../data/seed'
import { cn, inr, num } from '../lib/utils'

const gradeScore: Record<Grade, number> = { A: 3, B: 2, C: 1 }

export default function Buyer() {
  const rows = useListingRows()
  const buyers = useStore((s) => s.buyers)
  const activeBuyerId = useStore((s) => s.settings.activeBuyerId)
  const setActiveBuyer = useStore((s) => s.setActiveBuyer)
  const priceTrend = useStore((s) => s.priceTrend)
  const mandi = useStore((s) => s.settings.mandiRate)
  const buyer = buyers.find((b) => b.id === activeBuyerId) ?? buyers[0]
  const [type, setType] = useState<'all' | 'paddy' | 'wheat'>('all')
  const [grade, setGrade] = useState<'all' | Grade>('all')
  const [maxKm, setMaxKm] = useState(100)
  const [offerFor, setOfferFor] = useState<string | null>(null)

  const filtered = rows.filter((r) => (type === 'all' || r.l.residue === type) && (grade === 'all' || r.l.grade === grade) && r.dist <= maxKm)

  const kpi = useMemo(() => {
    const open = rows.filter((r) => r.l.status === 'Open')
    const supply = open.reduce((a, r) => a + r.l.tonnes, 0)
    const avgScore = open.length ? open.reduce((a, r) => a + gradeScore[r.l.grade], 0) / open.length : 0
    const avgGrade = avgScore >= 2.5 ? 'A' : avgScore >= 1.5 ? 'B' : avgScore > 0 ? 'C' : '—'
    const mine = rows.filter((r) => r.accepted?.buyerId === buyer.id)
    const myTonnes = mine.reduce((a, r) => a + (r.l.weighedTonnes ?? r.l.tonnes), 0)
    const avgPaid = mine.length ? mine.reduce((a, r) => a + (r.accepted?.price ?? 0), 0) / mine.length : 0
    return { supply, avgGrade, myTonnes, avgPaid, openCount: open.length }
  }, [rows, buyer.id])

  const trend = priceTrend.map((p) => ({ ...p, mandi }))

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <FadeIn className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label">Buyer dashboard</div>
          <h1 className="text-[36px] font-bold leading-tight text-forest">Quality-checked residue, on tap</h1>
          <p className="text-muted">Every listing is AI-graded from the farmer’s photo. Offer a price — the farmer sees it on WhatsApp instantly.</p>
        </div>
        <div className="flex items-center gap-2">
          <IconCircle icon={Factory} bg="bg-mustard" fg="text-forest" />
          <select value={activeBuyerId} onChange={(e) => setActiveBuyer(e.target.value)} className="rounded-xl border border-line bg-white px-3 py-2.5 font-bold outline-none focus:border-leaf">
            {buyers.map((b) => <option key={b.id} value={b.id}>{b.name} · {b.kind}</option>)}
          </select>
          <span className="inline-flex items-center gap-1 rounded-full bg-mustard px-3 py-1.5 text-[12px] font-black text-forest"><Star size={13} fill="currentColor" /> Pro subscription</span>
        </div>
      </FadeIn>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Layers} label="Available supply" value={<CountUp value={kpi.supply} decimals={1} suffix=" t" />} sub={`${kpi.openCount} open listings`} />
        <KpiCard icon={Star} label="Avg grade (open)" value={kpi.avgGrade} sub="AI quality check" bg="bg-mustard" fg="text-forest" />
        <KpiCard icon={Wallet} label="My accepted tonnes" value={<CountUp value={kpi.myTonnes} decimals={1} suffix=" t" />} sub={buyer.short} bg="bg-forest" />
        <KpiCard icon={TrendingUp} label="Avg price paid" value={kpi.avgPaid ? <CountUp value={kpi.avgPaid} prefix="₹" suffix="/t" /> : '—'} sub={`vs mandi ${inr(mandi)}/t`} bg="bg-terracotta" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[22px] font-semibold text-forest">Live listings</h2>
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <Seg value={type} set={setType} opts={[['all', 'All types'], ['paddy', 'Paddy'], ['wheat', 'Wheat']]} />
              <Seg value={grade} set={setGrade} opts={[['all', 'All grades'], ['A', 'A'], ['B', 'B'], ['C', 'C']]} />
              <label className="flex items-center gap-2 rounded-xl border border-line px-3 py-1.5 font-bold">
                <MapPin size={14} className="text-leaf" /> ≤ {maxKm} km
                <input type="range" min={5} max={100} value={maxKm} onChange={(e) => setMaxKm(Number(e.target.value))} className="w-24 accent-[#215C3A]" />
              </label>
            </div>
          </div>
          <div className="thin-scroll mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-line text-[11.5px] uppercase tracking-wider text-muted">
                  <th className="py-2 pr-2 font-bold">Farmer</th>
                  <th className="py-2 pr-2 font-bold">Residue</th>
                  <th className="py-2 pr-2 font-bold">Grade</th>
                  <th className="py-2 pr-2 text-right font-bold">Tonnes</th>
                  <th className="py-2 pr-2 text-right font-bold">Distance</th>
                  <th className="py-2 pr-2 font-bold">Status</th>
                  <th className="py-2 pr-2 text-right font-bold">Best offer</th>
                  <th className="py-2 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.map((r) => (
                    <motion.tr key={r.l.id} layout initial={{ opacity: 0, backgroundColor: '#FCEBE6' }} animate={{ opacity: 1, backgroundColor: '#ffffff00' }} transition={{ duration: 1.2 }} className="border-b border-line/70 last:border-0">
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{r.farmer.name}</span>
                          {r.isNew && <span className="pulse-new rounded-full bg-terracotta px-1.5 py-[1px] text-[10px] font-black text-white">NEW</span>}
                        </div>
                        <div className="text-[12.5px] text-muted">{r.farmer.village}</div>
                      </td>
                      <td className="py-3 pr-2">{r.l.residue === 'paddy' ? 'Paddy straw' : 'Wheat straw'}</td>
                      <td className="py-3 pr-2"><GradePill grade={r.l.grade} /></td>
                      <td className="py-3 pr-2 text-right font-bold">{num(r.l.weighedTonnes ?? r.l.tonnes, 1)}</td>
                      <td className="py-3 pr-2 text-right text-muted">{r.dist} km</td>
                      <td className="py-3 pr-2">
                        <StatusPill status={r.l.status} />
                        {r.l.verified && (
                          <div className={cn('mt-1 text-[11.5px] font-bold', r.l.verified === 'ok' ? 'text-leaf' : 'text-terracotta')}>
                            {r.l.verified === 'ok' ? `✓ Weighbridge ${num(r.l.factoryTonnes ?? 0, 1)} t` : '⚠ Weight mismatch'}
                          </div>
                        )}
                        {r.l.status === 'Paid' && !r.l.verified && <div className="mt-1 text-[11.5px] text-muted">In transit to factory…</div>}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <div className="font-serif font-bold text-forest">{(r.accepted ?? r.best) ? inr((r.accepted ?? r.best)!.price) + '/t' : '—'}</div>
                        <div className={cn('text-[11.5px]', r.mineBest ? 'font-bold text-leaf' : 'text-muted')}>{r.mineBest ? 'Yours' : r.bestBuyer?.short ?? 'No offers yet'}</div>
                      </td>
                      <td className="py-3 text-right">
                        {r.l.status === 'Open' ? (
                          <button onClick={() => setOfferFor(r.l.id)} className="btn-primary !px-3 !py-1.5 !text-[12.5px]"><Gavel size={13} /> Make offer</button>
                        ) : (
                          <span className="text-[12.5px] text-muted">—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <IconCircle icon={SearchX} bg="bg-cream" fg="text-muted" size={52} />
                <div className="mt-3 font-bold">No listings match these filters</div>
                <div className="text-[13px] text-muted">Try a wider distance or another grade.</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-forest">Supply map</h3>
              <div className="flex gap-2 text-[11px] font-bold">
                {(['A', 'B', 'C'] as Grade[]).map((g) => (
                  <span key={g} className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: g === 'A' ? '#215C3A' : g === 'B' ? '#E3A62F' : '#D5573B' }} />{g}</span>
                ))}
              </div>
            </div>
            <ListingsMap rows={filtered} buyer={buyer} height={290} />
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-forest">Price trend · last 7 days</h3>
              <RoundBadge>Agmarknet feed — Round 2</RoundBadge>
            </div>
            <div className="mt-3 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#E4E8DF" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#5F6B63' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1100, 1500]} tick={{ fontSize: 12, fill: '#5F6B63' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => inr(v) + '/t'} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="offer" name="Avg buyer offer" stroke="#215C3A" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="mandi" name="Local mandi" stroke="#9AA39D" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 text-right text-[11px] italic text-muted">Illustrative data</div>
          </div>
        </div>
      </div>
      <OfferDialog listingId={offerFor} onClose={() => setOfferFor(null)} />
    </div>
  )
}

function KpiCard({ icon, label, value, sub, bg = 'bg-leaf', fg = 'text-white' }: { icon: any; label: string; value: React.ReactNode; sub: string; bg?: string; fg?: string }) {
  return (
    <FadeIn className="card flex items-center gap-4 p-5">
      <IconCircle icon={icon} bg={bg} fg={fg} size={46} />
      <div className="min-w-0">
        <div className="label">{label}</div>
        <div className="font-serif text-[28px] font-bold leading-tight text-forest">{value}</div>
        <div className="truncate text-[12.5px] text-muted">{sub}</div>
      </div>
    </FadeIn>
  )
}

function Seg<T extends string>({ value, set, opts }: { value: T; set: (v: T) => void; opts: [T, string][] }) {
  return (
    <div className="flex rounded-xl border border-line bg-cream p-0.5">
      {opts.map(([v, l]) => (
        <button key={v} onClick={() => set(v)} className={cn('rounded-lg px-2.5 py-1 font-bold transition', value === v ? 'bg-white text-forest shadow-sm' : 'text-muted hover:text-ink')}>
          {l}
        </button>
      ))}
    </div>
  )
}
