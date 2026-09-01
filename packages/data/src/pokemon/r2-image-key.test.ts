import { describe, expect, it } from 'bun:test'
import {
  buildLegacyPokemonImageSourceKeyMap,
  buildPokemonImageSourceKeyMap,
  normalizeArtofPkmStem,
  pokemonImageVariantObjectKey,
  stripR2ImageExtensions,
} from './r2-image-key'

describe('pokemon R2 image key normalization', () => {
  it('strips repeated source extensions before publishing WebP', () => {
    expect(stripR2ImageExtensions('103.webp.webp')).toBe('103')
    expect(stripR2ImageExtensions('pokemon-image.png.webp')).toBe('pokemon-image')
    expect(pokemonImageVariantObjectKey('pokemon/pocket/A1/1.webp', 'small')).toBe(
      'v1/images/pokemon/small/pocket/A1/1.webp'
    )
  })

  it('keeps readable ArtofPkm words and removes random suffixes', () => {
    expect(normalizeArtofPkmStem('backfill-wallhaven-wallhaven-28qm76.jpg', 'abomasnow')).toBe(
      'backfill-wallhaven-wallhaven'
    )
    expect(normalizeArtofPkmStem('pokemon-legends-z-a-key-visual.png', 'abra')).toBe(
      'pokemon-legends-z-a-key-visual'
    )
    expect(normalizeArtofPkmStem('454572095-1702473220290371-3489572886328912-n.png', 'abra')).toBe(
      'abra'
    )
  })

  it('numbers readable-name and opaque-name collisions deterministically', () => {
    const sourceKeys = [
      'pokemon/artofpkm/abra/backfill-wallhaven-wallhaven-qz7m8l.jpg',
      'pokemon/artofpkm/abra/backfill-wallhaven-wallhaven-l83gwp.webp',
      'pokemon/artofpkm/abra/454572095-1702473220290371-3489572886328912-n.png',
      'pokemon/artofpkm/abra/460745904-1953585171752679-490391078914408578-n.png',
    ]
    const map = buildPokemonImageSourceKeyMap(sourceKeys)
    expect(map.get(sourceKeys[0]!)).toBe('pokemon/artofpkm/abra/backfill-wallhaven-wallhaven-2.jpg')
    expect(map.get(sourceKeys[1]!)).toBe(
      'pokemon/artofpkm/abra/backfill-wallhaven-wallhaven-1.webp'
    )
    expect(map.get(sourceKeys[2]!)).toBe('pokemon/artofpkm/abra/abra-1.png')
    expect(map.get(sourceKeys[3]!)).toBe('pokemon/artofpkm/abra/abra-2.png')
    expect(pokemonImageVariantObjectKey(sourceKeys[1]!, 'large', map)).toBe(
      'v1/images/pokemon/large/artofpkm/abra/backfill-wallhaven-wallhaven-1.webp'
    )
  })

  it('is idempotent for already canonical ordinal names', () => {
    const sourceKeys = [
      'pokemon/artofpkm/electivire/electivire-1.png',
      'pokemon/artofpkm/electivire/electivire-2.png',
      'pokemon/artofpkm/electivire/backfill-wallhaven-wallhaven-1.jpg',
    ]
    const map = buildPokemonImageSourceKeyMap(sourceKeys)
    expect(map.get(sourceKeys[0]!)).toBe(sourceKeys[0])
    expect(map.get(sourceKeys[1]!)).toBe(sourceKeys[1])
    expect(map.get(sourceKeys[2]!)).toBe(sourceKeys[2])
  })

  it('retains the first migration mapping for pre-normalized references', () => {
    const sourceKeys = [
      'pokemon/artofpkm/abra/454572095-1702473220290371-3489572886328912-n.png',
      'pokemon/artofpkm/abra/460745904-1953585171752679-490391078914408578-n.png',
      'pokemon/artofpkm/abra/backfill-wallhaven-wallhaven-l83gwp.webp',
    ]
    const map = buildLegacyPokemonImageSourceKeyMap(sourceKeys)
    expect(map.get(sourceKeys[0]!)).toBe('pokemon/artofpkm/abra/abra-1.png')
    expect(map.get(sourceKeys[1]!)).toBe('pokemon/artofpkm/abra/abra-2.png')
    expect(map.get(sourceKeys[2]!)).toBe('pokemon/artofpkm/abra/backfill-wallhaven-wallhaven.webp')
  })
})
