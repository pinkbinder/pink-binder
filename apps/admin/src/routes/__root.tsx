import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import type { ReactNode } from 'react'

import appCss from '../styles.css?url'

export interface AdminRouterContext {
  queryClient: QueryClient
}

/**
 * Root layout: document shell + cross-cutting providers.
 * nuqs uses the first-party `tanstack-router` adapter so URL state
 * (`?status=`, `?q=`, …) syncs through the TanStack Router history
 * instead of touching `window.history` directly.
 */
export const Route = createRootRouteWithContext<AdminRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Pink Binder Admin' },
      { name: 'description', content: 'Pink Binder admin dashboard — orders, products, content.' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon/favicon.ico' },
      { rel: 'icon', href: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/favicon/apple-touch-icon.png', sizes: '180x180' },
    ],
  }),
  component: () => (
    <RootDocument>
      <NuqsAdapter>
        <div className="min-h-screen">
          <AdminNav />
          <main>
            <Outlet />
          </main>
        </div>
      </NuqsAdapter>
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm font-semibold tracking-widest text-pink-500 uppercase">404</p>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground mt-2">The admin page you asked for does not exist.</p>
      </main>
    </RootDocument>
  ),
})

function AdminNav() {
  return (
    <header className="border-b px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" search={{ status: 'all', q: '' }} className="text-lg font-bold">
          Pink Binder Admin
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" search={{ status: 'all', q: '' }} className="hover:underline">
            Orders
          </Link>
          <Link to="/products" search={{ q: '' }} className="hover:underline">
            Products
          </Link>
        </nav>
      </div>
    </header>
  )
}

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
