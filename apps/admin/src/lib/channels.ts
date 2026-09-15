/**
 * Channel registries for the console's three services. Each channel pairs a
 * stable id with a display label and a brand-tinted identity dot so the same
 * channel reads the same way on the overview, inventory sync chips, content
 * cards, and ad rows.
 *
 * Integration note: these are display-only until the marketplace, publishing,
 * and ad APIs are connected. Ids match the marketplace names used by
 * @repo/marketplaces (eBay, TCGPlayer) where they exist, so wiring real data
 * later is a data swap, not a UI rewrite.
 */

export interface ChannelMeta {
  label: string
  /** Tailwind background utility painting the identity dot. */
  dotClass: string
  /** Optional inline gradient for platforms whose brand mark is a gradient. */
  dotStyle?: string
}

export const INVENTORY_CHANNELS = ['shopify', 'ebay', 'tcgplayer', 'whatnot'] as const
export type InventoryChannel = (typeof INVENTORY_CHANNELS)[number]

export const INVENTORY_CHANNEL_META: Record<InventoryChannel, ChannelMeta> = {
  shopify: { label: 'Shopify', dotClass: 'bg-channel-shopify' },
  ebay: { label: 'eBay', dotClass: 'bg-channel-ebay' },
  tcgplayer: { label: 'TCGPlayer', dotClass: 'bg-channel-tcgplayer' },
  whatnot: { label: 'Whatnot', dotClass: 'bg-channel-whatnot' },
}

export const CONTENT_PLATFORMS = [
  'blog',
  'twitter',
  'instagram',
  'facebook',
  'pinterest',
  'tiktok',
] as const
export type ContentPlatform = (typeof CONTENT_PLATFORMS)[number]

export const CONTENT_PLATFORM_META: Record<ContentPlatform, ChannelMeta> = {
  blog: { label: 'Blog', dotClass: 'bg-primary' },
  twitter: { label: 'X / Twitter', dotClass: 'bg-channel-x' },
  instagram: {
    label: 'Instagram',
    dotClass: 'bg-transparent',
    dotStyle: 'conic-gradient(from 210deg, #F58529, #DD2A7B, #8134AF, #515BD4, #F58529)',
  },
  facebook: { label: 'Facebook', dotClass: 'bg-channel-facebook' },
  pinterest: { label: 'Pinterest', dotClass: 'bg-channel-pinterest' },
  tiktok: { label: 'TikTok', dotClass: 'bg-channel-tiktok' },
}

export const AD_PLATFORMS = ['facebook', 'google', 'twitter', 'pinterest', 'other'] as const
export type AdPlatform = (typeof AD_PLATFORMS)[number]

export const AD_PLATFORM_META: Record<AdPlatform, ChannelMeta> = {
  facebook: { label: 'Facebook', dotClass: 'bg-channel-facebook' },
  google: {
    label: 'Google',
    dotClass: 'bg-transparent',
    dotStyle: 'conic-gradient(#4285F4, #EA4335, #FBBC05, #34A853, #4285F4)',
  },
  twitter: { label: 'X / Twitter', dotClass: 'bg-channel-x' },
  pinterest: { label: 'Pinterest', dotClass: 'bg-channel-pinterest' },
  other: { label: 'Other', dotClass: 'bg-muted-foreground/60' },
}
