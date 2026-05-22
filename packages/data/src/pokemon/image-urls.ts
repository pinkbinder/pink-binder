import {
  TCGDEX_CDN,
  VERCEL_BLOB_PUBLIC_HOST_SUFFIX,
  isLikelyBrokenTcgdexAssetUrl,
  isPokemontcgImageUrl,
  repairTcgdexAssetUrl,
} from '@repo/marketplaces/config'
import { buildScrydexCardImageUrls, toScrydexCatalogCardId } from '@repo/marketplaces/tcgplayer'
import {
  buildDreamWorldArtworkCdnUrl,
  buildHomeArtworkCdnUrl,
  buildOfficialArtworkCdnUrl,
  buildShinyArtworkCdnUrl,
} from './artwork'
import type { NormalizedSpeciesArt, NormalizedSpeciesSprites } from './normalized-species'
import type { PokemonTcgCard } from './tcg-card'
import type { MichiSceneArtSource } from './michi-scene-art'

/** Public Vercel Blob CDN URLs baked into normalized cache. */
export function isVercelBlobPublicUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim()
  if (!trimmed) {
    return false
  }
  try {
    return new URL(trimmed).hostname.endsWith(VERCEL_BLOB_PUBLIC_HOST_SUFFIX)
  } catch {
    return false
  }
}

export function isTcgdexImageUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim()
  if (!trimmed) {
    return false
  }
  try {
    return new URL(trimmed).hostname === TCGDEX_CDN.assetsHost
  } catch {
    return false
  }
}

function spriteFallback(
  url: string | null,
  fallback: () => string | null
): { primary: string | null; fallback: string | null } {
  const primary = url?.trim() || null
  const backup = fallback()
  if (!primary) {
    return { primary: backup, fallback: null }
  }
  if (isVercelBlobPublicUrl(primary) && backup && backup !== primary) {
    return { primary, fallback: backup }
  }
  return { primary, fallback: null }
}

function isTcgCardImageUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim()
  if (!trimmed) {
    return false
  }
  if (isTcgdexImageUrl(trimmed)) {
    return true
  }
  try {
    const host = new URL(trimmed).hostname
    return host === 'images.scrydex.com' || host.endsWith('pokemontcg.io')
  } catch {
    return false
  }
}

/** Ordered scene URLs: Blob CDN first, then original source (e.g. artofpkm). */
export function sceneArtUrlCandidates(entry: {
  url: string
  sourceUrl?: string | null
  source?: MichiSceneArtSource
}): string[] {
  let fallback = entry.sourceUrl?.trim() || null
  if (entry.source === 'artofpkm' && fallback && isTcgCardImageUrl(fallback)) {
    fallback = null
  }
  const chain = spriteUrlCandidates(entry.url, fallback)
  if (entry.source === 'artofpkm') {
    return chain.filter((url) => !isTcgCardImageUrl(url))
  }
  return chain
}

function scrydexUrlsForCard(card: PokemonTcgCard): {
  catalog: { small: string; large: string }
  tcgdx: { small: string; large: string }
} {
  const scrydexId = toScrydexCatalogCardId(card.id, { tcgplayerUrl: card.tcgplayerUrl })
  return {
    catalog: buildScrydexCardImageUrls(scrydexId),
    tcgdx: buildScrydexCardImageUrls(card.id, { tcgplayerUrl: card.tcgplayerUrl }),
  }
}

function applyScrydexFallbackIfNeeded(
  scrydex: { small: string; large: string },
  imageLarge: string,
  imageSmall: string,
  imageLargeFallback: string | undefined,
  imageSmallFallback: string | undefined
): {
  imageLarge: string
  imageSmall: string
  imageLargeFallback: string
  imageSmallFallback: string
} {
  let largeFallback = imageLargeFallback
  let smallFallback = imageSmallFallback

  if (!largeFallback || (largeFallback === imageLarge && !isPokemontcgImageUrl(largeFallback))) {
    largeFallback = scrydex.large
  }
  if (!smallFallback || (smallFallback === imageSmall && !isPokemontcgImageUrl(smallFallback))) {
    smallFallback = scrydex.small
  }

  return {
    imageLarge,
    imageSmall,
    imageLargeFallback: largeFallback,
    imageSmallFallback: smallFallback,
  }
}

