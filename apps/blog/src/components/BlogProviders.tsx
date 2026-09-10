'use client'

import { NuqsAdapter } from 'nuqs/adapters/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const QUERY_STALE_TIME_MS = 5 * 60 * 1_000
const QUERY_GC_TIME_MS = 30 * 60 * 1_000

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
 * Client providers for Astro blog islands. Uses the framework-agnostic
 * `nuqs/adapters/react` adapter (history API only) so the same BlogGrid
 * filter state works across server-rendered pages and client islands.
 */
export function BlogProviders({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={getBlogQueryClient()}>{children}</QueryClientProvider>
    </NuqsAdapter>
  )
}
