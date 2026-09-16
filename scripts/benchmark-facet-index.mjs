#!/usr/bin/env node
/**
 * Microbenchmark: linear facet helpers vs the BlogFacetIndex lookup path.
 * Simulates a production-scale catalog (~2 000 catalog tags, ~1 000 species,
 * ~150 expansions) and measures the per-URL-commit cost the hydrated grid
 * pays on every filter change.
 *
 *   bun scripts/benchmark-facet-index.mjs
 */
import {
  buildBlogFacetIndex,
  catalogSelectValueFromFilters,
  catalogSelectValueFromFiltersIndexed,
} from '../packages/data/src/blog/post-filters.ts'

const tags = Array.from({ length: 2000 }, (_, i) => ({
  value: `tag-${i}`,
  label: `Tag ${i}`,
}))
// Realistic: a handful of catalog tags DO mirror facets, so linear finds can
// early-exit partway through the catalog instead of always scanning all 2 000.
tags[997] = { value: 'electric', label: 'Electric Type' }
tags[1249] = { value: 'exp-42', label: 'Expansion 42' }
tags[1501] = { value: 'illustrator 77', label: 'Illustrator 77' }
const pokemon = Array.from({ length: 1000 }, (_, i) => ({
  slug: `species-${i}`,
  label: `Species ${i}`,
}))
const expansions = Array.from({ length: 150 }, (_, i) => ({
  slug: `exp-${i}`,
  label: `Expansion ${i}`,
}))
const facets = {
  types: ['Electric', 'Fire', 'Water'],
  generations: ['Gen I', 'Gen II'],
  lists: ['Species Guides', 'Cutest'],
  illustrators: Array.from({ length: 100 }, (_, i) => `Illustrator ${i}`),
  expansions,
  pokemon,
  themes: Array.from({ length: 20 }, (_, i) => `Theme ${i}`),
  tags,
}
const ctx = {
  typeFilters: facets.types,
  generationFilters: facets.generations,
  illustratorFilters: facets.illustrators,
  themeFilters: facets.themes,
  roundupListFilters: facets.lists,
  pokemonFilters: facets.pokemon,
  expansionFilters: facets.expansions,
}
const grouped = {
  type: 'Electric',
  generation: null,
  list: null,
  illustrator: 'Illustrator 77',
  expansion: 'exp-42',
  pokemon: null,
  themes: 'Theme 9',
}

function bench(label, fn, minMs = 300) {
  fn() // warmup
  const start = performance.now()
  let iterations = 0
  while (performance.now() - start < minMs) {
    fn()
    iterations++
  }
  const ms = (performance.now() - start) / iterations
  console.log(`${label}: ${ms.toFixed(3)} ms/op (${iterations} ops)`)
  return ms
}

const indexStart = performance.now()
const index = buildBlogFacetIndex(facets)
console.log(`buildBlogFacetIndex (one-time): ${(performance.now() - indexStart).toFixed(1)} ms`)

const linear = bench('catalogSelectValueFromFilters (linear, per change)', () =>
  catalogSelectValueFromFilters(null, grouped, tags, ctx))
const indexed = bench('catalogSelectValueFromFiltersIndexed (per change)', () =>
  catalogSelectValueFromFiltersIndexed(index, null, grouped))
console.log(`speedup: ${(linear / indexed).toFixed(0)}x`)
