import { AD_PLATFORMS, CONTENT_PLATFORMS } from '../lib/channels'
import { INVENTORY_CATEGORIES } from '../stores/inventory'

import { literalParser, stringParser } from './order-search'

export const INVENTORY_CATEGORY_FILTERS = ['all', ...INVENTORY_CATEGORIES] as const
export const CONTENT_PLATFORM_FILTERS = ['all', ...CONTENT_PLATFORMS] as const
export const AD_PLATFORM_FILTERS = ['all', ...AD_PLATFORMS] as const

/**
 * URL search parsers for the console dashboards. Literal unions clear unknown
 * values so a bad URL falls back to `all`; free-text `q` defaults to an empty
 * string so URLs stay shareable and SSR-safe.
 */
export const inventorySearchParsers = {
  q: stringParser(''),
  category: literalParser(INVENTORY_CATEGORY_FILTERS, 'all'),
}

export const contentSearchParsers = {
  q: stringParser(''),
  platform: literalParser(CONTENT_PLATFORM_FILTERS, 'all'),
}

export const adsSearchParsers = {
  platform: literalParser(AD_PLATFORM_FILTERS, 'all'),
}
