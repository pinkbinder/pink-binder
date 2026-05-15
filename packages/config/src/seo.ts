import { BRAND } from './site'

export const SEO_KEYWORD_GROUPS = {
  cuteBrand: [
    'cute pokemon cards for sale',
    'pink pokemon card collection',
    'kawaii pokemon cards',
    'aesthetic pokemon card binder',
    'pastel fairy type cards',
    'adorable baby shiny pokemon',
  ],
  speciesMoats: [
    'sylveon card shop',
    'mimikyu illustration rare',
    'maushold family cards',
    'eevee evolution full arts',
    'jigglypuff reverse holos',
    'togepi baby shinies',
    'espurr card collection',
    'jirachi star cards',
  ],
  rarity: [
    'S&V Illustration Rare cards',
    'Art Rare pokemon collection',
    'Japanese waifu cards',
    'CHV (Chinese) pokemon cards',
    'Special Illustration Rare (SIR) price guide',
  ],
  languages: ['english pokemon cards', 'japanese pokemon cards', 'chinese pokemon cards'],
  collectors: [
    'pokemon card shop',
    'pokemon card collector',
    'pokemon tcg puerto rico',
    'pokemon card live shopping',
  ],
  blog: ['pokemon card blog', 'pokemon tcg updates', 'pokemon collecting tips'],
} as const

export type SpeciesCollectionSlug = 'pink-brigade' | 'tiny-and-adorable' | 'dreamy-and-ethereal'

export type SpeciesKeywordConfig = {
  slug: string
  name: string
  titleName?: string
  collection: SpeciesCollectionSlug
  translations: string[]
  relatedKeywords: string[]
  relatedEntities?: string[]
}

type SpeciesSeoConfigInput = {
  siteName?: string
  includeKeywordGroups?: boolean
  customKeywords?: string[]
}

type PostKeywordConfigInput = {
  title: string
  tags?: string[]
  species?: string[]
  keywords?: string[]
}

export const SPECIES_COLLECTIONS = {
  'pink-brigade': {
    slug: 'pink-brigade',
    title: 'The Pink Brigade',
    description: 'Pink and pastel favorites that fit the Pink Binder brand.',
    featuredSpecies: ['Clefairy', 'Sylveon', 'Slowpoke', 'Jigglypuff', 'Eevee'],
  },
  'tiny-and-adorable': {
    slug: 'tiny-and-adorable',
    title: 'Tiny & Adorable',
    description: 'Small, playful, and family-friendly Pokémon card collections.',
    featuredSpecies: ['Maushold', 'Pawmi', 'Cutiefly', 'Togepi'],
  },
  'dreamy-and-ethereal': {
    slug: 'dreamy-and-ethereal',
    title: 'Dreamy & Ethereal',
    description: 'Soft, magical, and collector-focused Pokémon species hubs.',
    featuredSpecies: ['Jirachi', 'Cresselia', 'Mew', 'Mimikyu', 'Espurr'],
  },
} as const satisfies Record<
  SpeciesCollectionSlug,
  {
    slug: SpeciesCollectionSlug
    title: string
    description: string
    featuredSpecies: string[]
  }
>

const SPECIES_KEYWORD_SEEDS: SpeciesKeywordConfig[] = [
  {
    slug: 'sylveon',
    name: 'Sylveon',
    titleName: 'Sylveon & Eeveelution',
    collection: 'pink-brigade',
    translations: ['ニンフィア', '仙子伊布'],
    relatedKeywords: ['sylveon card shop', 'eeveelution cute cards', 'fairy type sylveon cards'],
    relatedEntities: ['Eevee', 'Clefairy'],
  },
  {
    slug: 'mimikyu',
    name: 'Mimikyu',
    collection: 'dreamy-and-ethereal',
    translations: ['ミミッキュ', '谜拟丘'],
    relatedKeywords: ['mimikyu illustration rare', 'mimikyu art rare cards'],
    relatedEntities: ['Jirachi', 'Espurr'],
  },
  {
    slug: 'maushold',
    name: 'Maushold',
    collection: 'tiny-and-adorable',
    translations: ['イッカネズミ', '一家鼠'],
    relatedKeywords: ['maushold family cards', 'cute maushold cards'],
    relatedEntities: ['Pawmi', 'Togepi'],
  },
  {
    slug: 'eevee',
    name: 'Eevee',
    titleName: 'Eevee & Evolution',
    collection: 'pink-brigade',
    translations: ['イーブイ', '伊布'],
    relatedKeywords: ['eevee evolution full arts', 'cute eevee cards'],
    relatedEntities: ['Sylveon', 'Jigglypuff'],
  },
  {
    slug: 'jigglypuff',
    name: 'Jigglypuff',
    collection: 'pink-brigade',
    translations: ['プリン', '胖丁'],
    relatedKeywords: ['jigglypuff reverse holos', 'cute jigglypuff cards'],
    relatedEntities: ['Clefairy', 'Sylveon'],
  },
  {
    slug: 'togepi',
    name: 'Togepi',
    collection: 'tiny-and-adorable',
    translations: ['トゲピー', '波克比'],
    relatedKeywords: ['togepi baby shinies', 'cute togepi cards'],
    relatedEntities: ['Maushold', 'Jirachi'],
  },
  {
    slug: 'espurr',
    name: 'Espurr',
    collection: 'dreamy-and-ethereal',
    translations: ['ニャスパー', '妙喵'],
    relatedKeywords: ['espurr card collection', 'cute espurr cards'],
    relatedEntities: ['Mimikyu', 'Jirachi'],
  },
  {
    slug: 'jirachi',
    name: 'Jirachi',
    collection: 'dreamy-and-ethereal',
    translations: ['ジラーチ', '基拉祈'],
    relatedKeywords: ['jirachi star cards', 'cute jirachi cards'],
    relatedEntities: ['Mew', 'Cresselia'],
  },
]

