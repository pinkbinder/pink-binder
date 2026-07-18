import { describe, expect, it } from 'bun:test'
import {
  BLOG_POST_FORMAT_CATEGORIES,
  COLLECTION_FILTER_SKIP,
  displayCategoriesForPost,
  GRID_META_CATEGORIES,
  isPostFormatCategory,
  orderBlogCategories,
  THEME_FILTER_SKIP,
} from './category-order'

describe('isPostFormatCategory', () => {
  it('returns true for known post-format categories', () => {
    for (const cat of BLOG_POST_FORMAT_CATEGORIES) {
      expect(isPostFormatCategory(cat)).toBe(true)
    }
  })

  it('returns false for subject/theme categories', () => {
    expect(isPostFormatCategory('Pikachu')).toBe(false)
    expect(isPostFormatCategory('Gen I')).toBe(false)
    expect(isPostFormatCategory('')).toBe(false)
  })
})

describe('orderBlogCategories', () => {
  it('puts subject categories first, formats last', () => {
    const ordered = orderBlogCategories(['Gen I', 'Species Guides', 'TCG Illustrators'])
    expect(ordered.indexOf('Gen I')).toBeLessThan(ordered.indexOf('TCG Illustrators'))
    expect(ordered.indexOf('Species Guides')).toBeLessThan(ordered.indexOf('TCG Illustrators'))
  })

  it('preserves order within each group', () => {
    const ordered = orderBlogCategories(['B', 'A', 'Format X', 'Format Y'])
    expect(ordered.slice(0, 2)).toEqual(['B', 'A'])
    expect(ordered.slice(2)).toEqual(['Format X', 'Format Y'])
  })

  it('handles an all-subject list', () => {
    expect(orderBlogCategories(['X', 'Y', 'Z'])).toEqual(['X', 'Y', 'Z'])
  })

  it('handles an all-format list', () => {
    const all = [...BLOG_POST_FORMAT_CATEGORIES]
    expect(orderBlogCategories(all)).toEqual(all)
  })
})

describe('displayCategoriesForPost', () => {
  it('returns subject[0] + format[0] for roundup kind', () => {
    const out = displayCategoriesForPost(['Pikachu', 'Species Guides', 'Cute Rankings'], 'roundup')
    // 'Cute Rankings' is a post-format category, so it surfaces as formats[0]
    expect(out).toEqual(['Pikachu', 'Cute Rankings'])
  })

  it('returns subject[0] + format[0] for illustrator kind', () => {
    const out = displayCategoriesForPost(['Akira Egawa', 'TCG Illustrators'], 'illustrator')
    expect(out).toEqual(['Akira Egawa', 'TCG Illustrators'])
  })

  it('returns up to 3 subjects for non-listed kinds', () => {
    const out = displayCategoriesForPost(['A', 'B', 'C', 'D', 'Species Guides'], 'species')
    expect(out).toEqual(['A', 'B', 'C'])
  })

  it('omits missing subject/format gracefully', () => {
    expect(displayCategoriesForPost([], 'roundup')).toEqual([])
    expect(displayCategoriesForPost(['OnlySubject'], 'roundup')).toEqual(['OnlySubject'])
  })
})

describe('deprecated alias sets', () => {
  it('GRID_META_CATEGORIES mirrors the format set', () => {
    // GRID_META_CATEGORIES aliases POST_FORMAT_SET; content-equal to the deprecated COLLECTION_FILTER_SKIP
    expect([...GRID_META_CATEGORIES].sort()).toEqual([...COLLECTION_FILTER_SKIP].sort())
    expect([...THEME_FILTER_SKIP].sort()).toEqual([...COLLECTION_FILTER_SKIP].sort())
  })
})
