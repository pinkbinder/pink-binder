import Medusa from '@medusajs/js-sdk'

const backendUrl = import.meta.env.MEDUSA_BACKEND_URL
const publishableKey = import.meta.env.MEDUSA_PUBLISHABLE_KEY

if (!backendUrl) {
  console.warn('MEDUSA_BACKEND_URL environment variable is not set.')
}

/**
 * Medusa SDK singleton (starter pattern): one client for the whole app,
 * configured from public env vars. No query-cache layer — pages fetch in
 * frontmatter on the server and islands keep only UI state.
 */
export const sdk = new Medusa({
  baseUrl: backendUrl ?? 'http://localhost:9000',
  publishableKey,
  debug: import.meta.env.DEV,
})

export function getSdk(): Medusa {
  return sdk
}
