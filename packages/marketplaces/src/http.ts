/** Next.js extends `fetch` with ISR options when called from App Router code. */
export type CachedFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false
  }
}

const DEFAULT_REVALIDATE_SECONDS = 60 * 60 * 24
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000

export async function marketplaceFetchJson<T>(
  url: string,
  init?: CachedFetchInit & { revalidateSeconds?: number }
): Promise<T | null> {
  const revalidate = init?.revalidateSeconds ?? DEFAULT_REVALIDATE_SECONDS
  const { next: nextInit, ...rest } = init ?? {}

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
