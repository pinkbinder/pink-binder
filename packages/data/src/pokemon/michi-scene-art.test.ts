import { describe, expect, it } from 'bun:test'
import type { PokemonTcgCard } from './tcg-card'
import {
  landscapeScoreMichiScene,
  compareMichiSceneLandscapePreference,
  sortMichiSceneArtByLandscapePreference,
  pickBestLandscapeMichiScene,
  artofPkmArtworkPageUrl,
  scoreCardForMichiScene,
  pickMichiSceneArtFromCards,
} from './michi-scene-art'

function scene(
  over: Partial<{ url: string; label: string; source: any; width?: number; height?: number }>
) {
  return { url: 'x', label: '', source: 'tcg', ...over } as any
}

describe('michi-scene-art landscape scoring', () => {
  it('scores wide images high', () => {
    expect(landscapeScoreMichiScene(scene({ width: 1600, height: 900 }))).toBeGreaterThan(100)
  })

  it('penalizes portrait images', () => {
    expect(landscapeScoreMichiScene(scene({ width: 400, height: 900 }))).toBe(-50)
  })

  it('uses source + label hints when no dimensions', () => {
    const artof = landscapeScoreMichiScene(
      scene({ source: 'artofpkm', url: 'https://www.artofpkm.com/x' })
    )
    const tcg = landscapeScoreMichiScene(scene({ source: 'tcg' }))
    expect(artof).toBeGreaterThan(tcg)
  })

  it('compareMichiSceneLandscapePreference orders best-first', () => {
    const wide = scene({ width: 1600, height: 900 })
    const tall = scene({ width: 400, height: 900 })
    expect(compareMichiSceneLandscapePreference(wide, tall)).toBeLessThan(0)
  })

  it('sortMichiSceneArtByLandscapePreference returns sorted copy', () => {
    const sorted = sortMichiSceneArtByLandscapePreference([
      scene({ width: 400, height: 900 }),
      scene({ width: 1600, height: 900 }),
    ])
    expect(landscapeScoreMichiScene(sorted[0] as any)).toBeGreaterThanOrEqual(
      landscapeScoreMichiScene(sorted[1] as any)
    )
  })

  it('pickBestLandscapeMichiScene picks highest, undefined when empty', () => {
    expect(pickBestLandscapeMichiScene([])).toBeUndefined()
    const best = pickBestLandscapeMichiScene([
      scene({ width: 400, height: 900 }),
      scene({ width: 1600, height: 900 }),
    ])
    expect(landscapeScoreMichiScene(best!)).toBeGreaterThan(100)
  })

  it('artofPkmArtworkPageUrl builds a url from pokedex number', () => {
    expect(artofPkmArtworkPageUrl(25)).toContain('25')
  })
})

describe('michi-scene-art card selection', () => {
  function card(over: Partial<PokemonTcgCard>): PokemonTcgCard {
    return {
      id: 'sv1-1',
      name: 'Testmon',
      setName: 'Base',
      number: '1',
      imageSmall: '',
      imageLarge: 'l.png',
      rarity: null,
      setSeries: '',
      artist: null,
      ...over,
    } as PokemonTcgCard
  }

  it('scoreCardForMichiScene rewards high rarity, penalizes shiny', () => {
    const ultra = scoreCardForMichiScene(card({ rarity: 'Ultra Rare' }))
    const shiny = scoreCardForMichiScene(card({ rarity: 'Shiny Rare' }))
    expect(ultra).toBeGreaterThan(shiny)
  })

  it('pickMichiSceneArtFromCards returns up to max entries', () => {
    const cards = [
      card({ id: 'sv1-1', rarity: 'Ultra Rare', setName: 'Base' }),
      card({ id: 'sv1-2', rarity: 'Ultra Rare', setName: 'Base' }),
      card({ id: 'sv1-3', rarity: 'Common', setName: 'Other' }),
    ]
    const picked = pickMichiSceneArtFromCards(cards, 2)
    expect(picked.length).toBeLessThanOrEqual(2)
  })
})
