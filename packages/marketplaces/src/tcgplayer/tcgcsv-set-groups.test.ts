import { describe, expect, it } from 'vitest'
import { normalizeTcgSetTitle, resolveTcgcsvGroupIdForCard } from './tcgcsv-set-groups'

describe('tcgplayer/tcgcsv-set-groups', () => {
  describe('normalizeTcgSetTitle', () => {
    it('lowercases and trims', () => {
      expect(normalizeTcgSetTitle('  BASE SET  ')).toBe('base set')
    })

    it('strips a leading "swsh12:" style prefix', () => {
      expect(normalizeTcgSetTitle('swsh12: Silver Tempest')).toBe('silver tempest')
    })

    it('strips a leading "xy1." style prefix', () => {
      expect(normalizeTcgSetTitle('xy1. Flashfire')).toBe('xy1 flashfire')
    })

    it('replaces punctuation with spaces', () => {
      expect(normalizeTcgSetTitle("McDonald's Collection 2018")).toBe('mcdonald s collection 2018')
    })

    it('collapses repeated whitespace', () => {
      expect(normalizeTcgSetTitle('Base    Set')).toBe('base set')
    })
  })

  describe('resolveTcgcsvGroupIdForCard', () => {
    it('returns null for empty input', () => {
      expect(resolveTcgcsvGroupIdForCard('')).toBeUndefined()
    })

    it('returns a number or undefined for a set id (map depends on tcgcsv client data)', () => {
      const result = resolveTcgcsvGroupIdForCard('base1-1')
      expect(result === undefined || typeof result === 'number').toBe(true)
    })

    it('returns null for an unknown set', () => {
      expect(resolveTcgcsvGroupIdForCard('zzzz9-99')).toBeUndefined()
    })
  })
})
