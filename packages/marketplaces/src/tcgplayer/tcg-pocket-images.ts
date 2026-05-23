import { tcgCardSetId } from '../config/cdn'
import { isTcgPocketCardId } from './product-line'

export type TcgPocketImageEntry = {
  imageSmall: string
  imageLarge: string
}

let injectedImageByCardId: Record<string, TcgPocketImageEntry> | null = null

export function setTcgPocketImageMap(map: Record<string, TcgPocketImageEntry> | null): void {
  injectedImageByCardId = map
}

/** Keys for TCGdex ids (`B2a-046`) and Scrydex-style (`b2a-46`). */
export function tcgPocketImageLookupKeys(cardId: string): string[] {
  const trimmed = cardId.trim()
  const dash = trimmed.lastIndexOf('-')
  if (dash <= 0) {
    return [trimmed.toLowerCase()]
  }
  const setId = trimmed.slice(0, dash)
  const local = trimmed.slice(dash + 1)
  const unpadded = String(Number.parseInt(local, 10))
  const keys = new Set<string>()
  keys.add(trimmed.toLowerCase())
  keys.add(`${setId}-${local}`.toLowerCase())
  if (unpadded !== local && Number.isFinite(Number.parseInt(local, 10))) {
    keys.add(`${setId}-${unpadded}`.toLowerCase())
  }
  return [...keys]
}

export function getTcgPocketImage(cardId: string): TcgPocketImageEntry | undefined {
  if (!isTcgPocketCardId(cardId)) {
    return undefined
  }
  for (const key of tcgPocketImageLookupKeys(cardId)) {
    const entry = injectedImageByCardId?.[key]
    if (entry?.imageSmall && entry.imageLarge) {
      return entry
    }
  }
  return undefined
}

/** Relative cache/images path for a Pocket card (`pocket/B2a/46.webp`). */
export function tcgPocketImageRelativePath(cardId: string): string | null {
  if (!isTcgPocketCardId(cardId)) {
    return null
  }
  const setId = tcgCardSetId(cardId)
  const local = cardId.slice(cardId.lastIndexOf('-') + 1)
  const unpadded = Number.parseInt(local, 10)
  if (!Number.isFinite(unpadded)) {
    return null
  }
  return `pocket/${setId}/${unpadded}.webp`
}
