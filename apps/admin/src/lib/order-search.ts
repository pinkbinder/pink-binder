import { parseAsString, parseAsStringLiteral } from 'nuqs'

export const ORDER_STATUSES = ['all', 'completed', 'pending', 'processing'] as const

export type OrderStatusFilter = (typeof ORDER_STATUSES)[number]

/**
 * nuqs URL parsers for the orders dashboard. `status` is a validated literal
 * union (unknown values clear so the route falls back to `all`); `q` is free
 * text with an empty-string default so the URL stays shareable and SSR-safe.
 */
export const ordersSearchParsers = {
  status: parseAsStringLiteral(ORDER_STATUSES).withDefault('all'),
  q: parseAsString.withDefault(''),
}
