import { describe, expect, it } from 'bun:test'
import {
  SPECIES_GUIDES_CATEGORY,
  GENERATIONS_GUIDE_CATEGORY,
  GENERATIONS_GUIDES_CATEGORY,
} from './categories'

describe('blog/categories', () => {
  it('exposes category label constants', () => {
    expect(SPECIES_GUIDES_CATEGORY).toBe('Pokemon Species Guides')
    expect(GENERATIONS_GUIDE_CATEGORY).toBe('Generations Guide')
  })

  it('deprecated alias matches canonical', () => {
    expect(GENERATIONS_GUIDES_CATEGORY).toBe(GENERATIONS_GUIDE_CATEGORY)
  })
})
