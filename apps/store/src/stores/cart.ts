import { useStore } from '@nanostores/react'
import { atom, computed } from 'nanostores'

export interface CartLine {
  id: string
  name: string
  priceCents: number
  qty: number
}

export interface CartState {
  lines: CartLine[]
  isOpen: boolean
  lastAddedAt: string | null
}

const STORAGE_KEY = 'pink-binder-cart'

function upsert(lines: CartLine[], line: Omit<CartLine, 'qty'>, qty: number): CartLine[] {
  const existing = lines.find((entry) => entry.id === line.id)
  if (!existing) return [...lines, { ...line, qty }]
  return lines.map((entry) =>
    entry.id === line.id ? { ...entry, qty: Math.min(99, entry.qty + qty) } : entry
  )
}

/**
 * Nanostores cart (starter pattern). The atom is the single source of truth;
 * `hydrateCartFromStorage` is called once from the layout island mount so the
 * server render never touches localStorage. Mutations mirror the old zustand
 * behavior: quantities clamp to 1..99 and removing is a qty <= 0 side effect.
 */
export const cart = atom<CartState>({ lines: [], isOpen: false, lastAddedAt: null })

let hydrated = false

export function hydrateCartFromStorage(): void {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { lines?: CartLine[] }
      if (Array.isArray(parsed.lines)) {
        cart.set({ ...cart.get(), lines: parsed.lines })
      }
    }
  } catch {
    // Corrupt storage is not fatal; start with an empty cart.
  }
  cart.subscribe((state) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines: state.lines }))
  })
}

export function addLine(line: Omit<CartLine, 'qty'>, qty = 1): void {
  const state = cart.get()
  cart.set({
    ...state,
    lines: upsert(state.lines, line, Math.max(1, Math.min(99, qty))),
    lastAddedAt: new Date().toISOString(),
  })
}

export function setLineQty(id: string, qty: number): void {
  const state = cart.get()
  cart.set({
    ...state,
    lines:
      qty <= 0
        ? state.lines.filter((line) => line.id !== id)
        : state.lines.map((line) =>
            line.id === id ? { ...line, qty: Math.max(1, Math.min(99, qty)) } : line
          ),
  })
}

export function removeLine(id: string): void {
  const state = cart.get()
  cart.set({ ...state, lines: state.lines.filter((line) => line.id !== id) })
}

export function clearCart(): void {
  cart.set({ ...cart.get(), lines: [] })
}

export function setCartOpen(open: boolean): void {
  cart.set({ ...cart.get(), isOpen: open })
}

export const cartCount = computed(cart, (state) =>
  state.lines.reduce((sum, line) => sum + line.qty, 0)
)

export const cartTotalCents = computed(cart, (state) =>
  state.lines.reduce((sum, line) => sum + line.qty * line.priceCents, 0)
)

export function useCart(): CartState {
  return useStore(cart)
}

export function useCartTotal(): number {
  return useStore(cartTotalCents)
}

export function formatPriceCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`
}