function promoteBestArtWhenTcgdexBroken(
  card: PokemonTcgCard,
  scrydex: { catalog: { small: string; large: string }; tcgdx: { small: string; large: string } },
  imageLarge: string,
  imageSmall: string,
  imageLargeFallback: string | undefined,
  imageSmallFallback: string | undefined
): {
  imageLarge: string
  imageSmall: string
  imageLargeFallback: string
  imageSmallFallback: string
} {
  const pokemontcgLarge = isPokemontcgImageUrl(imageLargeFallback) ? imageLargeFallback : undefined
  const pokemontcgSmall = isPokemontcgImageUrl(imageSmallFallback) ? imageSmallFallback : undefined

  if (pokemontcgLarge) {
    return {
      imageLarge: pokemontcgLarge,
      imageSmall: pokemontcgSmall ?? imageSmall,
      imageLargeFallback: scrydex.catalog.large,
      imageSmallFallback: scrydex.catalog.small,
    }
  }

  const scrydexId = toScrydexCatalogCardId(card.id, { tcgplayerUrl: card.tcgplayerUrl })
  const catalogScrydexLarge =
    scrydex.catalog.large !== scrydex.tcgdx.large ? scrydex.catalog.large : undefined
  if (catalogScrydexLarge && scrydexId !== card.id.trim().toLowerCase()) {
    return {
      imageLarge: catalogScrydexLarge,
      imageSmall:
        scrydex.catalog.small !== scrydex.tcgdx.small ? scrydex.catalog.small : imageSmall,
      imageLargeFallback: scrydex.tcgdx.large,
      imageSmallFallback: scrydex.tcgdx.small,
    }
  }

  return {
    imageLarge: scrydex.catalog.large,
    imageSmall: scrydex.catalog.small,
    imageLargeFallback: imageLargeFallback ?? imageLarge,
    imageSmallFallback: imageSmallFallback ?? imageSmall,
  }
}

/**
 * Repair TCGdex paths on cards already written by extract/transform.
 * Preserves pokemontcg.io fallbacks; promotes catalog Scrydex / pokemontcg when TCGdex URLs are known-bad.
 */
export function coercePokemonTcgCardImageUrls(card: PokemonTcgCard): PokemonTcgCard {
  const scrydex = scrydexUrlsForCard(card)

  let imageLarge = card.imageLarge?.trim() ?? ''
  let imageSmall = card.imageSmall?.trim() ?? ''
  let imageLargeFallback = card.imageLargeFallback?.trim()
  let imageSmallFallback = card.imageSmallFallback?.trim()

  if (isTcgdexImageUrl(imageLarge)) {
    imageLarge = repairTcgdexAssetUrl(imageLarge)
  }
  if (isTcgdexImageUrl(imageSmall)) {
    imageSmall = repairTcgdexAssetUrl(imageSmall)
  }
  if (imageLargeFallback && isTcgdexImageUrl(imageLargeFallback)) {
    imageLargeFallback = repairTcgdexAssetUrl(imageLargeFallback)
  }
  if (imageSmallFallback && isTcgdexImageUrl(imageSmallFallback)) {
    imageSmallFallback = repairTcgdexAssetUrl(imageSmallFallback)
  }

  const repaired = applyScrydexFallbackIfNeeded(
    scrydex.catalog,
    imageLarge,
    imageSmall,
    imageLargeFallback,
    imageSmallFallback
  )
  imageLarge = repaired.imageLarge
  imageSmall = repaired.imageSmall
  imageLargeFallback = repaired.imageLargeFallback
  imageSmallFallback = repaired.imageSmallFallback

  if (!imageLarge) {
    imageLarge = imageLargeFallback ?? ''
  }
  if (!imageSmall) {
    imageSmall = imageSmallFallback ?? ''
  }

  if (isLikelyBrokenTcgdexAssetUrl(imageLarge) || isLikelyBrokenTcgdexAssetUrl(imageSmall)) {
    const promoted = promoteBestArtWhenTcgdexBroken(
      card,
      scrydex,
      imageLarge,
      imageSmall,
      imageLargeFallback,
      imageSmallFallback
    )
    imageLarge = promoted.imageLarge
    imageSmall = promoted.imageSmall
    imageLargeFallback = promoted.imageLargeFallback
    imageSmallFallback = promoted.imageSmallFallback
  }

  return {
    ...card,
    imageLarge,
    imageSmall,
    imageLargeFallback,
    imageSmallFallback,
  }
}

/**
 * Keep Blob URLs as primaries; attach PokéAPI CDN fallbacks for sprites.
 * Repair TCGdex collect-card URLs; preserve scene art (with optional sourceUrl fallback).
 */
export function coerceSpeciesDisplayArt(
  art: NormalizedSpeciesArt,
  pokedexNumber: number
): NormalizedSpeciesArt {
  const official = spriteFallback(art.sprites.official, () =>
    buildOfficialArtworkCdnUrl(pokedexNumber)
  )
  const home = spriteFallback(art.sprites.home, () => buildHomeArtworkCdnUrl(pokedexNumber))
  const shiny = spriteFallback(art.sprites.shiny, () => buildShinyArtworkCdnUrl(pokedexNumber))
  const dreamWorld = spriteFallback(art.sprites.dreamWorld, () =>
    buildDreamWorldArtworkCdnUrl(pokedexNumber)
  )

  const sprites: NormalizedSpeciesSprites = {
    official: official.primary,
    home: home.primary,
    shiny: shiny.primary,
    dreamWorld: dreamWorld.primary,
    showdown: art.sprites.showdown,
  }

  return {
    sprites,
    sceneArt: art.sceneArt?.length ? art.sceneArt : undefined,
    collectCardArt: art.collectCardArt?.length ? art.collectCardArt : undefined,
  }
}

/** Ordered sprite URL candidates (Blob first, then PokéAPI CDN). */
export function spriteUrlCandidates(
  primary: string | null | undefined,
  fallback: string | null | undefined
): string[] {
  const ordered = [primary?.trim(), fallback?.trim()].filter((url): url is string => Boolean(url))
  return [...new Set(ordered)]
}
