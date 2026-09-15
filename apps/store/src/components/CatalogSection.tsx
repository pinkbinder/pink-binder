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
import { createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js'

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
export function CatalogSection(props: Props) {
  const [search, setSearch] = createSignal(
    typeof window === 'undefined'
      ? { q: '', category: 'All' as StoreCategory }
      : parseCatalogSearch(new URL(window.location.href).searchParams)
  )

  onMount(() => {
    const onPopState = () =>
      setSearch(parseCatalogSearch(new URL(window.location.href).searchParams))
    window.addEventListener('popstate', onPopState)
    onCleanup(() => window.removeEventListener('popstate', onPopState))
  })

  const setParam = (key: 'q' | 'category', value: string | null) => {
    const url = new URL(window.location.href)
    if (value === null || value === '' || value === 'All') url.searchParams.delete(key)
    else url.searchParams.set(key, value)
    window.history.pushState(null, '', url)
    setSearch(parseCatalogSearch(url.searchParams))
  }

  const visible = createMemo(() =>
    props.products.filter((p) => matchesSearch(p.name, p.category, search()))
  )

  const chips = () => (props.categories.length > 1 ? props.categories : [...STORE_CATEGORIES])

  return (
    <section class="px-4 py-10">
      <div class="mx-auto max-w-6xl">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 class="text-2xl font-bold">All Products</h2>
          <div class="flex flex-wrap items-center gap-2">
            <Input
              value={search().q}
              onInput={(event) => setParam('q', event.target.value || null)}
              placeholder="Search products…"
              aria-label="Search products"
              class="w-52"
            />
            <div class="flex flex-wrap gap-1">
              <For each={chips()}>
                {(entry) => (
                  <Button
                    size="sm"
                    variant={search().category === entry ? 'default' : 'outline'}
                    onClick={() => setParam('category', entry === 'All' ? null : entry)}
                  >
                    {entry}
                  </Button>
                )}
              </For>
            </div>
          </div>
        </div>
        <Show
          when={visible().length > 0}
          fallback={
            <p class="text-muted-foreground py-10 text-center">No products match those filters.</p>
          }
        >
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <For each={visible()}>
              {(product) => (
                <Card>
                  <CardHeader>
                    <div class="mb-2 flex items-start justify-between">
                      <Badge variant="outline">{product.category}</Badge>
                      {product.badge && <Badge>{product.badge}</Badge>}
                    </div>
                    <CardTitle size="sm">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p class="text-2xl font-bold">{formatPriceCents(product.priceCents)}</p>
                    <p class="text-muted-foreground mt-1 text-xs">via {product.marketplace}</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      class="w-full"
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
              )}
            </For>
          </div>
        </Show>
      </div>
    </section>
  )
}
