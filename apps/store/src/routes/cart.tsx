import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui'

import { formatPriceCents, useCartStore, useCartTotalCents } from '../stores/cart'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const lines = useCartStore((state) => state.lines)
  const setQty = useCartStore((state) => state.setQty)
  const removeLine = useCartStore((state) => state.removeLine)
  const clear = useCartStore((state) => state.clear)
  const totalCents = useCartTotalCents()

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Cart</h1>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" search={{ q: '', category: 'All' }}>
              Continue shopping
            </Link>
          </Button>
        </div>
        {lines.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Button className="mt-4" asChild>
                <Link to="/" search={{ q: '', category: 'All' }}>
                  Browse products
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {lines.length} item{lines.length === 1 ? '' : 's'}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={clear}>
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="divide-border divide-y">
                {lines.map((line) => (
                  <li key={line.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-medium">{line.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {formatPriceCents(line.priceCents)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setQty(line.id, line.qty - 1)}
                        aria-label={`Decrease ${line.name}`}
                      >
                        −
                      </Button>
                      <span className="w-6 text-center font-medium" aria-live="polite">
                        {line.qty}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setQty(line.id, line.qty + 1)}
                        aria-label={`Increase ${line.name}`}
                      >
                        +
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeLine(line.id)}>
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <p className="text-muted-foreground text-sm">Subtotal</p>
                <p className="text-xl font-bold">{formatPriceCents(totalCents)}</p>
              </div>
              <Button className="mt-4 w-full">Checkout (demo)</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