export const SPECIES_KEYWORD_CONFIGS = Object.fromEntries(
  SPECIES_KEYWORD_SEEDS.map((species) => [species.slug, species])
) as Record<string, SpeciesKeywordConfig>

/** Shared SEO defaults for the landing page and sitewide marketing metadata. */
export const LANDING_SEO = {
  description:
    'Pink Binder is a cute Pokémon card shop and content brand for pink Pokémon card collections, kawaii binder finds, pastel fairy cards, baby shinies, and illustration rares in English, Japanese, and Chinese.',
  keywords: uniqueKeywords([
    ...SEO_KEYWORD_GROUPS.collectors,
    ...SEO_KEYWORD_GROUPS.cuteBrand,
    ...SEO_KEYWORD_GROUPS.rarity,
    ...SEO_KEYWORD_GROUPS.languages,
    'pink binder pokemon',
    'girly pokemon cards',
    'pokemon card streamer',
  ]),
}

/** Shared SEO defaults for blog layouts and post discovery surfaces. */
export const BLOG_SEO = {
  description:
    'Pokémon card stories, collecting tips, and product updates from Pink Binder, with a focus on cute Pokémon cards, aesthetic binders, pastel fairy lines, baby shinies, reverse holos, and art or illustration rares.',
  keywords: uniqueKeywords([
    ...SEO_KEYWORD_GROUPS.blog,
    ...SEO_KEYWORD_GROUPS.cuteBrand,
    ...SEO_KEYWORD_GROUPS.rarity,
    ...SEO_KEYWORD_GROUPS.languages,
    ...SEO_KEYWORD_GROUPS.speciesMoats,
    'pink binder blog',
    'pokemon card shop news',
  ]),
}

export const BLOG_INDEX_SEO = {
  title: 'Pokemon Card Blog: Cute Card Picks, Tips, and Updates',
  description:
    'Explore Pink Binder posts about cute Pokémon cards, pink Pokémon card collections, kawaii binder picks, fairy lines, baby shinies, reverse holos, and illustration rares in English, Japanese, and Chinese sets.',
  keywords: uniqueKeywords([
    ...BLOG_SEO.keywords,
    'pokemon card blog',
    'cute pokemon cards',
    'aesthetic pokemon card binder',
  ]),
}

export function getSpeciesKeywordConfig(species: string) {
  const lookupKey = normalizeLookupValue(species)

  return SPECIES_KEYWORD_SEEDS.find((entry) =>
    [entry.slug, entry.name, ...entry.translations, ...(entry.relatedEntities ?? [])]
      .map(normalizeLookupValue)
      .includes(lookupKey)
  )
}

export function createSpeciesPageSeoConfig(
  species: string | SpeciesKeywordConfig,
  options: SpeciesSeoConfigInput = {}
) {
  const resolved =
    typeof species === 'string'
      ? (getSpeciesKeywordConfig(species) ?? {
          slug: slugifySpecies(species),
          name: species,
          collection: 'dreamy-and-ethereal' as const,
          translations: [],
          relatedKeywords: [],
        })
      : species

  const siteName = options.siteName ?? BRAND.name
  const collection = SPECIES_COLLECTIONS[resolved.collection]
  const titleLead = resolved.titleName ?? resolved.name

  return {
    slug: resolved.slug,
    name: resolved.name,
    collection,
    translations: resolved.translations,
    title: `${titleLead} Cute Cards | ${siteName}`,
    description: `Shop the cutest ${resolved.name} cards in English, Japanese, and Chinese. From rare Illustration Rares to shiny baby cards, we specialize in the pink and pastel side of Pokémon TCG. Fast shipping on all Fairy and Art Rare cards.`,
    heading: `The Ultimate ${resolved.name} Collection: Cute & Rare Cards`,
    keywords: uniqueKeywords([
      resolved.name,
      titleLead,
      ...resolved.translations,
      collection.title,
      ...resolved.relatedKeywords,
      ...(resolved.relatedEntities ?? []),
      ...(options.includeKeywordGroups === false ? [] : SEO_KEYWORD_GROUPS.cuteBrand),
      ...(options.includeKeywordGroups === false ? [] : SEO_KEYWORD_GROUPS.rarity),
      ...SEO_KEYWORD_GROUPS.languages,
      ...(options.customKeywords ?? []),
    ]),
  }
}

export function createPostKeywordConfig(input: PostKeywordConfigInput) {
  const matchedSpecies = uniqueSpecies([...(input.species ?? []), ...(input.tags ?? [])])

  return {
    matchedSpecies,
    keywords: uniqueKeywords([
      input.title,
      ...BLOG_SEO.keywords,
      ...(input.tags ?? []),
      ...(input.keywords ?? []),
      ...matchedSpecies.flatMap(
        (species) => createSpeciesPageSeoConfig(species, { includeKeywordGroups: false }).keywords
      ),
    ]),
  }
}

function uniqueKeywords(keywords: Iterable<string>) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const keyword of keywords) {
    const trimmed = keyword.trim()

    if (!trimmed) {
      continue
    }

    const key = trimmed.toLowerCase()

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(trimmed)
  }

  return result
}

function uniqueSpecies(species: string[]) {
  const seen = new Set<string>()
  const result: SpeciesKeywordConfig[] = []

  for (const entry of species) {
    const resolved = getSpeciesKeywordConfig(entry)

    if (!resolved || seen.has(resolved.slug)) {
      continue
    }

    seen.add(resolved.slug)
    result.push(resolved)
  }

  return result
}

function normalizeLookupValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[-_/]+/g, ' ')
}

function slugifySpecies(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'pokemon'
  )
}
