import { QueryClient } from '@tanstack/solid-query'
import { PersistQueryClientProvider } from '@tanstack/solid-query-persist-client'
import type { Persister } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import type { JSX } from 'solid-js'

const QUERY_STALE_TIME_MS = 60 * 1_000
const QUERY_GC_TIME_MS = 10 * 60 * 1_000
const PERSIST_KEY = 'pink-binder-admin-query-cache'
/**
 * Persisted cache survives full reloads and tab restores; keep entries no
 * longer than the in-memory gcTime — past that, serving stale data while
 * refetching buys nothing over a clean loader run.
 */
const PERSIST_MAX_AGE_MS = QUERY_GC_TIME_MS

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

/** SSR never runs the restore/save effects; the no-op keeps the provider
 *  tree identical between server and client (hydration-safe by construction). */
const serverNoopPersister: Persister = {
  persistClient: () => {},
  restoreClient: () => undefined,
  removeClient: () => {},
}

function createAdminPersister(): Persister {
  if (typeof window === 'undefined') return serverNoopPersister
  return createSyncStoragePersister({
    // Per-tab storage: tabs never share query state, so one tab cannot
    // revive entries another tab's mutations invalidated.
    storage: window.sessionStorage,
    key: PERSIST_KEY,
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

/**
 * Query provider with sessionStorage persistence (UX perf standards §2):
 * reloads and Back/Forward render from the persisted cache instantly and
 * revalidate in the background instead of blocking on loaders. Rendered as
 * the router's `Wrap` (with the integration's default wrap disabled) so this
 * is the single QueryClientProvider in the tree.
 */
export function AdminQueryProvider(props: { client: QueryClient; children?: JSX.Element }) {
  return (
    <PersistQueryClientProvider
      client={props.client}
      persistOptions={{
        persister: createAdminPersister(),
        maxAge: PERSIST_MAX_AGE_MS,
      }}
    >
      {props.children}
    </PersistQueryClientProvider>
  )
}
