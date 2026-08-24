import {
  resolveScrydexCardId,
  tcgplayerUrlCardId,
  toPokemontcgCatalogCardId,
} from '../tcgplayer/card-id'
import { isTrainerKitCardId } from '../tcgplayer/product-line'
import { getTrainerKitTcgplayerUrl } from '../tcgplayer/trainer-kit-tcgplayer'

const SCRYDEX_CDN = {
  cardImageBase: 'https://images.scrydex.com/pokemon',
  host: 'images.scrydex.com',
} as const

/** Scrydex returns a generic card-back PNG (~45k small / ~186k large) when the catalog id is wrong. */
export const SCRYDEX_PLACEHOLDER_SMALL_BYTES = 45_551
export const SCRYDEX_PLACEHOLDER_LARGE_BYTES = 186_316

const POKEMON_TCG_CDN = {
  imageHost: 'images.pokemontcg.io',
} as const

export const TCGDEX_CDN = {
  assetsHost: 'assets.tcgdex.net',
} as const

const POKEMON_TCG_PRICES_CDN = {
  tcgplayerPriceBase: 'https://prices.pokemontcg.io/tcgplayer',
} as const

export const EBAY_CDN_HOSTS = ['i.ebayimg.com', 'thumbs.ebaystatic.com'] as const

/** Hostnames allowed in Next.js `images.remotePatterns` for Pokémon TCG card art. */
const TCGPLAYER_CDN_HOST = 'tcgplayer-cdn.tcgplayer.com' as const

const SHINYDEV_CDN_HOST = 'pokemon-cards-prod-public.shinydev.io' as const

export const TCG_CARD_IMAGE_HOSTS = [
  POKEMON_TCG_CDN.imageHost,
  TCGDEX_CDN.assetsHost,
  SCRYDEX_CDN.host,
  TCGPLAYER_CDN_HOST,
  SHINYDEV_CDN_HOST,
] as const

export function buildScrydexCardImageUrls(
  cardId: string,
  options?: { tcgplayerUrl?: string | null }
): { small: string; large: string } {
  const id = resolveScrydexCardId(cardId, options?.tcgplayerUrl ?? undefined)
  return {
    small: `${SCRYDEX_CDN.cardImageBase}/${id}/small`,
    large: `${SCRYDEX_CDN.cardImageBase}/${id}/large`,
  }
}

/**
 * Set ids where the CDN series segment differs from the set id prefix
 * (see api.tcgdex.net `image` URLs vs set id alone).
 */
const TCGDEX_SET_CDN_SERIES: Record<string, string> = {
  si1: 'neo',
  np: 'pop',
  ru1: 'pl',
  dv1: 'bw',
  dc1: 'xy',
  g1: 'xy',
  det1: 'sm',
  fut2020: 'swsh',
  cel25: 'swsh',
  'p-a': 'tcgp',
  a1: 'tcgp',
  a1a: 'tcgp',
  a2: 'tcgp',
  a2a: 'tcgp',
  a2b: 'tcgp',
  a3: 'tcgp',
  a3a: 'tcgp',
  a3b: 'tcgp',
  b1: 'tcgp',
  b1a: 'tcgp',
}

/** TCGdex assets CDN uses `/en/{series}/{setId}/{localId}/high.webp` (not `/en/{setId}/{localId}` alone). */
export function inferTcgdexAssetSeriesFromSetId(setId: string): string {
  const id = setId.trim().toLowerCase()
  if (!id) {
    return id
  }

  const setOverride = TCGDEX_SET_CDN_SERIES[id]
  if (setOverride) {
    return setOverride
  }

  if (/^a\d+[a-z]?$/i.test(id) || /^b\d+[a-z]?$/i.test(id)) {
    return 'tcgp'
  }

  const seriesPrefixes = [
    'swsh',
    'sv',
    'sm',
    'xy',
    'bw',
    'hgss',
    'col',
    'pl',
    'dp',
    'ecard',
    'neo',
    'gym',
    'base',
    'ex',
  ] as const

  for (const series of seriesPrefixes) {
    if (id === series || id.startsWith(`${series}`)) {
      return series
    }
  }

  const dated = id.match(/^20\d{2}(sv|sm|swsh|xy|bw)/)
  if (dated?.[1]) {
    return dated[1]
  }

  const alpha = id.match(/^([a-z]+)/)
  return alpha?.[1] ?? id
}

