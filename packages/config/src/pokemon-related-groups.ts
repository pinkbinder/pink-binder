/**
 * Strong thematic pairings beyond evolution lines (same-gen starters, legendary sets, etc.).
 * Weak collection overlap (popular lists, artist themes) belongs in `collections` only — not here.
 */
export const POKEMON_RELATED_GROUPS = [
  // ─── Gen 1 legendaries ───────────────────────────────────────────────────────
  ['articuno', 'zapdos', 'moltres'],
  ['mewtwo', 'mew'],
  ['lugia', 'ho-oh'],

  // ─── Gen 2 beasts ────────────────────────────────────────────────────────────
  ['raikou', 'entei', 'suicune'],

  // ─── Gen 3 weather & legendaries ─────────────────────────────────────────────
  ['kyogre', 'groudon', 'rayquaza'],
  ['latias', 'latios'],
  ['regirock', 'regice', 'registeel'],

  // ─── Gen 4 lake & creation ───────────────────────────────────────────────────
  ['uxie', 'mesprit', 'azelf'],
  ['dialga', 'palkia', 'giratina'],

  // ─── Gen 5 Tao trio & swords of justice ──────────────────────────────────────
  ['reshiram', 'zekrom', 'kyurem'],
  ['cobalion', 'terrakion', 'virizion', 'keldeo'],
  ['tornadus', 'thundurus', 'landorus', 'enamorus'],

  // ─── Gen 6 kalos legendaries ─────────────────────────────────────────────────
  ['xerneas', 'yveltal', 'zygarde'],

  // ─── Gen 7 tapu & light trio ─────────────────────────────────────────────────
  ['tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini'],
  ['cosmog', 'cosmoem', 'solgaleo', 'lunala', 'necrozma'],

  // ─── Gen 8 legendaries & crown tundra ────────────────────────────────────────
  ['zacian', 'zamazenta', 'eternatus'],
  ['kubfu', 'urshifu'],
  ['regieleki', 'regidrago', 'regigigas'],
  ['glastrier', 'spectrier', 'calyrex'],

  // ─── Gen 9 legendaries & treasures of ruin ─────────────────────────────────
  ['koraidon', 'miraidon'],
  ['wo-chien', 'chien-pao', 'ting-lu', 'chi-yu'],

  // ─── Gen 10 starters ─────────────────────────────────────────────────────────
  ['browt', 'pombon', 'gecqua'],

  // ─── Starter trios (base forms) ──────────────────────────────────────────────
  ['bulbasaur', 'charmander', 'squirtle'],
  ['chikorita', 'cyndaquil', 'totodile'],
  ['treecko', 'torchic', 'mudkip'],
  ['chimchar', 'piplup', 'turtwig'],
  ['snivy', 'tepig', 'oshawott'],
  ['chespin', 'fennekin', 'froakie'],
  ['rowlet', 'litten', 'popplio'],
  ['grookey', 'scorbunny', 'sobble'],
  ['sprigatito', 'fuecoco', 'quaxly'],

  // ─── Starter trios (final evolutions) ────────────────────────────────────────
  ['venusaur', 'charizard', 'blastoise'],
  ['meganium', 'typhlosion', 'feraligatr'],
  ['sceptile', 'blaziken', 'swampert'],
  ['torterra', 'infernape', 'empoleon'],
  ['serperior', 'emboar', 'samurott'],
  ['chesnaught', 'delphox', 'greninja'],
  ['decidueye', 'incineroar', 'primarina'],
  ['rillaboom', 'cinderace', 'inteleon'],
  ['meowscarada', 'skeledirge', 'quaquaval'],

  // ─── Fossil revival sets (per-generation) ────────────────────────────────────
  ['omanyte', 'omastar', 'kabuto', 'kabutop', 'aerodactyl'],
  ['lileep', 'cradily', 'anorith', 'armaldo'],
  ['cranidos', 'rampardos', 'shieldon', 'bastiodon'],

  // ─── Paradox ancient/future pairs ────────────────────────────────────────────
  ['great-tusk', 'iron-treads'],
  ['scream-tail', 'flutter-mane'],
  ['brute-bonnet', 'iron-hands'],
  ['sandy-shocks', 'iron-thorns'],
  ['walking-wake', 'iron-leaves'],
  ['gouging-fire', 'raging-bolt'],
  ['iron-boulder', 'iron-crown'],
] as const satisfies readonly (readonly string[])[]
