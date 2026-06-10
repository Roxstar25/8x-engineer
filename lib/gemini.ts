import { GoogleGenerativeAI } from '@google/generative-ai'

export type HoroscopePeriod = 'daily' | 'weekly' | 'monthly'

export interface HoroscopeReading {
  main: string
  love: string
  career: string
  wellness: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'astra'
  text: string
  createdAt: number
}

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? ''
// Treat the template placeholder as "no key" so offline fallbacks render
// instantly instead of attempting a doomed network call first.
export const isGeminiEnabled = API_KEY.length > 0 && API_KEY !== 'your_key_here'

// Lazily created so a missing key never throws at import time.
let _model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null
function getModel() {
  if (!isGeminiEnabled) return null
  if (!_model) {
    const genAI = new GoogleGenerativeAI(API_KEY)
    _model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  }
  return _model
}

// Pull a JSON object out of a model response that may be wrapped in prose/fences.
function extractJson<T>(raw: string): T | null {
  const fenced = raw.replace(/```json/gi, '').replace(/```/g, '')
  const start = fenced.indexOf('{')
  const end = fenced.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null
  try {
    return JSON.parse(fenced.slice(start, end + 1)) as T
  } catch {
    return null
  }
}

// ─── 1. Horoscope ───────────────────────────────────────────────────────────

export async function generateHoroscope(
  sign: string,
  period: HoroscopePeriod
): Promise<HoroscopeReading> {
  const model = getModel()
  if (!model) return fallbackHoroscope(sign, period)

  const prompt = `You are an astrologer. Write a ${period} horoscope for ${sign}.
Return JSON only: { "main": string, "love": string, "career": string, "wellness": string }
Each field is 2 sentences. Mystical but grounded tone.`

  try {
    const res = await model.generateContent(prompt)
    const parsed = extractJson<HoroscopeReading>(res.response.text())
    if (parsed && parsed.main) return parsed
    return fallbackHoroscope(sign, period)
  } catch (e) {
    console.warn('[gemini] horoscope failed:', e)
    return fallbackHoroscope(sign, period)
  }
}

// ─── 2. Compatibility summary ─────────────────────────────────────────────────

export async function generateCompatibility(
  signA: string,
  signB: string,
  scores: object
): Promise<string> {
  const model = getModel()
  if (!model) return fallbackCompatibility(signA, signB)

  const prompt = `You are an astrologer. ${signA} and ${signB} have these compatibility scores: ${JSON.stringify(
    scores
  )}.
Write a 3-sentence romantic compatibility summary. Be specific to these signs.`

  try {
    const res = await model.generateContent(prompt)
    const text = res.response.text().trim()
    return text || fallbackCompatibility(signA, signB)
  } catch (e) {
    console.warn('[gemini] compatibility failed:', e)
    return fallbackCompatibility(signA, signB)
  }
}

// ─── 3. Chat ──────────────────────────────────────────────────────────────────

export async function chatWithAstra(
  messages: ChatMessage[],
  userSign: string
): Promise<string> {
  const model = getModel()
  if (!model) return fallbackChat(messages, userSign)

  const system = `You are Astra, a mystical AI astrologer. The user's sun sign is ${userSign}. Give warm, specific, short answers (2-3 sentences). Always relate to their sign.`

  // Build Gemini conversation history. System context is injected into the
  // first user message. History must start with a user turn.
  const firstUserIdx = messages.findIndex((m) => m.role === 'user')
  const contents = messages
    .slice(firstUserIdx === -1 ? messages.length : firstUserIdx)
    .map((m, i) => ({
      role: m.role === 'astra' ? ('model' as const) : ('user' as const),
      parts: [{ text: i === 0 ? `${system}\n\nUser: ${m.text}` : m.text }],
    }))

  if (contents.length === 0) return fallbackChat(messages, userSign)

  try {
    const res = await model.generateContent({ contents })
    const text = res.response.text().trim()
    return text || fallbackChat(messages, userSign)
  } catch (e) {
    console.warn('[gemini] chat failed:', e)
    return fallbackChat(messages, userSign)
  }
}

// ─── 4. Planet interpretation ────────────────────────────────────────────────

export async function generatePlanetInterpretation(
  planet: string,
  sign: string
): Promise<string> {
  const model = getModel()
  if (!model) return fallbackPlanet(planet, sign)

  const prompt = `You are an astrologer. Explain what it means to have ${planet} in ${sign}.
Write exactly 3 sentences. Mystical but grounded tone. Be specific to this placement.`

  try {
    const res = await model.generateContent(prompt)
    const text = res.response.text().trim()
    return text || fallbackPlanet(planet, sign)
  } catch (e) {
    console.warn('[gemini] planet interpretation failed:', e)
    return fallbackPlanet(planet, sign)
  }
}

// ─── Offline fallbacks ──────────────────────────────────────────────────────
// Keep the app fully functional (and demo-able) without an API key.

function fallbackHoroscope(sign: string, period: HoroscopePeriod): HoroscopeReading {
  return {
    main: `The stars favor ${sign} this ${period}. Trust the quiet pull of your intuition — it is guiding you somewhere worthwhile.`,
    love: `An honest conversation could deepen a bond. Let warmth lead and the rest will follow.`,
    career: `Momentum builds where you stay consistent. A small, steady step outshines a grand gesture now.`,
    wellness: `Your energy renews when you slow down. Make space for rest and the cosmos will meet you there.`,
  }
}

function fallbackCompatibility(signA: string, signB: string): string {
  return `${signA} and ${signB} bring out contrasting yet complementary energies in one another. There is real warmth here when both honor each other's pace and instincts. Lead with patience, and this connection can grow steady and bright.`
}

function fallbackPlanet(planet: string, sign: string): string {
  return `With ${planet} in ${sign}, this part of your nature takes on the unmistakable color of the sign. It shapes how you express yourself in quiet, consistent ways that others come to recognize. Lean into it, and it becomes one of your truest strengths.`
}

function fallbackChat(messages: ChatMessage[], userSign: string): string {
  const last = [...messages].reverse().find((m) => m.role === 'user')
  const topic = last?.text?.trim()
  if (topic) {
    return `As a ${userSign}, you carry a natural intuition about "${topic.slice(0, 60)}". Trust your instincts here, and let your sign's strengths guide the next step.`
  }
  return `The stars are listening, ${userSign}. Ask me anything about your path, love, or the energy around you.`
}