/**
 * Ensure a TCGdex image base matches the live API shape
 * (`https://assets.tcgdex.net/en/sv/sv04.5/150`, not `.../en/sv04.5/150`).
 */
export function normalizeTcgdexImageBase(imageBase: string): string {
  const trimmed = imageBase
    .trim()
    .replace(/\/+(low|high)\.(webp|png|jpe?g)$/i, '')
    .replace(/\/$/, '')

  if (!trimmed) {
    return trimmed
  }

  try {
    const url = new URL(trimmed)
    if (url.hostname !== TCGDEX_CDN.assetsHost) {
      return trimmed
    }

    const segments = url.pathname.split('/').filter(Boolean)
    if (segments[0] !== 'en' || segments.length < 3) {
      return trimmed
    }

    if (segments.length >= 4) {
      const setId = segments[2] ?? ''
      const localId = segments[3] ?? ''
      const series = normalizeTcgdexSeriesSlug(decodeURIComponent(segments[1] ?? ''), setId)
      url.pathname = `/en/${encodeTcgdexPathSegment(series)}/${encodeTcgdexPathSegment(setId)}/${encodeTcgdexPathSegment(localId)}`
      return url.toString().replace(/\/$/, '')
    }

    const setId = segments[1]
    const localId = segments[2]
    if (!setId || !localId) {
      return trimmed
    }
    const series = inferTcgdexAssetSeriesFromSetId(setId)
    url.pathname = `/en/${encodeTcgdexPathSegment(series)}/${encodeTcgdexPathSegment(setId)}/${encodeTcgdexPathSegment(localId)}`
    return url.toString().replace(/\/$/, '')
  } catch {
    return trimmed
  }
}

/** tcgdx/cards-database top-level folder titles → assets.tcgdex.net series segment. */
const TCGDEX_DISPLAY_SERIES_TO_CDN: Record<string, string> = {
  'scarlet & violet': 'sv',
  'scarlet and violet': 'sv',
  'sword & shield': 'swsh',
  'sword and shield': 'swsh',
  'sun & moon': 'sm',
  'sun and moon': 'sm',
  'heartgold & soulsilver': 'hgss',
  'heartgold and soulsilver': 'hgss',
  'diamond & pearl': 'dp',
  'diamond and pearl': 'dp',
  'black & white': 'bw',
  'black and white': 'bw',
  'pokemon tcg pocket': 'tcgp',
  'pokémon tcg pocket': 'tcgp',
  'mega evolution': 'me',
}

function normalizeSeriesKey(value: string): string {
  return value.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ')
}

/**
 * Map cards-database folder names (e.g. "Scarlet & Violet") to CDN slugs (e.g. "sv").
 * When the folder name is a display title, `setId` is used to infer the series prefix.
 */
export function normalizeTcgdexSeriesSlug(seriesSlug: string, setId?: string): string {
  const decoded = decodeURIComponent(seriesSlug).trim()
  const key = normalizeSeriesKey(decoded)

  const mapped = TCGDEX_DISPLAY_SERIES_TO_CDN[key]
  if (mapped) {
    return mapped
  }

  if (/^[a-z][a-z0-9]{0,5}$/.test(key) && !key.includes(' ')) {
    return key
  }

  if (setId?.trim()) {
    return inferTcgdexAssetSeriesFromSetId(setId)
  }

  return decoded.trim()
}

function encodeTcgdexPathSegment(segment: string): string {
  return encodeURIComponent(decodeURIComponent(segment.trim()))
}

