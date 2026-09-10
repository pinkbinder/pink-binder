import { parseAsString, parseAsStringLiteral } from 'nuqs'

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

/**
 * nuqs URL parsers for the storefront catalog. `category` is a validated
 * literal union (unknown values clear to `All`); `q` is free text with an
 * empty-string default so the URL stays shareable and SSR-safe.
 */
export const catalogSearchParsers = {
  q: parseAsString.withDefault(''),
  category: parseAsStringLiteral(STORE_CATEGORIES).withDefault('All'),
}
