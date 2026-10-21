import clsx, { type ClassValue } from 'clsx'

export const cn = (...c: ClassValue[]) => clsx(c)
export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
export const num = (n: number, d = 0) => n.toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: 0 })
export const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9)
export const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min))
export const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
export const fmtDate = (ms: number, lang: 'en' | 'hi' = 'en') =>
  new Date(ms).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

export function timeAgo(ms: number) {
  const s = Math.max(1, Math.round((Date.now() - ms) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  const d = Math.round(h / 24)
  return `${d} d ago`
}

export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}

export const txnId = () => String(Math.floor(100000000000 + Math.random() * 899999999999))
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
