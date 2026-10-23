import { motion } from 'framer-motion'
import { ScanSearch, Truck, Phone, Users, BadgeCheck, Leaf, Wheat, Droplets, ShieldCheck } from 'lucide-react'
import { useStore } from '../store'
import type { GradeDetails, Lang } from '../data/seed'
import { t } from '../lib/i18n'
import { SAMPLES } from '../lib/grading'
import { CO2_PER_TONNE, COMMISSION, farmerNet, localRate, offersFor, pctVsLocal } from '../lib/pricing'
import { cn, fmtDate, inr, num } from '../lib/utils'
import { gradeBg } from './ui'

export function SampleThumb({ sampleId, lang, className }: { sampleId: string; lang: Lang; className?: string }) {
  const s = SAMPLES.find((x) => x.id === sampleId) ?? SAMPLES[0]
  const Icon = s.id === 'damp' ? Droplets : Wheat
  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)} style={{ background: s.gradient }}>
      <div className="absolute inset-0 straw-texture" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="text-white/85 drop-shadow" size={34} strokeWidth={1.8} />
      </div>
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/45 to-transparent px-2 pb-1.5 pt-5 text-[11px] font-bold text-white">
        {s.label[lang]}
      </div>
    </div>
  )
}

export function AnalysingCard({ lang }: { lang: Lang }) {
  return (
    <div className="w-[230px]">
      <div className="flex items-center gap-2 text-[13px] font-bold text-leaf">
        <ScanSearch size={16} className="animate-pulse" /> {t('analysing', lang)}
      </div>
      <div className="relative mt-2 h-20 overflow-hidden rounded-lg shimmer">
        <div className="scanline absolute inset-x-0 h-[2px] bg-mustard shadow-[0_0_10px_#E3A62F]" />
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-2 w-3/4 rounded shimmer" />
        <div className="h-2 w-1/2 rounded shimmer" />
      </div>
    </div>
  )
}

function Meter({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-line overflow-hidden">
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }} />
    </div>
  )
}

const levelColor = (v: string) => (v === 'none' || v === 'low' ? 'bg-leaf' : v === 'medium' ? 'bg-mustard' : 'bg-terracotta')

