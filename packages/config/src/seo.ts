import { BRAND } from './site'

export const SEO_KEYWORD_GROUPS = {
  cuteBrand: [
    'cute pokemon cards for sale',
    'pink pokemon card collection',
    'kawaii pokemon cards',
    'aesthetic pokemon card binder',
    'pastel fairy type cards',
    'adorable baby shiny pokemon',
    'cute pokemon cards',
    'girly pokemon cards',
    'cute pokemon tcg shop',
  ],
  speciesMoats: [
    'sylveon card shop',
    'mimikyu illustration rare',
    'maushold family cards',
    'eevee evolution full arts',
    'jigglypuff reverse holos',
    'togepi baby shinies',
    'espurr card collection',
    'jirachi star cards',
    'gardevoir art rare cards',
    'milotic beautiful pokemon card',
    'pumpkaboo halloween pokemon cards',
    'greavard ghost dog pokemon card',
    'eeveelution collector cards',
  ],
  pinkPalace: [
    'pink pokemon cards',
    'sylveon collection',
    'pastel tcg',
    'fairy pokemon card binder',
  ],
  flowerGarden: ['floral pokemon cards', 'leafeon ar', 'comfey cards', 'shaymin land forme cards'],
  spaceAndDreams: [
    'jirachi cards',
    'starry pokemon cards',
    'cosmog collection',
    'dreamy pokemon cards',
  ],
  cozyAndSoft: [
    'fluffy pokemon',
    'teddiursa cards',
    'cozy card binder',
    'soft aesthetic pokemon cards',
  ],
  babyAndTiny: ['baby pokemon cards', 'baby shiny pokemon', 'tiny cute pokemon cards'],
  elegantAndFeminine: [
    'elegant pokemon cards',
    'feminine pokemon card collection',
    'pokemon special illustration rare',
  ],
  spookyCute: ['spooky cute pokemon cards', 'ghost pokemon cute collection', 'mimikyu fan cards'],
  eeveelutions: [
    'eeveelution cards',
    'eevee evolution cards',
    'sylveon espeon glaceon leafeon cards',
  ],
  rarity: [
    'Scarlet & Violet Illustration Rare cards',
    'Art Rare pokemon collection',
    'Japanese waifu cards',
    'CHV (Chinese) pokemon cards',
    'Special Illustration Rare (SIR) price guide',
  ],
  languages: ['english pokemon cards', 'japanese pokemon cards', 'chinese pokemon cards'],
  collectors: [
    'pokemon card shop',
    'pokemon card collector',
    'pokemon tcg puerto rico',
    'pokemon card live shopping',
  ],
  blog: ['pokemon card blog', 'pokemon tcg updates', 'pokemon collecting tips'],
} as const

export type SpeciesCollectionSlug =
  | 'pink-brigade'
  | 'tiny-and-adorable'
  | 'dreamy-and-ethereal'
  | 'pink-pastel-icons'
  | 'baby-and-tiny'
  | 'elegant-and-feminine'
  | 'spooky-cute'
  | 'eeveelution-core'

export type SpeciesKeywordConfig = {
  slug: string
  name: string
  titleName?: string
  collection: SpeciesCollectionSlug
  translations: string[]
  relatedKeywords: string[]
  relatedEntities?: string[]
  /** Primary Pokémon types from PokéAPI (e.g. ["Fairy"], ["Ghost", "Fairy"]) */
  types?: string[]
  /** Pokédex generation number the species was introduced in (1–9) */
  generation?: number
}

type SpeciesSeoConfigInput = {
  siteName?: string
  includeKeywordGroups?: boolean
  customKeywords?: string[]
}

type PostKeywordConfigInput = {
  title: string
  tags?: string[]
  species?: string[]
  keywords?: string[]
}

export const SPECIES_COLLECTIONS = {
  'pink-brigade': {
    slug: 'pink-brigade',
    title: 'The Pink Brigade',
    description: 'Pink and pastel favorites that fit the Pink Binder brand.',
    featuredSpecies: ['Clefairy', 'Sylveon', 'Slowpoke', 'Jigglypuff', 'Eevee'],
  },
  'tiny-and-adorable': {
    slug: 'tiny-and-adorable',
    title: 'Tiny & Adorable',
    description: 'Small, playful, and family-friendly Pokémon card collections.',
    featuredSpecies: ['Maushold', 'Pawmi', 'Cutiefly', 'Togepi'],
  },
  'dreamy-and-ethereal': {
    slug: 'dreamy-and-ethereal',
    title: 'Dreamy & Ethereal',
    description: 'Soft, magical, and collector-focused Pokémon species hubs.',
    featuredSpecies: ['Jirachi', 'Cresselia', 'Mew', 'Mimikyu', 'Espurr'],
  },
  'pink-pastel-icons': {
    slug: 'pink-pastel-icons',
    title: 'Pink & Pastel Icons',
    description: 'Highest-volume pink, pastel, fairy, and heart-themed Pokémon collections.',
    featuredSpecies: ['Sylveon', 'Mew', 'Jigglypuff', 'Clefairy', 'Alcremie'],
  },
  'baby-and-tiny': {
    slug: 'baby-and-tiny',
    title: 'Baby & Tiny Collection',
    description: 'Round, tiny, baby, and high-aesthetic Pokémon species for the aww niche.',
    featuredSpecies: ['Maushold', 'Togepi', 'Pichu', 'Teddiursa', 'Pawmi'],
  },
  'elegant-and-feminine': {
    slug: 'elegant-and-feminine',
    title: 'Elegant & Feminine Meta',
    description: 'Elegant, refined species tied to premium AR and SIR collector demand.',
    featuredSpecies: ['Gardevoir', 'Milotic', 'Altaria', 'Diancie', 'Cresselia'],
  },
  'spooky-cute': {
    slug: 'spooky-cute',
    title: 'Spooky-Cute Niche',
    description: 'Ghost and psychic favorites with loyal spooky-cute fanbases.',
    featuredSpecies: ['Mimikyu', 'Espurr', 'Meowstic', 'Misdreavus', 'Pumpkaboo'],
  },
  'eeveelution-core': {
    slug: 'eeveelution-core',
    title: 'Eeveelution Core',
    description: 'Mandatory Eevee and top Eeveelution species for cute collector traffic.',
    featuredSpecies: ['Eevee', 'Sylveon', 'Espeon', 'Glaceon', 'Leafeon'],
  },
} as const satisfies Record<
  SpeciesCollectionSlug,
  {
    slug: SpeciesCollectionSlug
    title: string
    description: string
    featuredSpecies: string[]
  }
