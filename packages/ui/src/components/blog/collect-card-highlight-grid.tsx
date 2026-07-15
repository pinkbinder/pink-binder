'use client'

import type { PokemonTcgCard } from '@repo/data/client'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { TcgCardImage } from './tcg-card-image'
import { TcgCardZoomDialog } from './tcg-card-zoom-dialog'

export const COLLECT_CARD_HIGHLIGHT_MAX = 3

/** Matches `aspect-[5/7]` at max-w-[11rem] / sm:max-w-[13rem] for popular pick rows. */
export const PORTRAIT_CARD_MEDIA_CLASS =
  'mx-auto aspect-[5/7] w-full max-w-[11rem] sm:max-w-[13rem]'
export const PORTRAIT_CARD_MIN_HEIGHT_CLASS = 'min-h-[15.4rem] sm:min-h-[18.2rem]'

export type CollectCardHighlightGridItem = {
  card: PokemonTcgCard
  supportingText?: string
  supportingSlot?: ReactNode
}

function gridColumnClass(count: number, options?: { responsiveStrip?: boolean }): string {
  if (options?.responsiveStrip) {
    if (count >= 3) return 'grid-cols-2 sm:grid-cols-3'
    if (count === 2) return 'grid-cols-2'
    return 'grid-cols-1'
  }
  if (count >= 3) return 'grid-cols-3'
  if (count === 2) return 'grid-cols-2'
  return 'grid-cols-1'
}

/** Three-up strip matching {@link RoundupHeroArtworkGrid} `variant="article"` cells. */
export function CollectCardHighlightGrid({
  items,
  className,
  imageFit = 'contain',
  aspectRatio = 'strip',
  showSupportingMeta = true,
}: {
  items: CollectCardHighlightGridItem[]
  className?: string
  /** `contain` shows the full card; `cover` crops to fill the strip cell. */
  imageFit?: 'cover' | 'contain'
  /** `portrait` — single flagship card at TCG proportions (popular lists). */
  aspectRatio?: 'strip' | 'portrait'
  showSupportingMeta?: boolean
}) {
  const visible = items.slice(0, COLLECT_CARD_HIGHLIGHT_MAX)
  if (visible.length === 0) {
    return null
  }

  const containCard = imageFit === 'contain'
  const portraitCard = aspectRatio === 'portrait'
  const stripLayout = !portraitCard && aspectRatio === 'strip'
  const columns = gridColumnClass(visible.length, { responsiveStrip: stripLayout })
  const showMeta =
    showSupportingMeta && visible.some((item) => item.supportingText || item.supportingSlot)
  const imageSizes = portraitCard
    ? '(max-width: 768px) 52vw, 220px'
    : stripLayout
      ? '(max-width: 640px) 72vw, 33vw, 240px'
      : '(max-width: 768px) 33vw, 240px'

  const stripContain = containCard && stripLayout

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'bg-muted grid w-full rounded-xl border',
          portraitCard && PORTRAIT_CARD_MEDIA_CLASS,
          stripLayout && 'gap-3 p-2 sm:aspect-[12/5] sm:grid-rows-1 sm:gap-3 sm:p-3',
          !stripLayout && !portraitCard && 'aspect-[12/5] grid-rows-1',
          stripContain ? null : !stripLayout && 'divide-x divide-pink-100/80 overflow-hidden',
          !stripLayout && !portraitCard && columns,
          stripLayout && columns
        )}
      >
        {visible.map((item, index) => {
          const alt = `${item.card.name}${item.card.rarity ? ` ${item.card.rarity}` : ''} from ${item.card.setName}`
          const wrapThirdAlone = stripContain && visible.length === 3 && index === 2
          return (
            <div
              key={item.card.id}
              className={cn(
                'relative min-h-0 min-w-0',
                containCard
                  ? cn(
                      'flex items-center justify-center',
                      portraitCard && 'bg-muted/30 p-2 sm:p-2.5',
                      stripContain && 'aspect-[5/7] w-full sm:aspect-auto sm:h-full',
                      wrapThirdAlone &&
                        'col-span-2 max-w-[11rem] justify-self-center sm:col-span-1 sm:max-w-none'
                    )
                  : 'h-full overflow-hidden'
              )}
            >
              <div
                className={cn(
                  'relative',
                  containCard ? 'h-full min-h-0 w-full' : 'absolute inset-0'
                )}
              >
                <TcgCardImage
                  card={item.card}
                  alt={alt}
                  className={cn(containCard ? 'object-contain drop-shadow-md' : 'object-cover')}
                  sizes={imageSizes}
                />
              </div>
              <TcgCardZoomDialog
                card={item.card}
                alt={alt}
                className="absolute inset-0 z-[1] h-full w-full cursor-zoom-in rounded-none border-0 bg-transparent p-0 shadow-none hover:opacity-100 focus-visible:ring-inset"
              >
                <span className="sr-only">View larger image: {alt}</span>
              </TcgCardZoomDialog>
            </div>
          )
        })}
      </div>
      {showMeta ? (
        <div className={cn('grid gap-3', columns)}>
          {visible.map((item) => (
            <div key={`meta-${item.card.id}`} className="min-w-0 space-y-1">
              {item.supportingSlot}
              {item.supportingText ? (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {item.supportingText}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
