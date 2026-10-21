import { motion } from 'framer-motion'
import { Bike, CircleDollarSign, Factory, Flag, Layers, Leaf, Mic, Settings2, Users, Wallet } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store'
import { CountUp, FadeIn, IconCircle } from '../components/ui'
import { CO2_PER_TONNE } from '../lib/pricing'
import { inr } from '../lib/utils'

const SDG = [
  ['8', '8.2', 'New income from waste', '₹ per farmer per season'],
  ['8', '8.5', 'Agent and transport jobs', 'Jobs created'],
  ['9', '9.3', 'Farmers linked to processors', 'Active buyers on platform'],
  ['9', '9.4', 'Biomass for clean industry', 'Tonnes diverted from burning'],
  ['9', '9.c', 'Voice and WhatsApp access', '% of payments via UPI'],
]

export default function Impact() {
  const impact = useStore((s) => s.impact)
  const buyers = useStore((s) => s.buyers)
  const agents = useStore((s) => s.agents)
  const avgPerFarmer = impact.farmersPaid ? impact.rupees / impact.farmersPaid : 0
  const upiPct = impact.payments ? (impact.upiPayments / impact.payments) * 100 : 0
  const co2 = impact.tonnes * CO2_PER_TONNE
  const chart = Object.entries(impact.villageTonnes)
    .map(([village, tonnes]) => ({ village, tonnes }))
    .sort((a, b) => b.tonnes - a.tonnes)

  const sdgValue: Record<string, string> = {
    '8.2': inr(avgPerFarmer),
    '8.5': String(impact.jobs),
    '9.3': String(buyers.length),
    '9.4': `${impact.tonnes.toLocaleString('en-IN', { maximumFractionDigits: 1 })} t`,
    '9.c': `${Math.round(upiPct)}%`,
  }

  const targets = [
    { label: 'Farmers paid', value: impact.farmersPaid, target: 500, fmt: (n: number) => Math.round(n).toString() },
    { label: 'Tonnes diverted', value: impact.tonnes, target: 2000, fmt: (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 1 }) + ' t' },
    { label: 'Extra income per farmer', value: avgPerFarmer, target: 5000, fmt: (n: number) => inr(n), note: 'target ₹3–5k' },
    { label: 'Youth jobs', value: impact.jobs, target: 25, fmt: (n: number) => Math.round(n).toString() },
  ]

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6">
      <FadeIn>
        <div className="label">Impact dashboard · pilot · Kaithal district</div>
        <h1 className="text-[36px] font-bold leading-tight text-forest">Every tonne sold is a tonne not burned.</h1>
        <p className="text-muted">Updates live as payments happen in the demo.</p>
      </FadeIn>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat icon={Layers} label="Tonnes diverted" value={<CountUp value={impact.tonnes} decimals={1} suffix=" t" />} bg="bg-forest" />
        <Stat icon={Users} label="Farmers paid" value={<CountUp value={impact.farmersPaid} />} />
        <Stat icon={CircleDollarSign} label="₹ to farmers" value={<CountUp value={impact.rupees} prefix="₹" />} bg="bg-mustard" fg="text-forest" />
        <Stat icon={Wallet} label="Avg extra / farmer" value={<CountUp value={avgPerFarmer} prefix="₹" />} sub="vs ₹0 when burned" />
        <Stat icon={Bike} label="Agents active" value={<CountUp value={agents.length} />} sub={`${impact.jobs} youth jobs`} bg="bg-[#2F7A4D]" />
        <Stat icon={Leaf} label="CO₂ avoided" value={<CountUp value={co2} decimals={1} suffix=" t" />} sub="estimate · 1.46 t/t" bg="bg-terracotta" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-semibold text-forest">Progress to pilot targets</h2>
            <span className="text-[11.5px] italic text-muted">Pilot targets — assumptions</span>
          </div>
          <div className="mt-4 space-y-4">
            {targets.map((t, i) => {
              const pct = Math.min(100, (t.value / t.target) * 100)
              return (
                <div key={t.label}>
                  <div className="flex justify-between text-[14px]">
                    <span className="font-bold">{t.label}</span>
                    <span className="text-muted"><b className="text-forest">{t.fmt(t.value)}</b> / {t.note ?? t.fmt(t.target)}</span>
                  </div>
                  <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-cream">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-leaf to-sage" initial={{ width: 0 }} animate={{ width: `${Math.max(2, pct)}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-[22px] font-semibold text-forest">Tonnes diverted by village</h2>
          <div className="mt-3 h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#E4E8DF" vertical={false} />
                <XAxis dataKey="village" tick={{ fontSize: 12, fill: '#5F6B63' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#5F6B63' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => `${v} t`} cursor={{ fill: '#F2F4EC' }} />
                <Bar dataKey="tonnes" radius={[6, 6, 0, 0]}>
                  {chart.map((c) => <Cell key={c.village} fill={c.village === 'Kaithal' ? '#E3A62F' : '#215C3A'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="p-5 pb-3">
          <h2 className="text-[22px] font-semibold text-forest">Aligned with SDG 8 and SDG 9</h2>
        </div>
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead>
              <tr className="bg-cream text-[11.5px] uppercase tracking-wider text-muted">
                <th className="px-5 py-2.5 font-bold">SDG target</th>
                <th className="px-5 py-2.5 font-bold">How we contribute</th>
                <th className="px-5 py-2.5 font-bold">Measured by</th>
                <th className="px-5 py-2.5 text-right font-bold">Pilot so far</th>
              </tr>
            </thead>
            <tbody>
              {SDG.map(([goal, target, how, measure]) => (
                <tr key={target} className="border-t border-line">
                  <td className="px-5 py-3">
                    <span className={`rounded-md px-2 py-1 text-[12px] font-black text-white ${goal === '8' ? 'bg-leaf' : 'bg-terracotta'}`}>SDG {target}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold">{how}</td>
                  <td className="px-5 py-3 text-muted">{measure}</td>
                  <td className="px-5 py-3 text-right font-serif text-[16px] font-bold text-forest">{sdgValue[target]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 border-t border-line px-5 py-3 text-[12px] text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-leaf" /> SDG 8 · Decent work and economic growth</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-terracotta" /> SDG 9 · Industry, innovation and infrastructure</span>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-forest p-6 text-white">
        <div className="label !text-sage">Roadmap</div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { icon: Mic, r: 'Round 2', a: 'Voice bot on WhatsApp', b: 'Quality grade + price compare' },
            { icon: Settings2, r: 'Round 3', a: 'End-to-end prototype', b: 'Live buyer dashboard' },
            { icon: Flag, r: 'Next', a: '1-village pilot', b: '2 buyers onboard' },
          ].map((s) => (
            <div key={s.r} className="flex items-center gap-3 rounded-xl bg-white/5 p-4">
              <IconCircle icon={s.icon} bg="bg-mustard" fg="text-forest" size={46} />
              <div>
                <div className="text-[12px] font-black uppercase tracking-[0.12em] text-mustard">{s.r}</div>
                <div className="font-bold">{s.a}</div>
                <div className="text-[13px] text-white/70">{s.b}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 font-serif text-[22px] font-bold leading-snug">
          Burning isn’t a farmer’s choice. It’s a market failure. <span className="text-mustard">We’re building the market.</span>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, sub, bg = 'bg-leaf', fg = 'text-white' }: { icon: any; label: string; value: React.ReactNode; sub?: string; bg?: string; fg?: string }) {
  return (
    <FadeIn className="card p-4">
      <IconCircle icon={icon} bg={bg} fg={fg} />
      <div className="mt-3 font-serif text-[26px] font-bold leading-tight text-forest">{value}</div>
      <div className="label mt-0.5">{label}</div>
      {sub && <div className="text-[11.5px] text-muted">{sub}</div>}
    </FadeIn>
  )
}
