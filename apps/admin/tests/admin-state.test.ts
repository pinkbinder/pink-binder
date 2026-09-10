import { describe, expect, test } from 'bun:test'
import { SECURITY_HEADERS } from '@repo/config'

import { ordersSearchParsers } from '../src/lib/order-search'
import { securityHeadersMiddleware } from '../src/middleware/security-headers'
import {
  formatAmountCents,
  useAdminPreferences,
  useAdminSelection,
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
    useAdminPreferences.setState({ theme: 'light', sidebarOpen: true })

    useAdminPreferences.getState().toggleTheme()
    expect(useAdminPreferences.getState().theme).toBe('dark')

    useAdminPreferences.getState().toggleTheme()
    expect(useAdminPreferences.getState().theme).toBe('light')

    useAdminPreferences.getState().setSidebarOpen(false)
    expect(useAdminPreferences.getState().sidebarOpen).toBe(false)
  })

  test('formats cent amounts without trailing .00', () => {
    expect(formatAmountCents(4900)).toBe('$49')
    expect(formatAmountCents(4950)).toBe('$49.50')
  })
})

describe('admin order selection store', () => {
  test('toggles and clears multi-select', () => {
    useAdminSelection.setState({ selectedOrderIds: [] })

    useAdminSelection.getState().toggleOrder('#001')
    useAdminSelection.getState().toggleOrder('#002')
    expect(useAdminSelection.getState().selectedOrderIds).toEqual(['#001', '#002'])

    useAdminSelection.getState().toggleOrder('#001')
    expect(useAdminSelection.getState().selectedOrderIds).toEqual(['#002'])

    useAdminSelection.getState().clearSelection()
    expect(useAdminSelection.getState().selectedOrderIds).toEqual([])
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
