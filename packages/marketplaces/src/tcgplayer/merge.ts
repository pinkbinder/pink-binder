import { canonicalTcgCardId, normalizeTcgCardNumber, pickPreferredTcgCardId } from './card-id'
import { mergeTcgCardPrices } from './pricing'
import type { TcgCardRecord } from './types'

function normalizeCardKeyPart(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeCardNumberKeyPart(value: string | null | undefined): string {
  const base = normalizeCardKeyPart(value)
  return base ? normalizeTcgCardNumber(base) : ''
}

function getEquivalentCardKeys(card: TcgCardRecord): string[] {
  const setName = normalizeCardKeyPart(card.setName)
  const number = normalizeCardNumberKeyPart(card.number)
  const name = normalizeCardKeyPart(card.name)
  const artist = normalizeCardKeyPart(card.artist)
  const rarity = normalizeCardKeyPart(card.rarity)
  const keys: string[] = []

  keys.push(`id::${canonicalTcgCardId(card.id)}`)

  if (setName && number && name) {
    keys.push(`${setName}::${number}::${name}`)
  }

  if (setName && name && artist && rarity) {
    keys.push(`${setName}::${name}::${artist}::${rarity}`)
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
    id: pickPreferredTcgCardId(primary.id, fallback.id),
    name: primary.name || fallback.name,
    ...tcgImages,
    rarity: primary.rarity ?? fallback.rarity,
    setName: primary.setName || fallback.setName,
    setSeries: fallback.setSeries || primary.setSeries,
    number: normalizeTcgCardNumber(primary.number || fallback.number),
    artist: primary.artist ?? fallback.artist,
    tcgplayerUrl: fallback.tcgplayerUrl ?? primary.tcgplayerUrl,
    price,
    metadataSource: primary.metadataSource,
  }
}

function dedupeWithinSource(cards: TcgCardRecord[]): TcgCardRecord[] {
  const byCanonicalId = new Map<string, TcgCardRecord>()

  for (const card of cards) {
    const canon = canonicalTcgCardId(card.id)
    const existing = byCanonicalId.get(canon)
    if (!existing) {
      byCanonicalId.set(canon, card)
      continue
    }
    byCanonicalId.set(canon, mergeRecord(existing, card))
  }

  return [...byCanonicalId.values()]
}

/** Merge TCGdex-primary rows with pokemontcg.io backup (prices, URLs, set series). */
export function mergeTcgCardRecords(
  primary: TcgCardRecord[],
  fallback: TcgCardRecord[]
): TcgCardRecord[] {
  const primaryDeduped = dedupeWithinSource(primary)
  const fallbackDeduped = dedupeWithinSource(fallback)

  const fallbackById = new Map(fallbackDeduped.map((card) => [card.id, card]))
  const fallbackByCanonicalId = new Map<string, TcgCardRecord>()
  const fallbackByEquivalentKey = new Map<string, TcgCardRecord>()
  for (const card of fallbackDeduped) {
    fallbackByCanonicalId.set(canonicalTcgCardId(card.id), card)
    for (const key of getEquivalentCardKeys(card)) {
      if (!fallbackByEquivalentKey.has(key)) {
        fallbackByEquivalentKey.set(key, card)
      }
    }
  }

  const merged: TcgCardRecord[] = []
  const seenIds = new Set<string>()
  const seenCanonicalIds = new Set<string>()
  const seenEquivalentKeys = new Set<string>()

  for (const card of primaryDeduped) {
    const equivalentKeys = getEquivalentCardKeys(card)
    const backup =
      fallbackById.get(card.id) ??
      fallbackByCanonicalId.get(canonicalTcgCardId(card.id)) ??
      equivalentKeys.map((key) => fallbackByEquivalentKey.get(key)).find(Boolean)
    merged.push(backup ? mergeRecord(card, backup) : card)
    seenIds.add(card.id)
    seenCanonicalIds.add(canonicalTcgCardId(card.id))
    if (backup) {
      seenIds.add(backup.id)
      seenCanonicalIds.add(canonicalTcgCardId(backup.id))
    }
    for (const key of equivalentKeys) {
      seenEquivalentKeys.add(key)
    }
  }

  for (const card of fallbackDeduped) {
    const canon = canonicalTcgCardId(card.id)
    const equivalentKeys = getEquivalentCardKeys(card)
    if (
      !seenIds.has(card.id) &&
      !seenCanonicalIds.has(canon) &&
      !equivalentKeys.some((key) => seenEquivalentKeys.has(key))
    ) {
      merged.push(card)
      for (const key of equivalentKeys) {
        seenEquivalentKeys.add(key)
      }
    }
  }

  return merged
}
