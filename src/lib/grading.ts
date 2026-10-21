import type { GradeDetails } from '../data/seed'
import { rand } from './utils'

export interface Sample {
  id: 'dry' | 'damp' | 'wheat'
  label: { en: string; hi: string }
  gradient: string
}

export const SAMPLES: Sample[] = [
  { id: 'dry', label: { en: 'Dry paddy straw', hi: 'सूखी धान की पराली' }, gradient: 'linear-gradient(135deg,#F0CF73 0%,#D9A93C 55%,#B9852A 100%)' },
  { id: 'damp', label: { en: 'Damp straw with mould', hi: 'गीली, फफूंद वाली पराली' }, gradient: 'linear-gradient(135deg,#8E9D73 0%,#5E6B4E 55%,#39432F 100%)' },
  { id: 'wheat', label: { en: 'Wheat straw', hi: 'गेहूँ का भूसा' }, gradient: 'linear-gradient(135deg,#F6E9C2 0%,#E6CF8E 55%,#C9AB62 100%)' },
]

/** Average colour of an image (data URL), used by the on-device demo grader. */
function averageColour(dataUrl: string): Promise<{ r: number; g: number; b: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = 40
      c.height = 40
      const ctx = c.getContext('2d')
      if (!ctx) return resolve({ r: 200, g: 170, b: 90 })
      ctx.drawImage(img, 0, 0, 40, 40)
      const d = ctx.getImageData(0, 0, 40, 40).data
      let r = 0, g = 0, b = 0
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2] }
      const n = d.length / 4
      resolve({ r: r / n, g: g / n, b: b / n })
    }
    img.onerror = () => resolve({ r: 200, g: 170, b: 90 })
    img.src = dataUrl
  })
}

function mock(sampleId: string): GradeDetails {
  if (sampleId === 'damp') return { type: 'paddy', grade: 'C', dryness: rand(52, 62), mould: 'high', dirt: 'medium', confidence: rand(84, 90), source: 'sample' }
  if (sampleId === 'wheat') return { type: 'wheat', grade: 'B', dryness: rand(80, 86), mould: 'low', dirt: 'low', confidence: rand(87, 93), source: 'sample' }
  return { type: 'paddy', grade: 'A', dryness: rand(88, 94), mould: 'none', dirt: 'low', confidence: rand(90, 96), source: 'sample' }
}

/**
 * Single entry point for residue grading.
 * Round 1: on-device colour heuristic for real photos + realistic mock for samples.
 * Round 2: replace the body with a call to the trained vision model (strict JSON).
 * It never throws — the demo can never get stuck.
 */
export async function gradeResidue(photo: { image?: string; sampleId?: string }): Promise<GradeDetails> {
  try {
    if (photo.sampleId) return mock(photo.sampleId)
    if (photo.image) {
      const { r, g, b } = await averageColour(photo.image)
      const brightness = (r + g + b) / 3
      const yellowness = (r + g) / 2 - b
      const greenness = g - r
      if (brightness > 115 && yellowness > 35 && greenness < 15)
        return { type: 'paddy', grade: 'A', dryness: rand(84, 92), mould: 'none', dirt: 'low', confidence: rand(80, 88), source: 'photo' }
      if (brightness < 85 || greenness > 15)
        return { type: 'paddy', grade: 'C', dryness: rand(50, 64), mould: 'high', dirt: 'medium', confidence: rand(76, 84), source: 'photo' }
      return { type: 'paddy', grade: 'B', dryness: rand(72, 82), mould: 'low', dirt: 'medium', confidence: rand(78, 86), source: 'photo' }
    }
  } catch {
    /* fall through */
  }
  return mock('dry')
}

/** Shrink an uploaded image so it fits comfortably in localStorage. */
export function fileToDataUrl(file: File, max = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * scale)
        c.height = Math.round(img.height * scale)
        c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.72))
      }
      img.onerror = () => resolve(String(reader.result))
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

const WORDS: Record<string, number> = {
  ek: 1, 'एक': 1, one: 1, do: 2, 'दो': 2, two: 2, teen: 3, 'तीन': 3, three: 3, char: 4, chaar: 4, 'चार': 4, four: 4,
  panch: 5, paanch: 5, 'पांच': 5, 'पाँच': 5, five: 5, chhe: 6, che: 6, 'छह': 6, 'छः': 6, six: 6, saat: 7, 'सात': 7, seven: 7,
  aath: 8, 'आठ': 8, eight: 8, nau: 9, 'नौ': 9, nine: 9, das: 10, 'दस': 10, ten: 10,
}
const UNIT = '(acres?|acer|ekad|ekar|एकड़|एकड़|एकड|किल्ला|किल्ले|killa|kille|bigha)'

/** Pull an acre count out of free text / speech ("2 acre", "do acre", "दो एकड़", "5 killa"). */
export function parseAcres(text: string): number | null {
  const s = text.toLowerCase()
  const d = s.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*' + UNIT, 'i'))
  if (d) return parseFloat(d[1])
  const w = s.match(new RegExp('([^\\s\\d]+)\\s*' + UNIT, 'i'))
  if (w && WORDS[w[1]] !== undefined) return WORDS[w[1]]
  return null
}
