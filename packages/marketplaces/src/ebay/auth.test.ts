import { afterEach, describe, expect, it, mock } from 'bun:test'

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('EBAY_')) delete process.env[key]
  }
})

// Fresh module instance per test so the module-level token cache doesn't leak
// between cases (bun caches `require('./auth')`, so we bust it with a query).
const loadAuth = (tag: string) => import(`./auth.ts?t=${tag}`) as Promise<typeof import('./auth')>

describe('getEbayClientCredentials', () => {
  it('returns null when credentials are missing', async () => {
    const { getEbayClientCredentials } = await loadAuth('cred-null')
    expect(getEbayClientCredentials()).toBeNull()
  })

  it('returns clientId + clientSecret from env', async () => {
    process.env.EBAY_APP_ID = 'my-id'
    process.env.EBAY_CLIENT_SECRET = 'my-secret'
    const { getEbayClientCredentials } = await loadAuth('cred-env')
    expect(getEbayClientCredentials()).toEqual({ clientId: 'my-id', clientSecret: 'my-secret' })
  })

  it('falls back to certId for the secret', async () => {
    process.env.EBAY_APP_ID = 'my-id'
    process.env.EBAY_CERT_ID = 'my-cert'
    const { getEbayClientCredentials } = await loadAuth('cred-cert')
    expect(getEbayClientCredentials()?.clientSecret).toBe('my-cert')
  })

  it('trims whitespace', async () => {
    process.env.EBAY_APP_ID = '  my-id  '
    process.env.EBAY_CLIENT_SECRET = '  my-secret  '
    const { getEbayClientCredentials } = await loadAuth('cred-trim')
    expect(getEbayClientCredentials()).toEqual({ clientId: 'my-id', clientSecret: 'my-secret' })
  })
})

describe('getEbayApplicationAccessToken', () => {
  it('returns null without credentials', async () => {
    const { getEbayApplicationAccessToken } = await loadAuth('tok-nocred')
    expect(await getEbayApplicationAccessToken()).toBeNull()
  })

  it('requests a token and returns the access_token', async () => {
    let bodySeen: URLSearchParams | undefined
    globalThis.fetch = mock(async (_url: string, init: RequestInit) => {
      bodySeen = new URLSearchParams(init.body as string)
      return {
        ok: true,
        json: async () => ({ access_token: 'TOKEN123', expires_in: 7200 }),
        text: async () => '',
      }
    }) as never

    process.env.EBAY_APP_ID = 'id'
    process.env.EBAY_CLIENT_SECRET = 'secret'
    const { getEbayApplicationAccessToken } = await loadAuth('tok-ok')
    const token = await getEbayApplicationAccessToken()
    expect(token).toBe('TOKEN123')
    expect(bodySeen?.get('grant_type')).toBe('client_credentials')
    expect(bodySeen?.get('scope')).toBe('https://api.ebay.com/oauth/api_scope')
  })

  it('returns null on non-ok response', async () => {
    globalThis.fetch = mock(async () => ({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({}),
      text: async () => 'bad',
    })) as never
    process.env.EBAY_APP_ID = 'id'
    process.env.EBAY_CLIENT_SECRET = 'secret'
    const { getEbayApplicationAccessToken } = await loadAuth('tok-nonok')
    expect(await getEbayApplicationAccessToken()).toBeNull()
  })

  it('returns null when access_token missing in response', async () => {
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => ({ expires_in: 7200 }),
      text: async () => '',
    })) as never
    process.env.EBAY_APP_ID = 'id'
    process.env.EBAY_CLIENT_SECRET = 'secret'
    const { getEbayApplicationAccessToken } = await loadAuth('tok-missing')
    expect(await getEbayApplicationAccessToken()).toBeNull()
  })

  it('accepts explicit credentials', async () => {
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => ({ access_token: 'EXPLICIT', expires_in: 3600 }),
      text: async () => '',
    })) as never
    const { getEbayApplicationAccessToken } = await loadAuth('tok-explicit')
    expect(await getEbayApplicationAccessToken({ clientId: 'a', clientSecret: 'b' })).toBe(
      'EXPLICIT'
    )
  })
})
