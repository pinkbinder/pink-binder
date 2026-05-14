import { Button } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui'

const products = [
  { id: 1, name: 'Digital Template', price: '$29', category: 'Templates', badge: 'Bestseller' },
  { id: 2, name: 'UI Component Kit', price: '$49', category: 'Design', badge: 'New' },
  { id: 3, name: 'Icon Pack Pro', price: '$19', category: 'Assets', badge: null },
  { id: 4, name: 'Brand Strategy Guide', price: '$39', category: 'Guides', badge: 'Popular' },
  { id: 5, name: 'SEO Toolkit', price: '$59', category: 'Tools', badge: null },
  { id: 6, name: 'Content Calendar', price: '$15', category: 'Productivity', badge: 'Sale' },
]

export default function StorePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold">Pink Binder Store</h1>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Products
            </Button>
            <Button variant="ghost" size="sm">
              Collections
            </Button>
            <Button size="sm">Cart (0)</Button>
          </nav>
        </div>
      </header>

      {/* Product Grid */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold">All Products</h2>
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
                  <p className="text-2xl font-bold">{product.price}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Add to Cart</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
