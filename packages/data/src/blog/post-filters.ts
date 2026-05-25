import { ALL_ROUNDUP_LIST_CATEGORIES, TCG_ILLUSTRATORS_CATEGORY } from './roundup-list-categories'
import { SPECIES_GUIDES_CATEGORY } from './categories'
import { COLLECTION_FILTER_SKIP } from './category-order'
import { parseTypeCategory } from '../ui/type-colors'

/** Blog index filter box labels (display only; filter values unchanged). */
export const BLOG_FILTER_GROUP_LABELS = {
  type: 'Pokémon Type',
  generation: 'Generation / Region',
  list: 'Post Format',
  illustrator: 'Card Illustrators',
  collection: 'Binder Themes',
} as const

interface PostWithCategories {
  categories: string[]
}

const GENERATION_ORDER: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
}

const GENERATION_REGION: Record<string, string> = {
  I: 'Kanto',
  II: 'Johto',
  III: 'Hoenn',
  IV: 'Sinnoh',
  V: 'Unova',
  VI: 'Kalos',
  VII: 'Alola',
  VIII: 'Galar',
  IX: 'Paldea',
  X: 'Unknown',
}

/** Returns a display label for a generation filter value (e.g. "Gen I" → "Gen I — Kanto"). */
export function generationFilterLabel(value: string): string {
  const roman = value.replace('Gen ', '')
  const region = GENERATION_REGION[roman]
  return region ? `${value} — ${region}` : value
}

export function extractTypeFilters(posts: PostWithCategories[]): string[] {
  const types = new Set<string>()
  for (const post of posts) {
    for (const cat of post.categories) {
      const m = /^(.+) Type$/.exec(cat)
      const typeName = m?.[1]
      if (typeName) types.add(typeName)
    }
  }
  return [...types].sort()
}

export function extractIllustratorFilters(posts: PostWithCategories[]): string[] {
  const illustrators = new Set<string>()
  for (const post of posts) {
    if (!post.categories.includes(TCG_ILLUSTRATORS_CATEGORY)) continue
    for (const cat of post.categories) {
      if (cat !== TCG_ILLUSTRATORS_CATEGORY) {
        illustrators.add(cat)
      }
    }
  }
  return [...illustrators].sort()
}

export function extractCollectionFilters(posts: PostWithCategories[]): string[] {
  const illustratorNames = new Set(extractIllustratorFilters(posts))
  const skipPattern = /^(.+ Type|Gen [IVX]+)$/
  const collections = new Set<string>()
  for (const post of posts) {
    for (const cat of post.categories) {
      if (COLLECTION_FILTER_SKIP.has(cat) || illustratorNames.has(cat)) {
        continue
      }
      if (!skipPattern.test(cat)) {
        collections.add(cat)
      }
    }
  }
  return [...collections].sort()
}

/** Blog index “Lists” chips: species guides + roundup angles, stable order. */
const ALL_LIST_FILTER_CATEGORIES: readonly string[] = [
  SPECIES_GUIDES_CATEGORY,
  ...ALL_ROUNDUP_LIST_CATEGORIES,
]

/** Roundup list types + species guides for blog index filter chips. */
export function extractRoundupListFilters(posts: PostWithCategories[]): string[] {
  const present = new Set<string>()
  for (const post of posts) {
    for (const cat of post.categories) {
      if (ALL_LIST_FILTER_CATEGORIES.includes(cat)) {
        present.add(cat)
      }
    }
  }
  return ALL_LIST_FILTER_CATEGORIES.filter((label) => present.has(label))
}

export function extractGenerationFilters(posts: PostWithCategories[]): string[] {
  const generations = new Set<string>()
  for (const post of posts) {
    for (const cat of post.categories) {
      if (/^Gen [IVX]+$/.test(cat)) generations.add(cat)
    }
  }

  return [...generations].sort((a, b) => {
    const aRoman = a.replace('Gen ', '')
    const bRoman = b.replace('Gen ', '')
    return (
      (GENERATION_ORDER[aRoman] ?? Number.MAX_SAFE_INTEGER) -
      (GENERATION_ORDER[bRoman] ?? Number.MAX_SAFE_INTEGER)
    )
  })
}

export function getFilterValueForCategory(category: string): string {
  return parseTypeCategory(category) ?? category
}
