export const ORDER_STATUSES = ['all', 'completed', 'pending', 'processing'] as const

export type OrderStatusFilter = (typeof ORDER_STATUSES)[number]

export interface SearchParamParser<T> {
  parse: (value: string | null | undefined) => T | null
  serialize: (value: T) => string
  defaultValue: T
}

export function stringParser(defaultValue: string): SearchParamParser<string> {
  return {
    parse: (value) => value ?? defaultValue,
    serialize: (value) => value,
    defaultValue,
  }
}

export function literalParser<const T extends readonly string[]>(
  values: T,
  defaultValue: T[number]
): SearchParamParser<T[number]> {
  return {
    parse: (value) => (values.includes(value as T[number]) ? (value as T[number]) : null),
    serialize: (value) => value,
    defaultValue,
  }
}

/**
 * URL search parsers for the orders dashboard. `status` is a validated
 * literal union (unknown values clear so the route falls back to `all`); `q`
 * is free text with an empty-string default so the URL stays shareable and
 * SSR-safe.
 */
export const ordersSearchParsers = {
  status: literalParser(ORDER_STATUSES, 'all'),
  q: stringParser(''),
}
