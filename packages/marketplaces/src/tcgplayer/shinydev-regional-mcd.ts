import { normalizeTcgCardNumber } from './card-id'
import { tcgCardSetId } from '../config/cdn'

/** ShinyDev public CDN — regional McDonald's promos (e.g. France) not on TCGPlayer. */
export const SHINYDEV_CDN = {
  host: 'pokemon-cards-prod-public.shinydev.io',
  cardBase: 'https://pokemon-cards-prod-public.shinydev.io/assets/cards/en',
} as const

/** TCGdex regional McDonald's set id → ShinyDev set folder (under `/assets/cards/en/`). */
export const TCGDEX_REGIONAL_MCD_TO_SHINYDEV_SET: Record<string, string> = {
  '2018sm-fr': 'm18f-f',
  '2019sm-fr': 'm19f-f',
}

export function isShinydevRegionalMcdSetId(setId: string): boolean {
  return setId.trim().toLowerCase() in TCGDEX_REGIONAL_MCD_TO_SHINYDEV_SET
}

function shinydevSpeciesSlugCandidates(speciesSlug: string, cardName?: string | null): string[] {
  const base = speciesSlug.trim().toLowerCase()
  if (!base) {
    return []
  }

  const candidates = [base]
  const name = cardName?.trim().toLowerCase() ?? ''

  if ((name.includes('alola') || name.includes("d'alola")) && !base.startsWith('alolan-')) {
    candidates.unshift(`alolan-${base}`)
  }
  if ((name.includes('galar') || name.includes('de galar')) && !base.startsWith('galarian-')) {
    candidates.unshift(`galarian-${base}`)
  }

  return [...new Set(candidates)]
}

export function buildShinydevRegionalMcdImageUrl(
  cardId: string,
  speciesSlug: string,
  cardName?: string | null
): string | null {
  const setId = tcgCardSetId(cardId).toLowerCase()
  const shinySet = TCGDEX_REGIONAL_MCD_TO_SHINYDEV_SET[setId]
  if (!shinySet) {
    return null
  }

  const dash = cardId.lastIndexOf('-')
  if (dash <= 0) {
    return null
  }
  const localId = normalizeTcgCardNumber(cardId.slice(dash + 1))
  if (!localId) {
    return null
  }

  const slugs = shinydevSpeciesSlugCandidates(speciesSlug, cardName)
  if (slugs.length === 0) {
    return null
  }

  const primarySlug = slugs[0]!
  return `${SHINYDEV_CDN.cardBase}/${shinySet}/${localId}/${primarySlug}/normal/t/high_res/front.webp`
}

/** Alternate species slug paths when the primary ShinyDev URL 404s (e.g. Alolan forms). */
function buildShinydevRegionalMcdImageFallbacks(
  cardId: string,
  speciesSlug: string,
  cardName?: string | null
): string[] {
  const setId = tcgCardSetId(cardId).toLowerCase()
  const shinySet = TCGDEX_REGIONAL_MCD_TO_SHINYDEV_SET[setId]
  if (!shinySet) {
    return []
  }

  const dash = cardId.lastIndexOf('-')
  if (dash <= 0) {
    return []
  }
  const localId = normalizeTcgCardNumber(cardId.slice(dash + 1))
  if (!localId) {
    return []
  }

  const slugs = shinydevSpeciesSlugCandidates(speciesSlug, cardName)
  return slugs
    .slice(1)
    .map(
      (slug) =>
        `${SHINYDEV_CDN.cardBase}/${shinySet}/${localId}/${slug}/normal/t/high_res/front.webp`
    )
}

export function buildShinydevRegionalMcdImageUrls(
  cardId: string,
  speciesSlug: string,
  cardName?: string | null
): { imageSmall: string; imageLarge: string; imageLargeFallbacks: string[] } | null {
  const primary = buildShinydevRegionalMcdImageUrl(cardId, speciesSlug, cardName)
  if (!primary) {
    return null
  }

  const alternates = buildShinydevRegionalMcdImageFallbacks(cardId, speciesSlug, cardName)
  return {
    imageSmall: primary,
    imageLarge: primary,
    imageLargeFallbacks: alternates,
  }
}
