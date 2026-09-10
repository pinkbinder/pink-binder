import { createFileRoute } from '@tanstack/react-router'
import { useQueryState } from 'nuqs'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@repo/ui'

import { productSearchParsers } from '../lib/order-search'

const ADMIN_PRODUCTS = [
  { id: 'pb-001', name: 'Digital Template', price: '$29', stock: 120, status: 'Active' },
  { id: 'pb-002', name: 'UI Component Kit', price: '$49', stock: 64, status: 'Active' },
  { id: 'pb-003', name: 'Icon Pack Pro', price: '$19', stock: 0, status: 'Out of stock' },
  { id: 'pb-004', name: 'Brand Strategy Guide', price: '$39', stock: 18, status: 'Low stock' },
]

export const Route = createFileRoute('/products')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  component: ProductsPage,
})

function ProductsPage() {
  const [q, setQ] = useQueryState('q', productSearchParsers.q)
  const needle = q.trim().toLowerCase()
  const products = ADMIN_PRODUCTS.filter((product) =>
    needle ? `${product.name} ${product.id}`.toLowerCase().includes(needle) : true
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted-foreground">Inventory at a glance (demo data)</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={q}
            onChange={(event) => void setQ(event.target.value || null, { throttleMs: 300 })}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-48"
          />
          <Button size="sm">New product</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {products.length} product{products.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="pb-2 text-left font-medium">ID</th>
                  <th className="pb-2 text-left font-medium">Name</th>
                  <th className="pb-2 text-left font-medium">Price</th>
                  <th className="pb-2 text-left font-medium">Stock</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{product.id}</td>
                    <td className="py-3">{product.name}</td>
                    <td className="py-3">{product.price}</td>
                    <td className="py-3">{product.stock}</td>
                    <td className="py-3">
                      <Badge variant={product.stock === 0 ? 'destructive' : 'outline'}>
                        {product.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
