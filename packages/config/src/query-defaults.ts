/**
 * Shared TanStack Query cache policy (ADR 0002 ownership, UX performance
 * standards §2). One module so policy changes are a single edit and the
 * m1 baseline contract (`docs/baselines/m1-state-data.json`) stays truthful.
 */
export interface QueryDefaults {
  staleTimeMs: number
  gcTimeMs: number
  /** Read retries; mutations always retry zero times. */
  retry: number
}

/** Admin console: operational dashboards, 60 s freshness. */
export const ADMIN_QUERY_DEFAULTS: QueryDefaults = {
  staleTimeMs: 60 * 1_000,
  gcTimeMs: 10 * 60 * 1_000,
  retry: 2,
}

/**
 * Blog catalog: content changes on data republish, not per minute. Values
 * are pinned by the m1 baseline contract (`blogGrid` query policy).
 */
export const BLOG_QUERY_DEFAULTS: QueryDefaults = {
  staleTimeMs: 5 * 60 * 1_000,
  gcTimeMs: 30 * 60 * 1_000,
  retry: 2,
}
