const POKEMON_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Normal: { bg: '#A8A77A', text: '#FFFFFF' },
  Fire: { bg: '#EE8130', text: '#FFFFFF' },
  Water: { bg: '#6390F0', text: '#FFFFFF' },
  Electric: { bg: '#F7D02C', text: '#3D3D3D' },
  Grass: { bg: '#7AC74C', text: '#FFFFFF' },
  Ice: { bg: '#96D9D6', text: '#1F2937' },
  Fighting: { bg: '#C22E28', text: '#FFFFFF' },
  Poison: { bg: '#A33EA1', text: '#FFFFFF' },
  Ground: { bg: '#E2BF65', text: '#3D3D3D' },
  Flying: { bg: '#A98FF3', text: '#FFFFFF' },
  Psychic: { bg: '#F95587', text: '#FFFFFF' },
  Bug: { bg: '#A6B91A', text: '#FFFFFF' },
  Rock: { bg: '#B6A136', text: '#FFFFFF' },
  Ghost: { bg: '#735797', text: '#FFFFFF' },
  Dragon: { bg: '#6F35FC', text: '#FFFFFF' },
  Dark: { bg: '#705746', text: '#FFFFFF' },
  Steel: { bg: '#B7B7CE', text: '#1F2937' },
  Fairy: { bg: '#D685AD', text: '#FFFFFF' },
}

const POKEMON_TYPE_LOGOS: Record<string, string> = Object.fromEntries(
  Object.keys(POKEMON_TYPE_COLORS).map((type) => [
    type,
    `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type.toLowerCase()}.svg`,
  ])
)

export function getPokemonTypeColors(type: string) {
  return POKEMON_TYPE_COLORS[type] ?? { bg: '#6B7280', text: '#FFFFFF' }
}

export function getPokemonTypeLogoUrl(type: string): string | null {
  return POKEMON_TYPE_LOGOS[type] ?? null
}

function toSolidLightColor(hex: string) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return '#E5E7EB'

  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '#E5E7EB'

  const LIGHT_MODE_WHITE_BLEND_FACTOR = 0.72
  const mixWithWhite = (channel: number) =>
    Math.round(channel + (255 - channel) * LIGHT_MODE_WHITE_BLEND_FACTOR)
  const toHex = (channel: number) => channel.toString(16).padStart(2, '0')
  return `#${toHex(mixWithWhite(r))}${toHex(mixWithWhite(g))}${toHex(mixWithWhite(b))}`
}

export function getPokemonTypeLightColors(type: string) {
  const colors = getPokemonTypeColors(type)
  return {
    bg: toSolidLightColor(colors.bg),
    text: colors.bg,
    border: colors.bg,
  }
}

export function getPokemonTypeLogoColor(type: string) {
  return getPokemonTypeLightColors(type).text
}

export function parseTypeCategory(category: string): string | null {
  const match = /^(.+) Type$/.exec(category)
  return match?.[1] ?? null
}
