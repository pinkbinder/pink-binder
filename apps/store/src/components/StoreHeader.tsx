import { useStore } from '@nanostores/solid'
import { Button } from '@repo/ui'
import { createSignal, onMount } from 'solid-js'

import { cart, cartCount, hydrateCartFromStorage, setCartOpen } from '../stores/cart'

/**
 * Header island: cart count + drawer toggle come from the nanostores cart.
 * Hydration from localStorage happens once, on the first island mount; the
 * count stays 0 until mount so server and client markup match.
 */
export function StoreHeader() {
  const cartState = useStore(cart)
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
          <Button variant="ghost" size="sm" as="a" href="/cart">
            Cart
          </Button>
          <Button size="sm" onClick={() => setCartOpen(!cartState().isOpen)}>
            Cart ({mounted() ? count() : 0})
          </Button>
        </nav>
      </div>
    </header>
  )
}
