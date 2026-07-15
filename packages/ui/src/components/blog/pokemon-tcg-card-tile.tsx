import { cn } from '../../lib/utils'
import { TcgCardImage } from './tcg-card-image'
import { TcgCardZoomDialog } from './tcg-card-zoom-dialog'
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
  const alt = `${card.name}${card.rarity ? ` ${card.rarity}` : ''} from ${card.setName}`

  const imageBlock = (
    <div
      className={cn(
        'relative aspect-[5/7] overflow-hidden rounded-xl border shadow-xs transition-shadow group-hover:shadow-md',
        TILE_SIZE_CLASS[size]
      )}
    >
      <TcgCardImage
        card={card}
        alt={`Cute ${card.name}${card.rarity ? ` ${card.rarity}` : ''} card from ${card.setName} - collectible Pokémon TCG`}
        className="object-contain"
        sizes={TILE_IMAGE_SIZES[size]}
      />
    </div>
  )

  return (
    <div className="group flex flex-col gap-2">
      {zoomable ? (
        <TcgCardZoomDialog card={card} alt={alt}>
          {imageBlock}
        </TcgCardZoomDialog>
      ) : (
        imageBlock
      )}
      {showMeta ? (
        <div
          className={cn(
            'space-y-0.5 px-0.5',
            (size === 'compact' || size === 'priceList') && 'text-center'
          )}
        >
          <p className="truncate text-xs font-medium">{card.setName}</p>
          {card.rarity ? (
            <p className="text-muted-foreground truncate text-xs">{card.rarity}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