/** Percent-encode path segments so apostrophes and spaces match the CDN. */
export function encodeTcgdexAssetUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname !== TCGDEX_CDN.assetsHost) {
      return trimmed
    }

    const segments = parsed.pathname.split('/').filter(Boolean)
    if (segments[0] !== 'en' || segments.length < 2) {
      return trimmed
    }

    const rest = segments.slice(1)
    const encoded = [
      'en',
      ...rest.map((segment, index) => {
        const decoded = decodeURIComponent(segment)
        const normalized =
          index === 0 && rest.length >= 2 ? normalizeTcgdexSeriesSlug(decoded, rest[1]) : decoded
        return encodeTcgdexPathSegment(normalized)
      }),
    ]
    parsed.pathname = `/${encoded.join('/')}`
    const rebuilt = parsed.toString()
    const qualityMatch = trimmed.match(/\/(low|high)\.(webp|png|jpe?g)$/i)
    if (!qualityMatch) {
      return rebuilt.replace(/\/$/, '')
    }
    return rebuilt
  } catch {
    return trimmed
  }
}

/**
 * Cached transform paths that 404 on the CDN (wrong Pocket series folder, promo sets
 * without assets, raw apostrophes in paths). Prefer Scrydex at runtime when matched.
 */
export function isLikelyBrokenTcgdexAssetUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim()
  if (!trimmed) {
    return false
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname !== TCGDEX_CDN.assetsHost) {
      return false
    }
  } catch {
    return false
  }

  const decoded = decodeURIComponent(trimmed).toLowerCase()
  if (/pok[eé]mon\s+tcg\s+pocket/.test(decoded)) {
    return true
  }
  if (/mcdonald/.test(decoded)) {
    return true
  }
  if (/\/mcd\//.test(decoded)) {
    return true
  }
  if (/\/20\d{2}(?:xy|sv|sm|swsh)(?:-[a-z]{2})?\//.test(decoded)) {
    return true
  }
  if (/\/tk\//.test(decoded)) {
    return true
  }
  if (/\/mfb\//.test(decoded)) {
    return true
  }
  if (trimmed.includes("'")) {
    return true
  }
  if (
    /scarlet\s*(?:&|and)\s*violet|sword\s*(?:&|and)\s*shield|sun\s*(?:&|and)\s*moon|heartgold\s*(?:&|and)\s*soulsilver|diamond\s*(?:&|and)\s*pearl|black\s*(?:&|and)\s*white/i.test(
      decoded
    )
  ) {
    return true
  }

  return false
}

/** Repair a full TCGdex asset URL (fixes missing series folder in cached paths). */
export function repairTcgdexAssetUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname !== TCGDEX_CDN.assetsHost) {
      return trimmed
    }

    const qualityMatch = trimmed.match(/\/(low|high)\.(webp|png|jpe?g)$/i)
    const base = normalizeTcgdexImageBase(trimmed)
    if (!qualityMatch) {
      return base
    }
    const quality = qualityMatch[1]
    const ext = qualityMatch[2]
    if (!quality || !ext) {
      return base
    }
    return encodeTcgdexAssetUrl(`${base}/${quality}.${ext}`)
  } catch {
    return trimmed
  }
}

export function buildTcgdexImageUrls(imageBase: string | undefined): {
  small: string
  large: string
} | null {
  const base = imageBase?.trim()
  if (!base) {
    return null
  }
  const normalized = normalizeTcgdexImageBase(base)
  return {
    small: `${normalized}/low.webp`,
    large: `${normalized}/high.webp`,
  }
}

export function isPokemontcgImageUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim()
  if (!trimmed) {
    return false
  }
  try {
    return new URL(trimmed).hostname === POKEMON_TCG_CDN.imageHost
  } catch {
    return false
  }
}

export function buildPokemontcgImageFallbacks(images?: {
  small?: string | null
  large?: string | null
}): { pokemontcgSmall?: string; pokemontcgLarge?: string } {
  const pokemontcgSmall = isPokemontcgImageUrl(images?.small) ? images!.small!.trim() : undefined
  const pokemontcgLarge = isPokemontcgImageUrl(images?.large) ? images!.large!.trim() : undefined
  return { pokemontcgSmall, pokemontcgLarge }
}