>

const SPECIES_COLLECTION_KEYWORDS: Record<SpeciesCollectionSlug, string[]> = {
  'pink-brigade': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.pinkPalace],
  'tiny-and-adorable': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.babyAndTiny],
  'dreamy-and-ethereal': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.spaceAndDreams],
  'pink-pastel-icons': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.pinkPalace],
  'baby-and-tiny': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.babyAndTiny],
  'elegant-and-feminine': [
    ...SEO_KEYWORD_GROUPS.cuteBrand,
    ...SEO_KEYWORD_GROUPS.elegantAndFeminine,
  ],
  'spooky-cute': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.spookyCute],
  'eeveelution-core': [...SEO_KEYWORD_GROUPS.cuteBrand, ...SEO_KEYWORD_GROUPS.eeveelutions],
}

const SPECIES_KEYWORD_SEEDS: SpeciesKeywordConfig[] = [
  // ─── Eeveelution Core ───────────────────────────────────────────────────────
  {
    slug: 'eevee',
    name: 'Eevee',
    titleName: 'Eevee & Evolution',
    collection: 'eeveelution-core',
    translations: ['イーブイ', '伊布'],
    relatedKeywords: ['eevee evolution full arts', 'cute eevee cards'],
    relatedEntities: ['Sylveon', 'Espeon', 'Vaporeon'],
    types: ['Normal'],
    generation: 1,
  },
  {
    slug: 'sylveon',
    name: 'Sylveon',
    titleName: 'Sylveon & Eeveelution',
    collection: 'eeveelution-core',
    translations: ['ニンフィア', '仙子伊布'],
    relatedKeywords: ['sylveon card shop', 'eeveelution cute cards', 'fairy type sylveon cards'],
    relatedEntities: ['Eevee', 'Espeon', 'Glaceon'],
    types: ['Fairy'],
    generation: 6,
  },
  {
    slug: 'espeon',
    name: 'Espeon',
    collection: 'eeveelution-core',
    translations: ['エーフィ', '太阳伊布'],
    relatedKeywords: ['espeon cards', 'psychic eeveelution cards'],
    relatedEntities: ['Eevee', 'Sylveon', 'Glaceon'],
    types: ['Psychic'],
    generation: 2,
  },
  {
    slug: 'glaceon',
    name: 'Glaceon',
    collection: 'eeveelution-core',
    translations: ['グレイシア', '冰伊布'],
    relatedKeywords: ['glaceon cards', 'elegant blue pokemon cards'],
    relatedEntities: ['Eevee', 'Leafeon', 'Sylveon'],
    types: ['Ice'],
    generation: 4,
  },
  {
    slug: 'leafeon',
    name: 'Leafeon',
    collection: 'eeveelution-core',
    translations: ['リーフィア', '叶伊布'],
    relatedKeywords: ['leafeon cards', 'leafeon art rare cards'],
    relatedEntities: ['Eevee', 'Glaceon', 'Shaymin'],
    types: ['Grass'],
    generation: 4,
  },
  {
    slug: 'vaporeon',
    name: 'Vaporeon',
    collection: 'eeveelution-core',
    translations: ['シャワーズ', '水伊布'],
    relatedKeywords: ['vaporeon cards', 'water eeveelution cards'],
    relatedEntities: ['Eevee', 'Glaceon', 'Sylveon'],
    types: ['Water'],
    generation: 1,
  },
  {
    slug: 'flareon',
    name: 'Flareon',
    collection: 'eeveelution-core',
    translations: ['ブースター', '火伊布'],
    relatedKeywords: ['flareon cards', 'fire eeveelution cards'],
    relatedEntities: ['Eevee', 'Espeon', 'Sylveon'],
    types: ['Fire'],
    generation: 1,
  },
  {
    slug: 'jolteon',
    name: 'Jolteon',
    collection: 'eeveelution-core',
    translations: ['サンダース', '雷伊布'],
    relatedKeywords: ['jolteon cards', 'electric eeveelution cards'],
    relatedEntities: ['Eevee', 'Espeon', 'Pichu'],
    types: ['Electric'],
    generation: 1,
  },
  {
    slug: 'umbreon',
    name: 'Umbreon',
    collection: 'eeveelution-core',
    translations: ['ブラッキー', '月亮伊布'],
    relatedKeywords: ['umbreon cards', 'umbreon moonlight collection', 'dark eeveelution cards'],
    relatedEntities: ['Eevee', 'Espeon', 'Sylveon'],
    types: ['Dark'],
    generation: 2,
  },
  // ─── Pink & Pastel Icons ─────────────────────────────────────────────────────
  {
    slug: 'jigglypuff',
    name: 'Jigglypuff',
    collection: 'pink-pastel-icons',
    translations: ['プリン', '胖丁'],
    relatedKeywords: ['jigglypuff reverse holos', 'cute jigglypuff cards'],
    relatedEntities: ['Clefairy', 'Sylveon', 'Wigglytuff'],
    types: ['Normal', 'Fairy'],
    generation: 1,
  },
  {
    slug: 'wigglytuff',
    name: 'Wigglytuff',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['wigglytuff cute cards', 'pink wigglytuff pokemon cards'],
    relatedEntities: ['Jigglypuff', 'Clefable', 'Igglybuff'],
    types: ['Normal', 'Fairy'],
    generation: 1,
  },
  {
    slug: 'clefairy',
    name: 'Clefairy',
    collection: 'pink-pastel-icons',
    translations: ['ピッピ', '皮皮'],
    relatedKeywords: ['clefairy card collection', 'pastel clefairy cards'],
    relatedEntities: ['Clefable', 'Cleffa', 'Sylveon'],
    types: ['Normal', 'Fairy'],
    generation: 1,
  },
  {
    slug: 'clefable',
    name: 'Clefable',
    collection: 'pink-pastel-icons',
    translations: ['ピクシー', '皮可西'],
    relatedKeywords: ['clefable pokemon cards', 'cute clefable cards'],
    relatedEntities: ['Clefairy', 'Cleffa'],
    types: ['Normal', 'Fairy'],
    generation: 1,
  },
  {
    slug: 'mew',
    name: 'Mew',
    collection: 'pink-pastel-icons',
    translations: ['ミュウ', '梦幻'],
    relatedKeywords: ['mew bubble card', 'mew corocoro promo', 'cute mew cards'],
    relatedEntities: ['Jirachi', 'Cresselia'],
    types: ['Psychic'],
    generation: 1,
  },
  {
    slug: 'slowpoke',
    name: 'Slowpoke',
    collection: 'pink-pastel-icons',
    translations: ['ヤドン', '呆呆兽'],
    relatedKeywords: ['slowpoke cute cards', 'derpy slowpoke collection'],
    relatedEntities: ['Mew', 'Sylveon'],
    types: ['Water', 'Psychic'],
    generation: 1,
  },
  {
    slug: 'chansey',
    name: 'Chansey',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['chansey pokemon cards', 'pink chansey cards'],
    relatedEntities: ['Blissey', 'Clefable'],
    types: ['Normal'],
    generation: 1,
  },
  {
    slug: 'blissey',
    name: 'Blissey',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['blissey pokemon cards', 'cute blissey card collection'],
    relatedEntities: ['Chansey', 'Happiny'],
    types: ['Normal'],
    generation: 2,
  },
  {
    slug: 'alomomola',
    name: 'Alomomola',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['alomomola card collection', 'heart shaped pokemon cards'],
    relatedEntities: ['Luvdisc', 'Mew'],
    types: ['Water'],
    generation: 5,
  },
  {
    slug: 'luvdisc',
    name: 'Luvdisc',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['luvdisc pokemon cards', 'heart pokemon card binder'],
    relatedEntities: ['Alomomola', 'Sylveon'],
    types: ['Water'],
    generation: 3,
  },
  {
    slug: 'hatenna',
    name: 'Hatenna',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['hatenna cards', 'cute hatenna pokemon card'],
    relatedEntities: ['Hattrem', 'Hatterene'],
    types: ['Psychic'],
    generation: 8,
  },
  {
    slug: 'hattrem',
    name: 'Hattrem',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['hattrem cards', 'pink psychic pokemon cards'],
    relatedEntities: ['Hatenna', 'Hatterene'],
    types: ['Psychic'],
    generation: 8,
  },
  {
    slug: 'hatterene',
    name: 'Hatterene',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['hatterene cards', 'cute witch pokemon cards'],
    relatedEntities: ['Hatenna', 'Hattrem'],
    types: ['Psychic', 'Fairy'],
    generation: 8,
  },
  {
    slug: 'milcery',
    name: 'Milcery',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['milcery cards', 'dessert pokemon cards'],
    relatedEntities: ['Alcremie', 'Sylveon'],
    types: ['Fairy'],
    generation: 8,
  },
  {
    slug: 'alcremie',
    name: 'Alcremie',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['alcremie cards', 'dessert aesthetic pokemon cards'],
    relatedEntities: ['Milcery', 'Sylveon'],
    types: ['Fairy'],
    generation: 8,
  },
  {
    slug: 'snubbull',
    name: 'Snubbull',
    collection: 'pink-pastel-icons',
    translations: ['ブルー', '布鲁'],
    relatedKeywords: ['snubbull cards', 'pink bulldog pokemon cards'],
    relatedEntities: ['Granbull', 'Clefairy'],
    types: ['Fairy'],
    generation: 2,
  },
  {
    slug: 'granbull',
    name: 'Granbull',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['granbull cards', 'pink fairy bulldog pokemon cards'],
    relatedEntities: ['Snubbull', 'Hatterene'],
    types: ['Fairy'],
    generation: 2,
  },
  {
    slug: 'marill',
    name: 'Marill',
    collection: 'pink-pastel-icons',
    translations: ['マリル', '玛力露'],
    relatedKeywords: ['marill cards', 'blue fairy pokemon cards'],
    relatedEntities: ['Azumarill', 'Jigglypuff'],
    types: ['Water', 'Fairy'],
    generation: 2,
  },
  {
    slug: 'azumarill',
    name: 'Azumarill',
    collection: 'pink-pastel-icons',
    translations: ['マリルリ', '玛力露丽'],
    relatedKeywords: ['azumarill cards', 'water fairy pokemon cards'],
    relatedEntities: ['Marill', 'Sylveon'],
    types: ['Water', 'Fairy'],
    generation: 2,
  },
  {
    slug: 'audino',
    name: 'Audino',
    collection: 'pink-pastel-icons',
    translations: ['tabunne', '差不多娃娃'],
    relatedKeywords: ['audino cards', 'pink healer pokemon cards'],
    relatedEntities: ['Chansey', 'Clefairy'],
    types: ['Normal'],
    generation: 5,
  },
  {
    slug: 'spritzee',
    name: 'Spritzee',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['spritzee cards', 'pink perfume fairy pokemon cards'],
    relatedEntities: ['Aromatisse', 'Sylveon'],
    types: ['Fairy'],
    generation: 6,
  },
  {
    slug: 'aromatisse',
    name: 'Aromatisse',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['aromatisse cards', 'fairy pink pokemon cards'],
    relatedEntities: ['Spritzee', 'Sylveon'],
    types: ['Fairy'],
    generation: 6,
  },
  {
    slug: 'swirlix',
    name: 'Swirlix',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['swirlix cards', 'cotton candy pokemon cards'],
    relatedEntities: ['Slurpuff', 'Milcery'],
    types: ['Fairy'],
    generation: 6,
  },
  {
    slug: 'slurpuff',
    name: 'Slurpuff',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['slurpuff cards', 'dessert fairy pokemon cards'],
    relatedEntities: ['Swirlix', 'Alcremie'],
    types: ['Fairy'],
    generation: 6,
  },
  {
    slug: 'flabebe',
    name: 'Flabébé',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['flabebe cards', 'tiny flower fairy pokemon cards'],
    relatedEntities: ['Floette', 'Florges'],
    types: ['Fairy'],
    generation: 6,
  },
  {
    slug: 'floette',
    name: 'Floette',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['floette cards', 'flower fairy pokemon cards'],
    relatedEntities: ['Flabébé', 'Florges'],
    types: ['Fairy'],
    generation: 6,
  },
  {
    slug: 'florges',
    name: 'Florges',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['florges cards', 'flower queen pokemon cards'],
    relatedEntities: ['Floette', 'Lilligant'],
    types: ['Fairy'],
    generation: 6,
  },
  // ─── Baby & Tiny ─────────────────────────────────────────────────────────────
  {
    slug: 'cleffa',
    name: 'Cleffa',
    collection: 'baby-and-tiny',
    translations: ['ピィ', '宝宝丁'],
    relatedKeywords: ['cleffa baby pokemon cards', 'cleffa shiny cards'],
    relatedEntities: ['Clefairy', 'Igglybuff'],
    types: ['Normal', 'Fairy'],
    generation: 2,
  },
  {
    slug: 'igglybuff',
    name: 'Igglybuff',
    collection: 'baby-and-tiny',
    translations: ['ププリン', '宝宝波'],
    relatedKeywords: ['igglybuff baby cards', 'igglybuff shiny cards'],
    relatedEntities: ['Jigglypuff', 'Cleffa'],
    types: ['Normal', 'Fairy'],
    generation: 2,
  },
  {
    slug: 'togepi',
    name: 'Togepi',
    collection: 'baby-and-tiny',
    translations: ['トゲピー', '波克比'],
    relatedKeywords: ['togepi baby shinies', 'cute togepi cards'],
    relatedEntities: ['Togetic', 'Togekiss'],
    types: ['Normal', 'Fairy'],
    generation: 2,
  },
  {
    slug: 'togetic',
    name: 'Togetic',
    collection: 'baby-and-tiny',
    translations: ['トゲチック', '波克基古'],
    relatedKeywords: ['togetic cards', 'cute togetic pokemon cards'],
    relatedEntities: ['Togepi', 'Togekiss'],
    types: ['Normal', 'Fairy'],
    generation: 2,
  },
  {
    slug: 'pichu',
    name: 'Pichu',
    collection: 'baby-and-tiny',
    translations: ['ピチュー', '皮丘'],
    relatedKeywords: ['pichu baby cards', 'pichu shiny cards'],
    relatedEntities: ['Togepi', 'Cleffa'],
    types: ['Electric'],
    generation: 2,
  },
  {
    slug: 'teddiursa',
    name: 'Teddiursa',
    collection: 'baby-and-tiny',
    translations: ['ヒメグマ', '熊宝宝'],
    relatedKeywords: ['teddiursa cards', 'teddy bear pokemon cards'],
    relatedEntities: ['Skitty', 'Pichu'],
    types: ['Normal'],
    generation: 2,
  },
  {
    slug: 'happiny',
    name: 'Happiny',
    collection: 'baby-and-tiny',
    translations: ['ピンプク', '小福蛋'],
    relatedKeywords: ['happiny cards', 'baby chansey pokemon cards'],
    relatedEntities: ['Chansey', 'Cleffa'],
    types: ['Normal'],
    generation: 4,
  },
  {
    slug: 'buneary',
    name: 'Buneary',
    collection: 'baby-and-tiny',
    translations: ['ミミロル', '卷卷耳'],
    relatedKeywords: ['buneary cards', 'cute bunny pokemon cards'],
    relatedEntities: ['Lopunny', 'Minccino'],
    types: ['Normal'],
    generation: 4,
  },
  {
    slug: 'cutiefly',
    name: 'Cutiefly',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['cutiefly cards', 'tiny cute pokemon cards'],
    relatedEntities: ['Ribombee', 'Togepi'],
    types: ['Bug', 'Fairy'],
    generation: 7,
  },
  {
    slug: 'ribombee',
    name: 'Ribombee',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['ribombee cards', 'cute fairy bug pokemon cards'],
    relatedEntities: ['Cutiefly', 'Sylveon'],
    types: ['Bug', 'Fairy'],
    generation: 7,
  },
  {
    slug: 'tandemaus',
    name: 'Tandemaus',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['tandemaus cards', 'cute family mouse pokemon cards'],
    relatedEntities: ['Maushold', 'Pawmi'],
    types: ['Normal'],
    generation: 9,
  },
  {
    slug: 'maushold',
    name: 'Maushold',
    collection: 'baby-and-tiny',
    translations: ['イッカネズミ', '一家鼠'],
    relatedKeywords: ['maushold family cards', 'cute maushold cards'],
    relatedEntities: ['Tandemaus', 'Pawmi'],
    types: ['Normal'],
    generation: 9,
  },
  {
    slug: 'pawmi',
    name: 'Pawmi',
    collection: 'baby-and-tiny',
    translations: ['パモ', '布拨'],
    relatedKeywords: ['pawmi cards', 'cute pawmi card collection'],
    relatedEntities: ['Pawmo', 'Pawmot'],
    types: ['Electric'],
    generation: 9,
  },
  {
    slug: 'pawmo',
    name: 'Pawmo',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['pawmo cards', 'pawmo evolution cards'],
    relatedEntities: ['Pawmi', 'Pawmot'],
    types: ['Electric', 'Fighting'],
    generation: 9,
  },
  {
    slug: 'pawmot',
    name: 'Pawmot',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['pawmot cards', 'pawmi evolution line cards'],
    relatedEntities: ['Pawmi', 'Pawmo'],
    types: ['Electric', 'Fighting'],
    generation: 9,
  },
  {
    slug: 'minccino',
    name: 'Minccino',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['minccino cards', 'fluffy pokemon cards'],
    relatedEntities: ['Cinccino', 'Skitty'],
    types: ['Normal'],
    generation: 5,
  },
  {
    slug: 'cinccino',
    name: 'Cinccino',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['cinccino cards', 'fluff aesthetic pokemon cards'],
    relatedEntities: ['Minccino', 'Skitty'],
    types: ['Normal'],
    generation: 5,
  },
  {
    slug: 'skitty',
    name: 'Skitty',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['skitty cards', 'cute cat pokemon cards'],
    relatedEntities: ['Delcatty', 'Teddiursa'],
    types: ['Normal'],
    generation: 3,
  },
  {
    slug: 'delcatty',
    name: 'Delcatty',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['delcatty cards', 'cute cat pokemon card collection'],
    relatedEntities: ['Skitty', 'Sylveon'],
    types: ['Normal'],
    generation: 3,
  },
  {
    slug: 'snom',
    name: 'Snom',
    collection: 'baby-and-tiny',
    translations: ['ユキハミ', '雪汪汪'],
    relatedKeywords: ['snom cards', 'cute ice bug pokemon cards'],
    relatedEntities: ['Frosmoth', 'Cutiefly'],
    types: ['Ice', 'Bug'],
    generation: 8,
  },
  {
    slug: 'piplup',
    name: 'Piplup',
    collection: 'tiny-and-adorable',
    translations: ['ポッチャマ', '波加曼'],
    relatedKeywords: ['piplup cards', 'cute penguin pokemon cards', 'piplup starter cards'],
    relatedEntities: ['Primarina', 'Marill'],
    types: ['Water'],
    generation: 4,
  },
  // ─── Dreamy & Ethereal ───────────────────────────────────────────────────────
  {
    slug: 'jirachi',
    name: 'Jirachi',
    collection: 'dreamy-and-ethereal',
    translations: ['ジラーチ', '基拉祈'],
    relatedKeywords: ['jirachi star cards', 'cute jirachi cards'],
    relatedEntities: ['Mew', 'Cresselia', 'Victini'],
    types: ['Steel', 'Psychic'],
    generation: 3,
  },
  {
    slug: 'munna',
    name: 'Munna',
    collection: 'dreamy-and-ethereal',
    translations: [],
    relatedKeywords: ['munna cards', 'dreamy cloud pokemon cards'],
    relatedEntities: ['Musharna', 'Cresselia'],
    types: ['Psychic'],
    generation: 5,
  },
  {
    slug: 'musharna',
    name: 'Musharna',
    collection: 'dreamy-and-ethereal',
    translations: [],
    relatedKeywords: ['musharna cards', 'dream aesthetic pokemon cards'],
    relatedEntities: ['Munna', 'Cresselia'],
    types: ['Psychic'],
    generation: 5,
  },
  {
    slug: 'victini',
    name: 'Victini',
    collection: 'dreamy-and-ethereal',
    translations: ['ビクティニ', '比克提尼'],
    relatedKeywords: ['victini cards', 'victini victory pokemon cards', 'victini mythical cards'],
    relatedEntities: ['Jirachi', 'Mew'],
    types: ['Psychic', 'Fire'],
    generation: 5,
  },
  {
    slug: 'shaymin',
    name: 'Shaymin',
    collection: 'dreamy-and-ethereal',
    translations: ['シェイミ', '谢米'],
    relatedKeywords: ['shaymin land forme cards', 'cottagecore pokemon cards'],
    relatedEntities: ['Leafeon', 'Jirachi'],
    types: ['Grass'],
    generation: 4,
  },
  {
    slug: 'comfey',
    name: 'Comfey',
    collection: 'dreamy-and-ethereal',
    translations: [],
    relatedKeywords: ['comfey cards', 'flower pokemon card collection'],
    relatedEntities: ['Leafeon', 'Lilligant'],
    types: ['Fairy'],
    generation: 7,
  },
  {
    slug: 'cosmog',
    name: 'Cosmog',
    collection: 'dreamy-and-ethereal',
    translations: [],
    relatedKeywords: ['cosmog collection', 'starry pokemon cards'],
    relatedEntities: ['Jirachi', 'Cresselia'],
    types: ['Psychic'],
    generation: 7,
  },
  // ─── Elegant & Feminine ──────────────────────────────────────────────────────
  {
    slug: 'togekiss',
    name: 'Togekiss',
    collection: 'elegant-and-feminine',
    translations: ['トゲキッス', '波克基斯'],
    relatedKeywords: ['togekiss cards', 'elegant fairy pokemon cards'],
    relatedEntities: ['Togepi', 'Togetic'],
    types: ['Normal', 'Fairy'],
    generation: 4,
  },
  {
    slug: 'lopunny',
    name: 'Lopunny',
    collection: 'elegant-and-feminine',
    translations: ['ミミロップ', '长耳兔'],
    relatedKeywords: ['lopunny cards', 'elegant bunny pokemon cards'],
    relatedEntities: ['Buneary', 'Sylveon'],
    types: ['Normal'],
    generation: 4,
  },
  {
    slug: 'primarina',
    name: 'Primarina',
    collection: 'elegant-and-feminine',
    translations: ['アシレーヌ', '西瓦顿'],
    relatedKeywords: ['primarina cards', 'elegant mermaid pokemon cards'],
    relatedEntities: ['Milotic', 'Sylveon'],
    types: ['Water', 'Fairy'],
    generation: 7,
  },
  {
    slug: 'gardevoir',
    name: 'Gardevoir',
    collection: 'elegant-and-feminine',
    translations: ['サーナイト', '沙奈朵'],
    relatedKeywords: ['gardevoir art rare cards', 'gardevoir sir cards'],
    relatedEntities: ['Kirlia', 'Diancie'],
    types: ['Psychic', 'Fairy'],
    generation: 3,
  },
  {
    slug: 'kirlia',
    name: 'Kirlia',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['kirlia cards', 'kirlia art rare pokemon'],
    relatedEntities: ['Gardevoir', 'Diancie'],
    types: ['Psychic', 'Fairy'],
    generation: 3,
  },
  {
    slug: 'lilligant',
    name: 'Lilligant',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['lilligant cards', 'hisuian lilligant cards'],
    relatedEntities: ['Leafeon', 'Tsareena'],
    types: ['Grass'],
    generation: 5,
  },
  {
    slug: 'tsareena',
    name: 'Tsareena',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['tsareena cards', 'elegant pokemon cards'],
    relatedEntities: ['Lilligant', 'Milotic'],
    types: ['Grass'],
    generation: 7,
  },
  {
    slug: 'milotic',
    name: 'Milotic',
    collection: 'elegant-and-feminine',
    translations: ['ミロカロス', '美纳斯'],
    relatedKeywords: ['milotic beautiful pokemon card', 'milotic art rare'],
    relatedEntities: ['Cresselia', 'Altaria'],
    types: ['Water'],
    generation: 3,
  },
  {
    slug: 'altaria',
    name: 'Altaria',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['altaria cards', 'cloud bird pokemon cards'],
    relatedEntities: ['Milotic', 'Cresselia'],
    types: ['Dragon', 'Flying'],
    generation: 3,
  },
  {
    slug: 'cresselia',
    name: 'Cresselia',
    collection: 'elegant-and-feminine',
    translations: ['クレセリア', '克雷色利亚'],
    relatedKeywords: ['cresselia cards', 'dreamy cresselia pokemon cards'],
    relatedEntities: ['Mew', 'Jirachi'],
    types: ['Psychic'],
    generation: 4,
  },
  {
    slug: 'diancie',
    name: 'Diancie',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['diancie cards', 'princess jewel pokemon cards'],
    relatedEntities: ['Gardevoir', 'Kirlia'],
    types: ['Rock', 'Fairy'],
    generation: 6,
  },
  {
    slug: 'meloetta',
    name: 'Meloetta',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['meloetta cards', 'elegant psychic pokemon cards'],
    relatedEntities: ['Diancie', 'Cresselia'],
    types: ['Normal', 'Psychic'],
    generation: 5,
  },
  // ─── Spooky-Cute ─────────────────────────────────────────────────────────────
  {
    slug: 'mimikyu',
    name: 'Mimikyu',
    collection: 'spooky-cute',
    translations: ['ミミッキュ', '谜拟丘'],
    relatedKeywords: ['mimikyu illustration rare', 'mimikyu art rare cards'],
    relatedEntities: ['Espurr', 'Misdreavus'],
    types: ['Ghost', 'Fairy'],
    generation: 7,
  },
  {
    slug: 'espurr',
    name: 'Espurr',
    collection: 'spooky-cute',
    translations: ['ニャスパー', '妙喵'],
    relatedKeywords: ['espurr card collection', 'cute espurr cards'],
    relatedEntities: ['Meowstic', 'Mimikyu'],
    types: ['Psychic'],
    generation: 6,
  },
  {
    slug: 'meowstic',
    name: 'Meowstic',
    collection: 'spooky-cute',
    translations: [],
    relatedKeywords: ['meowstic cards', 'cute spooky psychic pokemon cards'],
    relatedEntities: ['Espurr', 'Mimikyu'],
    types: ['Psychic'],
    generation: 6,
  },
  {
    slug: 'misdreavus',
    name: 'Misdreavus',
    collection: 'spooky-cute',
    translations: [],
    relatedKeywords: ['misdreavus cards', 'spooky cute ghost pokemon cards'],
    relatedEntities: ['Mimikyu', 'Pumpkaboo'],
    types: ['Ghost'],
    generation: 2,
  },
  {
    slug: 'greavard',
    name: 'Greavard',
    collection: 'spooky-cute',
    translations: [],
    relatedKeywords: ['greavard ghost dog pokemon card', 'greavard cards'],
    relatedEntities: ['Mimikyu', 'Pumpkaboo'],
    types: ['Ghost'],
    generation: 9,
  },
  {
    slug: 'pumpkaboo',
    name: 'Pumpkaboo',
    collection: 'spooky-cute',
    translations: [],
    relatedKeywords: ['pumpkaboo halloween pokemon cards', 'pumpkaboo fall pokemon cards'],
    relatedEntities: ['Misdreavus', 'Greavard'],
    types: ['Ghost', 'Grass'],
    generation: 6,
  },
  {
    slug: 'litwick',
    name: 'Litwick',
    collection: 'spooky-cute',
    translations: ['ヒトモシ', '蜡火'],
    relatedKeywords: ['litwick cards', 'cute candle ghost pokemon cards'],
    relatedEntities: ['Mimikyu', 'Misdreavus'],
    types: ['Ghost', 'Fire'],
    generation: 5,
  },
  {
    slug: 'froslass',
    name: 'Froslass',
    collection: 'spooky-cute',
    translations: ['ユキメノコ', '雪妖女'],
    relatedKeywords: ['froslass cards', 'ice ghost pokemon cards'],
    relatedEntities: ['Mimikyu', 'Misdreavus'],
    types: ['Ice', 'Ghost'],
    generation: 4,
  },
  {
    slug: 'frosmoth',
    name: 'Frosmoth',
    collection: 'spooky-cute',
    translations: ['モスノウ', '雪蛾女'],
    relatedKeywords: ['frosmoth cards', 'elegant ice moth pokemon cards'],
    relatedEntities: ['Snom', 'Froslass'],
    types: ['Ice', 'Bug'],
    generation: 8,
  },
  {
    slug: 'gengar',
    name: 'Gengar',
    collection: 'spooky-cute',
    translations: ['ゲンガー', '耿鬼'],
    relatedKeywords: ['gengar cards', 'gengar illustration rare', 'cute ghost pokemon cards'],
    relatedEntities: ['Mimikyu', 'Misdreavus'],
    types: ['Ghost', 'Poison'],
    generation: 1,
  },
]

