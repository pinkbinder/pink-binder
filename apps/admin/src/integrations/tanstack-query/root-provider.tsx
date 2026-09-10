import { QueryClient } from '@tanstack/react-query'

const QUERY_STALE_TIME_MS = 60 * 1_000
const QUERY_GC_TIME_MS = 10 * 60 * 1_000

function createAdminQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        gcTime: QUERY_GC_TIME_MS,
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  })
}

let browserQueryClient: QueryClient | undefined

/**
 * Framework-friendly QueryClient factory.
 * - Server (SSR / server functions): a fresh client per request.
 * - Browser: a singleton so cache survives client-side navigation.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return createAdminQueryClient()
  browserQueryClient ??= createAdminQueryClient()
  return browserQueryClient
}
