import { useStore } from '@nanostores/solid'
import { Button } from '@repo/ui'
import { createSignal, onMount } from 'solid-js'

import { cartCount, hydrateCartFromStorage } from '../stores/cart'

/**
 * Header island: the cart count comes from the nanostores cart. Hydration
 * from localStorage happens once, on the first island mount; the count stays
 * 0 until mount so server and client markup match.
 */
export function StoreHeader() {
  const count = useStore(cartCount)
  const [mounted, setMounted] = createSignal(false)
  onMount(() => {
    hydrateCartFromStorage()
    setMounted(true)
  })
  return (
    <header class="border-b px-4 py-4">
      <div class="mx-auto flex max-w-6xl items-center justify-between">
        <h1 class="text-xl font-bold">Pink Binder Store</h1>
        <nav class="flex items-center gap-2">
          <Button variant="ghost" size="sm" as="a" href="/">
            Products
          </Button>
          <Button size="sm" as="a" href="/cart">
            Cart ({mounted() ? count() : 0})
          </Button>
        </nav>
      </div>
    </header>
  )
}
