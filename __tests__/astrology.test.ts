import {
  getSunSign,
  getPlanetSigns,
  getCompatibility,
  SIGN_NAMES,
  ZODIAC,
} from '@/lib/astrology'

describe('getSunSign', () => {
  it('maps dates to the correct sign', () => {
    expect(getSunSign(new Date('1995-04-01')).name).toBe('Aries')
    expect(getSunSign(new Date('1995-07-23')).name).toBe('Leo')
    expect(getSunSign(new Date('1995-11-21')).name).toBe('Scorpio')
  })
  it('handles the Capricorn year-boundary wrap', () => {
    expect(getSunSign(new Date('1995-12-25')).name).toBe('Capricorn')
    expect(getSunSign(new Date('1995-01-10')).name).toBe('Capricorn')
  })
  it('handles boundary first/last days', () => {
    expect(getSunSign(new Date('1995-03-21')).name).toBe('Aries')
    expect(getSunSign(new Date('1995-03-20')).name).toBe('Pisces')
  })
})

describe('getPlanetSigns', () => {
  it('returns 5 planets with the Sun matching the sun sign', () => {
    const dob = new Date('1995-07-23')
    const planets = getPlanetSigns(dob)
    expect(planets).toHaveLength(5)
    expect(planets[0].planet).toBe('Sun')
    expect(planets[0].sign).toBe('Leo')
    planets.forEach((p) => expect(SIGN_NAMES).toContain(p.sign))
  })
})

describe('getCompatibility', () => {
  it('keeps all scores within 40–95', () => {
    for (const a of SIGN_NAMES) {
      for (const b of SIGN_NAMES) {
        const r = getCompatibility(a, b)
        for (const v of [r.overall, r.love, r.communication, r.trust]) {
          expect(v).toBeGreaterThanOrEqual(40)
          expect(v).toBeLessThanOrEqual(95)
        }
      }
    }
  })
  it('is symmetric', () => {
    const ab = getCompatibility('Aries', 'Leo')
    const ba = getCompatibility('Leo', 'Aries')
    expect(ab).toEqual(ba)
  })
  it('scores same-element pairs higher than clashing pairs', () => {
    const sameElement = getCompatibility('Aries', 'Leo').overall // fire + fire
    const clashing = getCompatibility('Aries', 'Cancer').overall // fire + water
    expect(sameElement).toBeGreaterThan(clashing)
  })
})

describe('ZODIAC data', () => {
  it('has 12 signs each with a glyph and element', () => {
    expect(ZODIAC).toHaveLength(12)
    ZODIAC.forEach((z) => {
      expect(z.symbol).toBeTruthy()
      expect(['fire', 'earth', 'air', 'water']).toContain(z.element)
    })
  })
})
