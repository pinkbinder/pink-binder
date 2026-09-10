import { createFileRoute, Link } from '@tanstack/react-router'
import { useQueryState } from 'nuqs'
import { Suspense } from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from '@repo/ui'

import { catalogQueryOptions } from '../queries/catalog'
import { catalogSearchParsers } from '../lib/catalog-search'
import { formatPriceCents, useCartCount, useCartStore } from '../stores/cart'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
    category:
      typeof search.category === 'string' &&
      catalogSearchParsers.category.parse(search.category) !== null
        ? search.category
        : 'All',
  }),
  loaderDeps: ({ search }) => ({ q: search.q, category: search.category }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      catalogQueryOptions({ q: deps.q, category: deps.category })
    ),
  component: StorePage,
  pendingComponent: StorePending,
})

function StorePage() {
  const { categories } = Route.useLoaderData()
  return (
    <main className="min-h-screen">
      <StoreHeader />
      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold">All Products</h2>
            <CatalogFilters categories={categories} />
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid />
          </Suspense>
        </div>
      </section>
    </main>
  )
}

function StorePending() {
  return (
    <main className="min-h-screen">
      <StoreHeader />
      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <ProductGridSkeleton />
        </div>
      </section>
    </main>
  )
}

function StoreHeader() {
  const cartCount = useCartCount()
  const setOpen = useCartStore((state) => state.setOpen)
  const isOpen = useCartStore((state) => state.isOpen)
  return (
    <header className="border-b px-4 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <h1 className="text-xl font-bold">Pink Binder Store</h1>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" search={{ q: '', category: 'All' }}>
              Products
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/cart">Cart</Link>
          </Button>
          <Button size="sm" onClick={() => setOpen(!isOpen)}>
            Cart ({cartCount})
          </Button>
        </nav>
      </div>
    </header>
  )
}

/**
 * nuqs-backed filters: `q`/`category` live in the URL (shareable, SSR-safe)
 * while the router loader refetches through the prefetched React Query cache.
 */
function CatalogFilters({ categories }: { categories: string[] }) {
  const [q, setQ] = useQueryState('q', catalogSearchParsers.q)
  const [category, setCategory] = useQueryState('category', catalogSearchParsers.category)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={q}
        onChange={(event) => void setQ(event.target.value || null, { throttleMs: 300 })}
        placeholder="Search products…"
        aria-label="Search products"
        className="w-52"
      />
      <div className="flex flex-wrap gap-1">
        {categories.map((entry) => (
          <Button
            key={entry}
            size="sm"
            variant={category === entry ? 'default' : 'outline'}
            onClick={() => void setCategory(entry === 'All' ? null : (entry as typeof category))}
          >
            {entry}
          </Button>
        ))}
      </div>
    </div>
  )
}

function ProductGrid() {
  const { products } = Route.useLoaderData()
  return <ProductCards products={products} />
}

function ProductCards({
  products,
}: {
  products: Awaited<ReturnType<typeof import('../server/catalog').getCatalog>>['products']
}) {
  const addLine = useCartStore((state) => state.addLine)
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center">No products match those filters.</p>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <div className="mb-2 flex items-start justify-between">
              <Badge variant="outline">{product.category}</Badge>
              {product.badge && <Badge>{product.badge}</Badge>}
            </div>
            <CardTitle className="text-lg">{product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPriceCents(product.priceCents)}</p>
            <p className="text-muted-foreground mt-1 text-xs">via {product.marketplace}</p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() =>
                addLine({ id: product.id, name: product.name, priceCents: product.priceCents })
              }
            >
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="border-border rounded-xl border p-6">
          <div className="bg-muted h-5 w-24 animate-pulse rounded" />
          <div className="bg-muted mt-3 h-6 w-3/4 animate-pulse rounded" />
          <div className="bg-muted mt-4 h-8 w-1/3 animate-pulse rounded" />
        </div>
      ))}
    </div>
  )
}