export const SPECIES_KEYWORD_CONFIGS = Object.fromEntries(
  SPECIES_KEYWORD_SEEDS.map((species) => [species.slug, species])
) as Record<string, SpeciesKeywordConfig>

const GENERATION_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'] as const

/** Returns a human-readable generation label like "Generation VI". */
export function generationLabel(gen: number): string {
  const roman = GENERATION_ROMAN[gen - 1] ?? String(gen)
  return `Generation ${roman}`
}

/** Shared SEO defaults for the landing page and sitewide marketing metadata. */
export const LANDING_SEO = {
  description:
    'Pink Binder is a cute Pokémon card shop and content brand for pink Pokémon card collections, kawaii binder finds, pastel fairy cards, baby shinies, and illustration rares in English, Japanese, and Chinese.',
  keywords: uniqueKeywords([
    ...SEO_KEYWORD_GROUPS.collectors,
    ...SEO_KEYWORD_GROUPS.cuteBrand,
    ...SEO_KEYWORD_GROUPS.pinkPalace,
    ...SEO_KEYWORD_GROUPS.flowerGarden,
    ...SEO_KEYWORD_GROUPS.spaceAndDreams,
    ...SEO_KEYWORD_GROUPS.cozyAndSoft,
    ...SEO_KEYWORD_GROUPS.babyAndTiny,
    ...SEO_KEYWORD_GROUPS.elegantAndFeminine,
    ...SEO_KEYWORD_GROUPS.spookyCute,
    ...SEO_KEYWORD_GROUPS.eeveelutions,
    ...SEO_KEYWORD_GROUPS.rarity,
    ...SEO_KEYWORD_GROUPS.languages,
    'pink binder pokemon',
    'girly pokemon cards',
    'pokemon card streamer',
  ]),
}

