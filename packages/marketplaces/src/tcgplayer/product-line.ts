import { tcgCardSetId } from '../config/cdn'
import type { TcgProductLine } from './types'

/**
 * Pokémon TCG Pocket expansion ids on TCGdex (Genetic Apex `A1`, Fantastical Parade `B2`, etc.).
 * @see https://api.tcgdex.net/v2/en/sets — Pocket sets use `A*` / `B*` ids, not pokemontcg.io catalog ids.
 */
export function isTcgPocketSetId(setId: string): boolean {
  const id = setId.trim().toLowerCase()
  if (id === 'p-a') {
    return true
  }
  return /^[ab]\d+[a-z]?$/i.test(id)
}

export function isTcgPocketCardId(cardId: string): boolean {
  return isTcgPocketSetId(tcgCardSetId(cardId))
}

export function tcgProductLineFromSetId(setId: string): TcgProductLine {
  return isTcgPocketSetId(setId) ? 'pokemon-tcg-pocket' : 'physical'
}

/** XY / SM trainer kits (duplicate kit slots per species; often no CDN scans). */
export function isTrainerKitSetName(setName: string | null | undefined): boolean {
  return /trainer\s+kit/i.test(setName ?? '')
}

export function trainerKitDedupeKey(
  setName: string | null | undefined,
  cardName: string | null | undefined
): string | null {
  if (!isTrainerKitSetName(setName)) {
    return null
  }
  const normalizedSet = (setName ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
  const normalizedName = (cardName ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (!normalizedSet || !normalizedName) {
    return null
  }
  return `trainer-kit::${normalizedSet}::${normalizedName}`
}
