const IMAGE_EXTENSION_PATTERN = /\.(?:png|jpe?g|webp|gif|avif|svg)$/i
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Words commonly present in the human-readable ArtofPkm source filenames. */
const LEGIBLE_ART_WORDS = new Set([
  'art',
  'artwork',
  'backfill',
  'bathing',
  'by',
  'card',
  'cards',
  'cute',
  'fukuyama',
  'home',
  'illustration',
  'illustrations',
  'jpn',
  'key',
  'keiko',
  'legends',
  'legend',
  'pokemon',
  'salon',
  'set',
  'shiny',
  'trainer',
  'trainers',
  'visual',
  'wallhaven',
])

export const R2_IMAGE_EXTENSIONS = /\.(?:png|jpe?g|webp|gif|avif|svg)$/i

/** Remove one or more source/variant image extensions from a filename. */
export function stripR2ImageExtensions(filename: string): string {
  let stripped = filename
  while (IMAGE_EXTENSION_PATTERN.test(stripped)) {
    stripped = stripped.slice(0, stripped.lastIndexOf('.'))
  }
  return stripped
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sourceRelativeKey(sourceKey: string): string {
  const normalized = sourceKey.replace(/\\/g, '/').replace(/^\/+/, '')
  return normalized.startsWith('pokemon/') ? normalized.slice('pokemon/'.length) : normalized
}

function sourceExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/)
  return match?.[0].toLowerCase() ?? ''
}

function isRandomToken(token: string): boolean {
  if (UUID_PATTERN.test(token)) return true
  if (/^\d{1,}$/.test(token)) return true
  if (/\d/.test(token) && token.length >= 6) return true
  return false
}

function isRecognizedArtWord(token: string, pokemonSlug: string): boolean {
  if (LEGIBLE_ART_WORDS.has(token)) return true
  return pokemonSlug.split('-').some((part) => part.length >= 3 && token === part)
}

/**
 * Make an ArtofPkm filename readable without attempting to infer metadata from
 * an opaque upload id. Opaque names intentionally fall back to the Pokémon
 * slug; collision numbering is applied by buildPokemonImageSourceKeyMap.
 */
function normalizeArtofPkmStemInternal(
  stem: string,
  pokemonSlug: string,
  preserveNumericOrdinal: boolean
): string {
  const pokemon = slugify(pokemonSlug) || 'pokemon'
  const tokens = slugify(stripR2ImageExtensions(stem)).split('-').filter(Boolean)
  const ordinalToken =
    preserveNumericOrdinal && tokens.length > 1 && /^\d{1,3}$/.test(tokens.at(-1) ?? '')
      ? tokens.at(-1)
      : undefined
  const filtered = tokens
    .slice(0, ordinalToken ? -1 : undefined)
    .filter((token) => !isRandomToken(token))
  const hasLegibleWord =
    filtered.join('-') === pokemon || filtered.some((token) => isRecognizedArtWord(token, pokemon))

  if (!hasLegibleWord) return pokemon

  if (ordinalToken) {
    return `${filtered.join('-')}-${ordinalToken}`
  }

  const readable = filtered.filter((token) => token.length > 0)
  return readable.length > 0 ? readable.join('-') : pokemon
}

export function normalizeArtofPkmStem(stem: string, pokemonSlug: string): string {
  return normalizeArtofPkmStemInternal(stem, pokemonSlug, true)
}

function imageDirectoryAndFilename(sourceKey: string): { directory: string; filename: string } {
  const relative = sourceRelativeKey(sourceKey)
  const separator = relative.lastIndexOf('/')
  return separator < 0
    ? { directory: '', filename: relative }
    : { directory: relative.slice(0, separator), filename: relative.slice(separator + 1) }
}

/** Return the canonical source filename, retaining the original source extension. */
export function canonicalPokemonSourceKey(sourceKey: string, ordinal?: number): string {
  const { directory, filename } = imageDirectoryAndFilename(sourceKey)
  const stem = stripR2ImageExtensions(filename)
  const directoryParts = directory.split('/').filter(Boolean)
  const isArtofPkm = directoryParts[0] === 'artofpkm'
  const pokemonSlug = isArtofPkm ? (directoryParts[1] ?? 'pokemon') : ''
  const normalizedStem = isArtofPkm ? normalizeArtofPkmStem(stem, pokemonSlug) : slugify(stem)
  return canonicalPokemonSourceKeyWithStem(sourceKey, normalizedStem, ordinal)
}

function canonicalPokemonSourceKeyWithStem(
  sourceKey: string,
  normalizedStem: string,
  ordinal?: number
): string {
  const { directory, filename } = imageDirectoryAndFilename(sourceKey)
  const directoryParts = directory.split('/').filter(Boolean)
  const numberedStem =
    ordinal !== undefined && ordinal > 0 ? `${normalizedStem}-${ordinal}` : normalizedStem
  const relative = [...directoryParts, `${numberedStem}${sourceExtension(filename)}`].join('/')
  return `pokemon/${relative}`
}

