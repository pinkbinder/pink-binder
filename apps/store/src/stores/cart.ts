import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartLine {
  id: string
  name: string
  priceCents: number
  qty: number
}

interface CartState {
  lines: CartLine[]
  isOpen: boolean
  lastAddedAt: string | null
  addLine: (line: Omit<CartLine, 'qty'>, qty?: number) => void
  removeLine: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  setOpen: (open: boolean) => void
}

function upsert(lines: CartLine[], line: Omit<CartLine, 'qty'>, qty: number): CartLine[] {
  const existing = lines.find((entry) => entry.id === line.id)
  if (!existing) return [...lines, { ...line, qty }]
  return lines.map((entry) =>
    entry.id === line.id ? { ...entry, qty: Math.min(99, entry.qty + qty) } : entry
  )
}

/**
 * Client-only cart state. `persist` keeps the cart across reloads via
 * localStorage; server components never import this module so there is no
 * SSR storage access. Selectors (`useCartCount`, …) keep re-renders scoped
 * to the slice each component reads.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      lastAddedAt: null,
      addLine: (line, qty = 1) =>
        set((state) => ({
          lines: upsert(state.lines, line, Math.max(1, Math.min(99, qty))),
          lastAddedAt: new Date().toISOString(),
        })),
      removeLine: (id) => set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.id !== id)
              : state.lines.map((l) =>
                  l.id === id ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l
                ),
        })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ isOpen: open }),
    }),
    { name: 'pink-binder-cart', partialize: (state) => ({ lines: state.lines }) }
  )
)

export function useCartCount(): number {
  return useCartStore((state) => state.lines.reduce((sum, line) => sum + line.qty, 0))
}

export function useCartTotalCents(): number {
  return useCartStore((state) =>
    state.lines.reduce((sum, line) => sum + line.qty * line.priceCents, 0)
  )
}

export function formatPriceCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`
}
