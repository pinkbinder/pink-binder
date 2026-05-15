import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

const REQUIRED_TOPIC = 'MARKETPLACE_ACCOUNT_DELETION'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const challengeCode = requestUrl.searchParams.get('challenge_code')
  const verificationToken = process.env.EBAY_VERIFICATION_TOKEN

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
    endpoint: `${requestUrl.origin}${requestUrl.pathname}`,
  })

  return NextResponse.json({ challengeResponse })
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

  const isExpectedTopic = topic === REQUIRED_TOPIC
  const hasNotification = !!payload && typeof payload === 'object'

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
