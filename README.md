# ✨ AstraAI — Mobile Astrology App

A dark-cosmic astrology app built with Expo + React Native + TypeScript, powered by
Google Gemini 2.0 Flash. No auth, no backend, no payments — everything persists locally
with AsyncStorage.

## Features

| Tab | What it does |
|---|---|
| **✨ Home** | Daily / weekly / monthly horoscope for your sign, with expandable Love · Career · Wellness cards. Readings are cached per sign + period + day. |
| **🌌 Chart** | Enter your name + birth date to generate a birth chart: an animated SVG zodiac wheel plus Sun / Moon / Mercury / Venus / Mars placements. Tap a planet for an AI interpretation. |
| **💫 Match** | Pick two signs and get a compatibility score with an animated arc, Love / Communication / Trust bars, and an AI-written romantic summary. |
| **🔮 Chat** | Chat with "Astra", a mystical AI astrologer that tailors every reply to your sun sign. History persists across restarts. |

## Setup

```bash
npm install
```

Create `.env.local` with your free Gemini API key (get one at https://aistudio.google.com/apikey):

```
EXPO_PUBLIC_GEMINI_API_KEY=your_actual_key
```

> Without a key the app still runs fully — Gemini-powered text falls back to built-in
> mystical placeholder readings, so all four tabs work for a demo.

Then start it:

```bash
npm start        # Expo dev server — press i for iOS simulator
npm run ios      # build + run on iOS
```

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm test            # jest (astrology logic + utils)
```

## Architecture

```
app/(tabs)/        index (Home) · chart · compatibility · chat
app/_layout.tsx    minimal provider stack → tabs (no auth gates)
components/        ZodiacWheel (SVG), SignPickerModal, TabBar, ui/*
contexts/          ProfileContext — shared { name, dob, sign }
constants/theme.ts cosmic color palette + element colors
lib/astrology.ts   sun sign, planet placements, compatibility matrix (local, deterministic)
lib/gemini.ts      Gemini calls + offline fallbacks
lib/storage.ts     AsyncStorage: profile, chat history, reading cache
```

All astrology math (sun sign, planets, compatibility 40–95 scoring) is local and
deterministic — Gemini is used only for prose (horoscopes, summaries, chat,
planet interpretations).

## Theme

Dark cosmic, no light mode. Palette lives in `constants/theme.ts`
(bg `#0A0A1A`, purple `#9B6DFF`, gold `#FFD700`) and is mirrored in `lib/theme.ts`
for the shared UI components.
