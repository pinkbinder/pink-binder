import { cn } from '../../lib/utils'
import { TcgCardImage } from './tcg-card-image'
import type { PokemonTcgCard } from '@repo/data/client'

const TILE_SIZE_CLASS = {
  default: 'w-full',
  compact: 'mx-auto w-full max-w-[5.5rem] sm:max-w-[6.5rem]',
  /** Price-list ranked rows — a bit larger than compact, still beside prose. */
  priceList: 'mx-auto w-full max-w-[7rem] sm:max-w-[8.5rem]',
} as const

const TILE_IMAGE_SIZES = {
  default: '(max-width: 640px) 45vw, (max-width: 768px) 30vw, 200px',
  compact: '(max-width: 640px) 22vw, 88px',
  priceList: '(max-width: 640px) 28vw, 112px',
} as const

export function PokemonTcgCardTile({
  card,
  showMeta = true,
  size = 'default',
  zoomable = true,
}: {
  card: PokemonTcgCard
  showMeta?: boolean
  /** `compact` for tight roundup rows; `priceList` for TCG price list posts. */
  size?: keyof typeof TILE_SIZE_CLASS
  zoomable?: boolean
}) {
  const imageBlock = (
    <div
      class={cn(
        'relative aspect-[5/7] overflow-hidden rounded-xl border shadow-xs transition-shadow group-hover:shadow-md',
        TILE_SIZE_CLASS[size]
      )}
    >
      <TcgCardImage
        card={card}
        alt={`Cute ${card.name}${card.rarity ? ` ${card.rarity}` : ''} card from ${card.setName} - collectible Pokémon TCG`}
        class="object-contain"
        sizes={TILE_IMAGE_SIZES[size]}
      />
    </div>
  )

  // Static-safe zoom: open the large rendering in a new tab (post pages ship
  // zero JS, so the old dialog trigger never fired).
  const zoomUrl = card.imageLarge ?? card.imageSmall

  return (
    <div class="group flex flex-col gap-2">
      {zoomable && zoomUrl ? (
        <a
          href={zoomUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`View larger image of ${card.name}`}
          class="block cursor-zoom-in transition-transform duration-200 hover:scale-[1.03]"
        >
          {imageBlock}
        </a>
      ) : (
        imageBlock
      )}
      {showMeta ? (
        <div
          class={cn(
            'space-y-0.5 px-0.5',
            (size === 'compact' || size === 'priceList') && 'text-center'
          )}
        >
          <p class="truncate text-xs font-medium">{card.setName}</p>
          {card.rarity ? <p class="text-muted-foreground truncate text-xs">{card.rarity}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
