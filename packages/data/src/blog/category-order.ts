/**
 * Blog category chip order: subject/theme first, post format second.
 *
 * Examples:
 *   - Gen I → Popular Rankings
 *   - Akira Egawa → TCG Illustrators
 *   - Asako Ito → Best Cards to Collect
 */

import { SPECIES_GUIDES_CATEGORY } from './categories'
import {
  ROUNDUP_LIST_CATEGORIES,
  TCG_EXPANSIONS_CATEGORY,
  TCG_ILLUSTRATORS_CATEGORY,
} from './roundup-list-categories'
export const BLOG_POST_FORMAT_CATEGORIES: readonly string[] = [
  SPECIES_GUIDES_CATEGORY,
  ...Object.values(ROUNDUP_LIST_CATEGORIES),
  TCG_ILLUSTRATORS_CATEGORY,
  TCG_EXPANSIONS_CATEGORY,
  'Generations',
  'Regions',
  'Wizards of the Coast sets',
  'Post-Wizards of the Coast sets',
  'Other sets',
]

const POST_FORMAT_SET = new Set<string>(BLOG_POST_FORMAT_CATEGORIES)

/** @deprecated Use {@link isPostFormatCategory}. */
export const GRID_META_CATEGORIES = POST_FORMAT_SET

export function isPostFormatCategory(category: string): boolean {
  return POST_FORMAT_SET.has(category)
}

/** Subject/theme categories first, post-format categories last (stable within each group). */
export function orderBlogCategories(categories: string[]): string[] {
  const subjects: string[] = []
  const formats: string[] = []

  for (const category of categories) {
    if (isPostFormatCategory(category)) {
      formats.push(category)
    } else {
      subjects.push(category)
    }
  }

  return [...subjects, ...formats]
}

/** Grid card chips: primary subject + post format when both exist. */
export function displayCategoriesForPost(categories: string[], kind: string): string[] {
  const ordered = orderBlogCategories(categories)
  const subjects = ordered.filter((category) => !isPostFormatCategory(category))
  const formats = ordered.filter((category) => isPostFormatCategory(category))

  if (
    kind === 'roundup' ||
    kind === 'illustrator' ||
    kind === 'generation' ||
    kind === 'expansion'
  ) {
    return [subjects[0], formats[0]].filter((category): category is string => Boolean(category))
  }

  return subjects.slice(0, 3)
}

/** Categories used by blog index filters — skip when extracting binder themes. */
export const COLLECTION_FILTER_SKIP = new Set<string>(BLOG_POST_FORMAT_CATEGORIES)
