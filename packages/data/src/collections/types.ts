export type SpeciesCollectionSlug =
  | 'pink-brigade'
  | 'babies'
  | 'starter-pokemon'
  | 'tiny-and-adorable'
  | 'food-and-sweet-treats'
  | 'cottagecore-and-floral'
  | 'dogs-and-canines'
  | 'cats-and-felines'
  | 'bunnies-and-rabbits'
  | 'mice-and-rats'
  | 'birds-and-bats'
  | 'fish'
  | 'cozy-and-warm'
  | 'sleepy'
  | 'dreamy-and-ethereal'
  | 'pink-pastel-icons'
  | 'elegant-and-feminine'
  | 'spooky-cute'
  | 'eeveelution-core'
  | 'most-popular'
  | 'legendary'
  | 'mythical'
  | 'yuka-morii'
  | 'asako-ito'
  | 'amphibians-and-reptiles'
  | 'foxes'
  | 'weasels-and-badgers'
  | 'monkeys-chimps-and-apes'
  | 'farm-animals'
  | 'safari-animals'
  | 'woodland-creatures'
  | 'squirrels-and-hamsters'
  | 'bugs-and-insects'
  | 'bears'
  | 'dragons'
  | 'sea-creatures'
  | 'celestial-and-space'
  | 'fluffy-and-plush'
  | 'ice-and-snow'
  | 'electric-cuties'
  | 'fairy-tale'
  | 'round-and-squishy'
  | 'dark-and-edgy'
  | 'fighting-spirit'
  | 'dinosaurs-and-fossils'
  | 'ocean-and-beach'
  | 'valentines-and-love'
  | 'halloween'
  | 'christmas-and-winter'
  | 'regional-variants'
  | 'pseudo-legendaries'

