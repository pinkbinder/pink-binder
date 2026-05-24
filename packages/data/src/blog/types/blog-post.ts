/**
 * Pre-generated blog post artifact written by the transform pipeline to
 * `cache/normalized/blogs/{kind}/{slug}.json`.
 *
 * Treats `@repo/data` as the CMS backend: blog files contain the body and
 * SEO payload, plus references (by id/slug) into the normalized entity cache.
 * Heavy objects (TCG cards, sprites, scene art) are NEVER duplicated — they
 * resolve at read time from `pokemon/{slug}/{cards,images}.json`, mirroring
 * the existing `collectCardArt` pattern.
 */

import type { PostTemplateSection, PostTemplateSectionId } from '../posts'
import type { RoundupPostPayload } from '../roundup-posts'

/** Serializable subset of `createPostKeywordConfig` output (keywords only). */
export interface BlogSeoKeywordConfig {
  /** Final keyword list for `<meta name="keywords">` and OG tags. */
  keywords: string[]
  /** Slugs of species that contributed keyword expansions. */
  matchedSpeciesSlugs: string[]
}

/** Bumped when the on-disk schema changes in a way that breaks readers. */
export const BLOG_POST_SCHEMA_VERSION = 1 as const

/** Top-level entity types served by the blog. */
export type BlogPostKind =
  | 'species'
  | 'roundup'
  | 'illustrator'
  | 'expansion'
  | 'region'
  | 'generation'

/**
 * Hero artwork is referenced — never the absolute URL of an externally hosted
 * sprite, since that lives in the entity's `images.json`. The renderer joins
 * these to produce concrete URLs at request time.
 */
export type HeroArtworkRef =
  | {
      kind: 'sprite'
      speciesSlug: string
      /** Maps to `images.json.sprites[spriteKey]`. */
      spriteKey: 'official' | 'home' | 'shiny' | 'dreamWorld' | 'showdown'
    }
  | {
      kind: 'card'
      speciesSlug: string
      cardId: string
      size: 'small' | 'large'
    }
  | {
      kind: 'scene'
      speciesSlug: string
      /** Index into `images.json.sceneArt`. */
      index: number
    }
  | {
      /** Fallback for posts whose hero is a static asset (e.g. `/images/logo.png`). */
      kind: 'static'
      url: string
    }

/** Card highlight reference — full card record loaded from species `cards.json`. */
export interface BlogCardHighlightRef {
  cardId: string
  speciesSlug: string
  /** Pre-baked editorial copy (template-generated or AI-polished). */
  text: string
}

/** Slim grid summary that mirrors `EnrichedPostForGrid` but uses pure refs. */
export interface BlogPostGridSummary {
  slug: string
  title: string
  description: string
  date: string
  /** Resolved at index build time so the index page can paint without joins. */
  image: string
  heroArtworkUrls?: string[]
  heroArtworkFill?: boolean
  tags: string[]
  speciesFilterTags: string[]
  categories: string[]
  displayCategories: string[]
  isLegendary?: boolean
  isMythical?: boolean
}

/** JSON-LD payloads we currently emit on post pages — pre-baked for SEO. */
export interface BlogJsonLd {
  '@context'?: string
  '@type': string
  [key: string]: unknown
}

/** Body content fields that the AI polish layer is allowed to overwrite. */
export interface BlogPolishedFields {
  /** Replaces `meta.description`. */
  description?: string
  /** Replaces `sections[id=why].paragraphs[0]` (or prepends if missing). */
  whyIntroParagraph?: string
  /** Replaces `refs.backstory.paragraphs[0]`. */
  backstoryOpener?: string
}

/** Stored on disk; persisted between AI polish runs for idempotent updates. */
export interface BlogPolishMeta {
  /** Stable hash of the inputs that produced the polished output. */
  inputDigest: string
  /** Vercel AI Gateway model string (e.g. `google/gemini-2.5-flash`). */
  model: string
  /** Bumped when the prompt template changes; older outputs become stale. */
  promptVersion: number
  /** ISO timestamp when polish was applied. */
  polishedAt: string
  /** Which fields were polished — informs the renderer / re-run logic. */
  fields: Array<keyof BlogPolishedFields>
}

/** Pre-baked backstory paragraphs (replaces runtime `buildRichBackstoryParagraphs`). */
export interface BlogBackstoryRefs {
  paragraphs: string[]
}

/**
 * The on-disk artifact. Same body fields the runtime `Post` carries today,
 * with explicit `kind` for renderer dispatch and `refs` for ID-based joins.
 */
export interface BlogPost {
  schemaVersion: typeof BLOG_POST_SCHEMA_VERSION
  slug: string
  kind: BlogPostKind

  meta: {
    title: string
    description: string
    date: string
    image: string
    categories: string[]
    tags: string[]
    species: string[]
    keywords: string[]
    relatedPostSlugs: string[]
    /** Static hero refs for grid + share images (resolves to `meta.image`). */
    heroArtworkRefs?: HeroArtworkRef[]
  }

  /** Same shape as runtime `PostTemplateSection[]` for species/entity guides. */
  sections: PostTemplateSection[]

  /**
   * ID/slug references into the normalized cache. Resolved on read, never
   * duplicated. Mirrors the `collectCardArt` precedent.
   */
  refs: {
    speciesSlug?: string
    illustratorSlug?: string
    expansionSlug?: string
    regionSlug?: string
    generationSlug?: string
    /** Card highlights with editorial copy — text already baked. */
    cardHighlights?: BlogCardHighlightRef[]
    /** Pre-baked rich backstory (replaces buildRichBackstoryParagraphs). */
    backstory?: BlogBackstoryRefs
    /** Slugs of related posts for the related-posts strip. */
    relatedSlugs?: string[]
  }

  seo: {
    keywordConfig: BlogSeoKeywordConfig
    /** Pre-baked structured data (BlogPosting, BreadcrumbList, FAQPage, ItemList). */
    jsonLd: BlogJsonLd[]
    /** Pre-rendered SEO description for `<meta name="description">`. */
    seoDescription: string
  }

  /** Roundup-specific payload (axis, picks, methodology); preserved verbatim. */
  roundup?: RoundupPostPayload

  /** AI polish bookkeeping — present iff `10-polish-blog-copy` ran for this post. */
  polish?: BlogPolishMeta
}

/** Per-slug entry in `blogs/index.json` for one-read grids. */
export interface BlogIndexEntry {
  slug: string
  kind: BlogPostKind
  /** Path relative to `cache/normalized/blogs/`. */
  file: string
  date: string
}

/** Single file feeding the blog index page + sitemap + future RSS feed. */
export interface BlogIndex {
  schemaVersion: typeof BLOG_POST_SCHEMA_VERSION
  builtAt: string
  /** Sorted by date desc — drives the grid order without re-sorting at runtime. */
  posts: BlogPostGridSummary[]
  bySlug: Record<string, BlogIndexEntry>
}

/** Re-export so `posts.ts` adapters can rely on the same names without circulars. */
export type { PostTemplateSection, PostTemplateSectionId }
