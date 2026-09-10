import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getCatalog, type CatalogQuery } from '../server/catalog'

export function catalogQueryOptions(query: CatalogQuery) {
  const normalized: CatalogQuery = {
    q: (query.q ?? '').trim(),
    category: query.category && query.category !== 'All' ? query.category : undefined,
  }
  return queryOptions({
    queryKey: ['store', 'catalog', normalized.q ?? '', normalized.category ?? 'All'],
    queryFn: () => getCatalog({ data: normalized }),
    staleTime: 5 * 60 * 1_000,
  })
}

export function useCatalogQuery(query: CatalogQuery) {
  return useSuspenseQuery(catalogQueryOptions(query))
}
