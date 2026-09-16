import { describe, expect, mock, test } from 'bun:test'
import { SECURITY_HEADERS } from '@repo/config'

// Keep the middleware test away from the Solid client runtime — `createMiddleware`
// is a pure builder, so a faithful stub lets us exercise our own handler
// without loading @tanstack/solid-start's DOM-side imports under Bun.
mock.module('@tanstack/solid-start', () => ({
  createMiddleware: () => ({ server: (fn: unknown) => ({ options: { server: fn } }) }),
}))

import { ordersSearchParsers } from '../src/lib/order-search'
import { formatAmountCents } from '../src/lib/format'
import { securityHeadersMiddleware } from '../src/middleware/security-headers'
import {
  adminPreferences,
  adminSelection,
  clearSelection,
  setAdminPreferences,
  setAdminSelection,
  setSidebarOpen,
  toggleOrder,
  toggleTheme,
} from '../src/stores/preferences'

describe('admin order search parsers', () => {
  test('status accepts known literals and clears unknown values', () => {
    expect(ordersSearchParsers.status.parse('pending')).toBe('pending')
    expect(ordersSearchParsers.status.parse('bogus')).toBeNull()
  })

  test('search query defaults to empty string', () => {
    expect(ordersSearchParsers.q.parse('')).toBe('')
  })

  test('status serializes back to the URL value', () => {
    expect(ordersSearchParsers.status.serialize('processing')).toBe('processing')
  })
})

describe('admin preferences store', () => {
  test('toggles theme and sidebar visibility', () => {
    setAdminPreferences({ theme: 'light', sidebarOpen: true })

    toggleTheme()
    expect(adminPreferences.theme).toBe('dark')

    toggleTheme()
    expect(adminPreferences.theme).toBe('light')

    setSidebarOpen(false)
    expect(adminPreferences.sidebarOpen).toBe(false)
  })

  test('formats cent amounts without trailing .00', () => {
    expect(formatAmountCents(4900)).toBe('$49')
    expect(formatAmountCents(4950)).toBe('$49.50')
  })
})

describe('admin order selection store', () => {
  test('toggles and clears multi-select', () => {
    setAdminSelection({ selectedOrderIds: [] })

    toggleOrder('#001')
    toggleOrder('#002')
    expect(adminSelection.selectedOrderIds).toEqual(['#001', '#002'])

    toggleOrder('#001')
    expect(adminSelection.selectedOrderIds).toEqual(['#002'])

    clearSelection()
    expect(adminSelection.selectedOrderIds).toEqual([])
  })
})

describe('admin security-headers middleware', () => {
  test('applies the shared security headers to Worker responses', async () => {
    const options = (
      securityHeadersMiddleware as unknown as {
        options: {
          server: (args: {
            next: () => Promise<{ response: Response; request: Request }>
            request: Request
          }) => Promise<{ response: Response; request: Request }>
        }
      }
    ).options
    const request = new Request('https://pinkbinder.shop/admin')
    const result = await options.server({
      request,
      next: async () => ({ request, response: new Response('ok') }),
    })

    for (const header of SECURITY_HEADERS) {
      expect(result.response.headers.get(header.key)).toBe(header.value)
    }
  })
})
