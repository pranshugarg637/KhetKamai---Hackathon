import type { Lang } from '../data/seed'

type Entry = { en: string; hi: string }

const DICT: Record<string, Entry> = {
  greet: {
    en: "Namaste Rajbir ji! 🙏 Don't burn your parali — sell it. Send a photo or a voice note and I'll find you the best price. 🌾",
    hi: 'नमस्ते राजबीर जी! 🙏 पराली जलाइए मत, बेचिए। फोटो या वॉइस नोट भेजिए — सबसे अच्छा दाम हम दिलाएँगे। 🌾',
  },
  askPhoto: { en: 'Send a photo of your parali 📷', hi: 'अपनी पराली की एक फोटो भेजिए 📷' },
  askAcres: { en: 'Got the photo 👍 How many acres of parali do you have?', hi: 'फोटो मिल गई 👍 कितने एकड़ की पराली है?' },
  gotAcres: { en: 'Got it — {acres} acres. Now send a photo of the parali 📷', hi: 'ठीक है — {acres} एकड़। अब पराली की फोटो भेजिए 📷' },
  notUnderstood: { en: "Sorry, I couldn't catch the acres. Please pick one 👇", hi: 'माफ़ कीजिए, एकड़ समझ नहीं आया। नीचे से चुनिए 👇' },
  hint: { en: 'Send a photo 📷 or tell me how many acres you have 🎤', hi: 'फोटो भेजिए 📷 या बोलकर बताइए कितने एकड़ हैं 🎤' },
  busySale: { en: 'Your current sale is in progress 🙂 I will update you here.', hi: 'आपकी अभी की बिक्री चल रही है 🙂 यहीं अपडेट देंगे।' },
  analysing: { en: 'Checking quality with AI…', hi: 'AI से जाँच हो रही है…' },
  offersIntro: { en: 'Live offers for your parali are here 👇', hi: 'आपकी पराली के लिए ताज़ा ऑफ़र आ गए 👇' },
  newOffer: { en: '🔔 New offer! {buyer} is offering ₹{price}/tonne.', hi: '🔔 नया ऑफ़र आया! {buyer} ₹{price}/टन दे रहा है।' },
  waiting: { en: "Sure 👍 I'll tell you as soon as a better offer comes.", hi: 'ठीक है 👍 बेहतर ऑफ़र आते ही बताएँगे।' },
  sellMoreAsk: { en: 'Great! Send a photo of the next lot 📷', hi: 'बढ़िया! अगले ढेर की फोटो भेजिए 📷' },
  mySales: {
    en: '📋 Your sales: {count} paid · Total earned ₹{total}. Pickups pending: {pending}.',
    hi: '📋 आपकी बिक्री: {count} भुगतान · कुल कमाई ₹{total}। बाकी पिकअप: {pending}।',
  },
  acresN: { en: '{n} acres', hi: '{n} एकड़' },
  acresTen: { en: '10+ acres', hi: '10+ एकड़' },

  chipPhoto: { en: '📷 Send photo', hi: '📷 फोटो भेजें' },
  chipVoice: { en: '🎤 Voice note', hi: '🎤 बोलकर बताएँ' },
  chipSales: { en: '📋 My sales', hi: '📋 मेरी बिक्री' },
  chipAccept: { en: '✅ Accept best offer', hi: '✅ सबसे अच्छा ऑफ़र लें' },
  chipWait: { en: '⏳ Wait for more offers', hi: '⏳ और ऑफ़र का इंतज़ार' },
  chipSellMore: { en: '🌾 Sell more', hi: '🌾 और बेचें' },

  typeHere: { en: 'Type a message', hi: 'संदेश लिखें' },
  online: { en: 'online', hi: 'ऑनलाइन' },
  typing: { en: 'typing…', hi: 'लिख रहा है…' },
  choosePhoto: { en: 'Send a photo of your parali', hi: 'पराली की फोटो भेजें' },
  sampleHint: { en: 'Demo sample photos', hi: 'डेमो फोटो' },
  upload: { en: 'Upload / take a real photo', hi: 'असली फोटो अपलोड करें / खींचें' },
  listening: { en: 'Listening… speak now', hi: 'सुन रहा हूँ… बोलिए' },
  voiceExample: { en: 'Try: “मेरे पास दो एकड़ पराली है”', hi: 'जैसे: “मेरे पास दो एकड़ पराली है”' },
  stop: { en: 'Done', hi: 'हो गया' },
  demoVoice: { en: 'Use demo voice', hi: 'डेमो आवाज़' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  voiceUnsupported: { en: "Voice input isn't available in this browser. Use Chrome, or tap “Use demo voice”.", hi: 'इस ब्राउज़र में आवाज़ नहीं चल रही। Chrome खोलें या “डेमो आवाज़” दबाएँ।' },
  voiceError: { en: "Didn't catch that. Try again or tap “Use demo voice”.", hi: 'सुनाई नहीं दिया। दोबारा बोलिए या “डेमो आवाज़” दबाएँ।' },
  tryAgain: { en: 'Try again', hi: 'फिर बोलें' },

  gradeTitle: { en: 'AI quality report', hi: 'AI गुणवत्ता रिपोर्ट' },
  grade: { en: 'Grade', hi: 'ग्रेड' },
  dryness: { en: 'Dryness', hi: 'सूखापन' },
  mould: { en: 'Mould', hi: 'फफूंद' },
  dirt: { en: 'Dirt / soil', hi: 'मिट्टी' },
  confidence: { en: 'confidence', hi: 'भरोसा' },
  estQty: { en: 'Estimated quantity', hi: 'अनुमानित मात्रा' },
  none: { en: 'None', hi: 'नहीं' },
  low: { en: 'Low', hi: 'कम' },
  medium: { en: 'Medium', hi: 'मध्यम' },
  high: { en: 'High', hi: 'ज़्यादा' },
  paddy: { en: 'Paddy straw', hi: 'धान की पराली' },
  wheat: { en: 'Wheat straw', hi: 'गेहूँ का भूसा' },
  gradeA: { en: 'Premium — ready for biogas & paper', hi: 'बढ़िया — बायोगैस और पेपर के लिए तैयार' },
  gradeB: { en: 'Good — fit for feed & mushroom', hi: 'अच्छा — चारा और मशरूम के लिए ठीक' },
  gradeC: { en: 'Fair — compost & biogas use', hi: 'ठीक-ठाक — खाद और बायोगैस के लिए' },

  priceTitle: { en: 'Live offers (₹ per tonne)', hi: 'ताज़ा ऑफ़र (₹ प्रति टन)' },
  localRate: { en: 'Local mandi rate', hi: 'लोकल मंडी रेट' },
  bestOffer: { en: 'Best offer: +{pct}% vs local rate', hi: 'सबसे अच्छा ऑफ़र: लोकल रेट से +{pct}%' },
  localBest: { en: 'Local rate is best right now', hi: 'अभी लोकल रेट ही सबसे अच्छा है' },
  fee: { en: 'Platform fee (6%)', hi: 'प्लेटफ़ॉर्म फ़ीस (6%)' },
  youEarn: { en: 'You earn', hi: 'आपकी कमाई' },
  illustrative: { en: 'Illustrative data', hi: 'उदाहरण डेटा' },
  offersUpdated: { en: 'Offers updated — see latest below ↓', hi: 'ऑफ़र अपडेट हुए — नीचे देखें ↓' },
  acceptedAt: { en: 'Accepted: {buyer} @ ₹{price}/t', hi: 'स्वीकार: {buyer} @ ₹{price}/टन' },

  pickupTitle: { en: 'Pickup booked ✅', hi: 'पिकअप बुक हो गया ✅' },
  pickupOn: { en: 'Pickup on {date} — before wheat sowing', hi: 'पिकअप {date} को — गेहूँ बुवाई से पहले' },
  agent: { en: 'Your agent', hi: 'आपका एजेंट' },
  payAfter: { en: 'Payment by UPI right after weighing', hi: 'तौल के बाद तुरंत UPI से भुगतान' },
  cluster: { en: 'Shared pickup with 3 nearby farmers = lower transport cost', hi: 'पास के 3 किसानों के साथ साझा पिकअप = कम किराया' },
  waitingPickup: { en: 'Waiting for agent pickup…', hi: 'एजेंट पिकअप का इंतज़ार…' },

  paidTitle: { en: 'Payment received', hi: 'भुगतान मिल गया' },
  paidMsg: { en: '₹{amount} credited to your UPI', hi: '₹{amount} आपके UPI में आ गए' },
  txn: { en: 'UPI Ref', hi: 'UPI रेफ़' },
  weighed: { en: 'Weighed', hi: 'तौल' },
  co2: { en: 'You saved {kg} kg of CO₂. Thank you for not burning!', hi: 'आपने {kg} किलो CO₂ बचाई। पराली न जलाने के लिए धन्यवाद!' },
}

export function t(key: string, lang: Lang, params: Record<string, string | number> = {}) {
  const e = DICT[key]
  let s = e ? e[lang] : key
  for (const k of Object.keys(params)) s = s.split(`{${k}}`).join(String(params[k]))
  return s
}
