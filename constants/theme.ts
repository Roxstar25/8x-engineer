// Dark cosmic theme — single source of truth for colors used across AstraAI.
// No light mode.

export const colors = {
  bg: '#0A0A1A',
  surface: '#12122A',
  purple: '#9B6DFF',
  gold: '#FFD700',
  pink: '#FF6B9D',
  textPrimary: '#F0EDFF',
  textSecondary: '#8A88A8',
  border: 'rgba(155,109,255,0.2)',
}

export const card = {
  backgroundColor: colors.surface,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 16,
}

// Element colors used by the zodiac wheel and sign badges.
export type Element = 'fire' | 'earth' | 'air' | 'water'

export const elementColors: Record<Element, string> = {
  fire: '#FF6B4A',
  earth: '#4CAF50',
  air: '#FFD700',
  water: '#4FC3F7',
}
