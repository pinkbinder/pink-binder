const EBAY_OAUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token'
const EBAY_OAUTH_SCOPE = 'https://api.ebay.com/oauth/api_scope'
const TOKEN_REFRESH_BUFFER_MS = 60_000

let cachedAccessToken: { value: string; expiresAt: number } | null = null

export function getEbayClientCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.EBAY_APP_ID?.trim()
  const clientSecret = process.env.EBAY_CLIENT_SECRET?.trim() ?? process.env.EBAY_CERT_ID?.trim()

  if (!clientId || !clientSecret) {
    return null
  }

  return { clientId, clientSecret }
}

export async function getEbayApplicationAccessToken(credentials?: {
  clientId: string
  clientSecret: string
}): Promise<string | null> {
  const resolved = credentials ?? getEbayClientCredentials()
  if (!resolved) {
    return null
  }

  const now = Date.now()
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + TOKEN_REFRESH_BUFFER_MS) {
    return cachedAccessToken.value
  }

  const basicAuth = Buffer.from(`${resolved.clientId}:${resolved.clientSecret}`).toString('base64')

  const response = await fetch(EBAY_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: EBAY_OAUTH_SCOPE,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error(
      `eBay OAuth token request failed: ${response.status} ${response.statusText}`,
      body.slice(0, 500)
    )
    return null
  }

  const data = (await response.json()) as {
    access_token?: string
    expires_in?: number
  }

  if (!data.access_token) {
    console.error('eBay OAuth token response missing access_token.')
    return null
  }

  const expiresInMs = (data.expires_in ?? 7200) * 1000
  cachedAccessToken = {
    value: data.access_token,
    expiresAt: now + expiresInMs,
  }

  return data.access_token
}
