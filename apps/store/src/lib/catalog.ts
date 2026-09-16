import { sdk } from './sdk'

export interface CatalogProduct {
  id: string
  name: string
  priceCents: number
  category: string
  badge: string | null
  marketplace: string
  marketplaceSlug: string
}

export interface CatalogPayload {
  products: CatalogProduct[]
  categories: string[]
  currencyCode: string
  regionId: string | null
}

interface MedusaVariant {
  calculated_price?: {
    calculated_amount?: number | null
  } | null
}

interface MedusaTag {
  value?: string | null
}

interface MedusaProduct {
  id: string
  title: string
  subtitle?: string | null
  tags?: MedusaTag[] | null
  variants?: MedusaVariant[]
}

function tagValue(tags: MedusaTag[], key: string): string | null {
  const prefix = `${key}:`
  return tags.find((tag) => tag.value?.startsWith(prefix))?.value?.slice(prefix.length) ?? null
}

function toCatalogProduct(product: MedusaProduct): CatalogProduct {
  const tags = product.tags ?? []
  return {
    id: product.id,
    name: product.title,
    priceCents: product.variants?.[0]?.calculated_price?.calculated_amount ?? 0,
    category: tagValue(tags, 'category') ?? 'Misc',
    badge: tagValue(tags, 'badge') ?? product.subtitle ?? null,
    marketplace: tagValue(tags, 'marketplace') ?? 'Pink Binder',
    marketplaceSlug: tagValue(tags, 'marketplace-slug') ?? '',
  }
}

interface MedusaRegion {
  id: string
  currency_code: string
}

/**
 * Region list is near-static Medusa configuration, so it is memoized in the
 * isolate instead of re-fetched on every index request — that removes one
 * serialized round-trip before the product list on each page load.
 */
const REGION_LIST_TTL_MS = 5 * 60 * 1_000
let cachedRegions: { expiresAt: number; regions: MedusaRegion[] } | null = null
let regionsInFlight: Promise<MedusaRegion[]> | null = null

async function listRegions(): Promise<MedusaRegion[]> {
  const now = Date.now()
  if (cachedRegions && cachedRegions.expiresAt > now) return cachedRegions.regions
  if (regionsInFlight) return regionsInFlight
  regionsInFlight = sdk.store.region
    .list({ limit: 20 })
    .then(({ regions }) => {
      const list = regions as MedusaRegion[]
      cachedRegions = { regions: list, expiresAt: Date.now() + REGION_LIST_TTL_MS }
      return list
    })
    .finally(() => {
      regionsInFlight = null
    })
  return regionsInFlight
}

/**
 * Product catalog per region, memoized briefly in the isolate: the storefront
 * re-fetches on every request today, and a 60-second window collapses bursts
 * of navigation into one Medusa round-trip while keeping prices/stock fresh.
 */
const CATALOG_TTL_MS = 60 * 1_000
const catalogCache = new Map<string, { expiresAt: number; payload: CatalogPayload }>()
const catalogInFlight = new Map<string, Promise<CatalogPayload>>()

/**
 * Server-side catalog fetch — Medusa Store API via the SDK singleton.
 * Region resolution is cookie-driven (see src/middleware.ts); the USD
 * calculated price is requested per region so currency stays consistent.
 * Only Pink Binder products carry catalog tags; Medusa sample products are
 * excluded from the storefront listing.
 */
export async function getCatalog(regionId: string | null): Promise<CatalogPayload> {
  const regionList = await listRegions()
  const region = regionId
    ? (regionList.find((entry) => entry.id === regionId) ?? regionList[0])
    : (regionList.find((entry) => entry.currency_code === 'usd') ?? regionList[0])
  const cacheKey = region?.id ?? 'default'

  const cached = catalogCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.payload
  const inFlight = catalogInFlight.get(cacheKey)
  if (inFlight) return inFlight

  const request = sdk.store.product
    .list({
      limit: 100,
      region_id: region?.id,
      fields: '+tags,*variants.calculated_price',
    })
    .then(({ products }) => {
      const mapped = (products as MedusaProduct[])
        .filter((product) => (product.tags ?? []).some((tag) => tag.value?.startsWith('category:')))
        .map((product) => toCatalogProduct(product))
      const payload: CatalogPayload = {
        products: mapped,
        categories: ['All', ...new Set(mapped.map((product) => product.category))],
        currencyCode: region?.currency_code ?? 'usd',
        regionId: region?.id ?? null,
      }
      catalogCache.set(cacheKey, { payload, expiresAt: Date.now() + CATALOG_TTL_MS })
      return payload
    })
    .finally(() => {
      catalogInFlight.delete(cacheKey)
    })
  catalogInFlight.set(cacheKey, request)
  return request
}
