import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pink Binder – Admin',
  description: 'Admin dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="bg-muted/30 w-64 border-r p-4">
            <div className="mb-8">
              <h1 className="text-lg font-bold">Pink Binder</h1>
              <p className="text-muted-foreground text-xs">Admin Dashboard</p>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Orders', href: '/orders' },
  { label: 'Blog Posts', href: '/posts' },
  { label: 'Users', href: '/users' },
  { label: 'Settings', href: '/settings' },
]
