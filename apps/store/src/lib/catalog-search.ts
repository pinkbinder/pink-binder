export const STORE_CATEGORIES = [
  'All',
  'Templates',
  'Design',
  'Assets',
  'Guides',
  'Tools',
  'Productivity',
] as const

export type StoreCategory = (typeof STORE_CATEGORIES)[number]

export interface CatalogSearch {
  q: string
  category: StoreCategory
}

const isStoreCategory = (value: string): value is StoreCategory =>
  (STORE_CATEGORIES as readonly string[]).includes(value)

/**
 * URL search parsing for the catalog island. `category` is a validated
 * literal union (unknown values clear to `All`); `q` is free text with an
 * empty-string default so the URL stays shareable.
 */
export function parseCatalogSearch(params: URLSearchParams): CatalogSearch {
  const rawCategory = params.get('category') ?? 'All'
  return {
    q: params.get('q') ?? '',
    category: isStoreCategory(rawCategory) ? rawCategory : 'All',
  }
}

export function matchesSearch(
  name: string,
  category: string,
  search: { q?: string; category?: string }
): boolean {
  const needle = (search.q ?? '').trim().toLowerCase()
  if (needle && !`${name} ${category}`.toLowerCase().includes(needle)) return false
  if (search.category && search.category !== 'All' && category !== search.category) return false
  return true
}
