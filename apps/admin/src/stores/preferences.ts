import { createStore } from 'solid-js/store'

export type AdminTheme = 'light' | 'dark'

/**
 * Client-only admin preferences. Deliberately *not* persisted: theme is
 * applied via a `dark` class toggle in an effect, and sidebar state is
 * ephemeral per session. Server components never import this module.
 */
export const [adminPreferences, setAdminPreferences] = createStore({
  theme: 'light' as AdminTheme,
  sidebarOpen: true,
})

export function toggleTheme(): void {
  setAdminPreferences('theme', (theme) => (theme === 'light' ? 'dark' : 'light'))
}

export function setSidebarOpen(open: boolean): void {
  setAdminPreferences('sidebarOpen', open)
}

/**
 * Ephemeral multi-select for the orders table. Kept separate from
 * preferences so bulk-action toolbars only re-render on selection changes.
 */
export const [adminSelection, setAdminSelection] = createStore({
  selectedOrderIds: [] as string[],
})

export function toggleOrder(id: string): void {
  setAdminSelection('selectedOrderIds', (ids) =>
    ids.includes(id) ? ids.filter((entry) => entry !== id) : [...ids, id]
  )
}

export function clearSelection(): void {
  setAdminSelection('selectedOrderIds', [])
}

export function formatAmountCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`
}
