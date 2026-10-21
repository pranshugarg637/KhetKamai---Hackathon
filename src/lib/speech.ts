/** Thin wrapper around the browser Web Speech API (Chrome / Edge). */
export function speechSupported() {
  const w = window as any
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition)
}

export function startRecognition(opts: {
  lang?: string
  onResult: (text: string) => void
  onError: (code: string) => void
}) {
  const w = window as any
  const SR = w.SpeechRecognition || w.webkitSpeechRecognition
  if (!SR) {
    opts.onError('unsupported')
    return null
  }
  let gotResult = false
  try {
    const r = new SR()
    r.lang = opts.lang ?? 'hi-IN'
    r.interimResults = false
    r.maxAlternatives = 1
    r.onresult = (e: any) => {
      gotResult = true
      opts.onResult(String(e.results[0][0].transcript))
    }
    r.onerror = (e: any) => {
      if (!gotResult) opts.onError(e?.error || 'error')
    }
    r.onend = () => {
      if (!gotResult) opts.onError('no-speech')
    }
    r.start()
    return r
  } catch {
    opts.onError('error')
    return null
  }
}
