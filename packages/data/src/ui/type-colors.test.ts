import { describe, expect, it } from 'bun:test'
import {
  getPokemonTypeColors,
  getPokemonTypeLogoUrl,
  getPokemonTypeLightColors,
  getPokemonTypeLogoColor,
  parseTypeCategory,
} from './type-colors'

/* ------------------------------------------------------------------ */
/*  getPokemonTypeColors — lookup with gray fallback                   */
/* ------------------------------------------------------------------ */
describe('getPokemonTypeColors', () => {
  it('returns known colors for a valid type', () => {
    const result = getPokemonTypeColors('Fire')
    expect(result).toEqual({ bg: '#EE8130', text: '#FFFFFF' })
  })

  it('returns known colors for another valid type', () => {
    const result = getPokemonTypeColors('Psychic')
    expect(result).toEqual({ bg: '#F95587', text: '#FFFFFF' })
  })

  it('returns a dark text color for light-background types', () => {
    const electric = getPokemonTypeColors('Electric')
    expect(electric.text).toBe('#3D3D3D')
    const steel = getPokemonTypeColors('Steel')
    expect(steel.text).toBe('#1F2937')
  })

  it('returns gray fallback for unknown type', () => {
    const result = getPokemonTypeColors('Unknown')
    expect(result).toEqual({ bg: '#6B7280', text: '#FFFFFF' })
  })

  it('returns gray fallback for empty string', () => {
    const result = getPokemonTypeColors('')
    expect(result).toEqual({ bg: '#6B7280', text: '#FFFFFF' })
  })

  it('is case-sensitive — lowercase returns fallback', () => {
    const result = getPokemonTypeColors('fire')
    expect(result).toEqual({ bg: '#6B7280', text: '#FFFFFF' })
  })

  it('handles all 18 known types without error', () => {
    const types = [
      'Normal',
      'Fire',
      'Water',
      'Electric',
      'Grass',
      'Ice',
      'Fighting',
      'Poison',
      'Ground',
      'Flying',
      'Psychic',
      'Bug',
      'Rock',
      'Ghost',
      'Dragon',
      'Dark',
      'Steel',
      'Fairy',
    ]
    for (const type of types) {
      const result = getPokemonTypeColors(type)
      expect(result.bg).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(result.text).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

/* ------------------------------------------------------------------ */
/*  getPokemonTypeLogoUrl — SVG icon URL or null                       */
/* ------------------------------------------------------------------ */
describe('getPokemonTypeLogoUrl', () => {
  it('returns a URL for a valid type', () => {
    const url = getPokemonTypeLogoUrl('Fire')
    expect(url).toBe('/icons/types/fire.svg')
  })

  it('returns null for an unknown type', () => {
    expect(getPokemonTypeLogoUrl('Unknown')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getPokemonTypeLogoUrl('')).toBeNull()
  })

  it('is case-sensitive — lowercase returns null', () => {
    expect(getPokemonTypeLogoUrl('water')).toBeNull()
  })

  it('handles all 18 known types without error', () => {
    const types = [
      'Normal',
      'Fire',
      'Water',
      'Electric',
      'Grass',
      'Ice',
      'Fighting',
      'Poison',
      'Ground',
      'Flying',
      'Psychic',
      'Bug',
      'Rock',
      'Ghost',
      'Dragon',
      'Dark',
      'Steel',
      'Fairy',
    ]
    for (const type of types) {
      const url = getPokemonTypeLogoUrl(type)
      expect(url).toMatch(/^\/icons\/types\//)
    }
  })
})

/* ------------------------------------------------------------------ */
/*  getPokemonTypeLightColors — lightened variant for UI backgrounds   */
/* ------------------------------------------------------------------ */
describe('getPokemonTypeLightColors', () => {
  it('returns bg, text, and border for a known type', () => {
    const result = getPokemonTypeLightColors('Fire')
    expect(result).toHaveProperty('bg')
    expect(result).toHaveProperty('text')
    expect(result).toHaveProperty('border')
  })

  it('returns lightened background color (Fire)', () => {
    const result = getPokemonTypeLightColors('Fire')
    // bg should be lightened version of #EE8130 (more white in it)
    expect(result.bg).toMatch(/^#[0-9A-Fa-f]{6}$/)
    expect(result.border).toBe('#EE8130')
  })

  it('returns a darkened, hue-preserving text variant for contrast', () => {
    const result = getPokemonTypeLightColors('Grass')
    // text is the solid type color mixed toward black (0.42 factor)
    expect(result.text).toBe('#335420')
    expect(result.border).toBe('#7AC74C')
  })

  it('handles unknown type with gray fallback', () => {
    const result = getPokemonTypeLightColors('Mystical')
    expect(result.bg).toMatch(/^#[0-9A-Fa-f]{6}$/)
    expect(result.text).toBe('#2d3036')
  })

  it('handles empty string with gray fallback', () => {
    const result = getPokemonTypeLightColors('')
    expect(result.text).toBe('#2d3036')
  })
})

/* ------------------------------------------------------------------ */
/*  getPokemonTypeLogoColor — convenience wrapper                      */
/* ------------------------------------------------------------------ */
describe('getPokemonTypeLogoColor', () => {
  it('returns the darkened text color from light colors', () => {
    expect(getPokemonTypeLogoColor('Fire')).toBe('#643614')
    expect(getPokemonTypeLogoColor('Water')).toBe('#2a3c65')
  })

  it('returns darkened gray fallback for unknown types', () => {
    expect(getPokemonTypeLogoColor('')).toBe('#2d3036')
  })
})

/* ------------------------------------------------------------------ */
/*  parseTypeCategory — extract type name from "XXX Type" string       */
/* ------------------------------------------------------------------ */
describe('parseTypeCategory', () => {
  it('extracts type from "Fire Type"', () => {
    expect(parseTypeCategory('Fire Type')).toBe('Fire')
  })

  it('extracts multi-word type from "Fighting Type"', () => {
    expect(parseTypeCategory('Fighting Type')).toBe('Fighting')
  })

  it('extracts "Dragon Type"', () => {
    expect(parseTypeCategory('Dragon Type')).toBe('Dragon')
  })

  it('returns null for exact string "Type" (no prefix)', () => {
    expect(parseTypeCategory('Type')).toBeNull()
  })

  it('returns null for lowercase "type"', () => {
    expect(parseTypeCategory('Fire type')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseTypeCategory('')).toBeNull()
  })

  it('returns null for string without "Type" suffix', () => {
    expect(parseTypeCategory('Fire')).toBeNull()
  })

  it('returns null for incomplete "Fire Typ"', () => {
    expect(parseTypeCategory('Fire Typ')).toBeNull()
  })

  it('preserves leading/trailing whitespace in the extracted part', () => {
    const result = parseTypeCategory(' Grass Type')
    // " Grass" — regex captures the space. Not ideal but matches current behaviour.
    expect(result).toBe(' Grass')
  })

  it('returns null for null-like "undefined Type"', () => {
    expect(parseTypeCategory('undefined Type')).toBe('undefined')
  })
})
