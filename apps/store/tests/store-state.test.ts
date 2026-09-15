import { describe, expect, test } from 'bun:test'

import {
  STORE_CATEGORIES,
  buildCatalogUrl,
  matchesSearch,
  parseCatalogSearch,
} from '../src/lib/catalog-search'
import {
  addLine,
  cart,
  cartCount,
  cartTotalCents,
  clearCart,
  formatPriceCents,
  removeLine,
  setLineQty,
} from '../src/stores/cart'

describe('store catalog search parsing', () => {
  test('search query defaults to empty string', () => {
    expect(parseCatalogSearch(new URLSearchParams()).q).toBe('')
  })

  test('category accepts known literals and clears unknown values', () => {
    expect(parseCatalogSearch(new URLSearchParams('category=Design')).category).toBe('Design')
    expect(parseCatalogSearch(new URLSearchParams('category=nope')).category).toBe('All')
  })

  test('matching applies query and category filters', () => {
    expect(matchesSearch('Digital Template', 'Templates', { q: 'digital' })).toBe(true)
    expect(matchesSearch('Digital Template', 'Templates', { q: 'pokemon' })).toBe(false)
    expect(matchesSearch('Digital Template', 'Templates', { category: 'Templates' })).toBe(true)
    expect(matchesSearch('Digital Template', 'Templates', { category: 'Tools' })).toBe(false)
    expect(STORE_CATEGORIES).toContain('All')
  })
})

describe('store cart state (nanostores)', () => {
  test('add, update, and remove lines with scoped totals', () => {
    clearCart()

    addLine({ id: 'pb-001', name: 'Digital Template', priceCents: 2900 })
    addLine({ id: 'pb-001', name: 'Digital Template', priceCents: 2900 }, 2)
    addLine({ id: 'pb-002', name: 'UI Kit', priceCents: 4900 })

    const lines = cart.get().lines
    expect(lines).toHaveLength(2)
    expect(lines.find((line) => line.id === 'pb-001')?.qty).toBe(3)
    expect(cartCount.get()).toBe(4)
    expect(cartTotalCents.get()).toBe(3 * 2900 + 4900)
    expect(cart.get().lastAddedAt).not.toBeNull()

    setLineQty('pb-001', 1)
    expect(cartCount.get()).toBe(2)

    removeLine('pb-002')
    expect(cart.get().lines.map((line) => line.id)).toEqual(['pb-001'])

    clearCart()
    expect(cart.get().lines).toEqual([])
  })

  test('quantity clamps to the 1..99 range', () => {
    clearCart()
    addLine({ id: 'pb-009', name: 'Pack', priceCents: 100 }, 500)
    expect(cartCount.get()).toBe(99)
    setLineQty('pb-009', 0)
    expect(cart.get().lines).toEqual([])
  })

  test('formats cent prices without trailing .00', () => {
    expect(formatPriceCents(2900)).toBe('$29')
    expect(formatPriceCents(2950)).toBe('$29.50')
  })
})

describe('catalog URL writes', () => {
  test('text search replaces so typing never spams history', () => {
    const result = buildCatalogUrl('https://localhost/', 'q', 'pikachu')
    expect(result.replace).toBe(true)
    expect(result.url).toBe('https://localhost/?q=pikachu')
  })

  test('category chips push so Back undoes a filter change', () => {
    const result = buildCatalogUrl('https://localhost/', 'category', 'Design')
    expect(result.replace).toBe(false)
    expect(result.url).toBe('https://localhost/?category=Design')
  })

  test('empty and default values delete the param', () => {
    expect(buildCatalogUrl('https://localhost/?q=x', 'q', null).url).toBe('https://localhost/')
    expect(buildCatalogUrl('https://localhost/?q=x', 'q', '').url).toBe('https://localhost/')
    expect(buildCatalogUrl('https://localhost/?category=Tools', 'category', 'All').url).toBe(
      'https://localhost/'
    )
  })

  test('unrelated params survive', () => {
    expect(buildCatalogUrl('https://localhost/?utm=1', 'q', 'x').url).toBe(
      'https://localhost/?utm=1&q=x'
    )
  })
})
