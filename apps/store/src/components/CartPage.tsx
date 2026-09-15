import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { createSignal, For, onMount, Show } from 'solid-js'

import {
  clearCart,
  formatPriceCents,
  hydrateCartFromStorage,
  removeLine,
  setLineQty,
  useCart,
  useCartTotal,
} from '../stores/cart'

/**
 * Cart island — nanostores cart state rendered client-side after hydration
 * (contents live in localStorage, so the server renders an empty shell).
 */
export function CartPage() {
  const cart = useCart()
  const totalCents = useCartTotal()
  // localStorage contents only exist client-side; suppress the server-rendered
  // empty shell until mount so hydration markup matches.
  const [mounted, setMounted] = createSignal(false)
  onMount(() => {
    hydrateCartFromStorage()
    setMounted(true)
  })
  const cartLines = () => (mounted() ? cart().lines : [])

  return (
    <main class="min-h-screen px-4 py-10">
      <div class="mx-auto max-w-3xl">
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-2xl font-bold">Cart</h1>
          <Button variant="ghost" size="sm" as="a" href="/">
            Continue shopping
          </Button>
        </div>
        <Show
          when={cartLines().length > 0}
          fallback={
            <Card>
              <CardContent class="py-10 text-center">
                <p class="text-muted-foreground">Your cart is empty.</p>
                <Button class="mt-4" as="a" href="/">
                  Browse products
                </Button>
              </CardContent>
            </Card>
          }
        >
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>
                  {cartLines().length} item{cartLines().length === 1 ? '' : 's'}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => clearCart()}>
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul class="divide-border divide-y">
                <For each={cartLines()}>
                  {(line) => (
                    <li class="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p class="font-medium">{line.name}</p>
                        <p class="text-muted-foreground text-sm">
                          {formatPriceCents(line.priceCents)} each
                        </p>
                      </div>
                      <div class="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLineQty(line.id, line.qty - 1)}
                          aria-label={`Decrease quantity of ${line.name}`}
                        >
                          −
                        </Button>
                        <span class="w-8 text-center">{line.qty}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLineQty(line.id, line.qty + 1)}
                          aria-label={`Increase quantity of ${line.name}`}
                        >
                          +
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeLine(line.id)}>
                          Remove
                        </Button>
                      </div>
                    </li>
                  )}
                </For>
              </ul>
              <div class="border-border mt-4 flex items-center justify-between border-t pt-4">
                <span class="font-semibold">Total</span>
                <span class="text-lg font-bold">{formatPriceCents(totalCents())}</span>
              </div>
            </CardContent>
          </Card>
        </Show>
      </div>
    </main>
  )
}
