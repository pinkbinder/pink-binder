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

/**
 * Server-side catalog fetch — Medusa Store API via the SDK singleton.
 * Region resolution is cookie-driven (see src/middleware.ts); the USD
 * calculated price is requested per region so currency stays consistent.
 * Only Pink Binder products carry catalog tags; Medusa sample products are
 * excluded from the storefront listing.
 */
export async function getCatalog(regionId: string | null): Promise<CatalogPayload> {
  const { regions } = await sdk.store.region.list({ limit: 20 })
  const regionList = regions as Array<{ id: string; currency_code: string }>
  const region = regionId
    ? (regionList.find((entry) => entry.id === regionId) ?? regionList[0])
    : (regionList.find((entry) => entry.currency_code === 'usd') ?? regionList[0])

  const { products } = await sdk.store.product.list({
    limit: 100,
    region_id: region?.id,
    fields: '+tags,*variants.calculated_price',
  })

  const mapped = (products as MedusaProduct[])
    .filter((product) => (product.tags ?? []).some((tag) => tag.value?.startsWith('category:')))
    .map((product) => toCatalogProduct(product))
  const categories: string[] = ['All', ...new Set(mapped.map((product) => product.category))]

  return {
    products: mapped,
    categories,
    currencyCode: region?.currency_code ?? 'usd',
    regionId: region?.id ?? null,
  }
}
