import { describe, expect, it } from 'vitest'
import type { TcgCardRecord } from './types'
import {
  collapseMcDonaldsRegionalDuplicates,
  collapseTrainerKitDuplicates,
  mergeTcgCardRecords,
} from './merge'

function rec(overrides: Partial<TcgCardRecord>): TcgCardRecord {
  return {
    id: 'base1-1',
    name: 'Alakazam',
    imageSmall: 'https://images.pokemontcg.io/base1/1.png',
    imageLarge: 'https://images.pokemontcg.io/base1/1_hires.png',
    rarity: 'Rare Holo',
    setName: 'Base',
    setSeries: 'Base',
    number: '1',
    artist: 'Ken Sugimori',
    metadataSource: 'pokemontcg' as TcgCardRecord['metadataSource'],
    ...overrides,
  }
}

describe('tcgplayer/merge', () => {
  describe('collapseMcDonaldsRegionalDuplicates', () => {
    it('keeps non-McDonald cards untouched', () => {
      const cards = [rec({ id: 'base1-1' }), rec({ id: 'base1-2' })]
      expect(collapseMcDonaldsRegionalDuplicates(cards)).toHaveLength(2)
    })

    it('collapses French + English McDonald promos for the same species/year', () => {
      const en = rec({ id: 'mcd18-1', setName: "McDonald's Collection 2018", name: 'Pikachu' })
      const fr = rec({
        id: '2018sm-fr-1',
        setName: "Collection McDonald's 2018",
        name: 'Pikachu',
      })
      const result = collapseMcDonaldsRegionalDuplicates([en, fr])
      expect(result).toHaveLength(1)
    })

    it('prefers the McDonald catalog id (mcd##-) within the same dedup key', () => {
      const a = rec({
        id: 'mcd18-1',
        setName: "McDonald's Collection 2018",
        name: 'Pikachu',
        number: '1',
      })
      const b = rec({
        id: 'sm1-1',
        setName: "McDonald's Collection 2018",
        name: 'Pikachu',
        number: '1',
      })
      const result = collapseMcDonaldsRegionalDuplicates([a, b])
      expect(result).toHaveLength(1)
      expect(result[0]!.id).toBe('mcd18-1')
    })
  })

  describe('collapseTrainerKitDuplicates', () => {
    it('collapses two trainer-kit slots on the same species page', () => {
      const a = rec({
        id: 'tk-ex-m-4',
        setName: 'XY Trainer Kit',
        name: 'Mega Charizard',
        number: '4',
      })
      const b = rec({
        id: 'tk2b-4',
        setName: 'XY Trainer Kit',
        name: 'Mega Charizard',
        number: '4',
      })
      const result = collapseTrainerKitDuplicates([a, b])
      expect(result).toHaveLength(1)
    })

    it('leaves unrelated cards alone', () => {
      const cards = [rec({ id: 'base1-1' }), rec({ id: 'base1-2' })]
      expect(collapseTrainerKitDuplicates(cards)).toHaveLength(2)
    })
  })

  describe('mergeTcgCardRecords', () => {
    it('merges a fallback row into a primary row by equivalent key', () => {
      const primary = [rec({ id: 'base1-1', price: undefined })]
      const fallback = [rec({ id: 'base1-1', rarity: 'Rare Holo', setName: 'Base Set' })]
      const result = mergeTcgCardRecords(primary, fallback)
      expect(result).toHaveLength(1)
      expect(result[0]!.setName).toBe('Base')
    })

    it('keeps fallback-only cards when no primary match exists', () => {
      const primary = [rec({ id: 'base1-1' })]
      const fallback = [rec({ id: 'base1-99', name: 'Missing' })]
      const result = mergeTcgCardRecords(primary, fallback)
      expect(result.some((c) => c.id === 'base1-99')).toBe(true)
    })

    it('dedupes primary cards by canonical id', () => {
      const primary = [rec({ id: 'base1-1', name: 'A' }), rec({ id: 'base1-1', name: 'B' })]
      const result = mergeTcgCardRecords(primary, [])
      expect(result).toHaveLength(1)
    })
  })
})
