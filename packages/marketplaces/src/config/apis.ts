/** Marketplace API base URLs and endpoints — single source of truth. */
export const EBAY_API = {
  oauthTokenUrl: 'https://api.ebay.com/identity/v1/oauth2/token',
  oauthScope: 'https://api.ebay.com/oauth/api_scope',
  browseSearchUrl: 'https://api.ebay.com/buy/browse/v1/item_summary/search',
} as const

export const TCGDEX_API = {
  baseUrl: 'https://api.tcgdex.net/v2',
  defaultLang: 'en',
} as const

export const POKEMON_TCG_API = {
  baseUrl: 'https://api.pokemontcg.io/v2',
} as const

/** Public documentation / marketing sites (not API hosts). */
export const MARKETPLACE_WEB = {
  tcgdex: 'https://tcgdex.dev/',
  pokemontcg: 'https://pokemontcg.io',
  scrydex: 'https://scrydex.com',
  tcgplayer: 'https://www.tcgplayer.com',
  ebay: 'https://www.ebay.com',
  etsy: 'https://www.etsy.com',
  whatnot: 'https://www.whatnot.com',
} as const
