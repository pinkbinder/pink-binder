import { parseAsString, parseAsStringLiteral } from 'nuqs'

import { AD_PLATFORMS, CONTENT_PLATFORMS } from '../lib/channels'
import { INVENTORY_CATEGORIES } from '../stores/inventory'

export const INVENTORY_CATEGORY_FILTERS = ['all', ...INVENTORY_CATEGORIES] as const
export const CONTENT_PLATFORM_FILTERS = ['all', ...CONTENT_PLATFORMS] as const
export const AD_PLATFORM_FILTERS = ['all', ...AD_PLATFORMS] as const

/**
 * nuqs URL parsers for the console dashboards. Literal unions clear unknown
 * values so a bad URL falls back to `all`; free-text `q` defaults to an empty
 * string so URLs stay shareable and SSR-safe.
 */
export const inventorySearchParsers = {
  q: parseAsString.withDefault(''),
  category: parseAsStringLiteral(INVENTORY_CATEGORY_FILTERS).withDefault('all'),
}

export const contentSearchParsers = {
  q: parseAsString.withDefault(''),
  platform: parseAsStringLiteral(CONTENT_PLATFORM_FILTERS).withDefault('all'),
}

export const adsSearchParsers = {
  platform: parseAsStringLiteral(AD_PLATFORM_FILTERS).withDefault('all'),
}
