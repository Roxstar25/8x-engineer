/** @type {import('tailwindcss').Config} */

// 🎨 BRAND: Change 'accent' to your brand color.
// All NativeWind classes using bg-accent, text-accent, border-accent update automatically.
// Also update Theme.accent in lib/theme.ts to match.

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0A0A1A',
        accent: '#9B6DFF',      // cosmic purple
        surface: '#12122A',
        surface2: '#1B1B38',
        muted: '#8A88A8',
      },
    },
  },
  plugins: [],
}
