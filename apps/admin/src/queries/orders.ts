import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getOrders, type OrdersQuery } from '../server/orders'

export function ordersQueryOptions(query: OrdersQuery) {
  const normalized: OrdersQuery = {
    status: query.status && query.status !== 'all' ? query.status : undefined,
    q: (query.q ?? '').trim() || undefined,
  }
  return queryOptions({
    queryKey: ['admin', 'orders', normalized.status ?? 'all', normalized.q ?? ''],
    queryFn: () => getOrders({ data: normalized }),
    staleTime: 60 * 1_000,
  })
}

export function useOrdersQuery(query: OrdersQuery) {
  return useSuspenseQuery(ordersQueryOptions(query))
}
