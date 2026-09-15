import { createRouter } from '@tanstack/solid-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/solid-router-ssr-query'
import * as TanStackQuery from './integrations/tanstack-query/root-provider'

import { routeTree } from './routeTree.gen'

/**
 * Shared client/server router factory. `setupRouterSsrQueryIntegration`
 * hydrates server-prefetched Solid Query state into the client so loaders
 * using `ensureQueryData` never refetch on mount.
 * Pattern: TanStack Start Query example.
 * https://tanstack.com/router/latest/docs/framework/solid/guide/external-data-loading
 */
export function getRouter() {
  const queryClient = TanStackQuery.getQueryClient()

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module '@tanstack/solid-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
