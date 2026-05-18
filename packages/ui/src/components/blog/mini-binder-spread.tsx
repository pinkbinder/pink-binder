import Image from 'next/image'
import type { PokemonTcgCard } from '@repo/data/client'
import { PokemonTcgCardTile } from './pokemon-tcg-card-tile'
import type { RoundupMichiScene } from './roundup-michi-scene-row'

export type BinderSpreadSlot =
  | { kind: 'card'; card: PokemonTcgCard }
  | { kind: 'michi'; scene: RoundupMichiScene; displayName: string }
  | { kind: 'art'; url: string; alt: string }

export type PositionedBinderSpreadSlot = {
  slot: BinderSpreadSlot
  row: number
  col: number
  colSpan: 1 | 2
}

function BinderPage({
  slots,
  pageLabel,
}: {
  slots: PositionedBinderSpreadSlot[]
  pageLabel: string
}) {
  return (
    <div className="rounded-xl border bg-muted/15 p-3">
      <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {pageLabel}
      </p>
      <div className="grid grid-cols-3 grid-rows-3 gap-2" style={{ minHeight: 'min(420px, 52vw)' }}>
        {slots.map((placed, index) => {
          const { slot, row, col, colSpan } = placed
          return (
            <div
              key={`${pageLabel}-${row}-${col}-${index}`}
              className={`overflow-hidden rounded-md border bg-card shadow-sm ${
                colSpan === 2 ? 'aspect-[10/7] min-h-0' : 'aspect-[5/7] min-h-0'
              }`}
              style={{
                gridColumn: `${col + 1} / span ${colSpan}`,
                gridRow: `${row + 1}`,
              }}
            >
              {slot.kind === 'card' ? (
                <div className="h-full scale-[0.92] p-0.5">
                  <PokemonTcgCardTile card={slot.card} />
                </div>
              ) : slot.kind === 'michi' ? (
                <div className="relative h-full w-full">
                  <Image
                    src={slot.scene.url}
                    alt={`${slot.displayName} Michi scene`}
                    fill
                    className="object-cover"
                    sizes={colSpan === 2 ? '240px' : '120px'}
                    unoptimized
                  />
                </div>
              ) : (
                <div className="relative flex h-full w-full items-center justify-center bg-muted/30 p-1 opacity-40">
                  <Image
                    src={slot.url}
                    alt={slot.alt}
                    width={48}
                    height={48}
                    className="object-contain"
                    unoptimized={slot.url.endsWith('.svg')}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MiniBinderSpread({
  pageOne,
  pageTwo,
  title = 'Mini binder spread',
  description,
  leftPageLabel = 'Left page',
  rightPageLabel = 'Right page',
}: {
  pageOne: PositionedBinderSpreadSlot[]
  pageTwo: PositionedBinderSpreadSlot[]
  title?: string
  description?: string
  leftPageLabel?: string
  rightPageLabel?: string
}) {
  if (pageOne.length === 0 && pageTwo.length === 0) {
    return null
  }

  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <BinderPage slots={pageOne} pageLabel={leftPageLabel} />
        <BinderPage slots={pageTwo} pageLabel={rightPageLabel} />
      </div>
    </section>
  )
}
