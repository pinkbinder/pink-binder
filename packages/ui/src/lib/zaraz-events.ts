'use client'

export interface ZarazApi {
  track(eventName: string, eventProperties?: Record<string, unknown>): void | Promise<void>
  ecommerce(eventName: string, eventProperties?: Record<string, unknown>): void | Promise<void>
}

declare global {
  interface Window {
    zaraz?: ZarazApi
    /** Provided by the Clarity tag; absent until (and unless) Zaraz loads it. */
    clarity?: (...args: unknown[]) => void
  }
}

function getZaraz(): ZarazApi | undefined {
  return typeof window === 'undefined' ? undefined : window.zaraz
}

function getClarity(): ((...args: unknown[]) => void) | undefined {
  return typeof window === 'undefined' ? undefined : window.clarity
}

function fireClarity(eventName: string): void {
  try {
    getClarity()?.('event', eventName)
  } catch {
    // Clarity is a mirror, never a dependency of the Zaraz event.
  }
}

// Cloudflare injects the Zaraz loader asynchronously, so events fired before
// it arrives (early clicks, post views) queue briefly and flush once
// `window.zaraz` exists. The queue is bounded so pages where Zaraz never
// loads (ad blockers) cannot grow it without limit.

const EVENT_QUEUE_LIMIT = 50
const FLUSH_INTERVAL_MS = 300
const MAX_FLUSH_ATTEMPTS = 16

type ZarazMethod = 'track' | 'ecommerce'

interface QueuedZarazEvent {
  method: ZarazMethod
  eventName: string
  eventProperties?: Record<string, unknown>
}

const queuedEvents: QueuedZarazEvent[] = []
let flushAttempts = 0
let flushTimer: ReturnType<typeof setInterval> | undefined

function dispatch(event: QueuedZarazEvent, zaraz: ZarazApi): void {
  try {
    const result =
      event.method === 'ecommerce'
        ? zaraz.ecommerce(event.eventName, event.eventProperties)
        : zaraz.track(event.eventName, event.eventProperties)
    void Promise.resolve(result).catch(() => undefined)
  } catch {
    // Analytics must never block or break the user interaction that emitted it.
  }
}

function stopFlushLoop(): void {
  if (flushTimer !== undefined) {
    clearInterval(flushTimer)
    flushTimer = undefined
  }
}

/** Send queued events once Zaraz is available; true when the queue drained. */
export function flushQueuedZarazEvents(): boolean {
  const zaraz = getZaraz()
  if (!zaraz) return false
  while (queuedEvents.length > 0) {
    dispatch(queuedEvents.shift() as QueuedZarazEvent, zaraz)
  }
  stopFlushLoop()
  return true
}

function ensureFlushLoop(): void {
  if (flushTimer !== undefined) return
  flushAttempts = 0
  flushTimer = setInterval(() => {
    flushAttempts += 1
    if (flushQueuedZarazEvents() || flushAttempts >= MAX_FLUSH_ATTEMPTS) {
      stopFlushLoop()
    }
  }, FLUSH_INTERVAL_MS)
}

export function getQueuedZarazEventCount(): number {
  return queuedEvents.length
}

function fireZaraz(
  method: ZarazMethod,
  eventName: string,
  eventProperties?: Record<string, unknown>
) {
  const zaraz = getZaraz()
  if (zaraz) {
    flushQueuedZarazEvents()
    dispatch({ method, eventName, eventProperties }, zaraz)
    return
  }
  if (typeof window === 'undefined') return
  if (queuedEvents.length >= EVENT_QUEUE_LIMIT) {
    queuedEvents.shift()
  }
  queuedEvents.push({ method, eventName, eventProperties })
  ensureFlushLoop()
}

export function sendZarazEvent(eventName: string, eventProperties?: Record<string, unknown>) {
  fireZaraz('track', eventName, eventProperties)
}