/**
 * Build one stable source-key mapping for a complete R2 source inventory.
 * Only ArtofPkm names are rewritten; other source objects remain unchanged.
 */
export function buildPokemonImageSourceKeyMap(sourceKeys: readonly string[]): Map<string, string> {
  const eligible = sourceKeys
    .map((key) => key.replace(/\\/g, '/').replace(/^\/+/, ''))
    .filter((key) => key.startsWith('pokemon/') && R2_IMAGE_EXTENSIONS.test(key))
  const artofPkm = eligible.filter((key) => key.startsWith('pokemon/artofpkm/'))
  const groups = new Map<string, string[]>()

  for (const sourceKey of artofPkm) {
    const canonical = canonicalPokemonSourceKey(sourceKey)
    const groupKey = canonical.slice(0, canonical.lastIndexOf('.'))
    const group = groups.get(groupKey) ?? []
    group.push(sourceKey)
    groups.set(groupKey, group)
  }

  const mapping = new Map<string, string>()
  const reserved = new Set(
    [...groups.entries()].filter(([, group]) => group.length === 1).map(([groupKey]) => groupKey)
  )
  const used = new Set(reserved)
  for (const sourceKey of eligible) {
    if (!sourceKey.startsWith('pokemon/artofpkm/')) {
      mapping.set(sourceKey, sourceKey)
      continue
    }

    const canonical = canonicalPokemonSourceKey(sourceKey)
    const groupKey = canonical.slice(0, canonical.lastIndexOf('.'))
    const group = [...(groups.get(groupKey) ?? [sourceKey])].sort()
    if (group.length === 1) {
      mapping.set(sourceKey, canonical)
      continue
    }

    const directory = canonical.slice(0, canonical.lastIndexOf('/'))
    const base = groupKey.slice(groupKey.lastIndexOf('/') + 1)
    let ordinal = group.indexOf(sourceKey) + 1
    let destinationStem = `${base}-${ordinal}`
    while (used.has(`${directory}/${destinationStem}`)) {
      ordinal += 1
      destinationStem = `${base}-${ordinal}`
    }
    used.add(`${directory}/${destinationStem}`)
    mapping.set(sourceKey, canonicalPokemonSourceKey(sourceKey, ordinal))
  }

  return mapping
}

/** Translate references written before the canonical names were uploaded. */
export function buildLegacyPokemonImageSourceKeyMap(
  sourceKeys: readonly string[]
): Map<string, string> {
  const eligible = sourceKeys
    .map((key) => key.replace(/\\/g, '/').replace(/^\/+/, ''))
    .filter((key) => key.startsWith('pokemon/') && R2_IMAGE_EXTENSIONS.test(key))
  const groups = new Map<string, string[]>()

  for (const sourceKey of eligible.filter((key) => key.startsWith('pokemon/artofpkm/'))) {
    const { directory, filename } = imageDirectoryAndFilename(sourceKey)
    const directoryParts = directory.split('/').filter(Boolean)
    const stem = normalizeArtofPkmStemInternal(
      stripR2ImageExtensions(filename),
      directoryParts[1] ?? 'pokemon',
      false
    )
    const groupKey = `pokemon/${directory}/${stem}`
    const group = groups.get(groupKey) ?? []
    group.push(sourceKey)
    groups.set(groupKey, group)
  }

  const mapping = new Map<string, string>()
  for (const sourceKey of eligible) {
    if (!sourceKey.startsWith('pokemon/artofpkm/')) {
      mapping.set(sourceKey, sourceKey)
      continue
    }
    const { directory, filename } = imageDirectoryAndFilename(sourceKey)
    const directoryParts = directory.split('/').filter(Boolean)
    const stem = normalizeArtofPkmStemInternal(
      stripR2ImageExtensions(filename),
      directoryParts[1] ?? 'pokemon',
      false
    )
    const groupKey = `pokemon/${directory}/${stem}`
    const group = [...(groups.get(groupKey) ?? [sourceKey])].sort()
    const ordinal = group.length > 1 ? group.indexOf(sourceKey) + 1 : undefined
    mapping.set(sourceKey, canonicalPokemonSourceKeyWithStem(sourceKey, stem, ordinal))
  }
  return mapping
}

/** Build a canonical v1 WebP object key from a source object key. */
export function pokemonImageVariantObjectKey(
  sourceKey: string,
  variant: 'small' | 'large',
  sourceKeyMap?: ReadonlyMap<string, string>
): string {
  const normalizedSourceKey = sourceKey.replace(/\\/g, '/').replace(/^\/+/, '')
  const mappedSourceKey = sourceKeyMap?.get(normalizedSourceKey) ?? normalizedSourceKey
  const relative = sourceRelativeKey(mappedSourceKey)
  return `v1/images/pokemon/${variant}/${stripR2ImageExtensions(relative)}.webp`
}
