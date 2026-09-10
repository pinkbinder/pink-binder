import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { useEffect, useState } from 'react'

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
  hydrateCartFromStorage()
  const { lines } = useCart()
  const totalCents = useCartTotal()
  // localStorage contents only exist client-side; suppress the server-rendered
  // empty shell until mount so React hydration markup matches.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const cartLines = mounted ? lines : []

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Cart</h1>
          <Button variant="ghost" size="sm" asChild>
            <a href="/">Continue shopping</a>
          </Button>
        </div>
        {cartLines.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Button className="mt-4" asChild>
                <a href="/">Browse products</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {cartLines.length} item{cartLines.length === 1 ? '' : 's'}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => clearCart()}>
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="divide-border divide-y">
                {cartLines.map((line) => (
                  <li key={line.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-medium">{line.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {formatPriceCents(line.priceCents)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLineQty(line.id, line.qty - 1)}
                        aria-label={`Decrease quantity of ${line.name}`}
                      >
                        −
                      </Button>
                      <span className="w-8 text-center">{line.qty}</span>
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
                ))}
              </ul>
              <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">{formatPriceCents(totalCents)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
