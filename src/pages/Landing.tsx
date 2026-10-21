import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bike, Camera, Clock, Factory, Flame, Gavel, IndianRupee, Leaf, MessageCircle, Mic, Play, Scale, ScanSearch, Search, Sprout, Truck, Wind, Coins } from 'lucide-react'
import { useStore } from '../store'
import { CountUp, FadeIn, IconCircle } from '../components/ui'
import { CO2_PER_TONNE } from '../lib/pricing'

export default function Landing() {
  const impact = useStore((s) => s.impact)
  return (
    <div>
      {/* Hero */}
      <section className="hero-pattern relative overflow-hidden bg-forest text-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-14 md:grid-cols-[1.15fr_1fr] md:py-20">
          <FadeIn>
            <div className="text-[12px] font-bold uppercase tracking-[0.28em] text-sage">Prompt-e-Thon · Round 1 · SDG 8 &amp; 9</div>
            <h1 className="mt-4 font-serif text-[64px] font-bold leading-none md:text-[84px]">KhetKamai</h1>
            <p className="mt-4 font-serif text-[26px] italic text-mustard md:text-[30px]">Turn what you burn into what you earn.</p>
            <p className="mt-4 max-w-[520px] text-[17px] text-white/80">
              A WhatsApp-first marketplace that turns crop residue into income instead of smoke — AI grading, fair prices, clustered pickups and UPI on weighing.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/live" className="btn-mustard !px-6 !py-3.5 !text-[15px]"><Play size={18} fill="currentColor" /> Start live demo</Link>
              <a href="#roles" className="btn !border !border-white/25 !px-6 !py-3.5 !text-[15px] text-white hover:bg-white/10">Explore roles <ArrowRight size={16} /></a>
            </div>
          </FadeIn>
          <div className="relative mx-auto h-[340px] w-[340px] md:h-[400px] md:w-[400px]">
            <div className="absolute inset-[6%] rounded-full bg-leaf/60" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 400">
              <motion.path d="M120 170 C 140 330, 290 340, 300 250" fill="none" stroke="#8DB580" strokeWidth="2.5" strokeDasharray="7 8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 0.3 }} />
            </svg>
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="absolute left-[4%] top-[8%] flex h-[46%] w-[46%] items-center justify-center rounded-full bg-terracotta shadow-2xl">
              <Flame size={84} fill="white" className="text-white" strokeWidth={1} />
            </motion.div>
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.5 }} className="absolute bottom-[6%] right-[2%] flex h-[42%] w-[42%] items-center justify-center rounded-full bg-mustard shadow-2xl">
              <IndianRupee size={80} className="text-forest" strokeWidth={3} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live counters */}
      <section className="mx-auto -mt-8 max-w-[1100px] px-5">
        <div className="card relative z-10 grid grid-cols-2 gap-4 p-5 md:grid-cols-4">
          {[
            { label: 'Tonnes diverted', v: <CountUp value={impact.tonnes} decimals={1} suffix=" t" />, icon: Sprout },
            { label: 'Farmers paid', v: <CountUp value={impact.farmersPaid} />, icon: Coins },
            { label: '₹ paid to farmers', v: <CountUp value={impact.rupees} prefix="₹" />, icon: IndianRupee },
            { label: 'CO₂ avoided (est.)', v: <CountUp value={impact.tonnes * CO2_PER_TONNE} decimals={1} suffix=" t" />, icon: Leaf },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <IconCircle icon={s.icon} />
              <div>
                <div className="font-serif text-[26px] font-bold leading-tight text-forest">{s.v}</div>
                <div className="label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-[1100px] px-5 py-16">
        <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
          <div className="rounded-2xl bg-forest p-7 text-white">
            <Flame className="text-mustard" size={36} fill="#E3A62F" />
            <div className="mt-5 font-serif text-[64px] font-bold leading-none text-mustard">~90 Mt</div>
            <div className="mt-3 text-[18px]">of crop residue burned in India every year</div>
          </div>
          <div className="grid gap-4">
            <div className="card flex items-center gap-4 p-5">
              <IconCircle icon={Truck} size={52} />
              <p className="font-serif text-[19px] italic leading-snug">“Rajbir: 2 acres, 12 days to wheat sowing. No buyer calls. A matchstick is faster.”</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Wind, k: 'Air', v: 'Smog', bg: 'bg-terracotta' },
                { icon: Sprout, k: 'Soil', v: 'Nutrients lost', bg: 'bg-leaf' },
                { icon: Coins, k: 'Income', v: '₹0 earned', bg: 'bg-mustard' },
              ].map((c) => (
                <div key={c.k} className="card p-4">
                  <IconCircle icon={c.icon} bg={c.bg} />
                  <div className="label mt-3">{c.k}</div>
                  <div className="font-bold">{c.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Search, t: 'No visible buyers', d: 'Nobody knows who pays' },
            { icon: Scale, t: 'No fair price', d: 'No trusted benchmark' },
            { icon: Truck, t: 'Logistics cost', d: 'Transport exceeds value' },
            { icon: Clock, t: '10–20 day window', d: 'Wheat sowing cannot wait' },
          ].map((c) => (
            <div key={c.t} className="card p-4">
              <IconCircle icon={c.icon} bg="bg-terracotta" />
              <div className="mt-3 font-bold text-forest">{c.t}</div>
              <div className="text-[13.5px] text-muted">{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 steps */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1100px] px-5">
          <div className="label">How it works</div>
          <h2 className="mt-1 text-[36px] font-bold text-forest">Photo to payment in four steps</h2>
          <p className="font-serif text-[18px] italic text-terracotta">Sell straw like booking a cab.</p>
          <div className="relative mt-10 grid gap-6 md:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-[34px] hidden border-t-[3px] border-dashed border-mustard md:block" />
            {[
              { icon: Camera, t: 'Photograph', d: 'Send a photo or voice note', ai: false },
              { icon: ScanSearch, t: 'Grade and price', d: 'AI checks type and quality', ai: true },
              { icon: Gavel, t: 'Compare and match', d: 'Live offers vs local rate', ai: true },
              { icon: Truck, t: 'Pickup and pay', d: 'UPI or agent cash', ai: false },
            ].map((s, i) => (
              <FadeIn key={s.t} delay={i * 0.08} className="relative text-center">
                <div className="relative mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full bg-leaf text-white shadow-lift">
                  <s.icon size={30} />
                  {s.ai && <span className="absolute -right-3 -top-1 rounded-md bg-mustard px-1.5 py-0.5 text-[10px] font-black text-forest">AI</span>}
                </div>
                <div className="card mt-4 p-4">
                  <div className="text-[12px] font-black uppercase tracking-[0.12em] text-terracotta">Step {i + 1}</div>
                  <div className="mt-1 font-bold text-forest">{s.t}</div>
                  <div className="text-[13.5px] text-muted">{s.d}</div>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 rounded-full bg-mustard px-6 py-2.5 font-bold text-forest">
              <Mic size={18} /> Hindi <span className="opacity-50">|</span> Haryanvi <span className="opacity-50">|</span> Punjabi
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-[1100px] scroll-mt-20 px-5 py-16">
        <div className="label">Built for three kinds of users</div>
        <h2 className="mt-1 text-[36px] font-bold text-forest">Open a role</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            { to: '/farmer', icon: MessageCircle, tag: 'Primary', t: 'Farmer (WhatsApp)', d: 'Rajbir, 41, Kaithal — sells parali by photo and voice in Hindi.', bg: 'bg-terracotta' },
            { to: '/buyer', icon: Factory, tag: 'Secondary', t: 'Buyer dashboard', d: 'Biogas, paper, mushroom & feed units get steady, graded supply.', bg: 'bg-mustard' },
            { to: '/agent', icon: Bike, tag: 'Tertiary', t: 'Agent app', d: 'Rural youth collect, weigh and pay — earning per pickup.', bg: 'bg-sage' },
          ].map((r) => (
            <Link key={r.to} to={r.to} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lift">
              <IconCircle icon={r.icon} bg={r.bg} size={52} />
              <div className="label mt-4">{r.tag}</div>
              <div className="mt-1 font-serif text-[22px] font-semibold text-forest">{r.t}</div>
              <p className="mt-1 text-[14px] text-muted">{r.d}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 font-bold text-leaf">Open <ArrowRight size={16} className="transition group-hover:translate-x-1" /></div>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Link to="/impact" className="btn-ghost">See impact &amp; SDG mapping <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  )
}
