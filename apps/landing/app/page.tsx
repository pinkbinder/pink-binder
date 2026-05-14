import { Button } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <Badge variant="secondary">Now Live</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to <span className="text-primary">Pink Binder</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          A modern platform built for creators, sellers, and administrators. Everything you need,
          beautifully organized.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 border-t px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-3xl font-bold">Features</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

const features = [
  {
    title: 'Online Store',
    description: 'Sell your products with ease',
    detail: 'A full-featured e-commerce experience with cart, checkout, and order management.',
  },
  {
    title: 'Blog',
    description: 'Share your story',
    detail: 'Write and publish articles to engage your audience and grow your brand.',
  },
  {
    title: 'Admin Dashboard',
    description: 'Manage everything in one place',
    detail: 'A powerful admin panel to manage users, content, orders, and settings.',
  },
]
