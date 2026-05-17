import type { SpeciesCollectionSlug } from './species-collections'
import { ASAKO_ITO_SPECIES_SLUGS, YUKA_MORII_SPECIES_SLUGS } from './illustrator-collection-slugs'
import {
  AMPHIBIANS_AND_REPTILES_SLUGS,
  BIRD_COLLECTION_SLUGS,
  BUNNY_COLLECTION_SLUGS,
  CAT_COLLECTION_SLUGS,
  COZY_AND_WARM_SLUGS,
  COTTAGECORE_AND_FLORAL_SLUGS,
  DOG_COLLECTION_SLUGS,
  DREAMY_AND_ETHEREAL_SLUGS,
  EEVEELUTION_CORE_SLUGS,
  ELEGANT_AND_FEMININE_SLUGS,
  FARM_ANIMALS_SLUGS,
  FISH_COLLECTION_SLUGS,
  FOOD_COLLECTION_SLUGS,
  FOXES_AND_WEASELS_SLUGS,
  MICE_COLLECTION_SLUGS,
  MONKEYS_CHIMPS_AND_APES_SLUGS,
  MOST_POPULAR_SLUGS,
  NON_ANIMAL_SLUGS,
  PINK_BRIGADE_SLUGS,
  PINK_PASTEL_ICONS_SLUGS,
  SAFARI_ANIMALS_SLUGS,
  SLEEPY_SLUGS,
  SPOOKY_CUTE_SLUGS,
  STARTER_BASE_SLUGS,
  TINY_AND_ADORABLE_SLUGS,
} from './species-collection-slug-sets'

/** Lower index = higher priority when sorting `collections` (primary = first entry). */
export const SPECIES_COLLECTION_SORT_ORDER: SpeciesCollectionSlug[] = [
  'dogs',
  'cats',
  'bunny',
  'mice',
  'foxes-and-weasels',
  'safari-animals',
  'birds',
  'fish',
  'farm-animals',
  'monkeys-chimps-and-apes',
  'amphibians-and-reptiles',
  'all-other-animals',
  'food-and-sweet-treats',
  'cottagecore-and-floral',
  'cozy-and-warm',
  'sleepy',
  'tiny-and-adorable',
  'spooky-cute',
  'dreamy-and-ethereal',
  'elegant-and-feminine',
  'pink-pastel-icons',
  'pink-brigade',
  'starter-pokemon',
  'babies',
  'eeveelution-core',
  'most-popular',
  'legendary',
  'mythical',
  'yuka-morii',
  'asako-ito',
]

const SORT_INDEX = new Map(SPECIES_COLLECTION_SORT_ORDER.map((slug, index) => [slug, index]))

const ANIMAL_COLLECTIONS: SpeciesCollectionSlug[] = [
  'dogs',
  'cats',
  'bunny',
  'mice',
  'foxes-and-weasels',
  'safari-animals',
  'birds',
  'fish',
  'farm-animals',
  'monkeys-chimps-and-apes',
  'amphibians-and-reptiles',
]

export interface SpeciesCollectionInput {
  slug: string
  isLegendary: boolean
  isMythical: boolean
  isBaby: boolean
}

export function sortSpeciesCollections(
  collections: SpeciesCollectionSlug[]
): SpeciesCollectionSlug[] {
  return [...collections].sort((a, b) => {
    const aIndex = SORT_INDEX.get(a) ?? Number.MAX_SAFE_INTEGER
    const bIndex = SORT_INDEX.get(b) ?? Number.MAX_SAFE_INTEGER
    if (aIndex !== bIndex) {
      return aIndex - bIndex
    }
    return a.localeCompare(b)
  })
}

