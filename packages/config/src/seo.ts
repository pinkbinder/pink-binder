import { BRAND } from './site'
import { POKEMON_CATALOG, type PokemonCatalogEntry } from './pokemon-catalog'
import { createEmptyPokemonTranslations, getPokemonTranslationValues } from './pokemon-translations'
import { SPECIES_COLLECTIONS, type SpeciesCollectionSlug } from './species-collections'

export { POKEMON_CATALOG, SPECIES_COLLECTIONS }
export type { SpeciesCollectionSlug }
export type SpeciesKeywordConfig = PokemonCatalogEntry

export const SEO_KEYWORD_GROUPS = {
  cuteBrand: [
    'cute pokemon cards for sale',
    'pink pokemon card collection',
    'kawaii pokemon cards',
    'aesthetic pokemon card binder',
    'pastel fairy type cards',
    'adorable baby shiny pokemon',
    'cute pokemon cards',
    'girly pokemon cards',
    'cute pokemon tcg shop',
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
    'gardevoir art rare cards',
    'milotic beautiful pokemon card',
    'pumpkaboo halloween pokemon cards',
    'greavard ghost dog pokemon card',
    'eeveelution collector cards',
  ],
  pinkPalace: [
    'pink pokemon cards',
    'sylveon collection',
    'pastel tcg',
    'fairy pokemon card binder',
  ],
  cottagecoreAndFloral: [
    'floral pokemon cards',
    'cottagecore pokemon cards',
    'plant pokemon cards',
    'comfey cards',
    'shaymin land forme cards',
  ],
  spaceAndDreams: [
    'jirachi cards',
    'starry pokemon cards',
    'cosmog collection',
    'dreamy pokemon cards',
  ],
  cozyAndSoft: [
    'fluffy pokemon',
    'teddiursa cards',
    'cozy card binder',
    'soft aesthetic pokemon cards',
  ],
  babies: ['baby pokemon cards', 'actual baby pokemon cards', 'baby shiny pokemon'],
  starters: ['starter pokemon cards', 'pokemon starter base forms', 'cute starter pokemon cards'],
  tinyAndAdorable: [
    'tiny cute pokemon cards',
    'small adorable pokemon cards',
    'tiny pokemon card collection',
  ],
  foodAndSweetTreats: [
    'dessert pokemon cards',
    'food pokemon cards',
    'sweet treats pokemon cards',
    'cute bakery pokemon cards',
  ],
  dogs: ['dog pokemon cards', 'puppy pokemon cards', 'cute dog pokemon collection'],
  cats: ['cat pokemon cards', 'kitten pokemon cards', 'cute cat pokemon collection'],
  bunnies: ['bunny pokemon cards', 'rabbit pokemon cards', 'cute bunny pokemon collection'],
  mice: ['mouse pokemon cards', 'cute mice pokemon cards', 'pikachu clone pokemon cards'],
  birds: ['bird pokemon cards', 'owl pokemon cards', 'penguin pokemon cards', 'duck pokemon cards'],
  fish: [
    'fish pokemon cards',
    'koi pokemon cards',
    'aquatic pokemon cards',
    'sea life pokemon cards',
  ],
  cozyAndWarm: [
    'cozy pokemon cards',
    'warm pokemon card collection',
    'vulpix ninetales cards',
    'fire fox pokemon cards',
    'fluffy pokemon card binder',
  ],
  sleepy: [
    'sleepy pokemon cards',
    'snorlax card collection',
    'slowpoke cute pokemon cards',
    'abra sleeping pokemon cards',
    'dreamy pokemon card binder',
  ],
  allOtherAnimals: [
    'seal pokemon cards',
    'fox pokemon cards',
    'deer pokemon cards',
    'giraffe pokemon cards',
    'cow pokemon cards',
    'bear pokemon cards',
    'animal pokemon collection',
  ],
  elegantAndFeminine: [
    'elegant pokemon cards',
    'feminine pokemon card collection',
    'pokemon special illustration rare',
  ],
  spookyCute: ['spooky cute pokemon cards', 'ghost pokemon cute collection', 'mimikyu fan cards'],
  eeveelutions: [
    'eeveelution cards',
    'eevee evolution cards',
    'sylveon espeon glaceon leafeon cards',
  ],
  mostPopular: [
    'most popular pokemon cards',
    'top pokemon fan favorites',
    'iconic pokemon cards all generations',
  ],
  legendary: [
    'legendary pokemon cards',
    'legendary pokemon collection',
    'pokemon legendary card binder',
  ],
  mythical: [
    'mythical pokemon cards',
    'mythical pokemon collection',
    'pokemon mythical card binder',
  ],
  rarity: [
    'Scarlet & Violet Illustration Rare cards',
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
  yukaMorii: [
    'yuka morii pokemon cards',
    'clay art pokemon tcg',
    'yuka morii collection',
    'clay sculpture pokemon cards',
    'yuka morii clay style cards',
  ],
  asakoIto: [
    'asako ito pokemon cards',
    'crochet amigurumi pokemon cards',
    'asako ito tcg',
    'knitted pokemon cards',
    'amigurumi style pokemon tcg',
  ],
} as const

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

const SPECIES_COLLECTION_KEYWORDS: Record<SpeciesCollectionSlug, string[]> = {
  'amphibians-and-reptiles': [
    ...SEO_KEYWORD_GROUPS.cuteBrand,
    ...SEO_KEYWORD_GROUPS.allOtherAnimals,
  ],
  'foxes-and-weasels': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.allOtherAnimals],
  'monkeys-chimps-and-apes': [
    ...SEO_KEYWORD_GROUPS.cuteBrand,
    ...SEO_KEYWORD_GROUPS.allOtherAnimals,
  ],
  'farm-animals': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.allOtherAnimals],
  'safari-animals': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.allOtherAnimals],
  'pink-brigade': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.pinkPalace],
  babies: [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.babies],
  'starter-pokemon': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.starters],
  'tiny-and-adorable': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.tinyAndAdorable],
  'food-and-sweet-treats': [
    ...SEO_KEYWORD_GROUPS.cuteBrand,
    ...SEO_KEYWORD_GROUPS.foodAndSweetTreats,
  ],
  'cottagecore-and-floral': [
    ...SEO_KEYWORD_GROUPS.cuteBrand,
    ...SEO_KEYWORD_GROUPS.cottagecoreAndFloral,
  ],
  dogs: [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.dogs],
  cats: [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.cats],
  bunny: [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.bunnies],
  mice: [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.mice],
  birds: [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.birds],
  fish: [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.fish],
  'cozy-and-warm': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.cozyAndWarm],
  sleepy: [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.sleepy],
  'all-other-animals': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.allOtherAnimals],
  'dreamy-and-ethereal': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.spaceAndDreams],
  'pink-pastel-icons': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.pinkPalace],
  'elegant-and-feminine': [
    ...SEO_KEYWORD_GROUPS.cuteBrand,
    ...SEO_KEYWORD_GROUPS.elegantAndFeminine,
  ],
  'spooky-cute': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.spookyCute],
  'eeveelution-core': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.eeveelutions],
  'most-popular': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.mostPopular],
  legendary: [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.legendary],
  mythical: [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.mythical],
  'yuka-morii': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.yukaMorii],
  'asako-ito': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.asakoIto],
}

