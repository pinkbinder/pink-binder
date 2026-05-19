/** Plain ESM for Next.js `next.config.mjs` (Node cannot load TS config barrels). */

/** Edge cache TTL for `/_next/image` (seconds). Vercel allows up to ~31 days. */
export const NEXT_IMAGE_MINIMUM_CACHE_TTL = 60 * 60 * 24 * 31

const TCG_CARD_IMAGE_HOSTS = ['images.pokemontcg.io', 'assets.tcgdex.net', 'images.scrydex.com']

const POKEAPI_SPRITES_HOST = 'raw.githubusercontent.com'

const BLOG_ART_REMOTE_HOSTS = ['www.artofpkm.com', 'projectpokemon.org']

const EBAY_CDN_HOSTS = ['i.ebayimg.com', 'thumbs.ebaystatic.com']

function httpsHost(hostname, pathname) {
  return pathname ? { protocol: 'https', hostname, pathname } : { protocol: 'https', hostname }
}

export function tcgCardImageRemotePatterns() {
  return TCG_CARD_IMAGE_HOSTS.map((hostname) => httpsHost(hostname))
}

export function ebayListingImageRemotePatterns() {
  return EBAY_CDN_HOSTS.map((hostname) => httpsHost(hostname))
}

export function googleFaviconRemotePatterns() {
  return [httpsHost('www.google.com', '/s2/favicons/**')]
}

export function blogImageRemotePatterns() {
  return [
    {
      protocol: 'https',
      hostname: POKEAPI_SPRITES_HOST,
      pathname: '/PokeAPI/sprites/**',
    },
    ...tcgCardImageRemotePatterns(),
    ...BLOG_ART_REMOTE_HOSTS.map((hostname) => httpsHost(hostname)),
  ]
}

/**
 * Blog image settings. On Vercel, skip the image optimizer entirely — roundup pages
 * load dozens of remote sprites/cards per view and each unique URL×width counts as a transform.
 */
export function blogNextImagesConfig() {
  return {
    unoptimized: process.env.VERCEL === '1',
    minimumCacheTTL: NEXT_IMAGE_MINIMUM_CACHE_TTL,
    remotePatterns: blogImageRemotePatterns(),
  }
}
