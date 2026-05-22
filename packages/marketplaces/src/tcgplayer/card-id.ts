/** Normalize numeric card numbers (e.g. 060 → 60) for dedupe keys. */
export function normalizeTcgCardNumber(number: string): string {
  const trimmed = number.trim()
  if (/^\d+$/.test(trimmed)) {
    const parsed = Number.parseInt(trimmed, 10)
    return Number.isFinite(parsed) ? String(parsed) : trimmed
  }
  return trimmed
}

/**
 * Canonical Pokémon TCG card id: lowercase set prefix + unpadded local number.
 * e.g. sv10-060 → sv10-60
 */
export function canonicalTcgCardId(id: string): string {
  const trimmed = id.trim()
  const lastDash = trimmed.lastIndexOf('-')
  if (lastDash <= 0) {
    return trimmed.toLowerCase()
  }

  const setPart = trimmed.slice(0, lastDash)
  const local = trimmed.slice(lastDash + 1)
  const normalizedLocal = normalizeTcgCardNumber(local)
  return `${setPart}-${normalizedLocal}`.toLowerCase()
}

/** Catalog id embedded in `prices.pokemontcg.io/tcgplayer/{id}` (pokemontcg.io / Scrydex). */
export function tcgplayerUrlCardId(url: string): string | null {
  const match = url.match(/\/tcgplayer\/([^/?#]+)/i)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

/**
 * TCGdex McDonald's / dated promo set ids → pokemontcg.io / Scrydex catalog ids.
 * TCGdex uses `2016xy`, `2024sv`, etc.; pokemontcg.io uses `mcd16`, `mcd24`, etc.
 */
export const TCGDEX_TO_POKEMONTCG_SET: Record<string, string> = {
  '2014xy': 'mcd14',
  '2015xy': 'mcd15',
  '2016xy': 'mcd16',
  '2017sm': 'mcd17',
  '2018sm': 'mcd18',
  '2019sm': 'mcd19',
  '2021swsh': 'mcd21',
  '2022swsh': 'mcd22',
  '2023sv': 'mcd23',
  '2024sv': 'mcd24',
}

function tcgdxSetUsesAlternateScrydexCatalog(setId: string): boolean {
  const id = setId.trim().toLowerCase()
  return (
    id in TCGDEX_TO_POKEMONTCG_SET ||
    /^20\d{2}(?:xy|sv|sm|swsh)(?:-[a-z]{2})?$/.test(id) ||
    /^tk-/i.test(id)
  )
}

/**
 * TCGdex git set ids (e.g. `sv04.5`) → pokemontcg.io / Scrydex catalog set ids (e.g. `sv4pt5`).
 */
export function tcgSetIdToPokemontcgCatalog(setId: string): string {
  const trimmed = setId.trim().toLowerCase()
  const tcgdxPromoAlias = TCGDEX_TO_POKEMONTCG_SET[trimmed]
  if (tcgdxPromoAlias) {
    return tcgdxPromoAlias
  }
  const dotted = trimmed.match(/^([a-z]+?)0*(\d+)\.(\d+)$/)
  if (dotted) {
    return `${dotted[1]}${dotted[2]}pt${dotted[3]}`
  }
  const leadingZeros = trimmed.match(/^([a-z]+?)0+(\d+)$/)
  if (leadingZeros) {
    return `${leadingZeros[1]}${leadingZeros[2]}`
  }
  return trimmed
}

/** Map a TCGdex-style card id to the pokemontcg.io / Scrydex catalog id when they differ. */
export function toPokemontcgCatalogCardId(cardId: string): string {
  const trimmed = cardId.trim()
  const dash = trimmed.lastIndexOf('-')
  if (dash <= 0) {
    return trimmed.toLowerCase()
  }
  const setPart = tcgSetIdToPokemontcgCatalog(trimmed.slice(0, dash))
  const local = normalizeTcgCardNumber(trimmed.slice(dash + 1))
  return `${setPart}-${local}`.toLowerCase()
}

/** Scrydex catalog card id (may differ from TCGdex id and pokemontcg.io id). */
export function toScrydexCatalogCardId(
  cardId: string,
  options?: { tcgplayerUrl?: string | null }
): string {
  const trimmed = cardId.trim()
  const dash = trimmed.lastIndexOf('-')
  if (dash <= 0) {
    return trimmed.toLowerCase()
  }

  const setId = trimmed.slice(0, dash).toLowerCase()

  if (!tcgdxSetUsesAlternateScrydexCatalog(setId) && options?.tcgplayerUrl?.trim()) {
    const fromUrl = tcgplayerUrlCardId(options.tcgplayerUrl)
    if (fromUrl) {
      return fromUrl
    }
  }

  return toPokemontcgCatalogCardId(trimmed)
}

/**
 * Id segment for Scrydex image URLs (`images.scrydex.com/pokemon/{id}/small`).
 */
export function resolveScrydexCardId(cardId: string, tcgplayerUrl?: string | null): string {
  return toScrydexCatalogCardId(cardId, { tcgplayerUrl })
}

/** Prefer the API id whose local segment is already unpadded (sv10-60 over sv10-060). */
export function pickPreferredTcgCardId(...ids: string[]): string {
  const unique = [...new Set(ids.map((value) => value.trim()).filter(Boolean))]
  if (unique.length === 0) {
    return ''
  }
  if (unique.length === 1) {
    return unique[0]!
  }

  const canon = canonicalTcgCardId(unique[0]!)
  const matching = unique.filter((value) => canonicalTcgCardId(value) === canon)
  return matching.reduce((best, current) => {
    const bestLocal = best.slice(best.lastIndexOf('-') + 1)
    const currentLocal = current.slice(current.lastIndexOf('-') + 1)
    return currentLocal.length < bestLocal.length ? current : best
  })
}
