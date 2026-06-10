/**
 * 🎨 BRAND — central theme constants.
 *
 * Change ACCENT (and the matching tailwind.config.js color) to rebrand the
 * entire app in one edit. All components import from here instead of
 * hardcoding color strings.
 *
 * Steps to rebrand:
 *   1. Change ACCENT below to your hex color
 *   2. Change the `accent` key in tailwind.config.js to the same hex
 *   3. Optionally change BG for a different dark shade
 */

// ── Primary brand color ───────────────────────────────────────────────────────
// Cosmic purple — matches constants/theme.ts `colors.purple`.
export const ACCENT = '#9B6DFF'

// Derived from ACCENT — adjust opacity as needed
export const ACCENT_DIM = 'rgba(155,109,255,0.12)'
export const ACCENT_BORDER = 'rgba(155,109,255,0.30)'
export const ACCENT_GLOW = 'rgba(155,109,255,0.20)'
// Text color on dark background using accent tone
export const ACCENT_LIGHT = '#C4A9FF'

// Gold — secondary cosmic accent
export const GOLD = '#FFD700'

// ── Backgrounds ───────────────────────────────────────────────────────────────
export const BG = '#0A0A1A'        // main app background (cosmic)
export const SURFACE = '#12122A'        // cards, inputs
export const SURFACE2 = '#1B1B38'        // elevated surface (sheet panels, etc.)
export const SURFACE3 = '#242450'        // even more elevated

// ── Text ──────────────────────────────────────────────────────────────────────
export const TEXT_PRIMARY = '#F0EDFF'
export const TEXT_SECONDARY = '#8A88A8'
export const TEXT_TERTIARY = 'rgba(240,237,255,0.38)'
export const TEXT_DISABLED = 'rgba(240,237,255,0.20)'

// ── Borders ───────────────────────────────────────────────────────────────────
export const BORDER = 'rgba(155,109,255,0.2)'
export const BORDER_ACTIVE = 'rgba(155,109,255,0.4)'

// ── Semantic ──────────────────────────────────────────────────────────────────
export const ERROR = '#f87171'
export const ERROR_DIM = 'rgba(248,113,113,0.10)'
export const WARNING = '#fbbf24'
export const SUCCESS = '#4ade80'

// ── Tab bar ───────────────────────────────────────────────────────────────────
export const TAB_ACTIVE = ACCENT
export const TAB_INACTIVE = '#8A88A8'
export const TAB_HEIGHT = 68
