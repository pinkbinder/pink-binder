import { mergeTcgCardPrices } from './pricing'
import type { TcgCardRecord } from './types'

function mergeRecord(primary: TcgCardRecord, fallback: TcgCardRecord): TcgCardRecord {
  const price = mergeTcgCardPrices(primary.price, fallback.price)
  const tcgImages =
    primary.metadataSource === 'tcgdex'
      ? {
          imageSmall: primary.imageSmall,
          imageLarge: primary.imageLarge,
          imageSmallFallback:
            primary.imageSmallFallback ?? fallback.imageSmallFallback ?? fallback.imageSmall,
          imageLargeFallback:
            primary.imageLargeFallback ?? fallback.imageLargeFallback ?? fallback.imageLarge,
        }
      : {
          imageSmall: primary.imageSmall,
          imageLarge: primary.imageLarge,
          imageSmallFallback: fallback.imageSmallFallback,
          imageLargeFallback: fallback.imageLargeFallback,
        }

  return {
    id: primary.id,
    name: primary.name || fallback.name,
    ...tcgImages,
    rarity: primary.rarity ?? fallback.rarity,
    setName: primary.setName || fallback.setName,
    setSeries: fallback.setSeries || primary.setSeries,
    number: primary.number || fallback.number,
    artist: primary.artist ?? fallback.artist,
    tcgplayerUrl: fallback.tcgplayerUrl ?? primary.tcgplayerUrl,
    price,
    metadataSource: primary.metadataSource,
  }
}

/** Merge TCGdex-primary rows with pokemontcg.io backup (prices, URLs, set series). */
export function mergeTcgCardRecords(
  primary: TcgCardRecord[],
  fallback: TcgCardRecord[]
): TcgCardRecord[] {
  const fallbackById = new Map(fallback.map((card) => [card.id, card]))
  const merged: TcgCardRecord[] = []
  const seen = new Set<string>()

  for (const card of primary) {
    const backup = fallbackById.get(card.id)
    merged.push(backup ? mergeRecord(card, backup) : card)
    seen.add(card.id)
  }

  for (const card of fallback) {
    if (!seen.has(card.id)) {
      merged.push(card)
    }
  }

  return merged
}
