import { GoogleTagManager as NextGoogleTagManager } from '@next/third-parties/google'

// Next.js replaces NEXT_PUBLIC_* env vars at build time; declare for TypeScript.
declare const process: { env: { NEXT_PUBLIC_GTM_ID?: string } }

/** GTM container IDs always match GTM-XXXXXXX (uppercase alphanumeric, 1-8 chars). */
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{1,8}$/

interface GoogleTagManagerProps {
  gtmId?: string
}

/**
 * Renders the Google Tag Manager script tags.
 * Reads `NEXT_PUBLIC_GTM_ID` from the environment when no `gtmId` prop is supplied.
 * Renders nothing if no GTM ID is available or the ID fails format validation,
 * so it is safe to include in layouts for environments where GTM has not been
 * configured yet.
 */
export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const id = gtmId ?? process.env.NEXT_PUBLIC_GTM_ID

  if (!id || !GTM_ID_PATTERN.test(id)) return null

  return <NextGoogleTagManager gtmId={id} />
}
