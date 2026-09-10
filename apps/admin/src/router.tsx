import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import * as TanStackQuery from './integrations/tanstack-query/root-provider'

import { routeTree } from './routeTree.gen'

/**
 * Shared client/server router factory. `setupRouterSsrQueryIntegration`
 * hydrates server-prefetched React Query state into the client so loaders
 * using `ensureQueryData` never refetch on mount.
 * Pattern: TanStack Start React Query example.
 * https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading
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

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