/** Shared SEO defaults for blog layouts and post discovery surfaces. */
export const BLOG_SEO = {
  description:
    'Pokémon card stories, collecting tips, and product updates from Pink Binder, with a focus on cute Pokémon cards, aesthetic binders, pastel fairy lines, baby shinies, reverse holos, and art or illustration rares.',
  keywords: uniqueKeywords([
    ...SEO_KEYWORD_GROUPS.blog,
    ...SEO_KEYWORD_GROUPS.cuteBrand,
    ...SEO_KEYWORD_GROUPS.pinkPalace,
    ...SEO_KEYWORD_GROUPS.flowerGarden,
    ...SEO_KEYWORD_GROUPS.spaceAndDreams,
    ...SEO_KEYWORD_GROUPS.cozyAndSoft,
    ...SEO_KEYWORD_GROUPS.babyAndTiny,
    ...SEO_KEYWORD_GROUPS.elegantAndFeminine,
    ...SEO_KEYWORD_GROUPS.spookyCute,
    ...SEO_KEYWORD_GROUPS.eeveelutions,
    ...SEO_KEYWORD_GROUPS.rarity,
    ...SEO_KEYWORD_GROUPS.languages,
    ...SEO_KEYWORD_GROUPS.speciesMoats,
    'pink binder blog',
    'pokemon card shop news',
  ]),
}

