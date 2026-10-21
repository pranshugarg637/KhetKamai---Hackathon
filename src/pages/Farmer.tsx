import { Languages, Mic, ScanSearch, Smartphone, Wifi } from 'lucide-react'
import FarmerChat from '../components/FarmerChat'
import { FadeIn, IconCircle, PhoneFrame, RoundBadge } from '../components/ui'

const POINTS = [
  { icon: Smartphone, title: 'Works on any phone', text: 'No app download. Rajbir just chats with a WhatsApp number he already uses.' },
  { icon: Mic, title: 'Voice-first, local language', text: 'Speak in Hindi — “मेरे पास दो एकड़ पराली है”. Haryanvi and Punjabi next.' },
  { icon: ScanSearch, title: 'AI grades from a photo', text: 'Type, dryness, mould and dirt — so buyers trust the quality before pickup.' },
  { icon: Languages, title: 'Fair price, in plain words', text: 'Live offers next to the local mandi rate, with the exact amount he will earn.' },
]

export default function Farmer() {
  return (
    <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-8 lg:grid-cols-[1fr_400px] lg:items-center">
      <FadeIn className="order-2 lg:order-1">
        <div className="label">Farmer experience · Rajbir, 41 · Kaithal</div>
        <h1 className="mt-2 text-[36px] font-bold leading-tight text-forest">Sell parali like booking a cab.</h1>
        <p className="mt-3 max-w-[520px] text-[16px] text-muted">
          One photo, one voice note, one tap. KhetKamai turns the residue Rajbir would burn into money in his UPI account — before wheat sowing.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {POINTS.map((p) => (
            <div key={p.title} className="card flex gap-3 p-4">
              <IconCircle icon={p.icon} />
              <div>
                <div className="font-bold">{p.title}</div>
                <div className="text-[13.5px] text-muted">{p.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <RoundBadge><Wifi size={12} /> WhatsApp Business API — Round 2</RoundBadge>
          <RoundBadge>Trained vision model — Round 2</RoundBadge>
        </div>
      </FadeIn>
      <div className="order-1 lg:order-2">
        <PhoneFrame className="h-[760px] max-h-[calc(100vh-110px)] min-h-[600px]">
          <FarmerChat />
        </PhoneFrame>
      </div>
    </div>
  )
}
