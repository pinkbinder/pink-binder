/** Environment variable names for marketplace integrations (values live in deployment env). */
export const EBAY_ENV = {
  appId: 'EBAY_APP_ID',
  clientSecret: 'EBAY_CLIENT_SECRET',
  certId: 'EBAY_CERT_ID',
  sellerUsername: 'EBAY_SELLER_USERNAME',
  searchQuery: 'EBAY_SEARCH_QUERY',
  marketplaceId: 'EBAY_MARKETPLACE_ID',
  debug: 'EBAY_DEBUG',
  verificationToken: 'EBAY_VERIFICATION_TOKEN',
  accountDeletionEndpoint: 'EBAY_ACCOUNT_DELETION_ENDPOINT',
  notificationEndpoint: 'EBAY_NOTIFICATION_ENDPOINT',
} as const

export const POKEMON_TCG_ENV = {
  apiKey: 'POKEMON_TCG_API_KEY',
} as const

export const TCGDEX_ENV = {
  lang: 'TCGDEX_LANG',
} as const
