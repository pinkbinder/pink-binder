import { trackButtonClick, trackOutboundClick, trackPostView } from '@repo/ui/zaraz-events'

/**
 * Page-level analytics wiring for the blog (button clicks, outbound links,
 * post views). Loaded by the shared layout on every page; all events go
 * through the Zaraz Web API so every configured tool receives them.
 */

const INTERACTIVE_SELECTOR = 'button, [role="button"]'

/** Radix generates unstable ids (`radix-:r0:`) that are noise as a dimension. */
const GENERATED_ID_PATTERN = /^(radix-|[:«]r)/

export interface ButtonClickInfo {
  kind: 'button'
  buttonText: string | null
  buttonId: string | null
  buttonSection: string | null
}

export interface OutboundClickInfo {
  kind: 'outbound'
  url: URL
  linkText: string | null
}

export type ResolvedClickInfo = ButtonClickInfo | OutboundClickInfo

function visibleLabel(element: Element): string | null {
  const explicit = element.getAttribute('aria-label') ?? element.getAttribute('title')
  const label = (explicit ?? element.textContent ?? '').replace(/\s+/g, ' ').trim()
  return label || null
}

function resolveAnalyticsId(element: Element): string | null {
  const override =
    element.getAttribute('data-analytics-id') ??
    element.closest('[data-analytics-id]')?.getAttribute('data-analytics-id')
  if (override) return override
  if (element.id && !GENERATED_ID_PATTERN.test(element.id)) return element.id
  return null
}

function resolveSection(element: Element): string | null {
  return element.closest('[data-analytics-section]')?.getAttribute('data-analytics-section') ?? null
}

/**
 * Map a click target to the analytics event it represents: outbound anchors
 * (different http origin than the page) win over generic buttons; internal
 * navigation is intentionally left to page_view/select_content events.
 */
export function resolveClickInfo(
  target: EventTarget | null,
  baseUrl: string
): ResolvedClickInfo | null {
  if (!(target instanceof Element)) return null

  const anchor = target.closest('a[href]')
  if (anchor) {
    const href = anchor.getAttribute('href') ?? ''
    if (!href || href.startsWith('#')) return null
    let url: URL
    try {
      url = new URL(href, baseUrl)
    } catch {
      return null
    }
    const pageOrigin = (() => {
      try {
        return new URL(baseUrl).origin
      } catch {
        return ''
      }
    })()
    if (url.origin === pageOrigin || !url.protocol.startsWith('http')) return null
    return { kind: 'outbound', url, linkText: visibleLabel(anchor) }
  }

  const button = target.closest(INTERACTIVE_SELECTOR)
  if (button) {
    return {
      kind: 'button',
      buttonText: visibleLabel(button),
      buttonId: resolveAnalyticsId(button),
      buttonSection: resolveSection(button),
    }
  }
  return null
}

interface EmbeddedPostView {
  slug: string
  title: string
}

/** The layout embeds this JSON payload on post pages (see Layout.astro). */
const POST_VIEW_ELEMENT_ID = 'pb-post-view'

function readEmbeddedPostView(): EmbeddedPostView | null {
  if (typeof document === 'undefined') return null
  const element = document.getElementById(POST_VIEW_ELEMENT_ID)
  if (!element?.textContent) return null
  try {
    const parsed: unknown = JSON.parse(element.textContent)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as EmbeddedPostView).slug === 'string' &&
      (parsed as EmbeddedPostView).slug
    ) {
      const { slug, title } = parsed as EmbeddedPostView
      return { slug, title: typeof title === 'string' ? title : '' }
    }
    return null
  } catch {
    return null
  }
}

function handleClick(event: MouseEvent): void {
  const info = resolveClickInfo(event.target, window.location.href)
  if (!info) return
  if (info.kind === 'outbound') {
    trackOutboundClick({ url: info.url, linkText: info.linkText })
    return
  }
  trackButtonClick({
    buttonText: info.buttonText,
    buttonId: info.buttonId,
    buttonSection: info.buttonSection,
  })
}

let initialized = false

/** Attach the delegated click tracker once, then report the page's post view. */
export function initBlogPageTracking(): void {
  if (typeof window === 'undefined') return
  if (!initialized) {
    initialized = true
    // Capture phase: keep counting even if app code stops propagation.
    document.addEventListener('click', handleClick, true)
  }
  const postView = readEmbeddedPostView()
  if (postView) {
    trackPostView({ postId: postView.slug, postTitle: postView.title })
  }
}
