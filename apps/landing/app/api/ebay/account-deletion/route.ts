import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

const REQUIRED_TOPIC = 'MARKETPLACE_ACCOUNT_DELETION'
const ENDPOINT_ENV_KEYS = ['EBAY_ACCOUNT_DELETION_ENDPOINT', 'EBAY_NOTIFICATION_ENDPOINT'] as const

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const challengeCode =
    requestUrl.searchParams.get('challenge_code') || requestUrl.searchParams.get('challengeCode')
  const verificationToken = process.env.EBAY_VERIFICATION_TOKEN?.trim()
  const endpoint = resolveEndpoint(requestUrl, request.headers)

  if (!challengeCode || !verificationToken) {
    return NextResponse.json(
      {
        error:
          'Missing challenge_code query parameter or EBAY_VERIFICATION_TOKEN environment variable.',
      },
      { status: 400 }
    )
  }

  const challengeResponse = createChallengeResponse({
    challengeCode,
    verificationToken,
    endpoint,
  })

  return NextResponse.json(
    { challengeResponse },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const topic =
    request.headers.get('x-ebay-notification-topic') || request.headers.get('x-ebay-topic-name')
  const normalizedTopic = topic?.trim().toUpperCase()

  const isExpectedTopic = normalizedTopic === REQUIRED_TOPIC
  const hasNotification = payload !== null && typeof payload === 'object' && !Array.isArray(payload)

  if (!isExpectedTopic || !hasNotification) {
    return NextResponse.json({ error: 'Unexpected notification payload.' }, { status: 400 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

function createChallengeResponse({
  challengeCode,
  verificationToken,
  endpoint,
}: {
  challengeCode: string
  verificationToken: string
  endpoint: string
}) {
  return createHash('sha256')
    .update(challengeCode)
    .update(verificationToken)
    .update(endpoint)
    .digest('hex')
}

function resolveEndpoint(requestUrl: URL, headers: Headers) {
  const configuredEndpoint = getConfiguredEndpoint()
  if (configuredEndpoint) {
    return configuredEndpoint
  }

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

function getConfiguredEndpoint() {
  for (const key of ENDPOINT_ENV_KEYS) {
    const value = process.env[key]?.trim()
    if (value) {
      return value
    }
  }
}
