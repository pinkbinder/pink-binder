/**
 * Artifact section and roundup payload types mirrored from the private
 * Pink Binder data service (`pinkbinder/blog-pipeline`). The service is
 * the source of truth; this copy exists so the public frontend can decode
 * published blog artifacts without importing the generation pipeline.
 */

export type PostTemplateSectionId =
  | 'why'
  | 'binder'
  | 'competitive'
  | 'about'
  | 'highlights'
  | 'inventory'
  | 'lore'
  | 'region'
  | 'trivia'

export interface PostTemplateCardHighlight {
  cardId: string | null
  text: string
}

export interface PostTemplateSection {
  sectionId: PostTemplateSectionId
  title: string
  summary: string
  bullets: string[]
  /** Short prose blocks that read like editorial copy, not bullet filler. */
  paragraphs?: string[]
  /** TCG highlights — card thumbnails are resolved on the blog page when IDs are present. */
  cardHighlights?: PostTemplateCardHighlight[]
}

/** Editorial angle of a roundup post (mirrors `RoundupAngle`). */
export type { RoundupAngle } from '../roundup-list-categories'

import type { RoundupAngle } from '../roundup-list-categories'

export interface RoundupPickEntry {
  slug: string
  reason: string
  score: number
}

export type RoundupCardArtistFilter = string

export interface ExpensiveCardPick {
  cardId: string
  cardName: string
  setName: string
  speciesSlug: string
  speciesName: string
  marketPrice: number
  reason: string
  tcgplayerUrl?: string
}

export interface SpeciesRoundupPostPayload {
  kind: 'species'
  pickSlugs: string[]
  picks: RoundupPickEntry[]
  angle: Exclude<RoundupAngle, 'expensive'>
  themeLabel: string
  axis: 'collection' | 'type' | 'generation'
  intro: string
  methodology: string
  /** 2–3 artwork URLs for blog grid thumbnails. */
  heroArtworkUrls: string[]
  showCardHighlights: boolean
  showMichiHighlights: boolean
  cardArtistFilter?: RoundupCardArtistFilter
}

export interface CardRoundupPostPayload {
  kind: 'cards'
  angle: 'expensive'
  cardPicks: ExpensiveCardPick[]
  themeLabel: string
  axis: 'collection' | 'type' | 'generation'
  intro: string
  methodology: string
  heroArtworkUrls: string[]
}

export type RoundupPostPayload = SpeciesRoundupPostPayload | CardRoundupPostPayload
