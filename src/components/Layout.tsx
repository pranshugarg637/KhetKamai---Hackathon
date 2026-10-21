import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, ChevronDown, RotateCcw, Settings, X } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { useStore } from '../store'
import { LogoMark, Modal } from './ui'
import { cn } from '../lib/utils'

const LINKS = [
  ['/live', 'Live Demo'],
  ['/farmer', 'Farmer'],
  ['/buyer', 'Buyer'],
  ['/agent', 'Agent'],
  ['/impact', 'Impact'],
] as const

export default function Layout() {
  const [confirm, setConfirm] = useState(false)
  const [settings, setSettings] = useState(false)
  const reset = useStore((s) => s.reset)
  const mandi = useStore((s) => s.settings.mandiRate)
  const setMandi = useStore((s) => s.setMandiRate)
  const [rate, setRate] = useState(String(mandi))
  const loc = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 h-[60px] bg-forest text-white shadow-[0_2px_12px_rgba(0,0,0,.15)]">
        <div className="mx-auto flex h-full max-w-[1500px] items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <LogoMark size={30} />
            <span className="font-serif text-[21px] font-bold tracking-tight">KhetKamai</span>
          </Link>
          <nav className="no-scrollbar ml-2 flex flex-1 items-center gap-1 overflow-x-auto">
            {LINKS.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn('whitespace-nowrap rounded-full px-3 py-1.5 text-[13.5px] font-bold transition', isActive ? 'bg-white/12 text-mustard bg-white/10' : 'text-white/75 hover:text-white hover:bg-white/5')
                }
              >
                {label === 'Live Demo' ? <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-terracotta animate-pulse" />{label}</span> : label}
              </NavLink>
            ))}
          </nav>
          <button onClick={() => { setRate(String(mandi)); setSettings(true) }} className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Settings">
            <Settings size={18} />
          </button>
          <button onClick={() => setConfirm(true)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-[13px] font-bold hover:bg-white/10">
            <RotateCcw size={14} /> <span className="hidden sm:inline">Reset demo</span>
          </button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {loc.pathname !== '/live' && (
        <footer className="border-t border-line py-5 text-center text-[13px] text-muted">
          Team Vibe Coders · Dept. of CSE, BVCOE (GGSIPU), Delhi · Prompt-e-Thon 2026
        </footer>
      )}

      <DemoGuide live={loc.pathname === '/live'} />
      <Toaster position="top-center" richColors closeButton />

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset demo?">
        <p className="text-[14px] text-muted">This clears the chat, new listings and payments, and restores the starting seed data. Use it before each presentation.</p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => setConfirm(false)} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={() => { reset(); setConfirm(false); toast.success('Demo reset — ready to present') }}
            className="btn-primary flex-1"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </Modal>

      <Modal open={settings} onClose={() => setSettings(false)} title="Settings">
        <label className="block">
          <span className="label">Local mandi / benchmark rate (₹ per tonne, Grade A)</span>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="input mt-1.5 text-lg font-bold" />
        </label>
        <p className="mt-2 text-[12.5px] text-muted">Grade B = 85%, Grade C = 65% of this. Round 2: pulled live from the Agmarknet price feed.</p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => setSettings(false)} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={() => { const n = Math.round(Number(rate)); if (n > 0) { setMandi(n); toast.success(`Mandi rate set to ₹${n.toLocaleString('en-IN')}/t`) } setSettings(false) }}
            className="btn-primary flex-1"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  )
}

const STEPS: [string, string, string][] = [
  ['/live', 'Open Live Demo', 'Everything happens on one screen.'],
  ['/live', 'Farmer sends a photo', 'Tap “Send photo” → pick “Dry paddy straw”.'],
  ['/live', 'Tell acres', 'Tap “2 acres” or use the mic (Hindi voice works in Chrome).'],
  ['/live', 'AI grade + live offers', 'Grade card and price bars appear; listing pops up for buyers.'],
  ['/live', 'Buyer raises the offer', 'Click “Make offer” on Rajbir’s listing → farmer sees it instantly.'],
  ['/live', 'Accept & pay', 'Accept best offer → “Complete pickup & pay” → UPI paid 🎉'],
  ['/impact', 'Show impact', 'Counters, SDG mapping and roadmap.'],
]

function DemoGuide({ live }: { live: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('fixed z-50', live ? 'bottom-3 left-1/2 -translate-x-1/2 lg:left-[46%]' : 'bottom-4 right-4')}>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }} className="card mb-2 w-[300px] p-4">
            <div className="flex items-center justify-between">
              <div className="font-serif text-[17px] font-semibold text-forest">Demo guide</div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-cream"><X size={16} /></button>
            </div>
            <ol className="mt-2 space-y-2">
              {STEPS.map(([to, title, desc], i) => (
                <li key={i}>
                  <Link to={to} onClick={() => setOpen(false)} className="flex gap-2.5 rounded-lg p-1.5 hover:bg-cream">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-white">{i + 1}</span>
                    <span>
                      <span className="block text-[13px] font-bold">{title}</span>
                      <span className="block text-[12px] leading-snug text-muted">{desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-2 rounded-lg bg-cream p-2 text-[11.5px] text-muted">Tip: press “Reset demo” in the top bar before you present.</div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen((v) => !v)} className="ml-auto flex items-center gap-2 rounded-full bg-mustard px-4 py-2.5 text-[13px] font-black text-forest shadow-lift transition hover:-translate-y-0.5">
        <BookOpen size={16} /> <span className="hidden sm:inline">Demo guide</span> <ChevronDown size={14} className={cn('transition', open ? '' : 'rotate-180')} />
      </button>
    </div>
  )
}
