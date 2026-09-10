import { useStore } from '@nanostores/react'
import { Button } from '@repo/ui'
import { useEffect, useState } from 'react'

import { cartCount, hydrateCartFromStorage, setCartOpen, useCart } from '../stores/cart'

/**
 * Header island: cart count + drawer toggle come from the nanostores cart.
 * Hydration from localStorage happens once, on the first island mount; the
 * count stays 0 until mount so server and client markup match.
 */
export function StoreHeader() {
  hydrateCartFromStorage()
  const { isOpen } = useCart()
  const count = useStore(cartCount)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <header className="border-b px-4 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <h1 className="text-xl font-bold">Pink Binder Store</h1>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="/">Products</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/cart">Cart</a>
          </Button>
          <Button size="sm" onClick={() => setCartOpen(!isOpen)}>
            Cart ({mounted ? count : 0})
          </Button>
        </nav>
      </div>
    </header>
  )
}
