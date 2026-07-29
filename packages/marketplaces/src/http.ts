/** Next.js extends `fetch` with ISR options when called from App Router code. */
export type CachedFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false
  }
}

const DEFAULT_REVALIDATE_SECONDS = 60 * 60 * 24

export async function marketplaceFetchJson<T>(
  url: string,
  init?: CachedFetchInit & { revalidateSeconds?: number }
): Promise<T | null> {
  const revalidate = init?.revalidateSeconds ?? DEFAULT_REVALIDATE_SECONDS
  const { next: nextInit, ...rest } = init ?? {}

  const fetchInit: CachedFetchInit = {
    ...rest,
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
