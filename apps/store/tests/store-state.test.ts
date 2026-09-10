import { describe, expect, test } from 'bun:test'
import { catalogSearchParsers } from '../src/lib/catalog-search'
import { formatPriceCents, useCartStore } from '../src/stores/cart'

describe('store catalog search parsers', () => {
  test('search query defaults to empty string', () => {
    expect(catalogSearchParsers.q.parse('')).toBe('')
  })

  test('category accepts known literals and clears unknown values', () => {
    expect(catalogSearchParsers.category.parse('Design')).toBe('Design')
    expect(catalogSearchParsers.category.parse('nope')).toBeNull()
  })

  test('category serializes back to the URL value', () => {
    expect(catalogSearchParsers.category.serialize('Tools')).toBe('Tools')
  })
})

describe('store cart state', () => {
  test('add, update, and remove lines with scoped totals', () => {
    useCartStore.setState({ lines: [], isOpen: false, lastAddedAt: null })

    useCartStore.getState().addLine({ id: 'pb-001', name: 'Digital Template', priceCents: 2900 })
    useCartStore.getState().addLine({ id: 'pb-001', name: 'Digital Template', priceCents: 2900 }, 2)
    useCartStore.getState().addLine({ id: 'pb-002', name: 'UI Kit', priceCents: 4900 })

    const state = useCartStore.getState()
    expect(state.lines).toHaveLength(2)
    expect(state.lines.find((line) => line.id === 'pb-001')?.qty).toBe(3)
    expect(state.lastAddedAt).not.toBeNull()

    useCartStore.getState().setQty('pb-001', 1)
    expect(useCartStore.getState().lines.find((line) => line.id === 'pb-001')?.qty).toBe(1)

    useCartStore.getState().removeLine('pb-002')
    expect(useCartStore.getState().lines.map((line) => line.id)).toEqual(['pb-001'])

    useCartStore.getState().clear()
    expect(useCartStore.getState().lines).toEqual([])
  })

  test('quantity clamps to the 1..99 range', () => {
    useCartStore.setState({ lines: [], isOpen: false, lastAddedAt: null })
    useCartStore.getState().addLine({ id: 'pb-009', name: 'Pack', priceCents: 100 }, 500)
    expect(useCartStore.getState().lines[0]?.qty).toBe(99)
    useCartStore.getState().setQty('pb-009', 0)
    expect(useCartStore.getState().lines).toEqual([])
  })

  test('formats cent prices without trailing .00', () => {
    expect(formatPriceCents(2900)).toBe('$29')
    expect(formatPriceCents(2950)).toBe('$29.50')
  })
})