export const BLOG_INDEX_SEO = {
  title: 'Pokémon Card Blog: Cute Card Picks, Tips, and Updates',
  description:
    'Explore Pink Binder posts about cute Pokémon cards, pink Pokémon card collections, kawaii binder picks, fairy lines, baby shinies, reverse holos, and illustration rares in English, Japanese, and Chinese sets.',
  keywords: uniqueKeywords([
    ...BLOG_SEO.keywords,
    'pokemon card blog',
    'cute pokemon cards',
    'aesthetic pokemon card binder',
  ]),
}

export function getSpeciesKeywordConfig(species: string) {
  const lookupKey = normalizeLookupValue(species)

  return SPECIES_KEYWORD_SEEDS.find((entry) =>
    [entry.slug, entry.name, ...entry.translations, ...(entry.relatedEntities ?? [])]
      .map(normalizeLookupValue)
      .includes(lookupKey)
  )
}

export function createSpeciesPageSeoConfig(
  species: string | SpeciesKeywordConfig,
  options: SpeciesSeoConfigInput = {}
) {
  const resolved =
    typeof species === 'string'
      ? (getSpeciesKeywordConfig(species) ?? {
          slug: slugifySpecies(species),
          name: species,
          collection: 'dreamy-and-ethereal' as const,
          translations: [],
          relatedKeywords: [],
        })
      : species

  const siteName = options.siteName ?? BRAND.name
  const collection = SPECIES_COLLECTIONS[resolved.collection]
  const titleLead = resolved.titleName ?? resolved.name
  const collectionKeywords = SPECIES_COLLECTION_KEYWORDS[resolved.collection] ?? []

  return {
    slug: resolved.slug,
    name: resolved.name,
    collection,
    translations: resolved.translations,
    title: `${titleLead} Cute Cards | ${siteName}`,
    description: `Shop the cutest ${resolved.name} cards in English, Japanese, and Chinese. From rare Illustration Rares to shiny baby cards, we specialize in the pink and pastel side of Pokémon TCG. Fast shipping on all Fairy and Art Rare cards.`,
    heading: `The Ultimate ${resolved.name} Collection: Cute & Rare Cards`,
    keywords: uniqueKeywords([
      resolved.name,
      titleLead,
      ...resolved.translations,
      collection.title,
      ...resolved.relatedKeywords,
      ...(resolved.relatedEntities ?? []),
      ...(options.includeKeywordGroups === false ? [] : collectionKeywords),
      ...(options.includeKeywordGroups === false ? [] : SEO_KEYWORD_GROUPS.rarity),
      ...SEO_KEYWORD_GROUPS.languages,
      ...(options.customKeywords ?? []),
    ]),
  }
}

