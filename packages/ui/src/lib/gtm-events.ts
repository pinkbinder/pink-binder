'use client'

import { sendGTMEvent } from '@next/third-parties/google'

// Re-export for direct use in client components
export { sendGTMEvent }

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
  sendGTMEvent({ event: 'select_content', content_type: contentType, item_id: itemId })
}

/**
 * Fire a `view_item` event – used when a visitor views a marketplace listing
 * or product detail.
 *
 * Corresponds to the GA4 recommended event of the same name.
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events#view_item
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
  sendGTMEvent({
    event: 'view_item',
    ecommerce: {
      currency,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          ...(itemCategory ? { item_category: itemCategory } : {}),
        },
      ],
    },
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
  sendGTMEvent({ event: 'search', search_term: sanitized })
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
  sendGTMEvent({ event: 'share', method, content_type: contentType, item_id: itemId })
}