/** Standard pokemontcg.io CDN paths for McDonald's catalog set ids (`mcd16-8` → `mcd16/8_hires.png`). */
export function buildPokemontcgImageUrlsFromCardId(
  cardId: string
): { small: string; large: string } | null {
  const trimmed = cardId.trim()
  const dash = trimmed.lastIndexOf('-')
  if (dash <= 0) {
    return null
  }
  const setId = trimmed.slice(0, dash).toLowerCase()
  const localId = trimmed.slice(dash + 1)
  if (!/^mcd\d+$/.test(setId) || !localId) {
    return null
  }
  return {
    small: `https://${POKEMON_TCG_CDN.imageHost}/${setId}/${localId}.png`,
    large: `https://${POKEMON_TCG_CDN.imageHost}/${setId}/${localId}_hires.png`,
  }
}

/**
 * TCGdex API lists these sets but assets.tcgdex.net has no card scans (McDonald's promos, etc.).
 */
export function isTcgdexUnsupportedSetId(setId: string): boolean {
  const id = setId.trim().toLowerCase()
  if (/^mcd\d+$/.test(id)) {
    return true
  }
  if (/^20\d{2}(?:xy|sv|sm|swsh)(?:-[a-z]{2})?$/.test(id)) {
    return true
  }
  if (/^tk-/i.test(id)) {
    return true
  }
  return false
}

export function isShinydevCardImageUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim()
  if (!trimmed) {
    return false
  }
  try {
    return new URL(trimmed).hostname === SHINYDEV_CDN_HOST
  } catch {
    return false
  }
}

export function isScrydexCardImageUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim()
  if (!trimmed) {
    return false
  }
  try {
    return new URL(trimmed).hostname === SCRYDEX_CDN.host
  } catch {
    return false
  }
}

export function isTcgdexAssetImageUrl(url: string | null | undefined): boolean {
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

function isVercelBlobPublicUrl(url: string): boolean {
  try {
    return new URL(url.trim()).hostname.endsWith('.public.blob.vercel-storage.com')
  } catch {
    return false
  }
}

/**
 * Hero strips and blog headers: prefer TCGdex `low.webp`.
 * `high.webp` is often missing (e.g. Crown Zenith Galarian Gallery `GG19`).
 */
export function preferTcgdexStripImageUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed.endsWith('/high.webp')) {
    return trimmed
  }
  try {
    if (new URL(trimmed).hostname !== TCGDEX_CDN.assetsHost) {
      return trimmed
    }
  } catch {
    return trimmed
  }
  return trimmed.replace(/\/high\.webp$/i, '/low.webp')
}

/** Ordered candidates for hero strips — low-res TCGdex first, then original URL. */
export function heroStripImageCandidates(url: string, fallback?: string): string[] {
  const trimmed = url.trim()
  if (!trimmed) {
    return fallback ? [fallback] : []
  }
  const preferred = preferTcgdexStripImageUrl(trimmed)
  const chain = preferred !== trimmed ? [preferred, trimmed] : [trimmed]
  if (fallback && !chain.includes(fallback)) {
    chain.push(fallback)
  }
  return chain
}

/** URLs safe to use as a primary card image (not known-bad TCGdex paths). */
export function isDisplayableTcgCardImageUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) {
    return false
  }
  if (
    isPokemontcgImageUrl(trimmed) ||
    isScrydexCardImageUrl(trimmed) ||
    isShinydevCardImageUrl(trimmed) ||
    trimmed.includes(TCGPLAYER_CDN_HOST) ||
    isVercelBlobPublicUrl(trimmed)
  ) {
    return true
  }
  return isTcgdexAssetImageUrl(trimmed) && !isLikelyBrokenTcgdexAssetUrl(trimmed)
}

/** Set id segment from a card id (e.g. `swsh2-53` → `swsh2`). */
export function tcgCardSetId(cardId: string): string {
  const trimmed = cardId.trim()
  const dash = trimmed.lastIndexOf('-')
  return dash > 0 ? trimmed.slice(0, dash) : trimmed
}

