'use client'

import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void): () => void {
  window.addEventListener('popstate', callback)
  window.addEventListener('pushstate', callback)
  window.addEventListener('replacestate', callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener('pushstate', callback)
    window.removeEventListener('replacestate', callback)
  }
}

function readPathname(): string {
  return typeof window === 'undefined' ? '/' : window.location.pathname
}

function readSearchParams(): URLSearchParams {
  return new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)
}

/**
 * Minimal pathname/query helpers for Astro islands (same shape as the
 * router hooks the islands were ported from).
 * The blog's islands only need the current pathname and query string —
 * there is no app router, so there is no navigation API to wrap.
 */

/** Current pathname; re-reads on history events. */
export function usePathname(): string {
  return useSyncExternalStore(subscribe, readPathname, () => '/')
}

/** Current query string; re-reads on history events. */
export function useSearchParams(): URLSearchParams {
  const tick = useSyncExternalStore(subscribe, readPathname, () => '/')
  void tick
  return readSearchParams()
}

/** Route params for islands rendered inside a known Astro route. */
export function useParams<
  T extends Record<string, string | string[]> = Record<string, string | string[]>,
>(): T {
  return {} as T
}
