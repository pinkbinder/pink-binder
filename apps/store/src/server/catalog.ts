import { SHOP_LINKS } from '@repo/config'
import { MARKETPLACE_DISPLAYS } from '@repo/config'
import { createServerFn } from '@tanstack/react-start'

export interface CatalogProduct {
  id: string
  name: string
  priceCents: number
  category: string
  badge: string | null
  marketplace: string
  marketplaceSlug: string
  shopUrl: string
  logoUrl: string
  imageAspectRatio: string
}

export interface CatalogPayload {
  products: CatalogProduct[]
  categories: string[]
  generatedAt: string
}

const FALLBACK_PRODUCTS: Array<Omit<CatalogProduct, 'imageAspectRatio' | 'logoUrl' | 'shopUrl'>> = [
  {
    id: 'pb-001',
    name: 'Digital Template',
    priceCents: 2900,
    category: 'Templates',
    badge: 'Bestseller',
    marketplace: 'Etsy',
    marketplaceSlug: 'etsy',
  },
  {
    id: 'pb-002',
    name: 'UI Component Kit',
    priceCents: 4900,
    category: 'Design',
    badge: 'New',
    marketplace: 'Etsy',
    marketplaceSlug: 'etsy',
  },
  {
    id: 'pb-003',
    name: 'Icon Pack Pro',
    priceCents: 1900,
    category: 'Assets',
    badge: null,
    marketplace: 'Whatnot',
    marketplaceSlug: 'whatnot',
  },
  {
    id: 'pb-004',
    name: 'Brand Strategy Guide',
    priceCents: 3900,
    category: 'Guides',
    badge: 'Popular',
    marketplace: 'eBay',
    marketplaceSlug: 'ebay',
  },
  {
    id: 'pb-005',
    name: 'SEO Toolkit',
    priceCents: 5900,
    category: 'Tools',
    badge: null,
    marketplace: 'TCGPlayer',
    marketplaceSlug: 'tcgplayer',
  },
  {
    id: 'pb-006',
    name: 'Content Calendar',
    priceCents: 1500,
    category: 'Productivity',
    badge: 'Sale',
    marketplace: 'eBay',
    marketplaceSlug: 'ebay',
  },
]

function displayFor(slug: string) {
  return MARKETPLACE_DISPLAYS.find((display) => display.slug === slug)
}

function withDisplay(product: (typeof FALLBACK_PRODUCTS)[number]): CatalogProduct {
  const display = displayFor(product.marketplaceSlug)
  const shopLink = SHOP_LINKS.find((link) => link.href.length > 0)
  return {
    ...product,
    shopUrl: display?.storeUrl ?? shopLink?.href ?? 'https://pinkbinder.shop',
    logoUrl: display?.logoUrl ?? '',
    imageAspectRatio: display?.listingImageAspectRatio ?? '1 / 1',
  }
}

export interface CatalogQuery {
  q?: string
  category?: string
}

function matchesQuery(product: CatalogProduct, query: CatalogQuery): boolean {
  const needle = (query.q ?? '').trim().toLowerCase()
  if (needle && !`${product.name} ${product.category}`.toLowerCase().includes(needle)) {
    return false
  }
  if (query.category && query.category !== 'All' && product.category !== query.category) {
    return false
  }
  return true
}

/**
 * Catalog server function — runs on the Worker (SSR + RPC), never in the
 * browser bundle. Swap `FALLBACK_PRODUCTS` for the eBay Browse / TCGdex
 * fetch behind `caches.default` when the storefront goes live; the route
 * loader + React Query key below stay unchanged.
 */
export const getCatalog = createServerFn({ method: 'GET' })
  .validator((input: CatalogQuery) => input)
  .handler(async ({ data }): Promise<CatalogPayload> => {
    const products = FALLBACK_PRODUCTS.map(withDisplay).filter((product) =>
      matchesQuery(product, data)
    )
    const categories = ['All', ...new Set(FALLBACK_PRODUCTS.map((p) => p.category))]
    return { products, categories, generatedAt: new Date().toISOString() }
  })
