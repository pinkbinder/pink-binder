import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { BLOG_QUERY_DEFAULTS } from '@repo/config/query-defaults'
import type { JSX } from 'solid-js'

const QUERY_STALE_TIME_MS = BLOG_QUERY_DEFAULTS.staleTimeMs
const QUERY_GC_TIME_MS = BLOG_QUERY_DEFAULTS.gcTimeMs

function createBlogQueryClient() {
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

function getBlogQueryClient() {
  if (typeof window === 'undefined') return createBlogQueryClient()
  browserQueryClient ??= createBlogQueryClient()
  return browserQueryClient
}

/**
 * Client providers for Astro blog islands. BlogGrid reads URL filter state
 * straight from `window.history`, so no search-param adapter is needed.
 */
export function BlogProviders(props: { children?: JSX.Element }) {
  return <QueryClientProvider client={getBlogQueryClient()}>{props.children}</QueryClientProvider>
}