export function resolveSpeciesCollections(entry: SpeciesCollectionInput): SpeciesCollectionSlug[] {
  const collections = new Set<SpeciesCollectionSlug>()

  const hasSpecificAnimalCollection =
    DOG_COLLECTION_SLUGS.has(entry.slug) ||
    CAT_COLLECTION_SLUGS.has(entry.slug) ||
    BUNNY_COLLECTION_SLUGS.has(entry.slug) ||
    MICE_COLLECTION_SLUGS.has(entry.slug) ||
    FOXES_AND_WEASELS_SLUGS.has(entry.slug) ||
    SAFARI_ANIMALS_SLUGS.has(entry.slug) ||
    BIRD_COLLECTION_SLUGS.has(entry.slug) ||
    FISH_COLLECTION_SLUGS.has(entry.slug) ||
    FARM_ANIMALS_SLUGS.has(entry.slug) ||
    MONKEYS_CHIMPS_AND_APES_SLUGS.has(entry.slug) ||
    AMPHIBIANS_AND_REPTILES_SLUGS.has(entry.slug)

  if (!NON_ANIMAL_SLUGS.has(entry.slug) && !hasSpecificAnimalCollection) {
    collections.add('all-other-animals')
  }

  if (MOST_POPULAR_SLUGS.has(entry.slug)) collections.add('most-popular')
  if (entry.isLegendary) collections.add('legendary')
  if (entry.isMythical) collections.add('mythical')
  if (entry.isBaby) collections.add('babies')
  if (STARTER_BASE_SLUGS.has(entry.slug)) collections.add('starter-pokemon')
  if (DOG_COLLECTION_SLUGS.has(entry.slug)) collections.add('dogs')
  if (CAT_COLLECTION_SLUGS.has(entry.slug)) collections.add('cats')
  if (BUNNY_COLLECTION_SLUGS.has(entry.slug)) collections.add('bunny')
  if (MICE_COLLECTION_SLUGS.has(entry.slug)) collections.add('mice')
  if (FOXES_AND_WEASELS_SLUGS.has(entry.slug)) collections.add('foxes-and-weasels')
  if (SAFARI_ANIMALS_SLUGS.has(entry.slug)) collections.add('safari-animals')
  if (FOOD_COLLECTION_SLUGS.has(entry.slug)) collections.add('food-and-sweet-treats')
  if (BIRD_COLLECTION_SLUGS.has(entry.slug)) collections.add('birds')
  if (FISH_COLLECTION_SLUGS.has(entry.slug)) collections.add('fish')
  if (FARM_ANIMALS_SLUGS.has(entry.slug)) collections.add('farm-animals')
  if (MONKEYS_CHIMPS_AND_APES_SLUGS.has(entry.slug)) collections.add('monkeys-chimps-and-apes')
  if (AMPHIBIANS_AND_REPTILES_SLUGS.has(entry.slug)) collections.add('amphibians-and-reptiles')
  if (COZY_AND_WARM_SLUGS.has(entry.slug)) collections.add('cozy-and-warm')
  if (SLEEPY_SLUGS.has(entry.slug)) collections.add('sleepy')
  if (COTTAGECORE_AND_FLORAL_SLUGS.has(entry.slug)) collections.add('cottagecore-and-floral')
  if (DREAMY_AND_ETHEREAL_SLUGS.has(entry.slug)) collections.add('dreamy-and-ethereal')
  if (ELEGANT_AND_FEMININE_SLUGS.has(entry.slug)) collections.add('elegant-and-feminine')
  if (PINK_PASTEL_ICONS_SLUGS.has(entry.slug)) collections.add('pink-pastel-icons')
  if (PINK_BRIGADE_SLUGS.has(entry.slug)) collections.add('pink-brigade')
  if (SPOOKY_CUTE_SLUGS.has(entry.slug)) collections.add('spooky-cute')
  if (TINY_AND_ADORABLE_SLUGS.has(entry.slug)) collections.add('tiny-and-adorable')
  if (EEVEELUTION_CORE_SLUGS.has(entry.slug)) collections.add('eeveelution-core')
  if (YUKA_MORII_SPECIES_SLUGS.has(entry.slug)) collections.add('yuka-morii')
  if (ASAKO_ITO_SPECIES_SLUGS.has(entry.slug)) collections.add('asako-ito')

  if (
    hasSpecificAnimalCollection ||
    COZY_AND_WARM_SLUGS.has(entry.slug) ||
    SLEEPY_SLUGS.has(entry.slug)
  ) {
    collections.delete('all-other-animals')
  }

  if (collections.size === 0) {
    collections.add('all-other-animals')
  }

  return sortSpeciesCollections([...collections])
}
