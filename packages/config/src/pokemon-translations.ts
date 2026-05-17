/** PokéAPI `language.name` codes used for species names (excluding English — use catalog `name`). */
export const POKEMON_TRANSLATION_LANGUAGE_CODES = [
  'cs',
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ja-hrkt',
  'ja-roma',
  'ko',
  'pt-br',
  'zh-hans',
  'zh-hant',
] as const

export type PokemonTranslationLanguageCode = (typeof POKEMON_TRANSLATION_LANGUAGE_CODES)[number]

export type PokemonTranslations = Record<PokemonTranslationLanguageCode, string>

export const POKEMON_TRANSLATION_LABELS: Record<PokemonTranslationLanguageCode, string> = {
  cs: 'Czech',
  de: 'German',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
  ja: 'Japanese',
  'ja-hrkt': 'Japanese (Kana)',
  'ja-roma': 'Japanese (Romaji)',
  ko: 'Korean',
  'pt-br': 'Portuguese (Brazil)',
  'zh-hans': 'Chinese (Simplified)',
  'zh-hant': 'Chinese (Traditional)',
}

export function createEmptyPokemonTranslations(): PokemonTranslations {
  return Object.fromEntries(
    POKEMON_TRANSLATION_LANGUAGE_CODES.map((code) => [code, ''])
  ) as PokemonTranslations
}

export function getPokemonTranslationValues(translations: PokemonTranslations): string[] {
  return POKEMON_TRANSLATION_LANGUAGE_CODES.map((code) => translations[code]).filter(
    (value) => value.length > 0
  )
}

export type PokemonLocalizedNameEntry = {
  languageCode: PokemonTranslationLanguageCode
  language: string
  name: string
}

/** Non-empty localized names for UI (excludes English; see catalog `name`). */
export function getPokemonLocalizedNames(
  translations: PokemonTranslations
): PokemonLocalizedNameEntry[] {
  return POKEMON_TRANSLATION_LANGUAGE_CODES.flatMap((languageCode) => {
    const name = translations[languageCode]
    if (!name) {
      return []
    }

    return [
      {
        languageCode,
        language: POKEMON_TRANSLATION_LABELS[languageCode],
        name,
      },
    ]
  })
}
