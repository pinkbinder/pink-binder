import { tcgCardSetId } from '../config/cdn'
import { normalizeTcgCardNumber } from './card-id'
import type { TcgProductLine } from './types'
import type { TcgCardRecord } from './types'

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

/** TCGdex trainer-kit print ids (`tk-bw-e-12`, `tk-xy-p-7`, …). */
export function isTrainerKitCardId(cardId: string | null | undefined): boolean {
  return /^tk-/i.test(cardId?.trim() ?? '')
}

/** pokemontcg.io catalog halves of EX Trainer Kit 2 → TCGdex kit set id. */
export const POKEMONTCG_TRAINER_KIT_SET_TO_TCGDEX: Record<string, string> = {
  tk2a: 'tk-ex-p',
  tk2b: 'tk-ex-m',
}

function normalizeCardKeyPart(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Unify `EX trainer Kit 2 (Minun)` vs `EX Trainer Kit 2 Minun` for trainer-kit dedupe. */
export function normalizeTrainerKitSetNameKey(setName: string): string {
  let normalized = normalizeCardKeyPart(setName)
  normalized = normalized
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return normalized
}

export function tcgdxTrainerKitSetIdForCard(
  card: Pick<TcgCardRecord, 'id' | 'setName'>
): string | null {
  const setId = tcgCardSetId(card.id).toLowerCase()
  if (isTrainerKitCardId(card.id)) {
    return setId
  }
  const mapped = POKEMONTCG_TRAINER_KIT_SET_TO_TCGDEX[setId]
  if (mapped) {
    return mapped
  }
  if (!isTrainerKitSetName(card.setName)) {
    return null
  }
  const key = normalizeTrainerKitSetNameKey(card.setName ?? '')
  if (/latias/.test(key)) {
    return 'tk-ex-latia'
  }
  if (/latios/.test(key)) {
    return 'tk-ex-latio'
  }
  if (/minun/.test(key)) {
    return 'tk-ex-m'
  }
  if (/plusle/.test(key)) {
    return 'tk-ex-p'
  }
  return null
}

export function trainerKitDedupeKey(
  setName: string | null | undefined,
  cardName: string | null | undefined,
  cardNumber?: string | null | undefined
): string | null {
  if (!isTrainerKitSetName(setName)) {
    return null
  }
  const normalizedSet = normalizeTrainerKitSetNameKey(setName ?? '')
  const normalizedName = normalizeCardKeyPart(cardName)
  const normalizedNumber = cardNumber
    ? normalizeTcgCardNumber(cardNumber) || normalizeCardKeyPart(cardNumber)
    : ''
  if (!normalizedSet || !normalizedName) {
    return null
  }
  return normalizedNumber
    ? `trainer-kit::${normalizedSet}::${normalizedName}::${normalizedNumber}`
    : `trainer-kit::${normalizedSet}::${normalizedName}`
}

/** Stable slot key for TCGdex `tk-ex-m-4` + pokemontcg `tk2b-4` duplicates on a species page. */
export function trainerKitSlotDedupeKey(
  card: Pick<TcgCardRecord, 'id' | 'setName' | 'name' | 'number'>,
  options?: { speciesPokedexNumber?: number }
): string | null {
  const kitSetId = tcgdxTrainerKitSetIdForCard(card)
  const number = card.number
    ? normalizeTcgCardNumber(card.number) || normalizeCardKeyPart(card.number)
    : ''
  if (!kitSetId || !number) {
    return trainerKitDedupeKey(card.setName, card.name, card.number)
  }
  if (typeof options?.speciesPokedexNumber === 'number') {
    return `trainer-kit-slot::${kitSetId}::${options.speciesPokedexNumber}::${number}`
  }
  return trainerKitDedupeKey(card.setName, card.name, card.number)
}
