import { mergeTcgCardRecords } from './merge'
import { getPokemontcgPokemonCardById, searchPokemontcgPokemonCards } from './providers/pokemontcg'
import { getTcgdexPokemonCardById, searchTcgdexPokemonCards } from './providers/tcgdex'
import type { GetPokemonTcgCardsOptions, TcgCardRecord } from './types'

export type {
  GetPokemonTcgCardsOptions,
  TcgCardArtistFilter,
  TcgCardPrice,
  TcgCardPriceSource,
  TcgCardRecord,
} from './types'

export { mergeTcgCardRecords } from './merge'

export { canonicalTcgCardId, normalizeTcgCardNumber, pickPreferredTcgCardId } from './card-id'

export {
  tcgCardImageCandidates,
  resolveTcgCardImageUrls,
  buildPokemontcgImageFallbacks,
  buildScrydexCardImageUrls,
  buildTcgdexImageUrls,
  tcgplayerProductUrl,
  type TcgCardImageUrls,
} from './images'

export { inferSetSeries, pickPokemontcgPrice, pickTcgdexPrice } from './pricing'

export {
  TCGDEX_API,
  POKEMON_TCG_API,
  POKEMON_TCG_API_BASE,
  TCG_CARD_DATA_ATTRIBUTION,
  TCG_CARD_IMAGE_ATTRIBUTION,
} from '../config'

const DEFAULT_SPECIES_LIMIT = 36

/** TCGdex is primary; pokemontcg.io is backup — see {@link MARKETPLACE_WEB}. */
export async function getPokemonTcgCards(
  options: GetPokemonTcgCardsOptions
): Promise<TcgCardRecord[]> {
  const normalized: GetPokemonTcgCardsOptions = {
    ...options,
    speciesName: options.speciesName.trim(),
    limit: options.limit ?? DEFAULT_SPECIES_LIMIT,
  }

  if (!normalized.speciesName) {
    return []
  }

  const [tcgdexCards, pokemontcgCards] = await Promise.all([
    searchTcgdexPokemonCards(normalized),
    searchPokemontcgPokemonCards(normalized),
  ])

  if (tcgdexCards.length > 0) {
    return mergeTcgCardRecords(tcgdexCards, pokemontcgCards)
  }

  return pokemontcgCards
}

export async function getPokemonTcgCardById(
  cardId: string,
  revalidateSeconds?: number
): Promise<TcgCardRecord | null> {
  const id = cardId.trim()
  if (!id) {
    return null
  }

  const [tcgdexCard, pokemontcgCard] = await Promise.all([
    getTcgdexPokemonCardById(id, revalidateSeconds),
    getPokemontcgPokemonCardById(id, revalidateSeconds),
  ])

  if (tcgdexCard && pokemontcgCard) {
    return mergeTcgCardRecords([tcgdexCard], [pokemontcgCard])[0] ?? null
  }

  return tcgdexCard ?? pokemontcgCard
}

export {
  fetchTopExpensiveByTcgType,
  fetchTopExpensivePokemonCards,
  maxPokemontcgMarketPrice,
  buildNationalDexSearchQuery,
  buildTcgTypeSearchQuery,
  type ExpensiveTcgCardSnapshot,
} from './expensive'

export const getTcgPlayerCards = getPokemonTcgCards

export async function getTcgPlayerListings(): Promise<never[]> {
  return []
}
