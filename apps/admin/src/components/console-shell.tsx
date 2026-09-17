import { createEffect, For, Show, type JSX } from 'solid-js'
import { Link, useMatchRoute } from '@tanstack/solid-router'
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
} from 'lucide-solid'
import { cn } from '@repo/ui'
import { Button } from '@repo/ui'

import { adminPreferences, setSidebarOpen, toggleTheme } from '../stores/preferences'

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
  createEffect(() => {
    document.documentElement.classList.toggle('dark', adminPreferences.theme === 'dark')
  })
}

/** Reactive accessors over the module-level preferences store; hoisted so
 *  components share one closure instead of recreating them per render. */
const themeToggleLabel = () =>
  adminPreferences.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
const sidebarOpen = () => adminPreferences.sidebarOpen

function BrandMark(props: { collapsed?: boolean }) {
  return (
    <Link to="/" class="flex min-w-0 items-center gap-2.5" title="Pink Binder console">
      <span
        aria-hidden
        class="bg-primary text-primary-foreground font-title flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
      >
        PB
      </span>
      <Show when={!props.collapsed}>
        <span class="min-w-0 leading-tight">
          <span class="block truncate text-sm font-bold">Pink Binder</span>
          <span class="text-muted-foreground block text-xs">Admin console</span>
        </span>
      </Show>
    </Link>
  )
}

function ThemeToggle(props: { expanded?: boolean }) {
  return (
    <Button variant="navItem" size="sm" onClick={toggleTheme} aria-label={themeToggleLabel()}>
      {adminPreferences.theme === 'light' ? <Moon class="size-4" /> : <Sun class="size-4" />}
      <Show when={props.expanded}>
        <span class="text-sm">
          {adminPreferences.theme === 'light' ? 'Dark mode' : 'Light mode'}
        </span>
      </Show>
    </Button>
  )
}

function DesktopSidebar() {
  const matchRoute = useMatchRoute()

  return (
    <aside
      class={cn(
        'bg-card/40 transition-width sticky top-0 hidden h-screen shrink-0 flex-col border-r duration-200 md:flex',
        sidebarOpen() ? 'w-64' : 'w-17'
      )}
    >
      <div class={cn('flex items-center gap-2 px-4 pt-5 pb-4', !sidebarOpen() && 'px-3')}>
        <BrandMark collapsed={!sidebarOpen()} />
      </div>
      <nav aria-label="Console" class="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        <For each={NAV_SECTIONS}>
          {(section) => (
            <div>
              <p
                class={cn(
                  'text-muted-foreground mb-1.5 px-2 text-xs font-semibold tracking-widest uppercase',
                  !sidebarOpen() && 'sr-only'
                )}
              >
                {section.label}
              </p>
              <div class="space-y-0.5">
                <For each={section.items}>
                  {(item) => {
                    const active = () => Boolean(matchRoute({ to: item.to, fuzzy: !item.exact }))
                    const Icon = item.icon
                    return (
                      <Link
                        to={item.to}
                        title={item.description}
                        aria-current={active() ? 'page' : undefined}
                        class={cn(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                          active()
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                          !sidebarOpen() && 'justify-center px-0'
                        )}
                      >
                        <Icon class="size-4 shrink-0" aria-hidden />
                        <Show
                          when={sidebarOpen()}
                          fallback={<span class="sr-only">{item.label}</span>}
                        >
                          <span class="truncate">{item.label}</span>
                        </Show>
                      </Link>
                    )
                  }}
                </For>
              </div>
            </div>
          )}
        </For>
      </nav>
      <div
        class={cn(
          'border-t px-3 py-3',
          sidebarOpen() ? 'flex items-center justify-between' : 'flex flex-col items-center gap-1'
        )}
      >
        <ThemeToggle expanded={sidebarOpen()} />
        <Button
          variant="navItem"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen())}
          aria-label={sidebarOpen() ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={sidebarOpen()}
        >
          {sidebarOpen() ? (
            <PanelLeftClose class="size-4" aria-hidden />
          ) : (
            <PanelLeftOpen class="size-4" aria-hidden />
          )}
          <Show when={sidebarOpen()}>
            <span class="text-sm">Collapse</span>
          </Show>
        </Button>
      </div>
    </aside>
  )
}

function MobileNav() {
  const matchRoute = useMatchRoute()
  return (
    <div class="bg-background/90 sticky top-0 z-40 border-b backdrop-blur md:hidden">
      <div class="flex items-center justify-between px-4 py-3">
        <BrandMark />
        <ThemeToggle />
      </div>
      <nav aria-label="Console" class="flex gap-1 overflow-x-auto px-3 pb-2">
        <For each={ALL_NAV_ITEMS}>
          {(item) => {
            const active = () => Boolean(matchRoute({ to: item.to, fuzzy: !item.exact }))
            return (
              <Link
                to={item.to}
                aria-current={active() ? 'page' : undefined}
                class={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                  active()
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.label}
              </Link>
            )
          }}
        </For>
      </nav>
    </div>
  )
}

export function ConsoleShell(props: { children?: JSX.Element }) {
  useThemeEffect()
  return (
    <div class="min-h-screen md:flex">
      <DesktopSidebar />
      <div class="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main class="min-w-0 flex-1">{props.children}</main>
      </div>
    </div>
  )
}
