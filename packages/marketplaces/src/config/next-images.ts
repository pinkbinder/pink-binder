import { EBAY_CDN_HOSTS, TCG_CARD_IMAGE_HOSTS } from './cdn'

export interface NextImageRemotePattern {
  protocol: 'https'
  hostname: string
  pathname?: string
}

function httpsHost(hostname: string, pathname?: string): NextImageRemotePattern {
  return pathname ? { protocol: 'https', hostname, pathname } : { protocol: 'https', hostname }
}

/** Remote patterns for Pokémon TCG card images in Next.js apps. */
export function tcgCardImageRemotePatterns(): NextImageRemotePattern[] {
  return TCG_CARD_IMAGE_HOSTS.map((hostname) => httpsHost(hostname))
}

/** Remote patterns for eBay listing thumbnails. */
export function ebayListingImageRemotePatterns(): NextImageRemotePattern[] {
  return EBAY_CDN_HOSTS.map((hostname) => httpsHost(hostname))
}

/** Favicon URLs used on shop / link-in-bio surfaces. */
export function googleFaviconRemotePatterns(): NextImageRemotePattern[] {
  return [httpsHost('www.google.com', '/s2/favicons/**')]
}
