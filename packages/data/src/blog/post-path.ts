/**
 * Canonical blog post slugs (stored in cache/index) map to hierarchical URL paths
 * for SEO-friendly URLs:
 *
 *   collection--dark-and-edgy--collect     → /posts/themes/dark-and-edgy/collect
 *   generation--generation-1--cutest       → /posts/generation/1/cutest
 *   generation--generation-1               → /posts/generation/1/overview
 *   expansion--lost-origin                 → /posts/expansion/lost-origin/overview
 *   illustrator--hasuno                    → /posts/illustrator/hasuno/overview
 *   illustrator--hasuno--cutest            → /posts/illustrator/hasuno/cutest
 *   pikachu                                → /posts/species/pikachu
 *
 * Legacy flat `--` slugs and old entity paths redirect at the edge.
 */

const ROUNDUP_ANGLES = new Set(['cutest', 'collect', 'popular', 'expensive'])

const ENTITY_OVERVIEW_KINDS = new Set(['expansion', 'generation', 'illustrator'])

/** URL path segment for binder-theme roundups (canonical slug axis stays `collection`). */
const ROUNDUP_THEME_URL_AXIS = 'themes'
const ROUNDUP_THEME_CANONICAL_AXIS = 'collection'

function roundupUrlAxisFromCanonical(canonicalAxis: string): string {
  return canonicalAxis === ROUNDUP_THEME_CANONICAL_AXIS ? ROUNDUP_THEME_URL_AXIS : canonicalAxis
}

function roundupCanonicalAxisFromUrl(urlAxis: string): string | null {
  if (urlAxis === ROUNDUP_THEME_URL_AXIS || urlAxis === 'collection') {
    return ROUNDUP_THEME_CANONICAL_AXIS
  }
  if (urlAxis === 'type' || urlAxis === 'generation' || urlAxis === 'illustrator') {
    return urlAxis
  }
  return null
}

/** First URL segment reserved for entity/roundup routes (not flat species slugs). */
const RESERVED_POST_PATH_PREFIXES = new Set([
  'species',
  'expansion',
  'generation',
  'illustrator',
  'themes',
  'collection',
  'type',
  ...ENTITY_OVERVIEW_KINDS,
  'overview',
])

type EntityOverviewKind = 'expansion' | 'generation' | 'illustrator'

function generationPathIdFromEntitySlug(entitySlug: string): string {
  const match = entitySlug.match(/^generation-(\d+)$/)
  return match ? match[1]! : entitySlug
}

function generationEntitySlugFromPathId(pathId: string): string {
  if (pathId.startsWith('generation-')) {
    return pathId
  }
  if (/^\d+$/.test(pathId)) {
    return `generation-${pathId}`
  }
  return pathId
}

function generationRoundupThemeFromPathId(pathId: string): string {
  const match = pathId.match(/^generation-(\d+)$/)
  if (match?.[1]) {
    return match[1]
  }
  return pathId
}

function entityPathIdFromSlug(kind: EntityOverviewKind, entitySlug: string): string {
  if (kind === 'generation') {
    return generationPathIdFromEntitySlug(entitySlug)
  }
  return entitySlug
}

function entitySlugFromPathId(kind: EntityOverviewKind, pathId: string): string {
  if (kind === 'generation') {
    return generationEntitySlugFromPathId(pathId)
  }
  return pathId
}

function buildPostsPath(segments: string[]): string {
  return `/posts/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`
}

/** Strip deprecated `list--` prefix from roundup slugs. */
export function normalizeCanonicalBlogSlug(slug: string): string {
  return slug.startsWith('list--') ? slug.slice('list--'.length) : slug
}

export function isRoundupCanonicalSlug(slug: string): boolean {
  const normalized = normalizeCanonicalBlogSlug(slug)
  if (/^illustrator--.+--(cutest|collect|expensive)$/.test(normalized)) {
    return true
  }
  return /^(collection|type|generation)--.+--(cutest|collect|popular|expensive)$/.test(normalized)
}

/** True when a single URL segment uses the old flat `--` slug form. */
export function isLegacyFlatBlogSlug(slug: string): boolean {
  if (!slug.includes('--')) {
    return false
  }
  return (
    slug.startsWith('list--') ||
    slug.startsWith('collection--') ||
    slug.startsWith('type--') ||
    slug.startsWith('expansion--') ||
    slug.startsWith('generation--') ||
    slug.startsWith('illustrator--')
  )
}

