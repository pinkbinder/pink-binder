/** Plain ESM remote image patterns (Node cannot load TS config barrels). */

const TCG_CARD_IMAGE_HOSTS = [
  'images.pokemontcg.io',
  'assets.tcgdex.net',
  'images.scrydex.com',
  'tcgplayer-cdn.tcgplayer.com',
  'pokemon-cards-prod-public.shinydev.io',
]

const POKEAPI_SPRITES_HOST = 'raw.githubusercontent.com'

const BLOG_ART_REMOTE_HOSTS = ['www.artofpkm.com', 'projectpokemon.org']

const R2_PUBLIC_HOST = 'images.pinkbinder.shop'
const R2_REMOTE_PATTERN = {
  protocol: 'https',
  hostname: R2_PUBLIC_HOST,
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
    R2_REMOTE_PATTERN,
    ...tcgCardImageRemotePatterns(),
    ...BLOG_ART_REMOTE_HOSTS.map((hostname) => httpsHost(hostname)),
  ]
}

/**
 * Blog image settings. Skip the image optimizer — roundup pages load dozens of
 * remote sprites/cards per view and blog-owned assets are pre-optimized on the
 * R2 CDN. Do not add an Images binding or a custom Cloudflare loader to the
 * blog: both would make runtime transformations an available cost path.
 *
 * @deprecated Use {@link blogImageRemotePatterns} instead.
 */
export function blogNextImagesConfig() {
  return {
    unoptimized: true,
    remotePatterns: blogImageRemotePatterns(),
  }
}