/**
 * Synthesize a TCGdex assets CDN base from a pokemontcg.io / TCGdex card id
 * (e.g. `bwp-BW65` → `https://assets.tcgdex.net/en/bw/bwp/BW65`).
 * McDonald's / dated promo set ids have no TCGdex CDN art — return null so callers use pokemontcg.io.
 */
export function buildTcgdexImageBaseFromCardId(cardId: string): string | null {
  const trimmed = cardId.trim()
  const dash = trimmed.lastIndexOf('-')
  if (dash <= 0) {
    return null
  }

  const setId = trimmed.slice(0, dash)
  const localId = trimmed.slice(dash + 1)
  if (!setId || !localId || isTcgdexUnsupportedSetId(setId)) {
    return null
  }

  const series = inferTcgdexAssetSeriesFromSetId(setId)
  return normalizeTcgdexImageBase(`https://assets.tcgdex.net/en/${series}/${setId}/${localId}`)
}

/**
 * Scrydex `prices.pokemontcg.io/tcgplayer/{id}` only resolves pokemontcg.io catalog ids.
 * TCG Pocket and other TCGdex-only sets 404 — do not persist affiliate links for them.
 */
export function isKnownTcgplayerPricesRedirectId(cardId: string): boolean {
  const normalized = cardId.trim().toLowerCase()
  if (/^tk-/i.test(normalized)) {
    return false
  }

  const setId = tcgCardSetId(cardId).toLowerCase()

  if (/^[ab]\d+[a-z]?$/.test(setId)) {
    return false
  }
  if (setId === 'p-a' || /^20\d{2}sv$/.test(setId) || setId === 'mfb') {
    return false
  }

  return true
}

type TcgplayerProductUrlOptions = {
  /**
   * Trustworthy pokemontcg.io catalog id (e.g. parsed from `images.pokemontcg.io` fallback URLs).
   * Used to correct naive TCGdex `*.5` → `*pt5` synthesis on Scrydex redirect links.
   */
  preferredCatalogCardId?: string | null
}

/**
 * Affiliate / product URL for TCGPlayer.
 *
 * 1. Prefer explicit `tcgplayer.url` from pokemontcg.io (Scrydex redirect → TCGPlayer).
 * 2. Else synthesize `prices.pokemontcg.io/tcgplayer/{id}` when the card id is in the
 *    physical TCG catalog (git pokemon-tcg-data has no tcgplayer field; synthesis is required).
 * 3. Omit links for TCG Pocket / other ids that 404 on the redirect service.
 */
export function tcgplayerProductUrl(
  cardId: string,
  tcgplayerUrl?: string | null,
  options?: TcgplayerProductUrlOptions
): string | undefined {
  const id = cardId.trim()
  if (isTrainerKitCardId(id)) {
    const cached = getTrainerKitTcgplayerUrl(id)
    if (cached) {
      return cached
    }
    const explicit = tcgplayerUrl?.trim()
    if (explicit && /tcgplayer\.com\/product\//i.test(explicit)) {
      return explicit
    }
    return undefined
  }

  const naiveCatalogId = toPokemontcgCatalogCardId(id)
  const preferred = options?.preferredCatalogCardId?.trim().toLowerCase()
  const catalogId =
    preferred && isKnownTcgplayerPricesRedirectId(preferred) ? preferred : naiveCatalogId
  const explicit = tcgplayerUrl?.trim()

  if (explicit) {
    if (explicit.includes('prices.pokemontcg.io')) {
      const redirectId = tcgplayerUrlCardId(explicit) ?? catalogId
      if (!redirectId || !isKnownTcgplayerPricesRedirectId(redirectId)) {
        return undefined
      }
      if (preferred && redirectId !== preferred && isKnownTcgplayerPricesRedirectId(preferred)) {
        return `${POKEMON_TCG_PRICES_CDN.tcgplayerPriceBase}/${encodeURIComponent(preferred)}`
      }
    }
    return explicit
  }

  if (!catalogId || !isKnownTcgplayerPricesRedirectId(catalogId)) {
    return undefined
  }

  return `${POKEMON_TCG_PRICES_CDN.tcgplayerPriceBase}/${encodeURIComponent(catalogId)}`
}