export function createPostKeywordConfig(input: PostKeywordConfigInput) {
  const matchedSpecies = uniqueSpecies([...(input.species ?? []), ...(input.tags ?? [])])

  return {
    matchedSpecies,
    keywords: uniqueKeywords([
      input.title,
      ...BLOG_SEO.keywords,
      ...(input.tags ?? []),
      ...(input.keywords ?? []),
      ...matchedSpecies.flatMap(
        (species) => createSpeciesPageSeoConfig(species, { includeKeywordGroups: false }).keywords
      ),
    ]),
  }
}

function uniqueKeywords(keywords: Iterable<string>) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const keyword of keywords) {
    const trimmed = keyword.trim()

    if (!trimmed) {
      continue
    }

    const key = trimmed.toLowerCase()

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(trimmed)
  }

  return result
}

function uniqueSpecies(species: string[]) {
  const seen = new Set<string>()
  const result: SpeciesKeywordConfig[] = []

  for (const entry of species) {
    const resolved = getSpeciesKeywordConfig(entry)

    if (!resolved || seen.has(resolved.slug)) {
      continue
    }

    seen.add(resolved.slug)
    result.push(resolved)
  }

  return result
}

function normalizeLookupValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[-_/]+/g, ' ')
}

function slugifySpecies(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'pokemon'
  )
}
