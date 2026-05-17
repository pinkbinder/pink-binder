import { parseTypeCategory } from '../ui/type-colors'

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

export function extractCollectionFilters(posts: PostWithCategories[]): string[] {
  const skipPattern = /^(Cute Pokémon Guides|.+ Type|Gen [IVX]+)$/
  const collections = new Set<string>()
  for (const post of posts) {
    for (const cat of post.categories) {
      if (!skipPattern.test(cat)) {
        collections.add(cat)
      }
    }
  }
  return [...collections].sort()
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
