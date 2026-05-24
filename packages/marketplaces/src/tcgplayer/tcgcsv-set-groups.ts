import { tcgCardSetId } from '../config/cdn'
import type { TcgcsvGroup } from './tcgcsv-client'
import { TCGCSV_PROMO_SET_TO_GROUP } from './tcgcsv-promo-images'
import { tcgSetIdToPokemontcgCatalog, TCGDEX_TO_POKEMONTCG_SET } from './card-id'

export type TcgSetCatalogEntry = {
  setId: string
  setName: string
}

/**
 * Static crosswalk: tcgdex / pokemontcg.io set ids → TCGCSV groupId.
 * Covers every era that `registerCodeFromGroupName` misses (XY, DP, BW, WotC, e-card, EX, promos, McDonald's, trainer kits, etc.).
 */
const STATIC_SET_TO_GROUP: Record<string, number> = {
  // === WotC / Classic ===
  base1: 604,
  bs: 604,
  base2: 605,
  bs2: 605,
  base3: 630,
  fo: 630,
  fossil: 630,
  base4: 635,
  ju: 635,
  jungle: 635,
  base5: 1373,
  tr: 1373,
  base6: 1374,
  lc: 1374,
  basep: 1418,
  si: 648,
  // Shadowless
  base1s: 1663,

  // === Neo ===
  neo1: 1396,
  n1: 1396,
  neo2: 1434,
  n2: 1434,
  neo3: 1389,
  n3: 1389,
  neo4: 1444,
  n4: 1444,

  // === Gym ===
  gym1: 1441,
  gym2: 1440,
  g2: 1440,

  // === e-Card ===
  ecard1: 1375,
  ecard2: 1397,
  aq: 1397,
  ecard3: 1372,
  sk: 1372,

  // === EX era ===
  ex1: 1393,
  rs: 1393,
  ex2: 1392,
  ss: 1392,
  ex3: 1376,
  dr: 1376,
  ex4: 1377,
  ma: 1377,
  ex5: 1416,
  hl: 1416,
  ex6: 1419,
  rg: 1419,
  ex7: 1428,
  rr: 1428,
  ex8: 1404,
  dx: 1404,
  ex9: 1410,
  em: 1410,
  ex10: 1398,
  uf: 1398,
  ex11: 1429,
  ds: 1429,
  ex12: 1378,
  lm: 1378,
  ex13: 1379,
  hp: 1379,
  ex14: 1395,
  cg: 1395,
  ex15: 1411,
  df: 1411,
  ex16: 1383,
  pk: 1383,

  // === Diamond & Pearl ===
  dp1: 1430,
  dp2: 1368,
  mt: 1368,
  dp3: 1380,
  sw: 1380,
  dp4: 1405,
  ge: 1405,
  dp5: 1390,
  md: 1390,
  dp6: 1417,
  la: 1417,
  dp7: 1369,
  sf: 1369,
  dpp: 1421,

  // === Platinum ===
  pl1: 1406,
  pl2: 1367,
  pl3: 1384,
  pl4: 1391,

  // === HeartGold SoulSilver ===
  hgss1: 1402,
  hs: 1402,
  hgss2: 1399,
  ul: 1399,
  hgss3: 1403,
  ud: 1403,
  hgss4: 1381,
  tm: 1381,
  hsp: 1453,
  col1: 1415,
  cl: 1415,

  // === Black & White ===
  bw1: 1400,
  bw2: 1424,
  epo: 1424,
  bw3: 1385,
  nvi: 1385,
  bw4: 1412,
  nxd: 1412,
  bw5: 1386,
  dex: 1386,
  bw6: 1394,
  drx: 1394,
  bw7: 1408,
  bcr: 1408,
  bw8: 1413,
  pls: 1413,
  bw9: 1382,
  plf: 1382,
  bw10: 1370,
  plb: 1370,
  bw11: 1409,
  ltr: 1409,
  bwp: 1407,
  dv1: 1426,
  drv: 1426,

  // === XY ===
  xy1: 1387,
  xy2: 1464,
  flf: 1464,
  xy3: 1481,
  ffi: 1481,
  xy4: 1494,
  phf: 1494,
  xy5: 1509,
  prc: 1509,
  xy6: 1534,
  ros: 1534,
  xy7: 1576,
  aor: 1576,
  xy8: 1661,
  bkt: 1661,
  xy9: 1701,
  bkp: 1701,
  xy10: 1780,
  fco: 1780,
  xy11: 1815,
  sts: 1815,
  xy12: 1842,
  evo: 1842,
  xyp: 1451,
  dc1: 1525,
  dcr: 1525,

  // Generations (tcgdex uses g1)
  g1: 1728,
  gen: 1728,

  // === SM ===
  sm1: 1863,
  sm2: 1919,
  sm3: 1957,
  sm35: 2054,
  shl: 2054,
  'sm3.5': 2054,
  sm4: 2071,
  sm5: 2178,
  sm6: 2209,
  sm7: 2278,
  ces: 2278,
  sm07: 2278,
  sm75: 2295,
  drm: 2295,
  'sm7.5': 2295,
  sm8: 2328,
  sm9: 2377,
  sm10: 2420,
  sm11: 2464,
  sm115: 2480,
  'sm11.5': 2480,
  sm12: 2534,
  smp: 1861,
  det1: 2409,
  dep: 2409,

  // === Misc promos / trainer kits ===
  np: 1423,
  pop1: 1422,
  pop2: 1447,
  pop3: 1442,
  pop4: 1452,
  pop5: 1439,
  pop6: 1432,
  pop7: 1414,
  pop8: 1450,
  pop9: 1446,
  rum1: 1433,

  // === McDonald's ===
  mcd11: 1401,
  mcd12: 1427,
  mcd14: 1692,
  mcd15: 1694,
  mcd16: 3087,
  mcd17: 2148,
  mcd18: 2364,
  mcd19: 2555,
  mcd21: 2782,
  mcd22: 3150,
  mcd23: 23306,
  mcd24: 24163,

  // === SWSH promo ===
  swshp: 2545,

  // === SWSH specials ===
  'swsh3.5': 2685,
  swsh35: 2685,
  'swsh4.5': 2754,
  swsh45: 2754,
  'swsh10.5': 3064,
  pgo: 3064,
  swsh12pt5: 17688,
  'swsh12.5': 17688,

  // === Celebrations ===
  cel25: 2867,
  clb: 2867,
  cel25c: 2931,

  // === Trainer kits ===
  'tk-xy-s': 1532,
  'tk-xy-n': 1532,
  'tk-xy-sy': 1532,
  'tk-xy-b': 1533,
  'tk-xy-w': 1533,
  'tk-xy-l': 1536,
  'tk-xy-la': 1536,
  'tk-xy-latia': 1536,
  'tk-xy-latio': 1536,
  'tk-xy-pl': 1796,
  'tk-xy-su': 1796,
  'tk-bw': 1538,
  'tk-bw-e': 1538,
  'tk-bw-z': 1538,
  'tk-hgss': 1540,
  'tk-dp': 1541,
  'tk-ex-p': 1542,
  'tk-ex-m': 1542,
  'tk-ex-la': 1543,
  'tk-ex-lt': 1543,
  'tk-sm-lr': 2069,
  'tk-sm-ar': 2069,
  'tk-sm-l': 2069,
  'tk-sm-r': 2069,
  'tk-sm-as': 2208,
  'tk-sm-an': 2208,

  // Radiant Collection
  rc1: 1465,
  rc2: 1729,

  // Kalos Starter Set
  kss: 1522,

  // Hidden Fates Shiny Vault
  sma: 2594,

  // Shining Fates Shiny Vault
  'swsh4.5sv': 2781,

  // === SV specials ===
  sv4pt5: 23237,
  'sv04.5': 23237,
  sv3pt5: 23353,
  'sv03.5': 23353,
  sv6pt5: 23529,
  'sv06.5': 23529,
  sv8pt5: 23821,
  'sv08.5': 23821,

  // Rumble (ru1 alias from tcgdex)
  ru1: 1433,

  // Best of Game / Promos
  bog: 1455,
  bp: 1455,

  // Battle Academies
  ba: 2686,
  ba22: 3051,
  ba24: 23520,

  // Misc
  fpp: 2776,
}

