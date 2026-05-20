import { EBAY_CDN_HOSTS, TCG_CARD_IMAGE_HOSTS } from './cdn'

/**
 * Remote hosts served with `unoptimized` on `next/image` so the browser loads CDNs directly.
 * Pair with `blogNextImagesConfig().unoptimized` on Vercel so new Image usages cannot bill transforms.
 */
/** Vercel Blob public store host suffix (e.g. `{storeId}.public.blob.vercel-storage.com`). */
export const VERCEL_BLOB_PUBLIC_HOST_SUFFIX = '.public.blob.vercel-storage.com'

export const REMOTE_IMAGE_BYPASS_HOSTS = [
  ...TCG_CARD_IMAGE_HOSTS,
  ...EBAY_CDN_HOSTS,
  'raw.githubusercontent.com',
  'www.artofpkm.com',
  'projectpokemon.org',
] as const

const BYPASS_HOSTS = new Set<string>(REMOTE_IMAGE_BYPASS_HOSTS)

/**
 * Use `unoptimized` on `next/image` for remote CDN assets. Local `/public` paths may
 * still use the optimizer when the hosting plan allows it.
 */
export function shouldBypassNextImageOptimization(src: string): boolean {
  const trimmed = src.trim()
  if (!trimmed) {
    return false
  }
  if (trimmed.endsWith('.svg')) {
    return true
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return false
  }
  try {
    const { hostname } = new URL(trimmed)
    if (BYPASS_HOSTS.has(hostname)) {
      return true
    }
    return hostname.endsWith(VERCEL_BLOB_PUBLIC_HOST_SUFFIX)
  } catch {
    return false
  }
}

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
