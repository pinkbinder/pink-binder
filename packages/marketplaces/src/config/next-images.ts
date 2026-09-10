import { EBAY_CDN_HOSTS, TCG_CARD_IMAGE_HOSTS } from './cdn'

/**
 * Remote hosts served directly (no optimizer) so the browser loads CDNs as-is.
 * Blog-owned assets are pre-optimized on the R2 CDN; roundup pages load dozens
 * of remote sprites/cards per view, so runtime transforms stay off.
 */
/** R2 public host for Pink Binder images (Cloudflare). */
export const R2_PUBLIC_HOST = 'images.pinkbinder.shop'

const REMOTE_IMAGE_BYPASS_HOSTS = [
  ...TCG_CARD_IMAGE_HOSTS,
  ...EBAY_CDN_HOSTS,
  'raw.githubusercontent.com',
  'www.artofpkm.com',
  'projectpokemon.org',
  R2_PUBLIC_HOST,
] as const

const BYPASS_HOSTS = new Set<string>(REMOTE_IMAGE_BYPASS_HOSTS)

/**
 * Whether a remote image URL should bypass optimization and load directly.
 * Local `/public` paths return false (served as-is by the Worker assets).
 */
export function shouldBypassImageOptimization(src: string): boolean {
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
    return hostname === R2_PUBLIC_HOST
  } catch {
    return false
  }
}

/** @deprecated Use {@link shouldBypassImageOptimization} instead. */
export const shouldBypassNextImageOptimization = shouldBypassImageOptimization
