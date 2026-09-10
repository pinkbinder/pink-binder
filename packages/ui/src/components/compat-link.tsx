'use client'

import type { AnchorHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react'

type AnchorProps = DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>

export interface CompatLinkProps extends Omit<AnchorProps, 'href'> {
  href: string | { pathname?: string; query?: Record<string, string | string[] | undefined> }
  children?: ReactNode
  /** Accepted for link API compatibility; ignored (Astro handles scroll). */
  scroll?: boolean
  /** Accepted for link API compatibility; ignored (no locale routing). */
  locale?: string | false
  /** Accepted for link API compatibility; ignored (always a plain anchor). */
  replace?: boolean
  /** Accepted for link API compatibility; ignored (no prefetch runtime). */
  prefetch?: boolean | null
}

/** Serialize an href object ({ pathname, query }) into a plain URL string. */
export function resolveCompatHref(href: CompatLinkProps['href']): string {
  if (typeof href === 'string') return href
  const pathname = href.pathname ?? '/'
  const query = href.query ?? {}
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const entry of value) params.append(key, entry)
    } else {
      params.set(key, value)
    }
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : ''
  return `${pathname}${suffix}`
}

/**
 * Plain anchor for Astro React islands (same props shape as the framework link import it replaces).
 * Renders a plain anchor — no router, no prefetch. Extra link-only props
 * (`scroll`, `locale`, `replace`, `prefetch`) are accepted and ignored.
 */
export default function CompatLink({
  href,
  scroll: _scroll,
  locale: _locale,
  replace: _replace,
  prefetch: _prefetch,
  ...rest
}: CompatLinkProps) {
  void _scroll
  void _locale
  void _replace
  void _prefetch
  return <a {...rest} href={resolveCompatHref(href)} />
}
