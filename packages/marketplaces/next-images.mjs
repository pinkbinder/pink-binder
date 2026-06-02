/** Plain ESM for Next.js `next.config.mjs` (Node cannot load TS config barrels). */

/** Edge cache TTL for `/_next/image` (seconds). Vercel allows up to ~31 days. */
export const NEXT_IMAGE_MINIMUM_CACHE_TTL = 60 * 60 * 24 * 31

const TCG_CARD_IMAGE_HOSTS = [
  'images.pokemontcg.io',
  'assets.tcgdex.net',
  'images.scrydex.com',
  'tcgplayer-cdn.tcgplayer.com',
]

const POKEAPI_SPRITES_HOST = 'raw.githubusercontent.com'

const BLOG_ART_REMOTE_HOSTS = ['www.artofpkm.com', 'projectpokemon.org']

/** Matches `{storeId}.public.blob.vercel-storage.com` (Vercel Blob CDN). */
const VERCEL_BLOB_REMOTE_PATTERN = {
  protocol: 'https',
  hostname: '*.public.blob.vercel-storage.com',
}

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
    VERCEL_BLOB_REMOTE_PATTERN,
    ...tcgCardImageRemotePatterns(),
    ...BLOG_ART_REMOTE_HOSTS.map((hostname) => httpsHost(hostname)),
  ]
}

/**
 * Blog image settings. Skip the image optimizer — roundup pages load dozens of
 * remote sprites/cards per view and assets are pre-optimized on Vercel Blob CDN.
 */
export function blogNextImagesConfig() {
  return {
    unoptimized: true,
    minimumCacheTTL: NEXT_IMAGE_MINIMUM_CACHE_TTL,
    remotePatterns: blogImageRemotePatterns(),
  }
}
