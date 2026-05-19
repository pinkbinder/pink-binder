import { mergeTcgCardPrices } from './pricing'
import type { TcgCardRecord } from './types'

function normalizeCardKeyPart(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function getEquivalentCardKeys(card: TcgCardRecord): string[] {
  const setName = normalizeCardKeyPart(card.setName)
  const number = normalizeCardKeyPart(card.number)
  const name = normalizeCardKeyPart(card.name)
  const artist = normalizeCardKeyPart(card.artist)
  const rarity = normalizeCardKeyPart(card.rarity)
  const keys: string[] = []

  if (setName && number && name) {
    keys.push(`${setName}::${number}::${name}`)
  }

  if (setName && name && artist && rarity) {
    keys.push(`${setName}::${name}::${artist}::${rarity}`)
  }

  if (keys.length === 0) {
    keys.push(`id::${normalizeCardKeyPart(card.id)}`)
  }

  return keys
}

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
  const fallbackByEquivalentKey = new Map<string, TcgCardRecord>()
  for (const card of fallback) {
    for (const key of getEquivalentCardKeys(card)) {
      if (!fallbackByEquivalentKey.has(key)) {
        fallbackByEquivalentKey.set(key, card)
      }
    }
  }
  const merged: TcgCardRecord[] = []
  const seen = new Set<string>()
  const seenEquivalentKeys = new Set<string>()

  for (const card of primary) {
    const equivalentKeys = getEquivalentCardKeys(card)
    const backup =
      fallbackById.get(card.id) ??
      equivalentKeys.map((key) => fallbackByEquivalentKey.get(key)).find(Boolean)
    merged.push(backup ? mergeRecord(card, backup) : card)
    seen.add(card.id)
    if (backup) {
      seen.add(backup.id)
    }
    for (const key of equivalentKeys) {
      seenEquivalentKeys.add(key)
    }
  }

  for (const card of fallback) {
    const equivalentKeys = getEquivalentCardKeys(card)
    if (!seen.has(card.id) && !equivalentKeys.some((key) => seenEquivalentKeys.has(key))) {
      merged.push(card)
      for (const key of equivalentKeys) {
        seenEquivalentKeys.add(key)
      }
    }
  }

  return merged
}
