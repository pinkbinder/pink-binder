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
    `https://images.pinkbinder.shop/v1/images/icons/types/${type.toLowerCase()}.svg`,
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

function luminance(hex: string): number {
  const channel = (value: number): number => {
    const scaled = value / 255
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
  }
  const r = channel(Number.parseInt(hex.slice(0, 2), 16))
  const g = channel(Number.parseInt(hex.slice(2, 4), 16))
  const b = channel(Number.parseInt(hex.slice(4, 6), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two opaque hex colors. */
export function contrastRatio(foreground: string, background: string): number {
  const parse = (hex: string): string => hex.replace('#', '')
  const fg = luminance(parse(foreground))
  const bg = luminance(parse(background))
  const [lighter, darker] = fg >= bg ? [fg, bg] : [bg, fg]
  return (lighter + 0.05) / (darker + 0.05)
}

/** White when it passes AA (4.5:1) on the background, else the dark shade that does. */
export function readableTextColorOn(background: string, preferred = '#FFFFFF'): string {
  if (contrastRatio(preferred, background) >= 4.5) return preferred
  return toSolidDarkColor(background)
}

/** Deep shade of the type color: keeps the hue readable as text on the light bg (≥ 4.5:1). */
function toSolidDarkColor(hex: string) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return '#3D3D3D'

  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '#3D3D3D'

  const DARK_TEXT_FACTOR = 0.42
  const toHex = (channel: number) =>
    Math.round(channel * DARK_TEXT_FACTOR)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function getPokemonTypeLightColors(type: string) {
  const colors = getPokemonTypeColors(type)
  return {
    bg: toSolidLightColor(colors.bg),
    text: toSolidDarkColor(colors.bg),
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
