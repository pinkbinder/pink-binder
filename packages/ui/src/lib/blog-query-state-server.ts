import { parseSearchParams } from './compat-navigation'
import { blogFilterParsers, type BlogFilterSearchParams } from './blog-query-state'

type LoaderInput = URLSearchParams | URL | Request | Record<string, string | string[] | undefined>

/**
 * Server-side filter loader: parses the first value of
 * each known filter key from a URL, request, search params, or a plain
 * `{ key: value }` map (what Astro's `Astro.url.searchParams` loop builds).
 */
export function loadBlogFilterSearchParams(input: LoaderInput): BlogFilterSearchParams {
  if (input instanceof URLSearchParams || input instanceof URL) {
    const params = input instanceof URL ? input.searchParams : input
    return parseSearchParams(blogFilterParsers, params)
  }
  if (input instanceof Request) {
    return parseSearchParams(blogFilterParsers, new URL(input.url).searchParams)
  }
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const entry of value) params.append(key, entry)
    } else {
      params.set(key, value)
    }
  }
  return parseSearchParams(blogFilterParsers, params)
}
