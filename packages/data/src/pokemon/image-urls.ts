import {
  TCGDEX_CDN,
  isDisplayableTcgCardImageUrl,
  isLikelyBrokenTcgdexAssetUrl,
  isTcgdexUnsupportedSetId,
  repairTcgdexAssetUrl,
  tcgCardSetId,
} from '@repo/marketplaces/config'
import {
  getTcgcsvPromoImage,
  getTcgPocketImage,
  getTrainerKitTcgplayerImage,
} from '@repo/marketplaces/tcgplayer'
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

/** Legacy Vercel Blob host suffix, retained only to provide a fallback for stale cached data. */
const LEGACY_VERCEL_BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com'

/** Detect a legacy Vercel Blob URL in stale cached data. */
export function isVercelBlobPublicUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim()
  if (!trimmed) {
    return false
  }
  try {
    return new URL(trimmed).hostname.endsWith(LEGACY_VERCEL_BLOB_HOST_SUFFIX)
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

/** Ensure Scrydex URLs are included in fallback arrays when missing. */
function ensureScrydexInFallbacks(
  scrydex: { small: string; large: string },
  imageSmall: string,
  imageLarge: string,
  smallFallbacks: string[],
  largeFallbacks: string[]
): { imageSmallFallbacks: string[]; imageLargeFallbacks: string[] } {
  const imageSmallFallbacks = [...smallFallbacks]
  const imageLargeFallbacks = [...largeFallbacks]

  if (scrydex.small !== imageSmall && !imageSmallFallbacks.includes(scrydex.small)) {
    imageSmallFallbacks.push(scrydex.small)
  }
  if (scrydex.large !== imageLarge && !imageLargeFallbacks.includes(scrydex.large)) {
    imageLargeFallbacks.push(scrydex.large)
  }

  return { imageSmallFallbacks, imageLargeFallbacks }
}

/**
 * Repair TCGdex paths on cards already written by extract/transform.
 * Ensures Scrydex fallbacks are always present. Promotes pokemontcg.io / Scrydex
 * when TCGdex primaries are known-broken.
 */
export function coercePokemonTcgCardImageUrls(card: PokemonTcgCard): PokemonTcgCard {
  const scrydex = scrydexUrlsForCard(card)

  let imageLarge = card.imageLarge?.trim() ?? ''
  let imageSmall = card.imageSmall?.trim() ?? ''

  if (isTcgdexImageUrl(imageLarge)) imageLarge = repairTcgdexAssetUrl(imageLarge)
  if (isTcgdexImageUrl(imageSmall)) imageSmall = repairTcgdexAssetUrl(imageSmall)

  let smallFallbacks = (card.imageSmallFallbacks ?? []).map((u) =>
    isTcgdexImageUrl(u) ? repairTcgdexAssetUrl(u) : u
  )
  let largeFallbacks = (card.imageLargeFallbacks ?? []).map((u) =>
    isTcgdexImageUrl(u) ? repairTcgdexAssetUrl(u) : u
  )

  if (!imageLarge && largeFallbacks.length) {
    imageLarge = largeFallbacks.shift()!
  }
  if (!imageSmall && smallFallbacks.length) {
    imageSmall = smallFallbacks.shift()!
  }

  const tcgdxSetUnsupported = isTcgdexUnsupportedSetId(tcgCardSetId(card.id))
  const primaryIsBroken =
    !getTcgcsvPromoImage(card.id) &&
    !getTrainerKitTcgplayerImage(card.id) &&
    !getTcgPocketImage(card.id) &&
    (isLikelyBrokenTcgdexAssetUrl(imageSmall) || isLikelyBrokenTcgdexAssetUrl(imageLarge))

  if (tcgdxSetUnsupported && primaryIsBroken) {
    const bestSmall = [scrydex.catalog.small, scrydex.tcgdx.small, ...smallFallbacks].find(
      isDisplayableTcgCardImageUrl
    )
    const bestLarge = [scrydex.catalog.large, scrydex.tcgdx.large, ...largeFallbacks].find(
      isDisplayableTcgCardImageUrl
    )

    if (bestSmall && bestSmall !== imageSmall) {
      smallFallbacks = [imageSmall, ...smallFallbacks].filter(
        (u) => u !== bestSmall && u.trim() !== ''
      )
      imageSmall = bestSmall
    }
    if (bestLarge && bestLarge !== imageLarge) {
      largeFallbacks = [imageLarge, ...largeFallbacks].filter(
        (u) => u !== bestLarge && u.trim() !== ''
      )
      imageLarge = bestLarge
    }
  }

  const withScrydex = ensureScrydexInFallbacks(
    scrydex.catalog,
    imageSmall,
    imageLarge,
    smallFallbacks,
    largeFallbacks
  )

  return {
    ...card,
    imageLarge,
    imageSmall,
    imageSmallFallbacks: withScrydex.imageSmallFallbacks.length
      ? withScrydex.imageSmallFallbacks
      : undefined,
    imageLargeFallbacks: withScrydex.imageLargeFallbacks.length
      ? withScrydex.imageLargeFallbacks
      : undefined,
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
