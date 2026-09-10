import { useEffect, type ReactNode } from 'react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Megaphone,
  Moon,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingCart,
  Sparkles,
  Sun,
} from 'lucide-react'
import { cn } from '@repo/ui'
import { Button } from '@repo/ui'

import { useAdminPreferences } from '../stores/preferences'

/**
 * Console chrome: a grouped sidebar on desktop (collapsible to an icon rail),
 * a sticky top bar with scrollable pills on mobile, and the theme toggle
 * every page inherits. Navigation groups mirror the three services plus the
 * overview so the console's shape is legible from any page.
 */

interface ConsoleNavItem {
  to: string
  label: string
  description: string
  icon: typeof Package
  /** Match only this exact path (needed for `/`). */
  exact?: boolean
}

interface ConsoleNavSection {
  label: string
  items: ConsoleNavItem[]
}

const NAV_SECTIONS: ConsoleNavSection[] = [
  {
    label: 'Overview',
    items: [
      {
        to: '/',
        label: 'Console',
        description: 'All three services at a glance',
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: 'Commerce',
    items: [
      {
        to: '/inventory',
        label: 'Inventory',
        description: 'Stock and marketplace sync',
        icon: Package,
      },
      {
        to: '/orders',
        label: 'Orders',
        description: 'Recent orders across channels',
        icon: ShoppingCart,
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        to: '/content',
        label: 'Content studio',
        description: 'AI drafts, reviews, publishing',
        icon: Sparkles,
      },
    ],
  },
  {
    label: 'Growth',
    items: [
      {
        to: '/ads',
        label: 'Ad spend',
        description: 'Budgets and results by platform',
        icon: Megaphone,
      },
    ],
  },
]

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items)

function useThemeEffect() {
  const theme = useAdminPreferences((state) => state.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
}

function BrandMark({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5" title="Pink Binder console">
      <span
        aria-hidden
        className="bg-primary text-primary-foreground font-title flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
      >
        PB
      </span>
      {!collapsed && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-bold">Pink Binder</span>
          <span className="text-muted-foreground block text-xs">Admin console</span>
        </span>
      )}
    </Link>
  )
}

function ThemeToggle({ expanded }: { expanded?: boolean }) {
  const theme = useAdminPreferences((state) => state.theme)
  const toggleTheme = useAdminPreferences((state) => state.toggleTheme)
  const label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={label}
      className="text-muted-foreground justify-start gap-2.5 px-2"
    >
      {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
      {expanded && (
        <span className="text-sm">{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
      )}
    </Button>
  )
}

function DesktopSidebar() {
  const sidebarOpen = useAdminPreferences((state) => state.sidebarOpen)
  const setSidebarOpen = useAdminPreferences((state) => state.setSidebarOpen)
  const matchRoute = useMatchRoute()

  return (
    <aside
      className={cn(
        'bg-card/40 sticky top-0 hidden h-screen shrink-0 flex-col border-r transition-[width] duration-200 md:flex',
        sidebarOpen ? 'w-64' : 'w-[4.25rem]'
      )}
    >
      <div className={cn('flex items-center gap-2 px-4 pt-5 pb-4', !sidebarOpen && 'px-3')}>
        <BrandMark collapsed={!sidebarOpen} />
      </div>
      <nav aria-label="Console" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p
              className={cn(
                'text-muted-foreground mb-1.5 px-2 text-[11px] font-semibold tracking-widest uppercase',
                !sidebarOpen && 'sr-only'
              )}
            >
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = Boolean(matchRoute({ to: item.to, fuzzy: !item.exact }))
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={item.description}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      !sidebarOpen && 'justify-center px-0'
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                    {!sidebarOpen && <span className="sr-only">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div
        className={cn(
          'border-t px-3 py-3',
          sidebarOpen ? 'flex items-center justify-between' : 'flex flex-col items-center gap-1'
        )}
      >
        <ThemeToggle expanded={sidebarOpen} />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={sidebarOpen}
          className="text-muted-foreground justify-start gap-2.5 px-2"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-4" aria-hidden />
          ) : (
            <PanelLeftOpen className="size-4" aria-hidden />
          )}
          {sidebarOpen && <span className="text-sm">Collapse</span>}
        </Button>
      </div>
    </aside>
  )
}

function MobileNav() {
  const matchRoute = useMatchRoute()
  return (
    <div className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <BrandMark />
        <ThemeToggle />
      </div>
      <nav aria-label="Console" className="flex gap-1 overflow-x-auto px-3 pb-2">
        {ALL_NAV_ITEMS.map((item) => {
          const active = Boolean(matchRoute({ to: item.to, fuzzy: !item.exact }))
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function ConsoleShell({ children }: { children: ReactNode }) {
  useThemeEffect()
  return (
    <div className="min-h-screen md:flex">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
