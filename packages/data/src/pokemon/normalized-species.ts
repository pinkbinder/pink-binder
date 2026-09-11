/**
 * Species artwork types mirrored from the private Pink Binder data service
 * (`pinkbinder/blog-pipeline`), which owns the normalized species cache.
 * Only the shapes needed to decode published artifacts and resolve image
 * URLs are kept here.
 */

export interface NormalizedSceneArtEntry {
  url: string
  label: string
  source: 'artofpkm' | 'tcg' | 'pokeos' | 'wallhaven' | 'openverse' | 'wikimedia' | 'pexels'
  setName?: string
  artist?: string | null
  cardId?: string
  pageUrl?: string
  /** Original remote URL before Blob publish (e.g. artofpkm ActiveStorage redirect). */
  sourceUrl?: string
  attribution: string
  width?: number
  height?: number
}

export type NormalizedCollectCardArtIds = string[]

export interface NormalizedSpeciesSprites {
  official: string | null
  home: string | null
  shiny: string | null
  dreamWorld: string | null
  showdown: string | null
}

export interface NormalizedSpeciesArt {
  sprites: NormalizedSpeciesSprites
  sceneArt?: NormalizedSceneArtEntry[]
  /** Chase print ids — resolve via the published gallery manifests. */
  collectCardArt?: NormalizedCollectCardArtIds
}
