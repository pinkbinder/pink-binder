/**
 * Framework-agnostic marketplace fetch. Callers may pass `revalidateSeconds`
 * as a pipeline-level hint; it is stripped before fetch because no current
 * runtime (Cloudflare Workers, Bun) honors Next.js ISR cache options.
 */
export type CachedFetchInit = RequestInit & {
  revalidateSeconds?: number
}

const DEFAULT_REQUEST_TIMEOUT_MS = 10_000

export async function marketplaceFetchJson<T>(
  url: string,
  init?: CachedFetchInit
): Promise<T | null> {
  const { revalidateSeconds: _revalidateSeconds, ...rest } = init ?? {}

  const fetchInit: RequestInit = {
    ...rest,
    signal: rest.signal ?? AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS),
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
