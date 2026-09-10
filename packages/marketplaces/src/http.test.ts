import { afterEach, describe, expect, it, mock } from 'bun:test'

const okJson = (body: unknown) => ({
  ok: true,
  json: async () => body,
  text: async () => JSON.stringify(body),
})

const notOk = { ok: false, json: async () => ({}), text: async () => 'err' }

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('http (marketplaceFetchJson)', () => {
  it('returns parsed json on success', async () => {
    globalThis.fetch = mock(async () => okJson({ hello: 'world' })) as never
    const { marketplaceFetchJson } = await import('./http')
    const out = await marketplaceFetchJson<{ hello: string }>('https://example.com/x')
    expect(out).toEqual({ hello: 'world' })
  })

  it('returns null on non-ok response', async () => {
    globalThis.fetch = mock(async () => notOk) as never
    const { marketplaceFetchJson } = await import('./http')
    expect(await marketplaceFetchJson('https://example.com/x')).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    globalThis.fetch = mock(async () => {
      throw new Error('network')
    }) as never
    const { marketplaceFetchJson } = await import('./http')
    expect(await marketplaceFetchJson('https://example.com/x')).toBeNull()
  })

  it('strips the revalidateSeconds hint instead of passing Next.js ISR options', async () => {
    let captured: RequestInit | undefined
    globalThis.fetch = mock(async (_url: string, init: RequestInit) => {
      captured = init
      return okJson({})
    }) as never
    const { marketplaceFetchJson } = await import('./http')
    await marketplaceFetchJson('https://example.com/x', { revalidateSeconds: 3600 })
    const recorded = captured as Record<string, unknown>
    expect(recorded.next).toBeUndefined()
    expect(recorded.revalidateSeconds).toBeUndefined()
  })

  it('adds a request deadline signal when the caller does not provide one', async () => {
    let captured: RequestInit | undefined
    globalThis.fetch = mock(async (_url: string, init: RequestInit) => {
      captured = init
      return okJson({})
    }) as never
    const { marketplaceFetchJson } = await import('./http')

    await marketplaceFetchJson('https://example.com/x')

    expect(captured?.signal).toBeInstanceOf(AbortSignal)
  })

  it('preserves a caller-provided request signal', async () => {
    let captured: RequestInit | undefined
    const controller = new AbortController()
    globalThis.fetch = mock(async (_url: string, init: RequestInit) => {
      captured = init
      return okJson({})
    }) as never
    const { marketplaceFetchJson } = await import('./http')

    await marketplaceFetchJson('https://example.com/x', { signal: controller.signal })

    expect(captured?.signal).toBe(controller.signal)
  })
})
