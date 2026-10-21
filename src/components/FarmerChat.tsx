import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Camera, CheckCheck, Mic, MoreVertical, Paperclip, Phone, SendHorizontal, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '../store'
import type { ChatMsg, Lang } from '../data/seed'
import { t } from '../lib/i18n'
import { SAMPLES, fileToDataUrl } from '../lib/grading'
import { startRecognition } from '../lib/speech'
import * as bot from '../lib/bot'
import { cn, fmtTime } from '../lib/utils'
import { LogoMark } from './ui'
import { AnalysingCard, GradeCard, PaymentCard, PickupCard, PriceCard, SampleThumb } from './ChatCards'

type RecState = null | 'listening' | 'unsupported' | 'error'

export default function FarmerChat() {
  const messages = useStore((s) => s.chat.messages)
  const stage = useStore((s) => s.chat.stage)
  const lang = useStore((s) => s.settings.lang)
  const setLang = useStore((s) => s.setLang)
  const typing = useStore((s) => s.botTyping)

  const [sheet, setSheet] = useState(false)
  const [rec, setRec] = useState<RecState>(null)
  const [text, setText] = useState('')
  const recRef = useRef<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const id = setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }), 60)
    return () => clearTimeout(id)
  }, [messages.length, typing, stage])

  const latestPrice = useMemo(() => {
    const m: Record<string, string> = {}
    messages.forEach((x) => { if (x.kind === 'price' && x.listingId) m[x.listingId] = x.id })
    return m
  }, [messages])

  const canPhoto = ['start', 'awaitPhoto', 'awaitAcres', 'paid'].includes(stage)

  const startVoice = () => {
    setRec('listening')
    recRef.current = startRecognition({
      lang: 'hi-IN',
      onResult: (txt) => { setRec(null); bot.sendText(txt, true) },
      onError: (code) => setRec(code === 'unsupported' ? 'unsupported' : 'error'),
    })
  }
  const closeVoice = () => { try { recRef.current?.abort?.() } catch { /* ignore */ } setRec(null) }
  const demoVoice = () => {
    closeVoice()
    bot.sendText(lang === 'hi' ? 'मेरे पास दो एकड़ पराली है' : 'I have 2 acres of paddy straw', true)
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setSheet(false)
    try {
      const data = await fileToDataUrl(f)
      bot.sendPhoto({ image: data })
    } catch {
      toast.error('Could not read that photo — try a sample photo instead.')
    }
  }

  const submitText = () => {
    if (!text.trim()) return
    bot.sendText(text)
    setText('')
  }

  type Chip = { label: string; on: () => void; primary?: boolean }
  let chips: Chip[] = []
  if (stage === 'start' || stage === 'awaitPhoto')
    chips = [
      { label: t('chipPhoto', lang), on: () => setSheet(true), primary: true },
      { label: t('chipVoice', lang), on: startVoice },
      { label: t('chipSales', lang), on: bot.mySales },
    ]
  else if (stage === 'awaitAcres')
    chips = [
      ...[1, 2, 5].map((n) => ({ label: t('acresN', lang, { n }), on: () => bot.chooseAcres(n), primary: n === 2 })),
      { label: t('acresTen', lang), on: () => bot.chooseAcres(10) },
      { label: '🎤', on: startVoice },
    ]
  else if (stage === 'priced')
    chips = [
      { label: t('chipAccept', lang), on: bot.acceptBest, primary: true },
      { label: t('chipWait', lang), on: bot.waitForOffers },
    ]
  else if (stage === 'accepted') chips = [{ label: t('chipSales', lang), on: bot.mySales }]
  else if (stage === 'paid')
    chips = [
      { label: t('chipSellMore', lang), on: bot.sellMore, primary: true },
      { label: t('chipSales', lang), on: bot.mySales },
    ]

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 bg-leaf px-3 pb-2.5 pt-9 text-white">
        <ArrowLeft size={20} className="opacity-90" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
          <LogoMark size={20} ring="ring-white" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1 text-[15px] font-bold">
            KhetKamai Bot
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-mustard text-[9px] font-black text-forest">✓</span>
          </div>
          <div className="text-[11.5px] text-white/80">{typing ? t('typing', lang) : t('online', lang)}</div>
        </div>
        <div className="flex rounded-full bg-white/15 p-0.5 text-[11px] font-bold">
          {(['en', 'hi'] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={cn('rounded-full px-2 py-0.5 transition', lang === l ? 'bg-white text-leaf' : 'text-white/85')}>
              {l === 'en' ? 'EN' : 'हिं'}
            </button>
          ))}
        </div>
        
        <Phone size={17} className="opacity-90" />
        <MoreVertical size={18} className="opacity-90" />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="wa-wallpaper thin-scroll flex-1 space-y-1.5 overflow-y-auto px-2.5 py-3">
        <div className="mx-auto mb-2 w-fit rounded-lg bg-[#FFF5D6] px-3 py-1 text-center text-[10.5px] text-[#6d5a1f] shadow-sm">
          🔒 {lang === 'hi' ? 'आपकी जानकारी सुरक्षित है · सिर्फ़ खरीदार को ग्रेड दिखेगा' : 'Your details are private · buyers only see the grade'}
        </div>
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <Bubble key={m.id} m={m} lang={lang} stalePrice={m.kind === 'price' && !!m.listingId && latestPrice[m.listingId] !== m.id} />
          ))}
        </AnimatePresence>
        {typing && (
          <div className="flex">
            <div className="rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="typing-dot h-2 w-2 rounded-full bg-muted" style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick replies */}
      {chips.length > 0 && !typing && (
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto bg-[#F4F1EA] px-2.5 pt-2">
          {chips.map((c) => (
            <button
              key={c.label}
              onClick={c.on}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition active:scale-95',
                c.primary ? 'border-leaf bg-leaf text-white hover:bg-forest' : 'border-leaf/30 bg-white text-leaf hover:bg-sage/15',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {stage === 'accepted' && !typing && (
        <div className="bg-[#F4F1EA] px-3 pt-1.5 text-center text-[11px] font-semibold text-muted">⏳ {t('waitingPickup', lang)}</div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-1.5 bg-[#F4F1EA] px-2 py-2">
        <div className="flex flex-1 items-center gap-1 rounded-full bg-white px-2.5 py-1.5 shadow-sm">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitText()}
            placeholder={t('typeHere', lang)}
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted/70"
          />
          <button onClick={() => (canPhoto ? setSheet(true) : toast(t('busySale', lang)))} className="p-1 text-muted hover:text-leaf" aria-label="Attach">
            <Paperclip size={18} />
          </button>
          <button onClick={() => (canPhoto ? setSheet(true) : toast(t('busySale', lang)))} className="p-1 text-muted hover:text-leaf" aria-label="Camera">
            <Camera size={18} />
          </button>
        </div>
        <button
          onClick={text.trim() ? submitText : startVoice}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf text-white shadow transition hover:bg-forest active:scale-90"
          aria-label={text.trim() ? 'Send' : 'Voice note'}
        >
          {text.trim() ? <SendHorizontal size={18} /> : <Mic size={19} />}
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      {/* Photo sheet */}
      <AnimatePresence>
        {sheet && (
          <motion.div className="absolute inset-0 z-20 flex items-end bg-black/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)}>
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="w-full rounded-t-3xl bg-white p-4"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
              <div className="flex items-center justify-between">
                <div className="font-serif text-[17px] font-semibold text-forest">{t('choosePhoto', lang)}</div>
                <button onClick={() => setSheet(false)} className="rounded-full p-1 hover:bg-cream"><X size={18} /></button>
              </div>
              <div className="label mt-3 mb-2">{t('sampleHint', lang)}</div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLES.map((s) => (
                  <button key={s.id} onClick={() => { setSheet(false); bot.sendPhoto({ sampleId: s.id }) }} className="transition hover:-translate-y-0.5 active:scale-95">
                    <SampleThumb sampleId={s.id} lang={lang} className="h-[92px] w-full" />
                  </button>
                ))}
              </div>
              <button onClick={() => fileRef.current?.click()} className="btn-ghost mt-3 w-full">
                <Upload size={16} /> {t('upload', lang)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice overlay */}
      <AnimatePresence>
        {rec && (
          <motion.div className="absolute inset-0 z-20 flex items-end bg-black/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ y: 240 }} animate={{ y: 0 }} exit={{ y: 240 }} transition={{ type: 'spring', damping: 26, stiffness: 300 }} className="w-full rounded-t-3xl bg-white p-5 text-center">
              {rec === 'listening' ? (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta text-white pulse-new">
                    <Mic size={28} />
                  </div>
                  <div className="mt-3 flex h-8 items-center justify-center gap-1">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span key={i} className="wave-bar w-1 rounded-full bg-leaf" style={{ height: 8 + ((i * 7) % 22), animationDelay: `${(i % 6) * 0.11}s` }} />
                    ))}
                  </div>
                  <div className="mt-2 font-bold text-forest">{t('listening', lang)}</div>
                  <div className="text-[12.5px] text-muted">{t('voiceExample', lang)}</div>
                </>
              ) : (
                <div className="py-2 text-[13.5px] text-ink">{t(rec === 'unsupported' ? 'voiceUnsupported' : 'voiceError', lang)}</div>
              )}
              <div className="mt-4 flex gap-2">
                <button onClick={closeVoice} className="btn-ghost flex-1">{t('cancel', lang)}</button>
                {rec === 'error' && <button onClick={startVoice} className="btn-ghost flex-1">{t('tryAgain', lang)}</button>}
                <button onClick={demoVoice} className="btn-primary flex-1">{t('demoVoice', lang)}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Bubble({ m, lang, stalePrice }: { m: ChatMsg; lang: Lang; stalePrice: boolean }) {
  const mine = m.from === 'farmer'
  const wide = ['grade', 'price', 'pickup', 'payment', 'analysing'].includes(m.kind)
  let body: React.ReactNode = null
  switch (m.kind) {
    case 'text':
      body = <div className="whitespace-pre-wrap text-[14px] leading-snug">{m.key ? t(m.key, lang, m.params) : m.text}</div>
      break
    case 'voice':
      body = (
        <div className="w-[210px]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-leaf text-white"><Mic size={14} /></span>
            <div className="flex h-5 flex-1 items-center gap-[2px]">
              {Array.from({ length: 22 }).map((_, i) => (
                <span key={i} className="w-[3px] rounded-full bg-leaf/60" style={{ height: 4 + ((i * 5) % 14) }} />
              ))}
            </div>
            <span className="text-[11px] text-muted">0:0{3 + (m.text?.length ?? 0) % 5}</span>
          </div>
          <div className="mt-1.5 text-[13px] italic text-ink/80">“{m.text}”</div>
        </div>
      )
      break
    case 'sample':
      body = <SampleThumb sampleId={m.sampleId ?? 'dry'} lang={lang} className="h-36 w-52" />
      break
    case 'image':
      body = <img src={m.image} alt="Uploaded parali" className="h-40 w-52 rounded-xl object-cover" />
      break
    case 'analysing':
      body = <AnalysingCard lang={lang} />
      break
    case 'grade':
      body = m.details ? <GradeCard d={m.details} acres={Number(m.params?.acres ?? 2)} tonnes={Number(m.params?.tonnes ?? 5)} lang={lang} /> : null
      break
    case 'price':
      body = stalePrice ? <div className="text-[12.5px] italic text-muted">{t('offersUpdated', lang)}</div> : m.listingId ? <PriceCard listingId={m.listingId} lang={lang} /> : null
      break
    case 'pickup':
      body = m.listingId ? <PickupCard listingId={m.listingId} lang={lang} /> : null
      break
    case 'payment':
      body = m.listingId ? <PaymentCard listingId={m.listingId} lang={lang} /> : null
      break
  }
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      className={cn('flex', mine ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'relative max-w-[86%] px-2.5 pb-1 pt-2 shadow-sm',
          mine ? 'rounded-2xl rounded-tr-sm bg-[#D9FDD3]' : 'rounded-2xl rounded-tl-sm bg-white',
          wide && 'px-3 pt-2.5',
          (m.kind === 'sample' || m.kind === 'image') && 'p-1 pb-1',
        )}
      >
        {body}
        <div className={cn('mt-0.5 flex items-center justify-end gap-1 text-[10px] text-muted', (m.kind === 'sample' || m.kind === 'image') && 'px-1')}>
          {fmtTime(m.time)}
          {mine && <CheckCheck size={14} className="text-sky-500" />}
        </div>
      </div>
    </motion.div>
  )
}
