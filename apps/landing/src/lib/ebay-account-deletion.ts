import { EBAY_ACCOUNT_DELETION_ENV_KEYS, EBAY_NOTIFICATION_TOPIC } from '@repo/marketplaces/ebay'
import { EBAY_ENV } from '@repo/marketplaces/config'

export type RuntimeEnvironment = Record<string, string | undefined>

export async function handleEbayChallenge(
  request: Request,
  environment: RuntimeEnvironment = process.env
): Promise<Response> {
  const requestUrl = new URL(request.url)
  const challengeCode =
    requestUrl.searchParams.get('challenge_code') || requestUrl.searchParams.get('challengeCode')
  const verificationToken = environment[EBAY_ENV.verificationToken]?.trim()
  const endpoint = resolveEndpoint(requestUrl, request.headers, environment)

  if (!challengeCode || !verificationToken) {
    return jsonResponse(
      {
        error: `Missing challenge_code query parameter or ${EBAY_ENV.verificationToken} environment variable.`,
      },
      400
    )
  }

  const challengeResponse = await createChallengeResponse({
    challengeCode,
    verificationToken,
    endpoint,
  })

  return jsonResponse({ challengeResponse }, 200, { 'Cache-Control': 'no-store, max-age=0' })
}

export async function handleEbayNotification(request: Request): Promise<Response> {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400)
  }

  const topic =
    request.headers.get('x-ebay-notification-topic') || request.headers.get('x-ebay-topic-name')
  const normalizedTopic = topic?.trim().toUpperCase()
  const isExpectedTopic = normalizedTopic === EBAY_NOTIFICATION_TOPIC
  const hasNotification = payload !== null && typeof payload === 'object' && !Array.isArray(payload)

  if (!isExpectedTopic || !hasNotification) {
    return jsonResponse({ error: 'Unexpected notification payload.' }, 400)
  }

  return jsonResponse({ received: true }, 200)
}

async function createChallengeResponse({
  challengeCode,
  verificationToken,
  endpoint,
}: {
  challengeCode: string
  verificationToken: string
  endpoint: string
}): Promise<string> {
  const input = new TextEncoder().encode(`${challengeCode}${verificationToken}${endpoint}`)
  const digest = await crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function resolveEndpoint(
  requestUrl: URL,
  headers: Headers,
  environment: RuntimeEnvironment
): string {
  const configuredEndpoint = getConfiguredEndpoint(environment)
  if (configuredEndpoint) return configuredEndpoint

  const forwardedProtocol = headers
    .get('x-forwarded-proto')
    ?.split(',')
    .map((value) => value.trim())
    .find(Boolean)
  const forwardedHost = headers
    .get('x-forwarded-host')
    ?.split(',')
    .map((value) => value.trim())
    .find(Boolean)

  if (forwardedProtocol && forwardedHost) {
    return `${forwardedProtocol}://${forwardedHost}${requestUrl.pathname}`
  }

  return `${requestUrl.origin}${requestUrl.pathname}`
}

function getConfiguredEndpoint(environment: RuntimeEnvironment): string | undefined {
  for (const key of EBAY_ACCOUNT_DELETION_ENV_KEYS) {
    const value = environment[key]?.trim()
    if (value) return value
  }
  return undefined
}

function jsonResponse(
  body: Record<string, string | boolean>,
  status: number,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  })
}
