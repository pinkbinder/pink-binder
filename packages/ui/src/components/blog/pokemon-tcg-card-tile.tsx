import { TcgCardImage } from './tcg-card-image'
import type { PokemonTcgCard } from '@repo/data/client'

export function PokemonTcgCardTile({
  card,
  showMeta = true,
}: {
  card: PokemonTcgCard
  showMeta?: boolean
}) {
  return (
    <div className="group flex flex-col gap-2">
      <div className="relative aspect-[5/7] overflow-hidden rounded-xl border shadow-sm transition-shadow group-hover:shadow-md">
        <TcgCardImage
          card={card}
          alt={`Cute ${card.name}${card.rarity ? ` ${card.rarity}` : ''} card from ${card.setName} - collectible Pokémon TCG`}
          className="object-contain"
          sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 200px"
        />
      </div>
      {showMeta ? (
        <div className="space-y-0.5 px-0.5">
          <p className="truncate text-xs font-medium">{card.setName}</p>
          {card.rarity ? (
            <p className="truncate text-xs text-muted-foreground">{card.rarity}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
