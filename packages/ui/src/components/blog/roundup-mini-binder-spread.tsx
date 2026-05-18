import Image from 'next/image'
import type { PokemonTcgCard } from '@repo/data/client'
import { PokemonTcgCardTile } from './pokemon-tcg-card-tile'
import type { RoundupMichiScene } from './roundup-michi-scene-row'

export type RoundupBinderSlot =
  | { kind: 'card'; card: PokemonTcgCard }
  | { kind: 'michi'; scene: RoundupMichiScene; displayName: string }
  | { kind: 'art'; url: string; alt: string }

export type PositionedRoundupBinderSlot = {
  slot: RoundupBinderSlot
  row: number
  col: number
  colSpan: 1 | 2
}

function BinderPage({
  slots,
  pageLabel,
}: {
  slots: PositionedRoundupBinderSlot[]
  pageLabel: string
}) {
  return (
    <div className="bg-muted/15 rounded-xl border p-3">
      <p className="text-muted-foreground mb-2 text-center text-xs font-medium uppercase tracking-wide">
        {pageLabel}
      </p>
      <div className="grid grid-cols-3 grid-rows-3 gap-2" style={{ minHeight: 'min(420px, 52vw)' }}>
        {slots.map((placed, index) => {
          const { slot, row, col, colSpan } = placed
          return (
            <div
              key={`${pageLabel}-${row}-${col}-${index}`}
              className={`bg-card overflow-hidden rounded-md border shadow-sm ${
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
                <div className="bg-muted/30 relative flex h-full w-full items-center justify-center p-1 opacity-40">
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

export function RoundupMiniBinderSpread({
  pageOne,
  pageTwo,
}: {
  pageOne: PositionedRoundupBinderSlot[]
  pageTwo: PositionedRoundupBinderSlot[]
}) {
  if (pageOne.length === 0 && pageTwo.length === 0) {
    return null
  }

  return (
    <section className="bg-card rounded-2xl border p-5">
      <h2 className="text-xl font-semibold tracking-tight">Mini binder spread</h2>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        A 3×3 spread across two pages — four Michi Method scenes (two per page, random wide slots;
        each spans two side-by-side pockets) plus one chase card per ranked Pokémon in the open
        singles. Layout is seeded per post so it stays consistent on rebuild; not print-ready.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <BinderPage slots={pageOne} pageLabel="Left page" />
        <BinderPage slots={pageTwo} pageLabel="Right page" />
      </div>
    </section>
  )
}
