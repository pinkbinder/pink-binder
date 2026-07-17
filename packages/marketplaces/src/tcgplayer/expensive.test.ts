import { describe, expect, it } from 'bun:test'
import {
  buildNationalDexSearchQuery,
  buildTcgTypeSearchQuery,
  maxPokemontcgMarketPrice,
} from './expensive'

describe('tcgplayer/expensive', () => {
  describe('buildNationalDexSearchQuery', () => {
    it('builds an OR query from pokedex numbers', () => {
      expect(buildNationalDexSearchQuery([25, 26])).toContain('nationalPokedexNumbers:25')
      expect(buildNationalDexSearchQuery([25, 26])).toContain('nationalPokedexNumbers:26')
    })

    it('returns only the supertype clause for no numbers', () => {
      expect(buildNationalDexSearchQuery([])).toBe(' supertype:Pokémon')
    })
  })

  describe('buildTcgTypeSearchQuery', () => {
    it('builds a types query', () => {
      expect(buildTcgTypeSearchQuery('Fire')).toContain('types:Fire')
    })
  })

  describe('maxPokemontcgMarketPrice', () => {
    it('returns 0 when no tcgplayer data', () => {
      expect(maxPokemontcgMarketPrice(undefined)).toBe(0)
      expect(maxPokemontcgMarketPrice({} as never)).toBe(0)
    })

    it('returns the highest market price across variants', () => {
      const tcgplayer = {
        prices: {
          normal: { market: 1.5, high: 2 },
          holofoil: { market: 3.25 },
          reverseHolofoil: { market: 0.9 },
        },
      } as never
      expect(maxPokemontcgMarketPrice(tcgplayer)).toBe(3.25)
    })

    it('falls back to high when market is missing', () => {
      const tcgplayer = { prices: { normal: { high: 4.1 } } } as never
      expect(maxPokemontcgMarketPrice(tcgplayer)).toBe(4.1)
    })
  })
})
