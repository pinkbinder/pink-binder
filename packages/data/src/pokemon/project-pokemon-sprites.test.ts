import { describe, expect, it } from 'bun:test'
import {
  buildProjectPokemonSpriteUrls,
  projectPokemonSpriteSlugCandidates,
  PROJECT_POKEMON_SPRITE_BASE,
} from './project-pokemon-sprites'

describe('project-pokemon-sprites', () => {
  it('buildProjectPokemonSpriteUrls builds normal + shiny gif urls', () => {
    const urls = buildProjectPokemonSpriteUrls('Pikachu')
    expect(urls.normal).toBe(`${PROJECT_POKEMON_SPRITE_BASE}/normal-sprite/pikachu.gif`)
    expect(urls.shiny).toBe(`${PROJECT_POKEMON_SPRITE_BASE}/shiny-sprite/pikachu.gif`)
  })

  it('projectPokemonSpriteSlugCandidates applies overrides and dedupes', () => {
    expect(projectPokemonSpriteSlugCandidates('Mr-Mime')).toContain('mr.mime')
    expect(projectPokemonSpriteSlugCandidates('nidoran-m')).toContain('nidoran_m')
  })

  it('projectPokemonSpriteSlugCandidates strips -family-of suffixes', () => {
    expect(projectPokemonSpriteSlugCandidates('squirtle-family-of-three')).toEqual([
      'squirtle-family-of-three',
      'squirtle',
    ])
  })

  it('projectPokemonSpriteSlugCandidates returns [] for empty', () => {
    expect(projectPokemonSpriteSlugCandidates('  ')).toEqual([])
  })
})
