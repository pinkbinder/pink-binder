import { mergeTcgCardRecords } from './merge'
import { getPokemontcgPokemonCardById, searchPokemontcgPokemonCards } from './providers/pokemontcg'
import { getTcgdexPokemonCardById, searchTcgdexPokemonCards } from './providers/tcgdex'
import type { GetPokemonTcgCardsOptions, TcgCardRecord } from './types'

export type {
  GetPokemonTcgCardsOptions,
  TcgCardPrice,
  TcgCardPriceSource,
  TcgCardRecord,
} from './types'

export {
  collapseMcDonaldsRegionalDuplicates,
  collapseTrainerKitDuplicates,
  mergeTcgCardRecords,
} from './merge'

export {
  canonicalTcgCardId,
  normalizeTcgCardNumber,
  pickPreferredTcgCardId,
  resolveScrydexCardId,
  tcgplayerUrlCardId,
  tcgSetIdToPokemontcgCatalog,
  TCGDEX_TO_POKEMONTCG_SET,
  toPokemontcgCatalogCardId,
  toScrydexCatalogCardId,
  pokemontcgCatalogCardIdFromImageUrl,
} from './card-id'

export {
  isTcgPocketCardId,
  isTcgPocketSetId,
  isTrainerKitCardId,
  isTrainerKitSetName,
  tcgProductLineFromSetId,
  trainerKitDedupeKey,
  trainerKitSlotDedupeKey,
  normalizeTrainerKitSetNameKey,
  POKEMONTCG_TRAINER_KIT_SET_TO_TCGDEX,
  tcgdxTrainerKitSetIdForCard,
} from './product-line'

export {
  TCGDEX_TRAINER_KIT_TO_TCGCSV_GROUP,
  buildTrainerKitTcgplayerUrlMap,
  getTrainerKitTcgplayerUrl,
  getTrainerKitTcgplayerImage,
  parseTrainerKitCardId,
  setTrainerKitTcgplayerUrlMap,
  type TrainerKitCardRef,
} from './trainer-kit-tcgplayer'

export {
  getTcgPocketImage,
  setTcgPocketImageMap,
  tcgPocketImageLookupKeys,
  tcgPocketImageRelativePath,
  type TcgPocketImageEntry,
} from './tcg-pocket-images'

export {
  buildTcgcsvPromoImageMap,
  buildTcgplayerCdnImageUrls,
  extractTcgplayerProductId,
  getTcgcsvPromoImage,
  isTcgplayerCdnImageUrl,
  setTcgcsvPromoImageMap,
  tcgcsvGroupForCardId,
  tcgplayerCdnImageUrlsFromSmallUrl,
  TCGCSV_PROMO_SET_TO_GROUP,
  type TcgcsvPromoCardRef,
  type TcgcsvPromoImageEntry,
  type TcgplayerCdnImageUrls,
} from './tcgcsv-promo-images'

export type { TcgProductLine } from './types'

export {
  isDisplayableTcgCardImageUrl,
  preferredTcgCardImageUrl,
  largestTcgCardImageUrl,
  preferTcgdexStripImageUrl,
  heroStripImageCandidates,
  tcgCardImageCandidates,
  resolveTcgCardImageUrls,
  buildPokemontcgImageFallbacks,
  buildPokemontcgImageUrlsFromCardId,
  buildScrydexCardImageUrls,
  buildTcgdexImageUrls,
  tcgplayerProductUrl,
  type TcgCardImageUrls,
} from './images'

export {
  inferSetSeries,
  pickPokemontcgPrice,
  pickTcgdexCardmarketPrice,
  pickTcgdexPrice,
} from './pricing'

export {
  TCGCSV_BASE,
  TCGCSV_LAST_UPDATED_URL,
  TCGCSV_POKEMON_CATEGORY_ID,
  TCGCSV_REQUEST_DELAY_MS,
  TCGCSV_USER_AGENT,
  fetchAllTcgcsvPokemonGroupData,
  fetchTcgcsvGroupPrices,
  fetchTcgcsvGroupProducts,
  fetchTcgcsvLastUpdated,
  fetchTcgcsvPokemonGroups,
  type TcgcsvGroup,
  type TcgcsvPokemonGroupData,
  type TcgcsvPriceRow,
  type TcgcsvProduct,
} from './tcgcsv-client'

export {
  TCGCSV_MIN_FULL_SYNC_INTERVAL_MS,
  TCGCSV_POKEMON_FULL_SYNC_MAX_REQUESTS,
  resolveTcgcsvFullSyncSkip,
  tcgcsvRemoteBuildIsNewer,
  type TcgcsvSkipFullSyncReason,
} from './tcgcsv-sync-policy'

export {
  buildTcgcsvPriceIndex,
  lookupTcgcsvCatalogEntry,
  lookupTcgcsvPriceIndexEntry,
  maxTcgcsvMarketPrice,
  normalizeTcgcsvPriceIndex,
  parseTcgplayerSetIdFromProductUrl,
  type TcgcsvPriceIndex,
  type TcgcsvPriceIndexEntry,
} from './tcgcsv-price-index'

export {
  buildTcgCardImageStack,
  shouldApplyTcgcsvImageStack,
  type TcgCardImageStack,
} from './tcg-card-image-stack'

export { tcgplayerImageSmallFromProduct } from './tcgcsv-promo-images'

export {
  buildSetToGroupIdMap,
  normalizeTcgSetTitle,
  resolveTcgcsvGroupIdForCard,
  type TcgSetCatalogEntry,
} from './tcgcsv-set-groups'

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
  const speciesName = options.speciesName?.trim() ?? ''
  const artistName = options.artistName?.trim()
  const artistOnly = options.artistOnly === true

  if (!artistOnly && !speciesName) {
    return []
  }

  if (artistOnly && !artistName) {
    return []
  }

  const normalized: GetPokemonTcgCardsOptions = {
    ...options,
    speciesName: speciesName || undefined,
    artistName,
    artistOnly,
    limit: options.limit ?? DEFAULT_SPECIES_LIMIT,
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