export const SPECIES_COLLECTIONS = {
  'amphibians-and-reptiles': {
    slug: 'amphibians-and-reptiles',
    title: '🐸 Amphibians & Reptiles',
    description: 'Frogs, toads, salamanders, lizards, turtles, and crocodiles.',
    featuredSpecies: ['Bulbasaur', 'Charmander', 'Squirtle', 'Totodile', 'Treecko'],
  },
  foxes: {
    slug: 'foxes',
    title: 'Foxes',
    description: 'Fox-inspired Pokémon from classic fire foxes to modern tricksters.',
    featuredSpecies: ['Vulpix', 'Ninetales', 'Zorua', 'Zoroark', 'Fennekin'],
  },
  'weasels-and-badgers': {
    slug: 'weasels-and-badgers',
    title: 'Weasels & Badgers',
    description: 'Weasel, ferret, stoat, and badger-like Pokémon with agile, scrappy vibes.',
    featuredSpecies: ['Sneasel', 'Weavile', 'Buizel', 'Floatzel', 'Sentret'],
  },
  'monkeys-chimps-and-apes': {
    slug: 'monkeys-chimps-and-apes',
    title: '🐒 Monkeys, Chimps & Apes',
    description: 'Primates of the Pokémon world.',
    featuredSpecies: ['Chimchar', 'Grookey', 'Aipom', 'Mankey', 'Slakoth'],
  },
  'farm-animals': {
    slug: 'farm-animals',
    title: 'Farm Animals',
    description: 'Sheep, goats, cows, pigs, chickens, ducks, and horses.',
    featuredSpecies: ['Mareep', 'Miltank', 'Lechonk', 'Psyduck', 'Ponyta'],
  },
  'safari-animals': {
    slug: 'safari-animals',
    title: '🦁 Safari Animals',
    description:
      'Elephants, lions, zebras, rhinos, and other safari-zone favorites — plus squirrel and mongoose cousins.',
    featuredSpecies: ['Phanpy', 'Girafarig', 'Litleo', 'Skwovet', 'Yungoos'],
  },
  'woodland-creatures': {
    slug: 'woodland-creatures',
    title: 'Woodland Creatures',
    description:
      'Forest and meadow Pokémon inspired by woodland critters, from skittish foragers to mossy spirits.',
    featuredSpecies: ['Skwovet', 'Greedent', 'Bidoof', 'Sentret', 'Phantump'],
  },
  'squirrels-and-hamsters': {
    slug: 'squirrels-and-hamsters',
    title: 'Squirrels & Hamsters',
    description:
      'Small bushy-tail and cheek-stuffing favorites with squirrel and hamster-style energy.',
    featuredSpecies: ['Skwovet', 'Greedent', 'Pachirisu', 'Morpeko', 'Emolga'],
  },
  'pink-brigade': {
    slug: 'pink-brigade',
    title: 'The Pink Brigade',
    description: 'Pink and pastel favorites that fit the Pink Binder brand.',
    featuredSpecies: ['Clefairy', 'Sylveon', 'Slowpoke', 'Jigglypuff', 'Eevee'],
  },
  babies: {
    slug: 'babies',
    title: 'Babies',
    description: 'Official baby Pokémon only, centered on the cutest pre-evolution collectors.',
    featuredSpecies: ['Cleffa', 'Togepi', 'Pichu', 'Azurill', 'Riolu'],
  },
  'starter-pokemon': {
    slug: 'starter-pokemon',
    title: 'Starter Pokemon',
    description:
      'Starter base forms from every generation, curated for collectors who love iconic first-partner Pokémon.',
    featuredSpecies: ['Bulbasaur', 'Cyndaquil', 'Mudkip', 'Piplup', 'Sprigatito'],
  },
  'tiny-and-adorable': {
    slug: 'tiny-and-adorable',
    title: 'Tiny & Adorable',
    description: 'Small, playful, and extra-cute Pokémon for tiny binder themes.',
    featuredSpecies: ['Maushold', 'Pawmi', 'Cutiefly', 'Piplup', 'Snom'],
  },
  'food-and-sweet-treats': {
    slug: 'food-and-sweet-treats',
    title: 'Food & Sweet Treats',
    description: 'Dessert, bakery, candy, tea, and snack-inspired Pokémon collectors love.',
    featuredSpecies: ['Milcery', 'Alcremie', 'Swirlix', 'Vanillite', 'Fidough'],
  },
  'cottagecore-and-floral': {
    slug: 'cottagecore-and-floral',
    title: 'Cottagecore & Floral',
    description: 'Soft floral, meadow, orchard, and plant-based Pokémon with cottagecore appeal.',
    featuredSpecies: ['Shaymin', 'Comfey', 'Flabébé', 'Petilil', 'Smoliv'],
  },
  'dogs-and-canines': {
    slug: 'dogs-and-canines',
    title: 'Dogs & Canines',
    description:
      'Dog, wolf, and other canine-inspired Pokémon for collectors who love the full canine family.',
    featuredSpecies: ['Growlithe', 'Arcanine', 'Yamper', 'Boltund', 'Rockruff'],
  },
  'cats-and-felines': {
    slug: 'cats-and-felines',
    title: 'Cats & Felines',
    description: 'Cat, kitten, and big-cat inspired Pokémon for feline-focused collection themes.',
    featuredSpecies: ['Meowth', 'Persian', 'Skitty', 'Sprigatito', 'Litten'],
  },
  'bunnies-and-rabbits': {
    slug: 'bunnies-and-rabbits',
    title: 'Bunnies & Rabbits',
    description:
      'Rabbit and bunny-inspired Pokémon from playful classics to battle-ready evolutions.',
    featuredSpecies: ['Buneary', 'Lopunny', 'Scorbunny', 'Bunnelby', 'Diggersby'],
  },
  'mice-and-rats': {
    slug: 'mice-and-rats',
    title: 'Mice & Rats',
    description:
      'Mouse and rodent-inspired Pokémon, including mascots, pika-clones, and chinchilla lines.',
    featuredSpecies: ['Pichu', 'Pikachu', 'Raichu', 'Dedenne', 'Cinccino'],
  },
  'birds-and-bats': {
    slug: 'birds-and-bats',
    title: 'Birds & Bats',
    description:
      'Bird, owl, penguin, duck, and other avian-inspired Pokémon for collectors building feathered lineups.',
    featuredSpecies: ['Piplup', 'Rowlet', 'Decidueye', 'Togetic', 'Corviknight'],
  },
  fish: {
    slug: 'fish',
    title: 'Fish',
    description:
      'Fish and closely related aquatic Pokémon, from tiny swimmers to dramatic sea-serpent evolutions.',
    featuredSpecies: ['Magikarp', 'Feebas', 'Milotic', 'Finneon', 'Veluza'],
  },
  'cozy-and-warm': {
    slug: 'cozy-and-warm',
    title: 'Cozy & Warm',
    description:
      'Warm, fuzzy, and fireside Pokémon — fire-type foxes, soft bears, fluffy sheep, and other cozy companion vibes.',
    featuredSpecies: ['Vulpix', 'Cyndaquil', 'Arcanine', 'Wooloo', 'Darumaka'],
  },
  sleepy: {
    slug: 'sleepy',
    title: 'Sleepy Pokémon',
    description:
      'Slow, drowsy, and dreamlike Pokémon — from Snorlax napping on a road to Abra snoozing through battles.',
    featuredSpecies: ['Snorlax', 'Jigglypuff', 'Slowpoke', 'Abra', 'Komala'],
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
    featuredSpecies: ['Sylveon', 'Mew', 'Jigglypuff', 'Clefairy', 'Hatterene'],
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
  'most-popular': {
    slug: 'most-popular',
    title: 'Most Popular Pokémon',
    description:
      'The top fan-favorite Pokémon across generations, from mascots and starters to legendary icons.',
    featuredSpecies: ['Pikachu', 'Charizard', 'Mewtwo', 'Lucario', 'Greninja'],
  },
  legendary: {
    slug: 'legendary',
    title: 'Legendary',
    description:
      'Legendary Pokémon with iconic lore and premium card demand across eras of the TCG.',
    featuredSpecies: ['Mewtwo', 'Lugia', 'Rayquaza', 'Cresselia', 'Cosmog'],
  },
  mythical: {
    slug: 'mythical',
    title: 'Mythical',
    description:
      'Rare mythical Pokémon that collectors love for their unique stories and special releases.',
    featuredSpecies: ['Mew', 'Jirachi', 'Victini', 'Shaymin', 'Diancie'],
  },
  'yuka-morii': {
    slug: 'yuka-morii',
    title: 'Yuka Morii',
    description:
      "Pokémon illustrated in Yuka Morii's signature clay-sculpture style — hand-crafted models photographed to create her iconic 3D card artwork.",
    featuredSpecies: ['Clefairy', 'Jigglypuff', 'Pikachu', 'Chansey', 'Froakie'],
  },
  'asako-ito': {
    slug: 'asako-ito',
    title: 'Asako Ito',
    description:
      "Pokémon illustrated in Asako Ito's distinctive crochet amigurumi style — hand-knitted fabric models that give each Pokémon a soft, tactile charm.",
    featuredSpecies: ['Espurr', 'Swirlix', 'Goomy', 'Munna', 'Audino'],
  },
  'bugs-and-insects': {
    slug: 'bugs-and-insects',
    title: '🐛 Bugs & Insects',
    description:
      'Bug-type and insect-inspired Pokémon — butterflies, beetles, spiders, and mantids that bring nature vibes to any binder.',
    featuredSpecies: ['Butterfree', 'Scizor', 'Snom', 'Ribombee', 'Heracross'],
  },
  bears: {
    slug: 'bears',
    title: '🐻 Bears',
    description: 'Bear-inspired Pokémon from cuddly cubs to mighty ursine evolutions.',
    featuredSpecies: ['Teddiursa', 'Bewear', 'Cubchoo', 'Pancham', 'Snorlax'],
  },
  dragons: {
    slug: 'dragons',
    title: '🐉 Dragons',
    description:
      'Dragon-type Pokémon — from tiny hatchlings like Dreepy to iconic legendaries like Rayquaza.',
    featuredSpecies: ['Dragonite', 'Garchomp', 'Goodra', 'Dreepy', 'Altaria'],
  },
  'sea-creatures': {
    slug: 'sea-creatures',
    title: 'Sea Creatures',
    description:
      'Non-fish aquatic Pokémon: jellyfish, seahorses, seals, crabs, octopi, and other ocean dwellers.',
    featuredSpecies: ['Lapras', 'Tentacool', 'Corsola', 'Staryu', 'Dewgong'],
  },
  'celestial-and-space': {
    slug: 'celestial-and-space',
    title: 'Celestial & Space',
    description:
      'Cosmic and starlit Pokémon tied to moons, comets, constellations, and dreamy night-sky themes.',
    featuredSpecies: ['Jirachi', 'Cosmog', 'Lunatone', 'Solrock', 'Clefairy'],
  },
  'fluffy-and-plush': {
    slug: 'fluffy-and-plush',
    title: 'Fluffy & Plush',
    description:
      'Soft, cuddly-looking Pokémon with plush-toy silhouettes and cozy textures collectors adore.',
    featuredSpecies: ['Eevee', 'Wooloo', 'Altaria', 'Teddiursa', 'Stufful'],
  },
  'ice-and-snow': {
    slug: 'ice-and-snow',
    title: '❄️ Ice & Snow',
    description: 'Ice-type and winter-themed Pokémon that bring frosty charm to any collection.',
    featuredSpecies: ['Snom', 'Glaceon', 'Articuno', 'Cubchoo', 'Eiscue'],
  },
  'electric-cuties': {
    slug: 'electric-cuties',
    title: '⚡ Electric Cuties',
    description:
      'Electric-type mascots, Pikachu clones, and other charged-up cuties that spark joy in any binder.',
    featuredSpecies: ['Pikachu', 'Dedenne', 'Pachirisu', 'Pawmi', 'Yamper'],
  },
  'fairy-tale': {
    slug: 'fairy-tale',
    title: '🧚 Fairy-Tale',
    description:
      'Fairy-type Pokémon with enchanting, magical designs — from whimsical sprites to mythical guardians.',
    featuredSpecies: ['Sylveon', 'Gardevoir', 'Mimikyu', 'Xerneas', 'Togekiss'],
  },
  'round-and-squishy': {
    slug: 'round-and-squishy',
    title: '🫧 Round & Squishy',
    description:
      'Pokémon whose charm is in their round, blob-like, or squishy design — pure comfort creatures.',
    featuredSpecies: ['Spheal', 'Goomy', 'Rowlet', 'Lechonk', 'Ditto'],
  },
  'dark-and-edgy': {
    slug: 'dark-and-edgy',
    title: '🌑 Dark & Edgy',
    description:
      'Dark-type Pokémon with moody, mysterious aesthetics that collectors love for contrast pages.',
    featuredSpecies: ['Umbreon', 'Absol', 'Zorua', 'Houndoom', 'Darkrai'],
  },
  'fighting-spirit': {
    slug: 'fighting-spirit',
    title: '🥊 Fighting Spirit',
    description:
      'Fighting-type Pokémon with warrior energy — martial artists, brawlers, and heroic fighters.',
    featuredSpecies: ['Lucario', 'Hawlucha', 'Riolu', 'Blaziken', 'Gallade'],
  },
  'dinosaurs-and-fossils': {
    slug: 'dinosaurs-and-fossils',
    title: '🦕 Dinosaurs & Fossils',
    description:
      'Fossil Pokémon and dinosaur-inspired species — prehistoric creatures revived for the modern collector.',
    featuredSpecies: ['Aerodactyl', 'Tyrantrum', 'Aurorus', 'Cranidos', 'Bastiodon'],
  },
  'ocean-and-beach': {
    slug: 'ocean-and-beach',
    title: '🏖️ Ocean & Beach',
    description:
      'Coastal and ocean-dwelling Pokémon that bring beach vibes and wave-rider energy to binder pages.',
    featuredSpecies: ['Wingull', 'Palossand', 'Corsola', 'Pyukumuku', 'Staryu'],
  },
  'valentines-and-love': {
    slug: 'valentines-and-love',
    title: '💕 Valentines & Love',
    description:
      'Heart-themed, love-inspired, and romantically designed Pokémon perfect for Valentine binder spreads.',
    featuredSpecies: ['Luvdisc', 'Sylveon', 'Chansey', 'Togekiss', 'Alomomola'],
  },
  halloween: {
    slug: 'halloween',
    title: '🎃 Halloween',
    description:
      'Ghost-type headliners and creepy-cute Pokémon that make Halloween binder pages unforgettable.',
    featuredSpecies: ['Gengar', 'Mimikyu', 'Chandelure', 'Pumpkaboo', 'Banette'],
  },
  'christmas-and-winter': {
    slug: 'christmas-and-winter',
    title: '🎄 Christmas & Winter',
    description:
      'Holiday and winter-themed Pokémon — snowy creatures, gift-givers, and festive favorites.',
    featuredSpecies: ['Delibird', 'Stantler', 'Snom', 'Glaceon', 'Eiscue'],
  },
  'regional-variants': {
    slug: 'regional-variants',
    title: '🗺️ Regional Variants',
    description:
      'Pokémon with Alolan, Galarian, Hisuian, or Paldean regional forms — collecting every variant is its own rewarding quest.',
    featuredSpecies: ['Vulpix', 'Ponyta', 'Meowth', 'Zorua', 'Growlithe'],
  },
  'pseudo-legendaries': {
    slug: 'pseudo-legendaries',
    title: '⭐ Pseudo-Legendaries',
    description:
      'The elite fan-favorite group with 600 base stat totals — not quite Legendary, but just as collectible.',
    featuredSpecies: ['Dragonite', 'Tyranitar', 'Garchomp', 'Dragapult', 'Goodra'],
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

/** Lower index = higher priority when sorting `collections` (primary = first entry). */
export const SPECIES_COLLECTION_SORT_ORDER: SpeciesCollectionSlug[] = [
  'dogs-and-canines',
  'cats-and-felines',
  'bunnies-and-rabbits',
  'mice-and-rats',
  'bears',
  'foxes',
  'weasels-and-badgers',
  'safari-animals',
  'woodland-creatures',
  'squirrels-and-hamsters',
  'birds-and-bats',
  'fish',
  'sea-creatures',
  'farm-animals',
  'monkeys-chimps-and-apes',
  'amphibians-and-reptiles',
  'bugs-and-insects',
  'dragons',
  'dinosaurs-and-fossils',
  'ocean-and-beach',
  'food-and-sweet-treats',
  'cottagecore-and-floral',
  'cozy-and-warm',
  'ice-and-snow',
  'christmas-and-winter',
  'sleepy',
  'tiny-and-adorable',
  'round-and-squishy',
  'spooky-cute',
  'halloween',
  'dreamy-and-ethereal',
  'celestial-and-space',
  'fairy-tale',
  'valentines-and-love',
  'fluffy-and-plush',
  'elegant-and-feminine',
  'electric-cuties',
  'dark-and-edgy',
  'fighting-spirit',
  'pink-pastel-icons',
  'pink-brigade',
  'starter-pokemon',
  'babies',
  'eeveelution-core',
  'most-popular',
  'pseudo-legendaries',
  'legendary',
  'mythical',
  'regional-variants',
  'yuka-morii',
  'asako-ito',
]

const SORT_INDEX = new Map(SPECIES_COLLECTION_SORT_ORDER.map((slug, index) => [slug, index]))

export function sortSpeciesCollections(
  collections: SpeciesCollectionSlug[]
): SpeciesCollectionSlug[] {
  return [...collections].sort((a, b) => {
    const aIndex = SORT_INDEX.get(a) ?? Number.MAX_SAFE_INTEGER
    const bIndex = SORT_INDEX.get(b) ?? Number.MAX_SAFE_INTEGER
    if (aIndex !== bIndex) {
      return aIndex - bIndex
    }
    return a.localeCompare(b)
  })
}
