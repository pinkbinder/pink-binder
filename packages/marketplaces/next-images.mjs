/** Plain ESM for Next.js `next.config.mjs` (Node cannot load TS config barrels). */

const TCG_CARD_IMAGE_HOSTS = ['images.pokemontcg.io', 'assets.tcgdex.net', 'images.scrydex.com']

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
