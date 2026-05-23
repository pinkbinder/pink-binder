import { getTcgcsvPromoImage, isTcgplayerCdnImageUrl } from './tcgcsv-promo-images'
import { getTrainerKitTcgplayerImage } from './trainer-kit-tcgplayer'
import { isPokemontcgImageUrl, tcgCardSetId } from '../config/cdn'
import {
  canonicalTcgCardId,
  normalizeTcgCardNumber,
  pickPreferredTcgCardId,
  pokemontcgCatalogCardIdFromImageUrl,
} from './card-id'
import { tcgplayerProductUrl } from '../config/cdn'
import { resolveTcgCardImageUrls } from './images'
import { mergeTcgCardPrices } from './pricing'
import {
  isTrainerKitCardId,
  tcgProductLineFromSetId,
  trainerKitDedupeKey,
  trainerKitSlotDedupeKey,
} from './product-line'
import type { TcgCardRecord } from './types'

function normalizeCardKeyPart(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Unify `Collection McDonald's 2019` vs `McDonald's Collection 2019` for promo dedupe. */
function normalizeMcDonaldsSetNameKey(setName: string): string {
  const normalized = normalizeCardKeyPart(setName)
  const year = normalized.match(/\b(20\d{2})\b/)?.[1]
  if (year && /mcdonald/.test(normalized)) {
    return `mcdonald's collection ${year}`
  }
  return normalized
}

function pickMergedTcgCardId(...ids: string[]): string {
  const trimmed = ids.map((value) => value.trim()).filter(Boolean)
  const mcdCatalog = trimmed.find((id) => /^mcd\d+-/i.test(id))
  if (mcdCatalog) {
    return mcdCatalog
  }
  const trainerKitIds = trimmed.filter((id) => isTrainerKitCardId(id))
  if (trainerKitIds.length > 0) {
    return trainerKitIds.sort((a, b) => a.localeCompare(b))[0]!
  }
  const legacyTk2 = trimmed.filter((id) => /^tk2[ab]-/i.test(id))
  if (legacyTk2.length > 0) {
    return legacyTk2.sort((a, b) => a.localeCompare(b))[0]!
  }
  return pickPreferredTcgCardId(...trimmed)
}

function normalizeCardNumberKeyPart(value: string | null | undefined): string {
  const base = normalizeCardKeyPart(value)
  return base ? normalizeTcgCardNumber(base) : ''
}

function isFrenchMcDonaldsPromo(card: TcgCardRecord): boolean {
  const setId = tcgCardSetId(card.id).toLowerCase()
  if (setId.includes('-fr') || /fr$/.test(setId)) {
    return true
  }
  return /collection mcdonald/i.test(normalizeCardKeyPart(card.setName))
}

function mcdonaldsPromoNameYearKey(
  card: TcgCardRecord,
  speciesPokedexNumber?: number
): string | null {
  const year = card.setName?.match(/\b(20\d{2})\b/)?.[1]
  if (!year || !/mcdonald/i.test(card.setName ?? '')) {
    return null
  }
  if (typeof speciesPokedexNumber === 'number') {
    return `mcd-species-dex::${year}::${speciesPokedexNumber}`
  }
  const name = normalizeCardKeyPart(card.name)
  return name ? `mcd-species::${year}::${name}` : null
}

function preferMcDonaldsPromoRecord(
  existing: TcgCardRecord,
  candidate: TcgCardRecord
): TcgCardRecord {
  const score = (record: TcgCardRecord): number => {
    let value = 0
    if (/^mcd\d+-/i.test(record.id)) {
      value += 8
    }
    if (!isFrenchMcDonaldsPromo(record)) {
      value += 4
    }
    if (getTcgcsvPromoImage(record.id) || isTcgplayerCdnImageUrl(record.imageLarge)) {
      value += 16
    }
    if (isPokemontcgImageUrl(record.imageLarge)) {
      value += 2
    }
    return value
  }
  return score(candidate) > score(existing) ? candidate : existing
}

/** One English McDonald's row per species per year (drop 2018sm-fr when mcd18 exists). */
export function collapseMcDonaldsRegionalDuplicates(
  cards: TcgCardRecord[],
  options?: { speciesPokedexNumber?: number }
): TcgCardRecord[] {
  const byKey = new Map<string, TcgCardRecord>()
  const rest: TcgCardRecord[] = []

  for (const card of cards) {
    const key = mcdonaldsPromoNameYearKey(card, options?.speciesPokedexNumber)
    if (!key) {
      rest.push(card)
      continue
    }
    const existing = byKey.get(key)
    byKey.set(key, existing ? preferMcDonaldsPromoRecord(existing, card) : card)
  }

  return [...rest, ...byKey.values()]
}

function preferTrainerKitRecord(existing: TcgCardRecord, candidate: TcgCardRecord): TcgCardRecord {
  const score = (record: TcgCardRecord): number => {
    let value = 0
    if (isTrainerKitCardId(record.id)) {
      value += 8
    }
    if (getTrainerKitTcgplayerImage(record.id) || isTcgplayerCdnImageUrl(record.imageLarge)) {
      value += 16
    }
    if (getTcgcsvPromoImage(record.id)) {
      value += 4
    }
    if (isPokemontcgImageUrl(record.imageLarge)) {
      value += 2
    }
    return value
  }
  return score(candidate) > score(existing) ? candidate : existing
}

/** One row per trainer-kit slot (e.g. `tk-ex-m-4` + `tk2b-4` on the same species page). */
export function collapseTrainerKitDuplicates(
  cards: TcgCardRecord[],
  options?: { speciesPokedexNumber?: number }
): TcgCardRecord[] {
  const byKey = new Map<string, TcgCardRecord>()
  const rest: TcgCardRecord[] = []

  for (const card of cards) {
    const key = trainerKitSlotDedupeKey(card, options)
    if (!key) {
      rest.push(card)
      continue
    }
    const existing = byKey.get(key)
    byKey.set(key, existing ? preferTrainerKitRecord(existing, card) : card)
  }

  return [...rest, ...byKey.values()]
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

  if (setName && number && /mcdonald/.test(setName)) {
    keys.push(`mcd-promo::${normalizeMcDonaldsSetNameKey(setName)}::${number}`)
  }

  const trainerKitKey = trainerKitDedupeKey(card.setName, card.name, card.number)
  if (trainerKitKey) {
    keys.push(trainerKitKey)
  }
  const trainerKitSlotKey = trainerKitSlotDedupeKey(card)
  if (trainerKitSlotKey && trainerKitSlotKey !== trainerKitKey) {
    keys.push(trainerKitSlotKey)
  }

  return keys
}

function pickPokemontcgApiImages(...records: TcgCardRecord[]): { small?: string; large?: string } {
  let small: string | undefined
  let large: string | undefined
  for (const record of records) {
    for (const url of [record.imageSmall, ...(record.imageSmallFallbacks ?? [])]) {
      if (!small && isPokemontcgImageUrl(url)) {
        small = url.trim()
      }
    }
    for (const url of [record.imageLarge, ...(record.imageLargeFallbacks ?? [])]) {
      if (!large && isPokemontcgImageUrl(url)) {
        large = url.trim()
      }
    }
  }
  return { small, large }
}

function preferredCatalogCardIdFromRecord(card: TcgCardRecord): string | null {
  for (const url of [...(card.imageSmallFallbacks ?? []), ...(card.imageLargeFallbacks ?? [])]) {
    const id = pokemontcgCatalogCardIdFromImageUrl(url)
    if (id) return id
  }
  return (
    pokemontcgCatalogCardIdFromImageUrl(card.imageSmall) ??
    pokemontcgCatalogCardIdFromImageUrl(card.imageLarge)
  )
}

function mergeRecord(primary: TcgCardRecord, fallback: TcgCardRecord): TcgCardRecord {
  const price = mergeTcgCardPrices(primary.price, fallback.price)
  const mergedId = pickMergedTcgCardId(primary.id, fallback.id)
  const preferredCatalogCardId =
    preferredCatalogCardIdFromRecord(fallback) ?? preferredCatalogCardIdFromRecord(primary)
  const tcgplayerUrl =
    tcgplayerProductUrl(mergedId, fallback.tcgplayerUrl ?? primary.tcgplayerUrl, {
      preferredCatalogCardId,
    }) ??
    fallback.tcgplayerUrl ??
    primary.tcgplayerUrl
  const tcgImages = resolveTcgCardImageUrls(
    mergedId,
    pickPokemontcgApiImages(fallback, primary),
    null,
    tcgplayerUrl
  )

  const setId = mergedId.includes('-') ? mergedId.slice(0, mergedId.lastIndexOf('-')) : mergedId

  return {
    id: mergedId,
    name: primary.name || fallback.name,
    ...tcgImages,
    rarity: primary.rarity ?? fallback.rarity,
    setName: primary.setName || fallback.setName,
    setSeries: fallback.setSeries || primary.setSeries,
    number: normalizeTcgCardNumber(primary.number || fallback.number),
    artist: primary.artist ?? fallback.artist,
    tcgplayerUrl,
    price,
    metadataSource: primary.metadataSource,
    productLine: tcgProductLineFromSetId(setId),
  }
}

function attachProductLine(card: TcgCardRecord): TcgCardRecord {
  const setId = card.id.includes('-') ? card.id.slice(0, card.id.lastIndexOf('-')) : card.id
  return {
    ...card,
    productLine: card.productLine ?? tcgProductLineFromSetId(setId),
  }
}

function dedupeWithinSource(cards: TcgCardRecord[]): TcgCardRecord[] {
  const byCanonicalId = new Map<string, TcgCardRecord>()

  for (const card of cards) {
    const canon = canonicalTcgCardId(card.id)
    const existing = byCanonicalId.get(canon)
    if (!existing) {
      byCanonicalId.set(canon, attachProductLine(card))
      continue
    }
    byCanonicalId.set(canon, attachProductLine(mergeRecord(existing, card)))
  }

  const byTrainerKit = new Map<string, TcgCardRecord>()
  const rest: TcgCardRecord[] = []

  for (const card of byCanonicalId.values()) {
    const key = trainerKitDedupeKey(card.setName, card.name, card.number)
    if (!key) {
      rest.push(card)
      continue
    }
    const existing = byTrainerKit.get(key)
    if (!existing) {
      byTrainerKit.set(key, card)
      continue
    }
    byTrainerKit.set(key, mergeRecord(existing, card))
  }

  return [...rest, ...byTrainerKit.values()]
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

  return collapseTrainerKitDuplicates(collapseMcDonaldsRegionalDuplicates(merged))
}
