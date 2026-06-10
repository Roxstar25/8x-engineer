// Core astrology data + lookups. All logic is local and deterministic — no API.
import type { Element } from '@/constants/theme'

export type { Element }

export interface ZodiacSign {
  name: string
  symbol: string // unicode glyph
  element: Element
  traits: string
  // Date range (inclusive). Capricorn wraps the year boundary.
  start: { month: number; day: number } // month is 1-12
  end: { month: number; day: number }
}

export const ZODIAC: ZodiacSign[] = [
  { name: 'Aries', symbol: '♈', element: 'fire', traits: 'Bold, driven, and fiercely independent.', start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
  { name: 'Taurus', symbol: '♉', element: 'earth', traits: 'Grounded, loyal, and quietly determined.', start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
  { name: 'Gemini', symbol: '♊', element: 'air', traits: 'Curious, quick-witted, and endlessly social.', start: { month: 5, day: 21 }, end: { month: 6, day: 20 } },
  { name: 'Cancer', symbol: '♋', element: 'water', traits: 'Nurturing, intuitive, and deeply feeling.', start: { month: 6, day: 21 }, end: { month: 7, day: 22 } },
  { name: 'Leo', symbol: '♌', element: 'fire', traits: 'Radiant, generous, and born to lead.', start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
  { name: 'Virgo', symbol: '♍', element: 'earth', traits: 'Precise, thoughtful, and quietly devoted.', start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
  { name: 'Libra', symbol: '♎', element: 'air', traits: 'Harmonious, charming, and ever fair-minded.', start: { month: 9, day: 23 }, end: { month: 10, day: 22 } },
  { name: 'Scorpio', symbol: '♏', element: 'water', traits: 'Intense, magnetic, and fiercely loyal.', start: { month: 10, day: 23 }, end: { month: 11, day: 21 } },
  { name: 'Sagittarius', symbol: '♐', element: 'fire', traits: 'Adventurous, honest, and forever seeking.', start: { month: 11, day: 22 }, end: { month: 12, day: 21 } },
  { name: 'Capricorn', symbol: '♑', element: 'earth', traits: 'Ambitious, disciplined, and built to endure.', start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
  { name: 'Aquarius', symbol: '♒', element: 'air', traits: 'Visionary, independent, and refreshingly original.', start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
  { name: 'Pisces', symbol: '♓', element: 'water', traits: 'Dreamy, compassionate, and deeply imaginative.', start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
]

export const SIGN_NAMES: string[] = ZODIAC.map((z) => z.name)

export function getSignByName(name: string): ZodiacSign | undefined {
  return ZODIAC.find((z) => z.name.toLowerCase() === name.trim().toLowerCase())
}

/** Returns the sun sign for a date of birth. */
export function getSunSign(dob: Date): ZodiacSign {
  const month = dob.getMonth() + 1 // 1-12
  const day = dob.getDate()

  for (const sign of ZODIAC) {
    const { start, end } = sign
    if (start.month <= end.month) {
      // Normal range within a single year
      if (
        (month === start.month && day >= start.day) ||
        (month === end.month && day <= end.day) ||
        (month > start.month && month < end.month)
      ) {
        return sign
      }
    } else {
      // Wrapping range (Capricorn: Dec 22 – Jan 19)
      if (
        (month === start.month && day >= start.day) ||
        (month === end.month && day <= end.day) ||
        month > start.month ||
        month < end.month
      ) {
        return sign
      }
    }
  }
  // Fallback (should never hit)
  return ZODIAC[0]
}

// ─── Planets ────────────────────────────────────────────────────────────────
// Simplified: birth month approximates the inner-planet placements. The Sun is
// the real sun sign; the rest are offset deterministically for a plausible chart.

export interface PlanetRow {
  planet: string
  emoji: string
  sign: string
  symbol: string
  element: Element
  meaning: string
}

const PLANET_DEFS: { planet: string; emoji: string; offset: number; meaning: string }[] = [
  { planet: 'Sun', emoji: '☀️', offset: 0, meaning: 'Your core identity and life force.' },
  { planet: 'Moon', emoji: '🌙', offset: 3, meaning: 'Your emotions and inner world.' },
  { planet: 'Mercury', emoji: '☿', offset: 1, meaning: 'How you think and communicate.' },
  { planet: 'Venus', emoji: '♀️', offset: 2, meaning: 'How you love and what you value.' },
  { planet: 'Mars', emoji: '♂️', offset: 5, meaning: 'Your drive, passion, and energy.' },
]

export function getPlanetSigns(dob: Date): PlanetRow[] {
  const sunSign = getSunSign(dob)
  const sunIndex = ZODIAC.findIndex((z) => z.name === sunSign.name)

  return PLANET_DEFS.map(({ planet, emoji, offset, meaning }) => {
    const sign = planet === 'Sun' ? sunSign : ZODIAC[(sunIndex + offset) % 12]
    return {
      planet,
      emoji,
      sign: sign.name,
      symbol: sign.symbol,
      element: sign.element,
      meaning,
    }
  })
}

// ─── Compatibility ────────────────────────────────────────────────────────────

export interface CompatibilityResult {
  overall: number
  love: number
  communication: number
  trust: number
}

// Element-pair base score. Higher for same element and classic complements
// (fire+air, earth+water); lower for clashing pairs.
function elementBase(a: Element, b: Element): number {
  if (a === b) return 86
  const complement: Record<Element, Element> = {
    fire: 'air',
    air: 'fire',
    earth: 'water',
    water: 'earth',
  }
  if (complement[a] === b) return 82
  // Clashing pairs (fire+water, earth+air) score lowest; the rest are neutral.
  const clash =
    (a === 'fire' && b === 'water') ||
    (a === 'water' && b === 'fire') ||
    (a === 'earth' && b === 'air') ||
    (a === 'air' && b === 'earth')
  return clash ? 47 : 60
}

function clamp40to95(n: number): number {
  return Math.max(40, Math.min(95, Math.round(n)))
}

// Order-independent seed so A↔B is symmetric.
function pairSeed(a: string, b: string): number {
  const key = [a.toLowerCase(), b.toLowerCase()].sort().join('|')
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100000
  return h
}

export function getCompatibility(signA: string, signB: string): CompatibilityResult {
  const a = getSignByName(signA)
  const b = getSignByName(signB)
  if (!a || !b) return { overall: 50, love: 50, communication: 50, trust: 50 }

  const base = elementBase(a.element, b.element)
  const seed = pairSeed(a.name, b.name)

  // Communication favors air/fire; trust favors earth/water.
  const commBias =
    (a.element === 'air' || a.element === 'fire' ? 4 : -2) +
    (b.element === 'air' || b.element === 'fire' ? 4 : -2)
  const trustBias =
    (a.element === 'earth' || a.element === 'water' ? 4 : -2) +
    (b.element === 'earth' || b.element === 'water' ? 4 : -2)

  const love = clamp40to95(base + ((seed % 13) - 6))
  const communication = clamp40to95(base + commBias + ((Math.floor(seed / 7) % 9) - 4))
  const trust = clamp40to95(base + trustBias + ((Math.floor(seed / 13) % 9) - 4))
  const overall = clamp40to95((love + communication + trust) / 3)

  return { overall, love, communication, trust }
}
