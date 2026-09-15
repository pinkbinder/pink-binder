/** Platinum tone for mythical badges — the `mythical-badge` @utility in @repo/ui/globals.css. */
export const MYTHICAL_PLATINUM_TONE_CLASS = 'mythical-badge'

export const CLICKABLE_BADGE_CLASS =
  'rounded-full border px-3 py-1 text-xs font-semibold shadow-xs ring-1 ring-black/5 transition-colors [@media(hover:hover)]:hover:-translate-y-px [@media(hover:hover)]:hover:shadow-sm'

const COLLECTION_BADGE_ICONS: Record<string, string> = {
  'The Pink Brigade': '🌸',
  Babies: '🍼',
  'Starter Pokemon': '🌱',
  'Tiny & Adorable': '✨',
  'Food & Sweet Treats': '🍰',
  'Cottagecore & Floral': '🌿',
  'Dogs & Canines': '🐕',
  'Cats & Felines': '🐱',
  'Bunnies & Rabbits': '🐰',
  'Mice & Rats': '🐭',
  Foxes: '🦊',
  'Weasels & Badgers': '🦡',
  'Safari Animals': '🦁',
  'Woodland Creatures': '🌲',
  'Squirrels & Hamsters': '🐿️',
  'Amphibians & Reptiles': '🐸',
  'Farm Animals': '🐄',
  'Monkeys, Chimps & Apes': '🐒',
  'Birds & Bats': '🐦',
  Fish: '🐟',
  'Sea Creatures': '🐙',
  'Celestial & Space': '🌌',
  'Fluffy & Plush': '🧸',
  'Cozy & Warm': '🔥',
  'Sleepy Pokémon': '💤',
  'Other Animal Friends': '🐾',
  'Dreamy & Ethereal': '🌙',
  'Pink & Pastel Icons': '💗',
  'Elegant & Feminine Meta': '💫',
  'Spooky-Cute Niche': '👻',
  'Eeveelution Core': '💎',
  'Most Popular Pokémon': '⭐',
  Legendary: '🌟',
  Mythical: '🔮',
  'Yuka Morii': '🏺',
  'Asako Ito': '🧶',
  Sowsow: '🌊',
  Hyogonosuke: '🎨',
  kawayoo: '🌈',
  kodama: '🍃',
}

export function getCollectionBadgeIcon(collection: string): string | null {
  return COLLECTION_BADGE_ICONS[collection] ?? null
}
