export type SpeciesCollectionSlug =
  | 'pink-brigade'
  | 'babies'
  | 'starter-pokemon'
  | 'tiny-and-adorable'
  | 'food-and-sweet-treats'
  | 'cottagecore-and-floral'
  | 'dogs'
  | 'cats'
  | 'bunny'
  | 'mice'
  | 'birds'
  | 'fish'
  | 'cozy-and-warm'
  | 'sleepy'
  | 'all-other-animals'
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
  | 'foxes-and-weasels'
  | 'monkeys-chimps-and-apes'
  | 'farm-animals'
  | 'safari-animals'

export const SPECIES_COLLECTIONS = {
  'amphibians-and-reptiles': {
    slug: 'amphibians-and-reptiles',
    title: '🐸 Amphibians & Reptiles',
    description: 'Frogs, toads, salamanders, lizards, turtles, and crocodiles.',
    featuredSpecies: ['Bulbasaur', 'Charmander', 'Squirtle', 'Totodile', 'Treecko'],
  },
  'foxes-and-weasels': {
    slug: 'foxes-and-weasels',
    title: '🦊 Foxes & Weasels',
    description: 'Foxes, weasels, ferrets, and stoats.',
    featuredSpecies: ['Vulpix', 'Zorua', 'Fennekin', 'Sneasel', 'Buizel'],
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
  dogs: {
    slug: 'dogs',
    title: 'Dogs & Canines',
    description:
      'Dog, wolf, and other canine-inspired Pokémon for collectors who love the full canine family.',
    featuredSpecies: ['Growlithe', 'Arcanine', 'Yamper', 'Boltund', 'Rockruff'],
  },
  cats: {
    slug: 'cats',
    title: 'Cats & Felines',
    description: 'Cat, kitten, and big-cat inspired Pokémon for feline-focused collection themes.',
    featuredSpecies: ['Meowth', 'Persian', 'Skitty', 'Sprigatito', 'Litten'],
  },
  bunny: {
    slug: 'bunny',
    title: 'Rabbits & Bunnies',
    description:
      'Rabbit and bunny-inspired Pokémon from playful classics to battle-ready evolutions.',
    featuredSpecies: ['Buneary', 'Lopunny', 'Scorbunny', 'Bunnelby', 'Diggersby'],
  },
  mice: {
    slug: 'mice',
    title: 'Mice & Rodents',
    description:
      'Mouse and rodent-inspired Pokémon, including mascots, pika-clones, and chinchilla lines.',
    featuredSpecies: ['Pichu', 'Pikachu', 'Raichu', 'Dedenne', 'Cinccino'],
  },
  birds: {
    slug: 'birds',
    title: 'Bird Pokémon',
    description:
      'Bird, owl, penguin, duck, and other avian-inspired Pokémon for collectors building feathered lineups.',
    featuredSpecies: ['Piplup', 'Rowlet', 'Decidueye', 'Togetic', 'Corviknight'],
  },
  fish: {
    slug: 'fish',
    title: 'Fish & Aquatic Pokémon',
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
  'all-other-animals': {
    slug: 'all-other-animals',
    title: 'Other Animal Friends',
    description:
      'A broad animal mix beyond cats, dogs, rabbits, rodents, birds, and fish: seals, bears, sheep, and more.',
    featuredSpecies: ['Spheal', 'Teddiursa', 'Wooloo', 'Miltank', 'Deerling'],
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
    title: 'Yuka Morii Art',
    description:
      "Pokémon illustrated in Yuka Morii's signature clay-sculpture style — hand-crafted models photographed to create her iconic 3D card artwork.",
    featuredSpecies: ['Clefairy', 'Jigglypuff', 'Pikachu', 'Chansey', 'Froakie'],
  },
  'asako-ito': {
    slug: 'asako-ito',
    title: 'Asako Ito Art',
    description:
      "Pokémon illustrated in Asako Ito's distinctive crochet amigurumi style — hand-knitted fabric models that give each Pokémon a soft, tactile charm.",
    featuredSpecies: ['Espurr', 'Swirlix', 'Goomy', 'Munna', 'Audino'],
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