export function sendZarazEcommerceEvent(
  eventName: string,
  eventProperties?: Record<string, unknown>
) {
  fireZaraz('ecommerce', eventName, eventProperties)
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
 * Fire a `search` event – used when a visitor runs a blog search.
 *
 * Corresponds to the GA4 recommended event of the same name, so the term
 * feeds GA4's site-search reporting.
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events#search
 */
export function trackSearch({ searchTerm }: { searchTerm: string }) {
  const sanitized = searchTerm.trim().slice(0, 100)
  if (!sanitized) return
  sendZarazEvent('search', { search_term: sanitized })
  fireClarity('search')
}

const FILTER_VALUE_LIMIT = 120

function sanitizeFilterValue(value: string | null | undefined): string | undefined {
  const sanitized = value?.trim().slice(0, FILTER_VALUE_LIMIT)
  return sanitized ? sanitized : undefined
}

/**
 * Fire a `filter` event – used when a visitor changes a blog grid filter.
 *
 * `filterAction` distinguishes applying a value from clearing one, so
 * "most popular filters" can be reported on `apply` actions alone.
 */
export function trackFilter({
  filterGroup,
  filterValue,
  filterAction,
}: {
  filterGroup: string
  filterValue?: string | null
  filterAction: 'apply' | 'clear' | 'clear_all'
}) {
  const value = filterAction === 'apply' ? sanitizeFilterValue(filterValue) : undefined
  sendZarazEvent('filter', {
    filter_group: filterGroup.slice(0, FILTER_VALUE_LIMIT),
    ...(value ? { filter_value: value } : {}),
    filter_action: filterAction,
  })
  fireClarity('filter')
}

const LABEL_LIMIT = 100

function sanitizeLabel(value: string | null | undefined): string | undefined {
  const sanitized = value?.replace(/\s+/g, ' ').trim().slice(0, LABEL_LIMIT)
  return sanitized ? sanitized : undefined
}

/**
 * Fire a `button_click` event for any interactive control. The delegated
 * tracker in the blog layout derives the identity from the element, with
 * `data-analytics-id` / `data-analytics-section` attribute overrides.
 */
export function trackButtonClick({
  buttonText,
  buttonId,
  buttonSection,
}: {
  buttonText?: string | null
  buttonId?: string | null
  buttonSection?: string | null
}) {
  const text = sanitizeLabel(buttonText)
  const id = sanitizeLabel(buttonId)
  const section = sanitizeLabel(buttonSection)
  if (!text && !id && !section) return
  sendZarazEvent('button_click', {
    ...(text ? { button_text: text } : {}),
    ...(id ? { button_id: id } : {}),
    ...(section ? { button_section: section } : {}),
  })
}

/**
 * Fire a GA4 enhanced-measurement-compatible `click` event for outbound
 * navigation, so "where do readers go next" is reportable per destination
 * (Zaraz replaces gtag.js, whose automatic outbound tracking never loads).
 * @see https://support.google.com/analytics/answer/9216061
 */
export function trackOutboundClick({
  url,
  linkText,
}: {
  url: string | URL
  linkText?: string | null
}) {
  let parsed: URL
  try {
    parsed = url instanceof URL ? url : new URL(url)
  } catch {
    return
  }
  const text = sanitizeLabel(linkText)
  sendZarazEvent('click', {
    link_url: parsed.toString().slice(0, 512),
    link_domain: parsed.hostname,
    outbound: true,
    ...(text ? { link_text: text } : {}),
  })
}

/**
 * Fire a `post_view` event when an article page renders. Per-post readership
 * then does not depend on parsing `page_view` paths, and the slug/title are
 * first-class properties for every connected tool.
 */
export function trackPostView({
  postId,
  postTitle,
}: {
  postId: string
  postTitle?: string | null
}) {
  const id = postId.trim().slice(0, 200)
  if (!id) return
  const title = sanitizeLabel(postTitle)
  sendZarazEvent('post_view', {
    post_id: id,
    ...(title ? { post_title: title } : {}),
  })
  fireClarity('post_view')
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
