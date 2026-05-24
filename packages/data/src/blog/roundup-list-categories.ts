/** Client-safe roundup angle + index filter category labels (no server-only deps). */

export type RoundupAngle = 'cutest' | 'collect' | 'popular' | 'expensive'

/**
 * Primary blog category per roundup angle — used for index filters (not species guides).
 * Each value is unique so `/?filter=Cute Rankings` etc. works out of the box.
 */
export const ROUNDUP_LIST_CATEGORIES: Record<RoundupAngle, string> = {
  cutest: 'Cute Rankings',
  popular: 'Popular Rankings',
  collect: 'Best Cards to Collect',
  expensive: 'TCG Price Lists',
}

export const TCG_ILLUSTRATORS_CATEGORY = 'TCG Illustrators'

export const ALL_ROUNDUP_LIST_CATEGORIES: readonly string[] = [
  ...Object.values(ROUNDUP_LIST_CATEGORIES),
  TCG_ILLUSTRATORS_CATEGORY,
]

/** @deprecated Use {@link ROUNDUP_LIST_CATEGORIES}. */
export const ROUNDUP_TYPE_TAGS = ROUNDUP_LIST_CATEGORIES

export function getRoundupListCategory(angle: RoundupAngle): string {
  return ROUNDUP_LIST_CATEGORIES[angle]
}

export function isRoundupListCategory(category: string): boolean {
  return (ALL_ROUNDUP_LIST_CATEGORIES as readonly string[]).includes(category)
}
