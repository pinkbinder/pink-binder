import { GoogleTagManager as NextGoogleTagManager } from '@next/third-parties/google'

// Next.js replaces NEXT_PUBLIC_* env vars at build time; declare for TypeScript.
declare const process: { env: { NEXT_PUBLIC_GTM_ID?: string } }

interface GoogleTagManagerProps {
  gtmId?: string
}

/**
 * Renders the Google Tag Manager script tags.
 * Reads `NEXT_PUBLIC_GTM_ID` from the environment when no `gtmId` prop is supplied.
 * Renders nothing if no GTM ID is available, so it is safe to include in layouts
 * for environments where GTM has not been configured yet.
 */
export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const id = gtmId ?? process.env.NEXT_PUBLIC_GTM_ID

  if (!id) return null

  return <NextGoogleTagManager gtmId={id} />
}
