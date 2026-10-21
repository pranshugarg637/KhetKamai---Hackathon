import { useEffect, useRef, useState, type ReactNode, type ComponentType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, IndianRupee, X } from 'lucide-react'
import type { Grade, Status } from '../data/seed'
import { cn } from '../lib/utils'

export function LogoMark({ size = 34, ring = 'ring-forest' }: { size?: number; ring?: string }) {
  return (
    <div className="relative shrink-0" style={{ width: size * 1.4, height: size }}>
      <div className="absolute left-0 top-0 rounded-full bg-terracotta flex items-center justify-center" style={{ width: size, height: size }}>
        <Flame className="text-white" size={size * 0.52} fill="white" strokeWidth={1.5} />
      </div>
      <div
        className={cn('absolute right-0 bottom-[-2px] rounded-full bg-mustard flex items-center justify-center ring-2', ring)}
        style={{ width: size * 0.66, height: size * 0.66 }}
      >
        <IndianRupee className="text-forest" size={size * 0.38} strokeWidth={3} />
      </div>
    </div>
  )
}

export function IconCircle({ icon: Icon, bg = 'bg-leaf', fg = 'text-white', size = 40 }: { icon: ComponentType<any>; bg?: string; fg?: string; size?: number }) {
  return (
    <span className={cn('inline-flex items-center justify-center rounded-full shrink-0', bg, fg)} style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.48)} strokeWidth={2.2} />
    </span>
  )
}

const gradeStyle: Record<Grade, string> = { A: 'bg-leaf text-white', B: 'bg-mustard text-forest', C: 'bg-terracotta text-white' }
export function GradePill({ grade, className }: { grade: Grade; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black', gradeStyle[grade], className)}>Grade {grade}</span>
}
export const gradeBg = (g: Grade) => gradeStyle[g]
export const gradeHex: Record<Grade, string> = { A: '#215C3A', B: '#E3A62F', C: '#D5573B' }

const statusStyle: Record<Status, string> = {
  Open: 'bg-sage/25 text-leaf',
  Matched: 'bg-mustard/25 text-[#875c08]',
  PickedUp: 'bg-leaf/15 text-leaf',
  Paid: 'bg-forest text-white',
}
const statusLabel: Record<Status, string> = { Open: 'Open', Matched: 'Matched', PickedUp: 'Picked up', Paid: 'Paid' }
export function StatusPill({ status }: { status: Status }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap', statusStyle[status])}>{statusLabel[status]}</span>
}

export function RoundBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border border-dashed border-mustard/70 bg-mustard/10 px-2.5 py-0.5 text-[11px] font-bold text-[#875c08] whitespace-nowrap', className)}>
      {children}
    </span>
  )
}

export function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 1000 }: { value: number; decimals?: number; prefix?: string; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(value)
  const shown = useRef(value)
  const first = useRef(true)
  useEffect(() => {
    const from = first.current ? 0 : shown.current
    first.current = false
    const to = value
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const e = 1 - Math.pow(1 - p, 3)
      const v = from + (to - from) * e
      shown.current = v
      setDisplay(v)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return (
    <>
      {prefix}
      {display.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </>
  )
}

export function Modal({ open, onClose, title, children, width = 'max-w-md' }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; width?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] bg-ink/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className={cn('card w-full p-6', width)}
          >
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[22px] font-semibold">{title}</h3>
                <button onClick={onClose} className="rounded-full p-1.5 hover:bg-cream" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[380px] rounded-[2.6rem] bg-[#141c17] p-[10px] shadow-phone', className)}>
      <div className="absolute left-1/2 top-[14px] z-30 h-[22px] w-[110px] -translate-x-1/2 rounded-full bg-[#141c17]" />
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white">{children}</div>
    </div>
  )
}

export function SectionTitle({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        {eyebrow && <div className="label mb-1">{eyebrow}</div>}
        <h2 className="text-[22px] font-semibold text-forest">{title}</h2>
      </div>
      {right}
    </div>
  )
}

export function FadeIn({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }} className={className}>
      {children}
    </motion.div>
  )
}
