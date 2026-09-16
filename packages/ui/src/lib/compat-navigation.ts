import { createMemo, createSignal, onCleanup, onMount, type Accessor } from 'solid-js'

export interface SearchParamParser {
  parse: (value: string) => string | null
  serialize?: (value: string) => string
}

export type ParsedSearchParams<P extends Record<string, SearchParamParser>> = {
  [K in keyof P]: string | null
}

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

function readSearch(): string {
  return typeof window === 'undefined' ? '' : window.location.search
}

/** Tracks `window.location` — bumped on popstate and the push/replace events our URL-state helpers dispatch. */
function createLocationRevision(): Accessor<number> {
  const [revision, setRevision] = createSignal(0)
  onMount(() => {
    const bump = () => setRevision((value) => value + 1)
    const unsubscribe = subscribe(bump)
    onCleanup(unsubscribe)
  })
  return revision
}

/** Current pathname; updates on history events. */
export function usePathname(): Accessor<string> {
  const revision = createLocationRevision()
  return createMemo(() => {
    revision()
    return readPathname()
  })
}

/** Current query params; re-parsed on history events. A history event that
 *  leaves the query string unchanged (hash-only pushes, unrelated writers)
 *  returns the memoized instance instead of a fresh object, so downstream
 *  memos keyed on identity do not re-run. */
export function useSearchParams(): Accessor<URLSearchParams> {
  const revision = createLocationRevision()
  let lastSearch: string | null = null
  let lastParams = new URLSearchParams()
  return createMemo(() => {
    revision()
    const search = readSearch()
    if (search !== lastSearch) {
      lastSearch = search
      lastParams = new URLSearchParams(search)
    }
    return lastParams
  })
}

export function parseSearchParams<P extends Record<string, SearchParamParser>>(
  parsers: P,
  search: string | URLSearchParams
): ParsedSearchParams<P> {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search
  const result = {} as ParsedSearchParams<P>
  for (const key of Object.keys(parsers) as (keyof P)[]) {
    const raw = params.get(key as string)
    const parser = parsers[key]
    result[key] = raw === null || !parser ? null : parser.parse(raw)
  }
  return result
}

interface UrlQueryStatesOptions {
  /** 'push' (default) or 'replace' history writes. */
  history?: 'push' | 'replace'
}

/**
 * URL-backed filter state for Astro islands — reads `location.search`, writes
 * through `history.pushState`/`replaceState`, and notifies location
 * subscribers. Null values delete the param (clear-on-default semantics —
 * every parser here defaults to null).
 */
export function createUrlQueryStates<P extends Record<string, SearchParamParser>>(
  parsers: P,
  options: UrlQueryStatesOptions = {}
): [Accessor<ParsedSearchParams<P>>, (next: Partial<ParsedSearchParams<P>> | null) => void] {
  const revision = createLocationRevision()
  // Same search string, same parsed object — a no-op history event (or a
  // redundant write) then never re-runs the filter pipeline downstream.
  let lastSearch: string | null = null
  let lastState = parseSearchParams(parsers, '')
  const state = createMemo(() => {
    revision()
    const search = readSearch()
    if (search !== lastSearch) {
      lastSearch = search
      lastState = parseSearchParams(parsers, search)
    }
    return lastState
  })

  const setState = (next: Partial<ParsedSearchParams<P>> | null) => {
    if (typeof window === 'undefined' || next === null) return
    const params = new URLSearchParams(readSearch())
    for (const key of Object.keys(parsers) as (keyof P)[]) {
      if (!(key in next)) continue
      const value = next[key]
      if (value === null || value === undefined) {
        params.delete(key as string)
      } else {
        const serialize = parsers[key]?.serialize
        params.set(key as string, serialize ? serialize(value) : String(value))
      }
    }
    const query = params.toString()
    const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    const method = options.history === 'replace' ? 'replaceState' : 'pushState'
    window.history[method](null, '', url)
    window.dispatchEvent(new Event(method === 'pushState' ? 'pushstate' : 'replacestate'))
  }

  return [state, setState]
}
