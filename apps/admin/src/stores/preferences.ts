import { create } from 'zustand'

export type AdminTheme = 'light' | 'dark'

interface AdminPreferences {
  theme: AdminTheme
  sidebarOpen: boolean
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
}

/**
 * Client-only admin preferences. Deliberately *not* persisted: theme is
 * applied via a `dark` class toggle in an effect, and sidebar state is
 * ephemeral per session. Server components never import this module.
 */
export const useAdminPreferences = create<AdminPreferences>()((set) => ({
  theme: 'light',
  sidebarOpen: true,
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))

interface AdminSelection {
  selectedOrderIds: string[]
  toggleOrder: (id: string) => void
  clearSelection: () => void
}

/**
 * Ephemeral multi-select for the orders table. Kept separate from
 * preferences so bulk-action toolbars only re-render on selection changes.
 */
export const useAdminSelection = create<AdminSelection>()((set) => ({
  selectedOrderIds: [],
  toggleOrder: (id) =>
    set((state) => ({
      selectedOrderIds: state.selectedOrderIds.includes(id)
        ? state.selectedOrderIds.filter((entry) => entry !== id)
        : [...state.selectedOrderIds, id],
    })),
  clearSelection: () => set({ selectedOrderIds: [] }),
}))

export function formatAmountCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`
}
