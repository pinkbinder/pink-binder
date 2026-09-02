'use client'

export interface ZarazApi {
  track(eventName: string, eventProperties?: Record<string, unknown>): void | Promise<void>
  ecommerce(eventName: string, eventProperties?: Record<string, unknown>): void | Promise<void>
}

declare global {
  interface Window {
    zaraz?: ZarazApi
  }
}

function getZaraz(): ZarazApi | undefined {
  return typeof window === 'undefined' ? undefined : window.zaraz
}

function fireZaraz(call: (zaraz: ZarazApi) => void | Promise<void>) {
  const zaraz = getZaraz()
  if (!zaraz) return

  try {
    void Promise.resolve(call(zaraz)).catch(() => undefined)
  } catch {
    // Analytics must never block or break the user interaction that emitted it.
  }
}

export function sendZarazEvent(eventName: string, eventProperties?: Record<string, unknown>) {
  fireZaraz((zaraz) => zaraz.track(eventName, eventProperties))
}

export function sendZarazEcommerceEvent(
  eventName: string,
  eventProperties?: Record<string, unknown>
) {
  fireZaraz((zaraz) => zaraz.ecommerce(eventName, eventProperties))
}

/**
 * Fire a `select_content` event – used when a visitor clicks a blog post
 * or any piece of curated content.
 *
 * Corresponds to the GA4 recommended event of the same name.
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events#select_content
 */
export function trackSelectContent({
  contentType,
  itemId,
}: {
  contentType: string
  itemId: string
}) {
  sendZarazEvent('select_content', { content_type: contentType, item_id: itemId })
}

/**
 * Fire Zaraz's `Product Viewed` e-commerce event for an outbound marketplace
 * listing. Zaraz maps this event to the correct format for supported tools.
 * @see https://developers.cloudflare.com/zaraz/web-api/ecommerce/
 */
export function trackViewItem({
  itemId,
  itemName,
  itemCategory,
  currency = 'USD',
}: {
  itemId: string
  itemName: string
  itemCategory?: string
  currency?: string
}) {
  sendZarazEcommerceEvent('Product Viewed', {
    product_id: itemId,
    name: itemName,
    ...(itemCategory ? { category: itemCategory } : {}),
    currency,
  })
}

/**
 * Fire a `search` event – used when a visitor performs a search.
 *
 * Corresponds to the GA4 recommended event of the same name.
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events#search
 */
export function trackSearch({ searchTerm }: { searchTerm: string }) {
  const sanitized = searchTerm.trim().slice(0, 100)
  if (!sanitized) return
  sendZarazEvent('search', { search_term: sanitized })
}

/**
 * Fire a `share` event – used when a visitor shares content via the share dialog.
 *
 * Corresponds to the GA4 recommended event of the same name.
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events#share
 */
export function trackShare({
  method,
  contentType,
  itemId,
}: {
  method: string
  contentType: string
  itemId: string
}) {
  sendZarazEvent('share', { method, content_type: contentType, item_id: itemId })
}
