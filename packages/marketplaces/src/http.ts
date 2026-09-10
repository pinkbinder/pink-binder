/**
 * Framework-agnostic cache hint for marketplace fetches. The `next` field
 * carries the upstream revalidation hint (ignored outside ISR runtimes);
 * prefer `revalidateSeconds`, which TanStack Start server functions and the
 * Astro edge cache read explicitly.
 */
export type CachedFetchInit = RequestInit & {
  revalidateSeconds?: number
  next?: {
    revalidate?: number | false
  }
}

const DEFAULT_REVALIDATE_SECONDS = 60 * 60 * 24
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000

export async function marketplaceFetchJson<T>(
  url: string,
  init?: CachedFetchInit
): Promise<T | null> {
  const revalidate = init?.revalidateSeconds ?? DEFAULT_REVALIDATE_SECONDS
  const { next: nextInit, revalidateSeconds: _revalidateSeconds, ...rest } = init ?? {}

  const fetchInit: CachedFetchInit = {
    ...rest,
    signal: rest.signal ?? AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS),
    next: { revalidate, ...nextInit },
  }

  try {
    const response = await fetch(url, fetchInit)

    if (!response.ok) {
      return null
    }

    return (await response.json()) as T
  } catch {
    return null
  }
}