export function GradeCard({ d, acres, tonnes, lang }: { d: GradeDetails; acres: number; tonnes: number; lang: Lang }) {
  return (
    <div className="w-[248px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-wider text-leaf">
          <ScanSearch size={14} /> {t('gradeTitle', lang)}
        </div>
        <span className="rounded-full bg-sage/25 px-2 py-0.5 text-[11px] font-bold text-leaf">
          {d.confidence}% {t('confidence', lang)}
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
          className={cn('flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl', gradeBg(d.grade))}
        >
          <span className="text-[9px] font-bold uppercase leading-none opacity-80">{t('grade', lang)}</span>
          <span className="font-serif text-3xl font-bold leading-none">{d.grade}</span>
        </motion.div>
        <div className="min-w-0">
          <div className="font-bold text-[15px] leading-tight">{t(d.type, lang)}</div>
          <div className="text-[12px] text-muted leading-snug">{t('grade' + d.grade, lang)}</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-[12px] mb-1">
          <span className="text-muted">{t('dryness', lang)}</span>
          <span className="font-bold">{d.dryness}%</span>
        </div>
        <Meter value={d.dryness} color={d.dryness > 80 ? '#215C3A' : d.dryness > 65 ? '#E3A62F' : '#D5573B'} />
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[12px]">
        {(['mould', 'dirt'] as const).map((k) => (
          <div key={k} className="rounded-lg bg-cream px-2 py-1.5">
            <div className="text-muted">{t(k, lang)}</div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className={cn('h-2 w-2 rounded-full', levelColor(d[k]))} />
              {t(d[k], lang)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between rounded-lg border border-line px-2.5 py-2 text-[12px]">
        <span className="text-muted">{t('estQty', lang)}</span>
        <span className="font-bold">
          {num(tonnes, 1)} t <span className="font-normal text-muted">({acres} × 2.5 t)</span>
        </span>
      </div>
    </div>
  )
}

export function PriceCard({ listingId, lang }: { listingId: string; lang: Lang }) {
  const listing = useStore((s) => s.listings.find((l) => l.id === listingId))
  const allOffers = useStore((s) => s.offers)
  const buyers = useStore((s) => s.buyers)
  const mandi = useStore((s) => s.settings.mandiRate)
  if (!listing) return null
  const offers = offersFor(allOffers, listingId).slice(0, 3)
  const local = localRate(listing.grade, mandi)
  const best = offers[0]
  const bestPrice = best?.price ?? local
  const max = Math.max(bestPrice, local) * 1.04
  const pct = pctVsLocal(bestPrice, local)
  const gross = Math.round(listing.tonnes * bestPrice)
  const fee = Math.round(gross * COMMISSION)
  const net = farmerNet(listing.tonnes, bestPrice)
  const accepted = allOffers.find((o) => o.id === listing.acceptedOfferId)
  const acceptedBuyer = buyers.find((b) => b.id === accepted?.buyerId)
  const rows = [
    ...offers.map((o, i) => ({ id: o.id, name: buyers.find((b) => b.id === o.buyerId)?.short ?? 'Buyer', value: o.price, color: i === 0 ? '#123C2A' : '#2F7A4D' })),
    { id: 'local', name: t('localRate', lang), value: local, color: '#7B867E' },
  ]
  return (
    <div className="w-[256px]">
      <div className="text-[12px] font-black uppercase tracking-wider text-leaf">{t('priceTitle', lang)}</div>
      <div className="mt-2.5 space-y-2">
        {rows.map((r, i) => (
          <div key={r.id} className="grid grid-cols-[78px_1fr] items-center gap-2">
            <div className="truncate text-[11.5px] font-semibold text-ink" title={r.name}>{r.name}</div>
            <div className="h-6 rounded-md bg-cream overflow-hidden">
              <motion.div
                className={cn('flex h-full items-center justify-end rounded-md pr-1.5 text-[11.5px] font-black text-white', accepted?.id === r.id && 'ring-2 ring-mustard')}
                style={{ background: r.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(r.value / max) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
              >
                {r.value.toLocaleString('en-IN')}
              </motion.div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2.5 rounded-lg bg-mustard px-2.5 py-1.5 text-center text-[12.5px] font-black text-forest">
        {pct > 0 ? t('bestOffer', lang, { pct }) : t('localBest', lang)}
      </div>
      <div className="mt-2.5 space-y-1 rounded-lg border border-line p-2.5 text-[12px]">
        <div className="flex justify-between">
          <span className="text-muted">{num(listing.tonnes, 1)} t × {inr(bestPrice)}</span>
          <span className="font-semibold">{inr(gross)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">{t('fee', lang)}</span>
          <span className="font-semibold text-terracotta">− {inr(fee)}</span>
        </div>
        <div className="flex items-end justify-between border-t border-dashed border-line pt-1.5">
          <span className="font-bold text-leaf">{t('youEarn', lang)}</span>
          <span className="font-serif text-[24px] font-bold leading-none text-forest">{inr(net)}</span>
        </div>
      </div>
      {accepted && acceptedBuyer && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-leaf/10 px-2.5 py-1.5 text-[12px] font-bold text-leaf">
          <BadgeCheck size={14} /> {t('acceptedAt', lang, { buyer: acceptedBuyer.short, price: accepted.price.toLocaleString('en-IN') })}
        </div>
      )}
      <div className="mt-1.5 text-right text-[10.5px] italic text-muted">{t('illustrative', lang)}</div>
    </div>
  )
}

export function PickupCard({ listingId, lang }: { listingId: string; lang: Lang }) {
  const listing = useStore((s) => s.listings.find((l) => l.id === listingId))
  const agents = useStore((s) => s.agents)
  if (!listing) return null
  const agent = agents.find((a) => a.id === listing.agentId) ?? agents[0]
  return (
    <div className="w-[248px]">
      <div className="flex items-center gap-2 font-bold text-forest">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf text-white"><Truck size={16} /></span>
        {t('pickupTitle', lang)}
      </div>
      <div className="mt-2 text-[13px]">{t('pickupOn', lang, { date: fmtDate(listing.pickupDate ?? Date.now(), lang) })}</div>
      <div className="mt-2.5 flex items-center gap-2.5 rounded-xl bg-cream p-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mustard font-serif text-lg font-bold text-forest">{agent.name[0]}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-muted">{t('agent', lang)}</div>
          <div className="font-bold leading-tight">{agent.name}, {agent.age} · {agent.village}</div>
          <div className="flex items-center gap-1 text-[12px] text-leaf"><Phone size={11} /> {agent.phone}</div>
        </div>
      </div>
      <div className="mt-2 space-y-1 text-[12px]">
        {listing.escrow && (
          <div className="flex items-start gap-1.5 rounded-md bg-mustard/20 px-1.5 py-1 font-semibold text-[#6d4a05]"><ShieldCheck size={14} className="mt-0.5 shrink-0" /> {t('escrowLocked', lang, { amount: listing.escrow.toLocaleString('en-IN') })}</div>
        )}
        <div className="flex items-start gap-1.5"><BadgeCheck size={14} className="mt-0.5 shrink-0 text-leaf" /> {t('payAfter', lang)}</div>
        <div className="flex items-start gap-1.5"><Users size={14} className="mt-0.5 shrink-0 text-leaf" /> {t('cluster', lang)}</div>
      </div>
    </div>
  )
}

export function PaymentCard({ listingId, lang }: { listingId: string; lang: Lang }) {
  const listing = useStore((s) => s.listings.find((l) => l.id === listingId))
  if (!listing || !listing.paidAmount) return null
  const kg = Math.round((listing.weighedTonnes ?? listing.tonnes) * CO2_PER_TONNE * 1000)
  return (
    <div className="w-[248px] overflow-hidden rounded-xl border border-leaf/20">
      <div className="bg-forest px-3 py-2.5 text-white">
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-sage"><BadgeCheck size={14} /> {t('paidTitle', lang)}</div>
        <div className="mt-0.5 font-serif text-[28px] font-bold leading-tight">{inr(listing.paidAmount)}</div>
        <div className="text-[12px] text-white/80">{t('paidMsg', lang, { amount: listing.paidAmount.toLocaleString('en-IN') })}</div>
      </div>
      <div className="space-y-1 bg-white px-3 py-2 text-[12px]">
        <div className="flex justify-between"><span className="text-muted">{t('txn', lang)}</span><span className="font-mono font-semibold">{listing.txnId}</span></div>
        <div className="flex justify-between"><span className="text-muted">{t('weighed', lang)}</span><span className="font-semibold">{num(listing.weighedTonnes ?? listing.tonnes, 1)} t</span></div>
      </div>
      <div className="flex items-start gap-1.5 bg-sage/20 px-3 py-2 text-[12px] font-semibold text-leaf">
        <Leaf size={14} className="mt-0.5 shrink-0" /> {t('co2', lang, { kg: kg.toLocaleString('en-IN') })}
      </div>
    </div>
  )
}
