import { SHOP_LINKS, type ShopLink } from './site'

export const MARKETPLACE_SLUGS = ['ebay', 'etsy', 'tcgplayer', 'whatnot'] as const
export type MarketplaceSlug = (typeof MARKETPLACE_SLUGS)[number]

/**
 * Native listing-image aspect ratios per marketplace so cards use `object-contain`
 * without cropping (eBay gallery thumbs are square, TCGPlayer uses card proportions, etc.).
 */
const LISTING_IMAGE_ASPECT: Record<MarketplaceSlug, string> = {
  ebay: '1 / 1',
  etsy: '1 / 1',
  tcgplayer: '5 / 7',
  whatnot: '1 / 1',
}

const SLUG_BY_MARKETPLACE_NAME: Record<string, MarketplaceSlug> = {
  eBay: 'ebay',
  Etsy: 'etsy',
  TCGPlayer: 'tcgplayer',
  Whatnot: 'whatnot',
}

export interface MarketplaceDisplay {
  slug: MarketplaceSlug
  /** Display name, e.g. "eBay" */
  name: string
  storeName: string
  /** Human title for shop CTAs, e.g. "Shop thepinkbinder on eBay" */
  shopTitle: string
  storeUrl: string
  /** Favicon or logo URL for listing badges */
  logoUrl: string
  /** CSS `aspect-ratio` value for listing card images */
  listingImageAspectRatio: string
}

function shopLinkToDisplay(link: ShopLink): MarketplaceDisplay | null {
  if (!link.marketplace) {
    return null
  }

  const slug = SLUG_BY_MARKETPLACE_NAME[link.marketplace]
  if (!slug) {
    return null
  }

  return {
    slug,
    name: link.marketplace,
    storeName: link.storeName ?? '',
    shopTitle: link.label,
    storeUrl: link.href,
    logoUrl: link.thumbnail,
    listingImageAspectRatio: LISTING_IMAGE_ASPECT[slug],
  }
}

export function getMarketplaceDisplay(slug: MarketplaceSlug): MarketplaceDisplay {
  const link = SHOP_LINKS.find(
    (entry) => entry.marketplace && SLUG_BY_MARKETPLACE_NAME[entry.marketplace] === slug
  )

  const display = link ? shopLinkToDisplay(link) : null
  if (!display) {
    throw new Error(`No shop link configured for marketplace slug "${slug}".`)
  }

  return display
}

export const MARKETPLACE_DISPLAYS: MarketplaceDisplay[] = SHOP_LINKS.map((link) =>
  shopLinkToDisplay(link)
).filter((display): display is MarketplaceDisplay => display !== null)
