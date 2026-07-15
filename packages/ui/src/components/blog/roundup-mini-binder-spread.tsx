import type { BinderSpreadSlot, PositionedBinderSpreadSlot } from './mini-binder-spread'
import { MiniBinderSpread } from './mini-binder-spread'

export type RoundupBinderSlot = BinderSpreadSlot
export type PositionedRoundupBinderSlot = PositionedBinderSpreadSlot

export function RoundupMiniBinderSpread({
  pageOne,
  pageTwo,
  persistenceKey,
}: {
  pageOne: PositionedRoundupBinderSlot[]
  pageTwo: PositionedRoundupBinderSlot[]
  persistenceKey: string
}) {
  if (pageOne.length === 0 && pageTwo.length === 0) {
    return null
  }

  return (
    <MiniBinderSpread
      pageOne={pageOne}
      pageTwo={pageTwo}
      persistenceKey={persistenceKey}
      title="Mini binder spread"
      description="A 3×3 spread across two pages — four Michi Method scenes (two per page, random wide slots; each spans two side-by-side pockets) plus one chase card per ranked Pokémon in the open singles. Layout is seeded per post so it stays consistent on rebuild; not print-ready."
      leftPageLabel="Left page"
      rightPageLabel="Right page"
    />
  )
}
