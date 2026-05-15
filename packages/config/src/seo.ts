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
  {
    slug: 'sylveon',
    name: 'Sylveon',
    titleName: 'Sylveon & Eeveelution',
    collection: 'pink-pastel-icons',
    translations: ['ニンフィア', '仙子伊布'],
    relatedKeywords: ['sylveon card shop', 'eeveelution cute cards', 'fairy type sylveon cards'],
    relatedEntities: ['Eevee', 'Clefairy'],
  },
  {
    slug: 'mimikyu',
    name: 'Mimikyu',
    collection: 'spooky-cute',
    translations: ['ミミッキュ', '谜拟丘'],
    relatedKeywords: ['mimikyu illustration rare', 'mimikyu art rare cards'],
    relatedEntities: ['Jirachi', 'Espurr'],
  },
  {
    slug: 'maushold',
    name: 'Maushold',
    collection: 'baby-and-tiny',
    translations: ['イッカネズミ', '一家鼠'],
    relatedKeywords: ['maushold family cards', 'cute maushold cards'],
    relatedEntities: ['Pawmi', 'Togepi'],
  },
  {
    slug: 'eevee',
    name: 'Eevee',
    titleName: 'Eevee & Evolution',
    collection: 'eeveelution-core',
    translations: ['イーブイ', '伊布'],
    relatedKeywords: ['eevee evolution full arts', 'cute eevee cards'],
    relatedEntities: ['Sylveon', 'Jigglypuff'],
  },
  {
    slug: 'jigglypuff',
    name: 'Jigglypuff',
    collection: 'pink-pastel-icons',
    translations: ['プリン', '胖丁'],
    relatedKeywords: ['jigglypuff reverse holos', 'cute jigglypuff cards'],
    relatedEntities: ['Clefairy', 'Sylveon'],
  },
  {
    slug: 'togepi',
    name: 'Togepi',
    collection: 'baby-and-tiny',
    translations: ['トゲピー', '波克比'],
    relatedKeywords: ['togepi baby shinies', 'cute togepi cards'],
    relatedEntities: ['Maushold', 'Jirachi'],
  },
  {
    slug: 'espurr',
    name: 'Espurr',
    collection: 'spooky-cute',
    translations: ['ニャスパー', '妙喵'],
    relatedKeywords: ['espurr card collection', 'cute espurr cards'],
    relatedEntities: ['Mimikyu', 'Jirachi'],
  },
  {
    slug: 'jirachi',
    name: 'Jirachi',
    collection: 'dreamy-and-ethereal',
    translations: ['ジラーチ', '基拉祈'],
    relatedKeywords: ['jirachi star cards', 'cute jirachi cards'],
    relatedEntities: ['Mew', 'Cresselia'],
  },
  {
    slug: 'wigglytuff',
    name: 'Wigglytuff',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['wigglytuff cute cards', 'pink wigglytuff pokemon cards'],
    relatedEntities: ['Jigglypuff', 'Clefable'],
  },
  {
    slug: 'clefairy',
    name: 'Clefairy',
    collection: 'pink-pastel-icons',
    translations: ['ピッピ', '皮皮'],
    relatedKeywords: ['clefairy card collection', 'pastel clefairy cards'],
    relatedEntities: ['Clefable', 'Cleffa', 'Sylveon'],
  },
  {
    slug: 'clefable',
    name: 'Clefable',
    collection: 'pink-pastel-icons',
    translations: ['ピクシー', '皮可西'],
    relatedKeywords: ['clefable pokemon cards', 'cute clefable cards'],
    relatedEntities: ['Clefairy', 'Cleffa'],
  },
  {
    slug: 'cleffa',
    name: 'Cleffa',
    collection: 'pink-pastel-icons',
    translations: ['ピィ', '宝宝丁'],
    relatedKeywords: ['cleffa baby pokemon cards', 'cleffa shiny cards'],
    relatedEntities: ['Clefairy', 'Togepi'],
  },
  {
    slug: 'mew',
    name: 'Mew',
    collection: 'pink-pastel-icons',
    translations: ['ミュウ', '梦幻'],
    relatedKeywords: ['mew bubble card', 'mew corocoro promo', 'cute mew cards'],
    relatedEntities: ['Jirachi', 'Cresselia'],
  },
  {
    slug: 'slowpoke',
    name: 'Slowpoke',
    collection: 'pink-pastel-icons',
    translations: ['ヤドン', '呆呆兽'],
    relatedKeywords: ['slowpoke cute cards', 'derpy slowpoke collection'],
    relatedEntities: ['Mew', 'Sylveon'],
  },
  {
    slug: 'chansey',
    name: 'Chansey',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['chansey pokemon cards', 'pink chansey cards'],
    relatedEntities: ['Blissey', 'Clefable'],
  },
  {
    slug: 'blissey',
    name: 'Blissey',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['blissey pokemon cards', 'cute blissey card collection'],
    relatedEntities: ['Chansey', 'Clefable'],
  },
  {
    slug: 'alomomola',
    name: 'Alomomola',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['alomomola card collection', 'heart shaped pokemon cards'],
    relatedEntities: ['Luvdisc', 'Mew'],
  },
  {
    slug: 'luvdisc',
    name: 'Luvdisc',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['luvdisc pokemon cards', 'heart pokemon card binder'],
    relatedEntities: ['Alomomola', 'Sylveon'],
  },
  {
    slug: 'hatenna',
    name: 'Hatenna',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['hatenna cards', 'cute hatenna pokemon card'],
    relatedEntities: ['Hattrem', 'Hatterene'],
  },
  {
    slug: 'hattrem',
    name: 'Hattrem',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['hattrem cards', 'pink psychic pokemon cards'],
    relatedEntities: ['Hatenna', 'Hatterene'],
  },
  {
    slug: 'hatterene',
    name: 'Hatterene',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['hatterene cards', 'cute witch pokemon cards'],
    relatedEntities: ['Hatenna', 'Hattrem'],
  },
  {
    slug: 'milcery',
    name: 'Milcery',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['milcery cards', 'dessert pokemon cards'],
    relatedEntities: ['Alcremie', 'Skitty'],
  },
  {
    slug: 'alcremie',
    name: 'Alcremie',
    collection: 'pink-pastel-icons',
    translations: [],
    relatedKeywords: ['alcremie cards', 'dessert aesthetic pokemon cards'],
    relatedEntities: ['Milcery', 'Sylveon'],
  },
  {
    slug: 'munna',
    name: 'Munna',
    collection: 'dreamy-and-ethereal',
    translations: [],
    relatedKeywords: ['munna cards', 'dreamy cloud pokemon cards'],
    relatedEntities: ['Musharna', 'Cresselia'],
  },
  {
    slug: 'musharna',
    name: 'Musharna',
    collection: 'dreamy-and-ethereal',
    translations: [],
    relatedKeywords: ['musharna cards', 'dream aesthetic pokemon cards'],
    relatedEntities: ['Munna', 'Cresselia'],
  },
  {
    slug: 'tandemaus',
    name: 'Tandemaus',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['tandemaus cards', 'cute family mouse pokemon cards'],
    relatedEntities: ['Maushold', 'Pawmi'],
  },
  {
    slug: 'pichu',
    name: 'Pichu',
    collection: 'baby-and-tiny',
    translations: ['ピチュー', '皮丘'],
    relatedKeywords: ['pichu baby cards', 'pichu shiny cards'],
    relatedEntities: ['Togepi', 'Pawmi'],
  },
  {
    slug: 'teddiursa',
    name: 'Teddiursa',
    collection: 'baby-and-tiny',
    translations: ['ヒメグマ', '熊宝宝'],
    relatedKeywords: ['teddiursa cards', 'teddy bear pokemon cards'],
    relatedEntities: ['Skitty', 'Pichu'],
  },
  {
    slug: 'cutiefly',
    name: 'Cutiefly',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['cutiefly cards', 'tiny cute pokemon cards'],
    relatedEntities: ['Ribombee', 'Togepi'],
  },
  {
    slug: 'ribombee',
    name: 'Ribombee',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['ribombee cards', 'cute fairy bug pokemon cards'],
    relatedEntities: ['Cutiefly', 'Sylveon'],
  },
  {
    slug: 'pawmi',
    name: 'Pawmi',
    collection: 'baby-and-tiny',
    translations: ['パモ', '布拨'],
    relatedKeywords: ['pawmi cards', 'cute pawmi card collection'],
    relatedEntities: ['Pawmo', 'Pawmot', 'Maushold'],
  },
  {
    slug: 'pawmo',
    name: 'Pawmo',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['pawmo cards', 'pawmo evolution cards'],
    relatedEntities: ['Pawmi', 'Pawmot'],
  },
  {
    slug: 'pawmot',
    name: 'Pawmot',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['pawmot cards', 'pawmi evolution line cards'],
    relatedEntities: ['Pawmi', 'Pawmo'],
  },
  {
    slug: 'minccino',
    name: 'Minccino',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['minccino cards', 'fluffy pokemon cards'],
    relatedEntities: ['Cinccino', 'Skitty'],
  },
  {
    slug: 'cinccino',
    name: 'Cinccino',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['cinccino cards', 'fluff aesthetic pokemon cards'],
    relatedEntities: ['Minccino', 'Skitty'],
  },
  {
    slug: 'skitty',
    name: 'Skitty',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['skitty cards', 'cute cat pokemon cards'],
    relatedEntities: ['Delcatty', 'Teddiursa'],
  },
  {
    slug: 'delcatty',
    name: 'Delcatty',
    collection: 'baby-and-tiny',
    translations: [],
    relatedKeywords: ['delcatty cards', 'cute cat pokemon card collection'],
    relatedEntities: ['Skitty', 'Sylveon'],
  },
  {
    slug: 'shaymin',
    name: 'Shaymin',
    collection: 'dreamy-and-ethereal',
    translations: ['シェイミ', '谢米'],
    relatedKeywords: ['shaymin land forme cards', 'cottagecore pokemon cards'],
    relatedEntities: ['Leafeon', 'Jirachi'],
  },
  {
    slug: 'gardevoir',
    name: 'Gardevoir',
    collection: 'elegant-and-feminine',
    translations: ['サーナイト', '沙奈朵'],
    relatedKeywords: ['gardevoir art rare cards', 'gardevoir sir cards'],
    relatedEntities: ['Kirlia', 'Diancie'],
  },
  {
    slug: 'kirlia',
    name: 'Kirlia',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['kirlia cards', 'kirlia art rare pokemon'],
    relatedEntities: ['Gardevoir', 'Diancie'],
  },
  {
    slug: 'lilligant',
    name: 'Lilligant',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['lilligant cards', 'hisuian lilligant cards'],
    relatedEntities: ['Leafeon', 'Tsareena'],
  },
  {
    slug: 'tsareena',
    name: 'Tsareena',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['tsareena cards', 'elegant pokemon cards'],
    relatedEntities: ['Lilligant', 'Milotic'],
  },
  {
    slug: 'milotic',
    name: 'Milotic',
    collection: 'elegant-and-feminine',
    translations: ['ミロカロス', '美纳斯'],
    relatedKeywords: ['milotic beautiful pokemon card', 'milotic art rare'],
    relatedEntities: ['Cresselia', 'Altaria'],
  },
  {
    slug: 'altaria',
    name: 'Altaria',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['altaria cards', 'cloud bird pokemon cards'],
    relatedEntities: ['Milotic', 'Cresselia'],
  },
  {
    slug: 'cresselia',
    name: 'Cresselia',
    collection: 'elegant-and-feminine',
    translations: ['クレセリア', '克雷色利亚'],
    relatedKeywords: ['cresselia cards', 'dreamy cresselia pokemon cards'],
    relatedEntities: ['Mew', 'Jirachi'],
  },
  {
    slug: 'diancie',
    name: 'Diancie',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['diancie cards', 'princess jewel pokemon cards'],
    relatedEntities: ['Gardevoir', 'Kirlia'],
  },
  {
    slug: 'meloetta',
    name: 'Meloetta',
    collection: 'elegant-and-feminine',
    translations: [],
    relatedKeywords: ['meloetta cards', 'elegant psychic pokemon cards'],
    relatedEntities: ['Diancie', 'Cresselia'],
  },
  {
    slug: 'meowstic',
    name: 'Meowstic',
    collection: 'spooky-cute',
    translations: [],
    relatedKeywords: ['meowstic cards', 'cute spooky psychic pokemon cards'],
    relatedEntities: ['Espurr', 'Mimikyu'],
  },
  {
    slug: 'misdreavus',
    name: 'Misdreavus',
    collection: 'spooky-cute',
    translations: [],
    relatedKeywords: ['misdreavus cards', 'spooky cute ghost pokemon cards'],
    relatedEntities: ['Mimikyu', 'Pumpkaboo'],
  },
  {
    slug: 'greavard',
    name: 'Greavard',
    collection: 'spooky-cute',
    translations: [],
    relatedKeywords: ['greavard ghost dog pokemon card', 'greavard cards'],
    relatedEntities: ['Mimikyu', 'Pumpkaboo'],
  },
  {
    slug: 'pumpkaboo',
    name: 'Pumpkaboo',
    collection: 'spooky-cute',
    translations: [],
    relatedKeywords: ['pumpkaboo halloween pokemon cards', 'pumpkaboo fall pokemon cards'],
    relatedEntities: ['Misdreavus', 'Greavard'],
  },
  {
    slug: 'espeon',
    name: 'Espeon',
    collection: 'eeveelution-core',
    translations: ['エーフィ', '太阳伊布'],
    relatedKeywords: ['espeon cards', 'psychic eeveelution cards'],
    relatedEntities: ['Eevee', 'Sylveon', 'Glaceon'],
  },
  {
    slug: 'glaceon',
    name: 'Glaceon',
    collection: 'eeveelution-core',
    translations: ['グレイシア', '冰伊布'],
    relatedKeywords: ['glaceon cards', 'elegant blue pokemon cards'],
    relatedEntities: ['Eevee', 'Leafeon', 'Sylveon'],
  },
  {
    slug: 'leafeon',
    name: 'Leafeon',
    collection: 'eeveelution-core',
    translations: ['リーフィア', '叶伊布'],
    relatedKeywords: ['leafeon cards', 'leafeon art rare cards'],
    relatedEntities: ['Eevee', 'Glaceon', 'Shaymin'],
  },
  {
    slug: 'comfey',
    name: 'Comfey',
    collection: 'dreamy-and-ethereal',
    translations: [],
    relatedKeywords: ['comfey cards', 'flower pokemon card collection'],
    relatedEntities: ['Leafeon', 'Lilligant'],
  },
  {
    slug: 'cosmog',
    name: 'Cosmog',
    collection: 'dreamy-and-ethereal',
    translations: [],
    relatedKeywords: ['cosmog collection', 'starry pokemon cards'],
    relatedEntities: ['Jirachi', 'Cresselia'],
  },
]

export const SPECIES_KEYWORD_CONFIGS = Object.fromEntries(
  SPECIES_KEYWORD_SEEDS.map((species) => [species.slug, species])
) as Record<string, SpeciesKeywordConfig>

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
