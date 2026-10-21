# KhetKamai — Round 1 prototype

*Turn what you burn into what you earn.* Team Vibe Coders · BVCOE (GGSIPU), Delhi · Prompt-e-Thon 2026

A clickable demo of our WhatsApp-first crop-residue marketplace. Everything runs in the browser with demo data, so there is no login and no backend.

## Run it on Windows (easy way)

1. **Install Node.js (one time only).** Go to https://nodejs.org, download the **LTS** version, and install it with all the default options. Restart your laptop if it asks.
2. **Unzip** `KhetKamai_prototype.zip`. Right-click it → **Extract All** → **Extract**.
3. Open the extracted `khetkamai` folder and **double-click `start-demo.bat`**.
   - The first time, it downloads packages for 1–2 minutes. You need internet for this.
   - Chrome then opens at **http://localhost:5173** by itself. If it doesn't, open that address yourself.
4. **Keep the black window open** while you demo. Closing it stops the app.

## Run it from a terminal (any OS)

```bash
cd khetkamai
npm install
npm run dev
```

Then open http://localhost:5173 in Chrome.

## Open on a phone (same Wi-Fi)

When `npm run dev` runs, the black window shows a **Network** address such as `http://192.168.1.23:5173`. Open that address on a phone that is on the same Wi-Fi. Farmer view on the phone plus buyer view on the laptop makes a great demo.

> Two tabs on the **same** browser stay in sync live. A phone and a laptop each keep their own copy of the demo data.

## Put it online (optional, 1 minute, no coding)

The ready-built website is in the `dist` folder.

1. Go to https://app.netlify.com/drop and sign in with Google or GitHub.
2. Drag the **`dist`** folder onto the page.
3. You get a public link that you can open on the projector laptop or any phone.

## The demo (about 3 minutes)

1. Click **Reset demo** in the top bar first.
2. Open **Live Demo**.
3. In the phone, tap **📷 फोटो भेजें** → choose **सूखी धान की पराली** (dry paddy straw).
4. Tap **2 एकड़**, or tap the mic and say *"मेरे पास दो एकड़ पराली है"*. If the mic doesn't work, tap **Use demo voice**.
5. The AI grade card and the live price bars appear. Rajbir's listing pops up in the buyer list with a **NEW** badge.
6. Click **Make offer** on Rajbir's listing → type **1500** → **Send offer**. The farmer chat shows *नया ऑफ़र आया!*
7. In the phone, tap **✅ सबसे अच्छा ऑफ़र लें**. A pickup card appears.
8. Bottom-right: **Complete pickup & pay** → **Confirm weight & pay via UPI** → confetti, and the farmer gets the payment message.
9. Show the **Impact** page: the counters have gone up.

- Use the **EN / हिं** switch in the chat header to change language.
- The **Demo guide** button lists these steps.

## What is real vs simulated in Round 1

| Real | Simulated (Round 2/3) |
|---|---|
| Full farmer → buyer → agent flow and live updates between screens | WhatsApp itself (we show a WhatsApp-style chat) |
| Hindi voice-to-text (Chrome / Edge, needs mic permission) | AI vision grading. Round 1 uses rule-based grading in `src/lib/grading.ts` |
| Pricing engine, 6% fee, CO₂ estimate | UPI payment, Agmarknet price feed |

## Code map

- `src/lib/bot.ts`: WhatsApp bot conversation flow
- `src/lib/grading.ts`: `gradeResidue()`, where the Round 2 vision model plugs in
- `src/lib/pricing.ts`: pricing engine
- `src/store.ts`: shared data store (saved in the browser, syncs between tabs)
- `src/data/seed.ts`: demo data (farmers, buyers, agents, listings)
- `src/pages/*`: Landing, Live, Farmer, Buyer, Agent, Impact

See `disclosure_log.md` for the prompts, AI model, tools and open-source libraries used.

## Troubleshooting

- **"npm is not recognized"**: Node.js isn't installed, or the laptop needs a restart after installing it.
- **Port already in use**: close the other black window, or run `npm run dev -- --port 5174`.
- **Map is grey**: map tiles need internet. Everything else works offline once installed.
- **Mic doesn't work**: use Chrome, allow the microphone, or tap **Use demo voice**.
