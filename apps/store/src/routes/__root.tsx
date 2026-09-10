import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import type { ReactNode } from 'react'

import appCss from '../styles.css?url'

export interface StoreRouterContext {
  queryClient: QueryClient
}

/**
 * Root layout: document shell + cross-cutting providers.
 * nuqs uses the first-party `tanstack-router` adapter so URL state
 * (`?q=`, `?category=`, …) syncs through the TanStack Router history
 * instead of touching `window.history` directly.
 */
export const Route = createRootRouteWithContext<StoreRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Pink Binder Store' },
      {
        name: 'description',
        content: 'Shop the Pink Binder — cute Pokémon TCG singles and marketplace finds.',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: () => (
    <RootDocument>
      <NuqsAdapter>
        <Outlet />
      </NuqsAdapter>
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm font-semibold tracking-widest text-pink-500 uppercase">404</p>
        <h1 className="mt-2 text-2xl font-bold">Product not found</h1>
        <p className="text-muted-foreground mt-2">
          The page you are looking for moved or never existed.
        </p>
      </main>
    </RootDocument>
  ),
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