const SPECIES_KEYWORD_CONFIG_LIST: SpeciesKeywordConfig[] = POKEMON_CATALOG

export const SPECIES_KEYWORD_CONFIGS = Object.fromEntries(
  SPECIES_KEYWORD_CONFIG_LIST.map((species) => [species.slug, species])
) as Record<string, SpeciesKeywordConfig>

const GENERATION_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const

/** Returns a human-readable generation label like "Gen VI". */
export function generationLabel(gen: number): string {
  const roman = GENERATION_ROMAN[gen - 1] ?? String(gen)
  return `Gen ${roman}`
}

/** Shared SEO defaults for the landing page and sitewide marketing metadata. */
export const LANDING_SEO = {
  description:
    'Pink Binder is a cute Pokémon card shop and content brand for pink Pokémon card collections, kawaii binder finds, pastel fairy cards, baby shinies, and illustration rares in English, Japanese, and Chinese.',
  keywords: uniqueKeywords([
    ...SEO_KEYWORD_GROUPS.collectors,
    ...SEO_KEYWORD_GROUPS.cuteBrand,
    ...SEO_KEYWORD_GROUPS.pinkPalace,
    ...SEO_KEYWORD_GROUPS.cottagecoreAndFloral,
    ...SEO_KEYWORD_GROUPS.spaceAndDreams,
    ...SEO_KEYWORD_GROUPS.cozyAndSoft,
    ...SEO_KEYWORD_GROUPS.babies,
    ...SEO_KEYWORD_GROUPS.starters,
    ...SEO_KEYWORD_GROUPS.tinyAndAdorable,
    ...SEO_KEYWORD_GROUPS.foodAndSweetTreats,
    ...SEO_KEYWORD_GROUPS.dogs,
    ...SEO_KEYWORD_GROUPS.cats,
    ...SEO_KEYWORD_GROUPS.bunnies,
    ...SEO_KEYWORD_GROUPS.mice,
    ...SEO_KEYWORD_GROUPS.birds,
    ...SEO_KEYWORD_GROUPS.fish,
    ...SEO_KEYWORD_GROUPS.allOtherAnimals,
    ...SEO_KEYWORD_GROUPS.elegantAndFeminine,
    ...SEO_KEYWORD_GROUPS.spookyCute,
    ...SEO_KEYWORD_GROUPS.eeveelutions,
    ...SEO_KEYWORD_GROUPS.mostPopular,
    ...SEO_KEYWORD_GROUPS.legendary,
    ...SEO_KEYWORD_GROUPS.mythical,
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
    ...SEO_KEYWORD_GROUPS.pinkPalace,
    ...SEO_KEYWORD_GROUPS.cottagecoreAndFloral,
    ...SEO_KEYWORD_GROUPS.spaceAndDreams,
    ...SEO_KEYWORD_GROUPS.cozyAndSoft,
    ...SEO_KEYWORD_GROUPS.babies,
    ...SEO_KEYWORD_GROUPS.starters,
    ...SEO_KEYWORD_GROUPS.tinyAndAdorable,
    ...SEO_KEYWORD_GROUPS.foodAndSweetTreats,
    ...SEO_KEYWORD_GROUPS.dogs,
    ...SEO_KEYWORD_GROUPS.cats,
    ...SEO_KEYWORD_GROUPS.bunnies,
    ...SEO_KEYWORD_GROUPS.mice,
    ...SEO_KEYWORD_GROUPS.birds,
    ...SEO_KEYWORD_GROUPS.fish,
    ...SEO_KEYWORD_GROUPS.allOtherAnimals,
    ...SEO_KEYWORD_GROUPS.elegantAndFeminine,
    ...SEO_KEYWORD_GROUPS.spookyCute,
    ...SEO_KEYWORD_GROUPS.eeveelutions,
    ...SEO_KEYWORD_GROUPS.mostPopular,
    ...SEO_KEYWORD_GROUPS.legendary,
    ...SEO_KEYWORD_GROUPS.mythical,
    ...SEO_KEYWORD_GROUPS.rarity,
    ...SEO_KEYWORD_GROUPS.languages,
    ...SEO_KEYWORD_GROUPS.speciesMoats,
    'pink binder blog',
    'pokemon card shop news',
  ]),
}