/** Normalize set / group titles for fuzzy equality (strip SV01:, punctuation, etc.). */
export function normalizeTcgSetTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+\d+(?:\.\d+)?:\s*/i, '')
    .replace(/^[a-z]{2,4}:\s*/i, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function registerSetId(map: Record<string, number>, setId: string, groupId: number): void {
  const trimmed = setId.trim().toLowerCase()
  if (!trimmed) {
    return
  }
  map[trimmed] = groupId
  map[tcgSetIdToPokemontcgCatalog(trimmed)] = groupId
  for (const [tcgdxSet, catalogSet] of Object.entries(TCGDEX_TO_POKEMONTCG_SET)) {
    if (catalogSet === trimmed || tcgdxSet === trimmed) {
      map[tcgdxSet] = groupId
      map[catalogSet] = groupId
    }
  }
}

function catalogTitleMatchesGroup(catalogTitle: string, groupTitle: string): boolean {
  if (!catalogTitle || !groupTitle) {
    return false
  }
  if (catalogTitle === groupTitle) {
    return true
  }
  if (catalogTitle.length <= 6 && /^\d+[a-z]?$/.test(catalogTitle)) {
    return groupTitle.endsWith(catalogTitle) || groupTitle.includes(` ${catalogTitle}`)
  }
  return false
}

function registerPromoSetIds(map: Record<string, number>): void {
  for (const [setId, groupId] of Object.entries(TCGCSV_PROMO_SET_TO_GROUP)) {
    registerSetId(map, setId, groupId)
  }
}

function registerCodeFromGroupName(map: Record<string, number>, group: TcgcsvGroup): void {
  const codeMatch = group.name.match(/^([A-Za-z]+\d+(?:\.\d+)?)\s*:/)
  if (!codeMatch?.[1]) {
    return
  }
  const code = codeMatch[1].toLowerCase()
  registerSetId(map, code, group.groupId)
  const svMatch = code.match(/^sv0*(\d+(?:\.\d+)?)$/)
  if (svMatch?.[1]) {
    registerSetId(map, `sv${svMatch[1]}`, group.groupId)
  }
  const swshMatch = code.match(/^swsh0*(\d+(?:\.\d+)?)$/)
  if (swshMatch?.[1]) {
    registerSetId(map, `swsh${swshMatch[1]}`, group.groupId)
  }
  const smMatch = code.match(/^sm0*(\d+(?:\.\d+)?)$/)
  if (smMatch?.[1]) {
    registerSetId(map, `sm${smMatch[1]}`, group.groupId)
  }
}

/**
 * Map tcgdx / pokemontcg set ids → TCGCSV groupId using:
 * 1. Static crosswalk table (comprehensive, verified)
 * 2. Code parsed from group name (SV01:, SWSH01:, SM8:)
 * 3. Catalog title fuzzy matching
 * 4. Group abbreviations
 */
export function buildSetToGroupIdMap(
  groups: readonly TcgcsvGroup[],
  catalog?: readonly TcgSetCatalogEntry[]
): Record<string, number> {
  const map: Record<string, number> = {}

  for (const [setId, groupId] of Object.entries(STATIC_SET_TO_GROUP)) {
    registerSetId(map, setId, groupId)
  }

  registerPromoSetIds(map)

  const catalogByTitle = new Map<string, string[]>()
  if (catalog) {
    for (const entry of catalog) {
      const title = normalizeTcgSetTitle(entry.setName)
      if (!title) {
        continue
      }
      const ids = catalogByTitle.get(title) ?? []
      ids.push(entry.setId.trim().toLowerCase())
      catalogByTitle.set(title, ids)
    }
  }

  for (const group of groups) {
    registerCodeFromGroupName(map, group)

    const normalizedGroupTitle = normalizeTcgSetTitle(group.name)
    for (const [title, setIds] of catalogByTitle.entries()) {
      if (!catalogTitleMatchesGroup(title, normalizedGroupTitle)) {
        continue
      }
      for (const setId of setIds) {
        registerSetId(map, setId, group.groupId)
      }
    }

    if (group.abbreviation.trim()) {
      registerSetId(map, group.abbreviation.trim().toLowerCase(), group.groupId)
    }
  }

  return map
}

export function resolveTcgcsvGroupIdForCard(
  cardId: string,
  setToGroupId?: Record<string, number>
): number | undefined {
  const setId = tcgCardSetId(cardId).toLowerCase()
  if (setToGroupId) {
    const direct = setToGroupId[setId]
    if (direct != null) {
      return direct
    }
    const catalog = tcgSetIdToPokemontcgCatalog(setId)
    if (setToGroupId[catalog] != null) {
      return setToGroupId[catalog]
    }
  }

  const promo = TCGCSV_PROMO_SET_TO_GROUP[setId]
  if (promo != null) {
    return promo
  }
  const catalogPromo = TCGCSV_PROMO_SET_TO_GROUP[tcgSetIdToPokemontcgCatalog(setId)]
  if (catalogPromo != null) {
    return catalogPromo
  }
  const tcgdxAlias = TCGDEX_TO_POKEMONTCG_SET[setId]
  if (tcgdxAlias && TCGCSV_PROMO_SET_TO_GROUP[tcgdxAlias] != null) {
    return TCGCSV_PROMO_SET_TO_GROUP[tcgdxAlias]
  }

  return undefined
}
