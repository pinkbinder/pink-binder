import { EBAY_CDN_HOSTS, TCG_CARD_IMAGE_HOSTS } from './cdn'

/**
 * Remote hosts served with `unoptimized` on `next/image` so the browser loads CDNs directly.
 * Pair with `blogNextImagesConfig().unoptimized` on Cloudflare so new Image usages bypass transforms.
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
 * Use `unoptimized` on `next/image` for remote CDN assets. Local `/public` paths may
 * still use the optimizer when the hosting plan allows it. The Wrangler `IMAGES`
 * binding is not an automatic Next.js loader; a Cloudflare transformation path
 * must be explicitly configured with `loaderFile` or a per-image loader.
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
    return hostname === R2_PUBLIC_HOST
  } catch {
    return false
  }
}
