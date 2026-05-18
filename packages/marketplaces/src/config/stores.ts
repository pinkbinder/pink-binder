import { MARKETPLACE_WEB } from './apis'

const FAVICON = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`

export interface MarketplaceShopLink {
  href: string
  label: string
  thumbnail: string
  thumbnailAlt: string
  shareDescription: string
  enabled: boolean
  external?: boolean
  storeName?: string
  marketplace?: string
}

/** Pink Binder storefront URLs (affiliate / seller pages, not API endpoints). */
export const MARKETPLACE_SHOP_LINKS: MarketplaceShopLink[] = [
  {
    marketplace: 'Whatnot',
    storeName: 'thepinkbinder',
    label: 'Shop thepinkbinder on Whatnot',
    href: 'https://whatnot.pxf.io/xJJMAy',
    thumbnail: FAVICON('whatnot.com'),
    thumbnailAlt: 'Whatnot logo',
    shareDescription: 'Join live breaks and drops from The Pink Binder on Whatnot.',
    enabled: true,
    external: true,
  },
  {
    marketplace: 'TCGPlayer',
    storeName: 'Pink-Binder-Store',
    label: 'Shop Pink-Binder-Store on TCGPlayer',
    href: `${MARKETPLACE_WEB.tcgplayer}/sellers/Pink-Binder-Store/eee48140`,
    thumbnail: FAVICON('tcgplayer.com'),
    thumbnailAlt: 'TCGPlayer logo',
    shareDescription: 'Shop Pokémon TCG singles and listings on TCGPlayer.',
    enabled: true,
    external: true,
  },
  {
    marketplace: 'eBay',
    storeName: 'thepinkbinder',
    label: 'Shop thepinkbinder on eBay',
    href: `${MARKETPLACE_WEB.ebay}/usr/thepinkbinder`,
    thumbnail: FAVICON('ebay.com'),
    thumbnailAlt: 'eBay logo',
    shareDescription: 'Browse cards and collectibles from The Pink Binder on eBay.',
    enabled: true,
    external: true,
  },
  {
    marketplace: 'Etsy',
    storeName: 'CutePkmn',
    label: 'Shop CutePkmn on Etsy',
    href: `${MARKETPLACE_WEB.etsy}/shop/cutepkmn`,
    thumbnail: FAVICON('etsy.com'),
    thumbnailAlt: 'Etsy logo',
    shareDescription: 'Find cute Pokémon-themed products on Etsy from CutePkmn.',
    enabled: true,
    external: true,
  },
]
