/**
 * Small edge-safe discovery surface. Keep this module free of workspace
 * barrels so the Next proxy does not pull server/configuration code into the
 * Worker middleware bundle.
 */
export const API_CATALOG_PATH = '/.well-known/api-catalog'
export const OPENAPI_PATH = '/.well-known/openapi.json'
export const API_DOCS_PATH = '/.well-known/api-docs'

const PRODUCTION_BLOG_ORIGIN = 'https://pinkbinder.blog'

export const DISCOVERY_LINK_HEADER = [
  `<${PRODUCTION_BLOG_ORIGIN}${API_CATALOG_PATH}>; rel="api-catalog"`,
  `<${PRODUCTION_BLOG_ORIGIN}${OPENAPI_PATH}>; rel="service-desc"`,
  `<${PRODUCTION_BLOG_ORIGIN}${API_DOCS_PATH}>; rel="service-doc"`,
  `<${PRODUCTION_BLOG_ORIGIN}${OPENAPI_PATH}>; rel="describedby"`,
].join(', ')
