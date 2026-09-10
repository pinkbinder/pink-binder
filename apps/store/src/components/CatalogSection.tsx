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
import { useEffect, useMemo, useState } from 'react'

import type { CatalogProduct } from '../lib/catalog'
import {
  STORE_CATEGORIES,
  matchesSearch,
  parseCatalogSearch,
  type StoreCategory,
} from '../lib/catalog-search'
import { addLine, formatPriceCents } from '../stores/cart'

interface Props {
  products: CatalogProduct[]
  categories: string[]
}

/**
 * Catalog island — receives the server-fetched products as props (starter
 * pattern: no client data fetching for the listing) and filters locally from
 * URL search params so `?q=`/`?category=` stay shareable.
 */
export function CatalogSection({ products, categories }: Props) {
  const [search, setSearch] = useState(() =>
    typeof window === 'undefined'
      ? { q: '', category: 'All' as StoreCategory }
      : parseCatalogSearch(new URL(window.location.href).searchParams)
  )

  useEffect(() => {
    const onPopState = () =>
      setSearch(parseCatalogSearch(new URL(window.location.href).searchParams))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setParam = (key: 'q' | 'category', value: string | null) => {
    const url = new URL(window.location.href)
    if (value === null || value === '' || value === 'All') url.searchParams.delete(key)
    else url.searchParams.set(key, value)
    window.history.pushState(null, '', url)
    setSearch(parseCatalogSearch(url.searchParams))
  }

  const visible = useMemo(
    () => products.filter((p) => matchesSearch(p.name, p.category, search)),
    [products, search]
  )

  const chips = categories.length > 1 ? categories : [...STORE_CATEGORIES]

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">All Products</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search.q}
              onChange={(event) => setParam('q', event.target.value || null)}
              placeholder="Search products…"
              aria-label="Search products"
              className="w-52"
            />
            <div className="flex flex-wrap gap-1">
              {chips.map((entry) => (
                <Button
                  key={entry}
                  size="sm"
                  variant={search.category === entry ? 'default' : 'outline'}
                  onClick={() => setParam('category', entry === 'All' ? null : entry)}
                >
                  {entry}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center">
            No products match those filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
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
                      addLine({
                        id: product.id,
                        name: product.name,
                        priceCents: product.priceCents,
                      })
                    }
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
