import { createStart } from '@tanstack/react-start'

import { securityHeadersMiddleware } from './middleware/security-headers'

/**
 * Start instance — wires Worker-wide request middleware.
 * Routers are created per request in `src/router.tsx`; this instance only
 * carries cross-cutting concerns (security headers today, auth/rate-limiting
 * tomorrow) so middleware stays composable and testable in isolation.
 */
export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeadersMiddleware],
}))