export const BLOG_INDEX_SEO = {
  title: 'Cute Pokémon Collector Guide',
  description:
    'Your guide to the soft, pastel, and art-focused side of the Pokémon TCG—featuring regular updates on the cutest cards, beautiful illustration styles, set previews, news or announcements, and inspiration for your cozy card collection!',
  keywords: uniqueKeywords([
    ...BLOG_SEO.keywords,
    'pokemon card blog',
    'cute pokemon cards',
    'aesthetic pokemon card binder',
  ]),
}

export function getSpeciesKeywordConfig(species: string) {
  const lookupKey = normalizeLookupValue(species)

  return SPECIES_KEYWORD_CONFIG_LIST.find((entry) =>
    [
      entry.slug,
      entry.name,
      ...getPokemonTranslationValues(entry.translations),
      ...entry.relatedEntities,
    ]
      .map(normalizeLookupValue)
      .includes(lookupKey)
  )
}

/**
 * Precise species lookup that matches only by slug, name, and translations.
 * Unlike {@link getSpeciesKeywordConfig}, this does NOT search `relatedEntities`,
 * which prevents false positives where one species' relatedEntities list causes
 * a different species to be returned.
 */
export function getSpeciesConfigBySlugOrName(species: string): SpeciesKeywordConfig | undefined {
  const lookupKey = normalizeLookupValue(species)

  return SPECIES_KEYWORD_CONFIG_LIST.find((entry) =>
    [entry.slug, entry.name, ...getPokemonTranslationValues(entry.translations)]
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
      ? (getSpeciesKeywordConfig(species) ??
        ({
          id: -1,
          slug: slugifySpecies(species),
          name: species,
          generation: 1,
          isLegendary: false,
          isMythical: false,
          isBaby: false,
          collections: [],
          types: [],
          translations: createEmptyPokemonTranslations(),
          relatedKeywords: [],
          relatedEntities: [],
        } as SpeciesKeywordConfig))
      : species

  const siteName = options.siteName ?? BRAND.name
  const collectionSlugs = [...new Set(resolved.collections)] as SpeciesCollectionSlug[]
  const collection = collectionSlugs[0] ? SPECIES_COLLECTIONS[collectionSlugs[0]] : null
  const collectionTitles = collectionSlugs.map((slug) => SPECIES_COLLECTIONS[slug].title)
  const titleLead = resolved.name
  const collectionKeywords = collectionSlugs.flatMap(
    (slug) => SPECIES_COLLECTION_KEYWORDS[slug] ?? []
  )

  return {
    slug: resolved.slug,
    name: resolved.name,
    collection,
    collections: collectionSlugs.map((slug) => SPECIES_COLLECTIONS[slug]),
    translations: resolved.translations,
    title: `${titleLead} Cute Cards | ${siteName}`,
    description: `Shop the cutest ${resolved.name} cards in English, Japanese, and Chinese. From rare Illustration Rares to shiny baby cards, we specialize in the pink and pastel side of Pokémon TCG. Fast shipping on all Fairy and Art Rare cards.`,
    heading: `The Ultimate ${resolved.name} Collection: Cute & Rare Cards`,
    keywords: uniqueKeywords([
      resolved.name,
      titleLead,
      ...getPokemonTranslationValues(resolved.translations),
      ...collectionTitles,
      ...resolved.relatedKeywords,
      ...resolved.relatedEntities,
      ...(options.includeKeywordGroups === false ? [] : collectionKeywords),
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
