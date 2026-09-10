import { defineMiddleware } from 'astro:middleware'

import { applySecurityHeaders } from './lib/security-headers'

const REGION_COOKIE = 'pb_region'
const REGION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/**
 * Request middleware — security headers on every response plus cookie-driven
 * region resolution (starter pattern, simplified): the selected Medusa region
 * id rides in `locals.regionId` for page frontmatter; page code may promote a
 * default region by writing `locals.regionId`, which is then persisted.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const regionId = context.cookies.get(REGION_COOKIE)?.value ?? null
  context.locals.regionId = regionId

  const response = await next()

  const resolved = context.locals.regionId
  if (!regionId && resolved) {
    context.cookies.set(REGION_COOKIE, resolved as string, {
      path: '/',
      maxAge: REGION_COOKIE_MAX_AGE,
      sameSite: 'lax',
    })
  }

  return applySecurityHeaders(response)
})
