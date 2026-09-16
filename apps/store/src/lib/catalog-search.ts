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

/**
 * URL write for a catalog param change, plus the history mode it needs:
 * text search replaces the current entry (one keystroke must never become one
 * history entry), while category chips push so Back undoes a filter change.
 * Null/empty values delete the param (clear-on-default semantics).
 */
export function buildCatalogUrl(
  href: string,
  key: 'q' | 'category',
  value: string | null
): { url: string; replace: boolean } {
  const url = new URL(href)
  if (value === null || value === '' || value === 'All') url.searchParams.delete(key)
  else url.searchParams.set(key, value)
  return { url: url.toString(), replace: key === 'q' }
}
