/**
 * Immutable, build-time variants for blog-owned raster assets.
 *
 * These URLs deliberately bypass Next/Image and Cloudflare Image Transformations.
 * The versioned path makes a one-year immutable browser cache safe: bump the
 * version when a source asset changes.
 */
const BLOG_R2_ASSET_BASE_URL = 'https://images.pinkbinder.shop/v1/images/brand'

export const BLOG_R2_ASSETS = {
  logo: {
    small: `${BLOG_R2_ASSET_BASE_URL}/logo/64.webp`,
    medium: `${BLOG_R2_ASSET_BASE_URL}/logo/192.webp`,
    large: `${BLOG_R2_ASSET_BASE_URL}/logo/1024.webp`,
  },
  promo: {
    small: `${BLOG_R2_ASSET_BASE_URL}/whatnot-promo/320.webp`,
    medium: `${BLOG_R2_ASSET_BASE_URL}/whatnot-promo/640.webp`,
    large: `${BLOG_R2_ASSET_BASE_URL}/whatnot-promo/886.webp`,
  },
} as const

export const BLOG_LOCAL_ASSETS = {
  logo: '/images/logo.png',
  promo: '/images/whatnot-promo.jpeg',
} as const