export function canonicalSlugToPathSegments(canonicalSlug: string): string[] {
  const slug = normalizeCanonicalBlogSlug(canonicalSlug)

  const illustratorRoundup = slug.match(/^illustrator--(.+)--(cutest|collect|expensive)$/)
  if (illustratorRoundup) {
    return ['illustrator', illustratorRoundup[1]!, illustratorRoundup[2]!]
  }

  const roundupMatch = slug.match(
    /^(collection|type|generation)--(.+)--(cutest|collect|popular|expensive)$/
  )
  if (roundupMatch) {
    const axis = roundupMatch[1]!
    const theme = roundupMatch[2]!
    const angle = roundupMatch[3]!
    if (axis === 'generation') {
      return [axis, generationPathIdFromEntitySlug(theme), angle]
    }
    return [roundupUrlAxisFromCanonical(axis), theme, angle]
  }

  const entityMatch = slug.match(/^(expansion|generation|illustrator)--(.+)$/)
  if (entityMatch) {
    const kind = entityMatch[1] as EntityOverviewKind
    const entitySlug = entityMatch[2]!
    return [kind, entityPathIdFromSlug(kind, entitySlug), 'overview']
  }

  return ['species', slug]
}

export function pathSegmentsToCanonicalSlug(segments: string[]): string | null {
  if (segments.length === 0) {
    return null
  }

  if (segments.length === 1) {
    const single = normalizeCanonicalBlogSlug(decodeURIComponent(segments[0]!))
    return single.trim() ? single : null
  }

  if (segments.length === 2) {
    const [kind, id] = segments.map((segment) => decodeURIComponent(segment))
    if (kind === 'species' && id) {
      const slug = normalizeCanonicalBlogSlug(id)
      return slug.trim() ? slug : null
    }
    if (kind === 'expansion' || kind === 'illustrator') {
      return `${kind}--${id}`
    }
    if (kind === 'generation' && id) {
      return `generation--${generationEntitySlugFromPathId(id)}`
    }
    return null
  }

  if (segments.length === 3) {
    const axis = decodeURIComponent(segments[0] ?? '')
    const theme = decodeURIComponent(segments[1] ?? '')
    const angle = decodeURIComponent(segments[2] ?? '')

    if (angle === 'overview' && ENTITY_OVERVIEW_KINDS.has(axis as EntityOverviewKind) && theme) {
      return `${axis}--${entitySlugFromPathId(axis as EntityOverviewKind, theme)}`
    }

    if (!angle || !ROUNDUP_ANGLES.has(angle)) {
      return null
    }
    if (axis === 'illustrator') {
      return `illustrator--${theme}--${angle}`
    }
    const canonicalAxis = roundupCanonicalAxisFromUrl(axis)
    if (canonicalAxis === ROUNDUP_THEME_CANONICAL_AXIS || canonicalAxis === 'type') {
      return `${canonicalAxis}--${theme}--${angle}`
    }
    if (axis === 'generation' && theme) {
      return `generation--${generationRoundupThemeFromPathId(theme)}--${angle}`
    }
  }

  return null
}

/** Build `/posts/...` pathname from a canonical slug. */
export function getPostPathname(canonicalSlug: string): string {
  const segments = canonicalSlugToPathSegments(canonicalSlug)
  return buildPostsPath(segments)
}

export function getPostHref(canonicalSlug: string, baseUrl?: string): string {
  const pathname = getPostPathname(canonicalSlug)
  return baseUrl ? new URL(pathname, baseUrl).toString() : pathname
}

/** 301 target when a request still uses a legacy URL shape. */
export function getLegacyPostRedirectPath(segments: string[]): string | null {
  if (segments.length === 0) {
    return null
  }

  const currentPath = buildPostsPath(segments)
  const decoded = segments.map((segment) => decodeURIComponent(segment))

  const canonical = pathSegmentsToCanonicalSlug(decoded)
  if (canonical) {
    const nextPath = getPostPathname(canonical)
    if (nextPath !== currentPath) {
      return nextPath
    }
  }

  if (segments.length !== 1) {
    return null
  }

  const raw = decoded[0]!

  if (isLegacyFlatBlogSlug(raw)) {
    const normalized = normalizeCanonicalBlogSlug(raw)
    const nextPath = getPostPathname(normalized)
    return nextPath === currentPath ? null : nextPath
  }

  // /posts/pikachu → /posts/species/pikachu
  if (!raw.includes('--') && !RESERVED_POST_PATH_PREFIXES.has(raw)) {
    const nextPath = getPostPathname(raw)
    return nextPath === currentPath ? null : nextPath
  }

  return null
}
