'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { PokemonTcgCard } from '@repo/data/client'
import { MichiSceneArtImage } from './michi-scene-art-image'
import { PokemonTcgCardTile } from './pokemon-tcg-card-tile'
import { RemoteImageWithFallback } from '../remote-image-with-fallback'
import { Button } from '../button'
import type { RoundupMichiScene } from './roundup-michi-scene-row'

export type BinderSpreadSlot =
  | { kind: 'card'; card: PokemonTcgCard }
  | { kind: 'michi'; scene: RoundupMichiScene; displayName: string }
  | { kind: 'back' }
  | { kind: 'art'; url: string; alt: string }

export type PositionedBinderSpreadSlot = {
  slot: BinderSpreadSlot
  row: number
  col: number
  colSpan: 1 | 2
}

type InteractiveBinderSlot = PositionedBinderSpreadSlot & { contentId: string }
type BinderPageKey = 'pageOne' | 'pageTwo'
type BinderLayout = Record<BinderPageKey, InteractiveBinderSlot[]>

function slotContentIdentity(slot: BinderSpreadSlot): string {
  switch (slot.kind) {
    case 'card':
      return `card:${slot.card.id}`
    case 'michi':
      return `michi:${slot.scene.url}`
    case 'art':
      return `art:${slot.url}`
    case 'back':
      return 'back'
  }
}

function materializePage(
  slots: PositionedBinderSpreadSlot[],
  pageKey: BinderPageKey
): InteractiveBinderSlot[] {
  const occupied = new Set<string>()
  const materialized = slots.map((placed, index) => {
    if (
      Number.isInteger(placed.row) &&
      Number.isInteger(placed.col) &&
      placed.row >= 0 &&
      placed.row < 3 &&
      placed.col >= 0
    ) {
      for (let i = 0; i < placed.colSpan; i += 1) {
        const col = placed.col + i
        if (col < 3) {
          occupied.add(`${placed.row}:${col}`)
        }
      }
    }
    return {
      ...placed,
      contentId: `${slotContentIdentity(placed.slot)}:${pageKey}:${index}`,
    }
  })

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      if (!occupied.has(`${row}:${col}`)) {
        materialized.push({
          row,
          col,
          colSpan: 1,
          slot: { kind: 'back' },
          contentId: `${pageKey}:empty:${row}:${col}`,
        })
      }
    }
  }

  return materialized.sort((a, b) => (a.row !== b.row ? a.row - b.row : a.col - b.col))
}

function layoutStorageKey(layout: BinderLayout, title: string, persistenceKey?: string): string {
  const value = `${persistenceKey ?? title}|${layout.pageOne
    .map((slot) => slot.contentId)
    .join('|')}|${layout.pageTwo.map((slot) => slot.contentId).join('|')}`
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return `pink-binder:mini-binder:${(hash >>> 0).toString(36)}`
}

function restoreLayout(initial: BinderLayout, serialized: string | null): BinderLayout | null {
  if (!serialized) return null
  try {
    const saved = JSON.parse(serialized) as Partial<Record<BinderPageKey, string[]>>
    const allInitial = [...initial.pageOne, ...initial.pageTwo]
    const contentById = new Map(allInitial.map((slot) => [slot.contentId, slot]))
    const savedIds = [...(saved.pageOne ?? []), ...(saved.pageTwo ?? [])]
    if (
      saved.pageOne?.length !== initial.pageOne.length ||
      saved.pageTwo?.length !== initial.pageTwo.length ||
      new Set(savedIds).size !== allInitial.length ||
      savedIds.some((id) => !contentById.has(id))
    ) {
      return null
    }

    const restorePage = (pageKey: BinderPageKey) =>
      initial[pageKey].map((position, index) => {
        const content = contentById.get(saved[pageKey]![index]!)!
        return { ...position, contentId: content.contentId, slot: content.slot }
      })

    return { pageOne: restorePage('pageOne'), pageTwo: restorePage('pageTwo') }
  } catch {
    return null
  }
}

function BinderPage({
  slots,
  pageKey,
  pageLabel,
  selectedIndex,
  onSelect,
}: {
  slots: InteractiveBinderSlot[]
  pageKey: BinderPageKey
  pageLabel: string
  selectedIndex: number | null
  onSelect: (page: BinderPageKey, index: number) => void
}) {
  return (
    <div className="bg-muted/15 rounded-xl border p-3">
      <p className="text-muted-foreground mb-2 text-center text-xs font-medium tracking-wide uppercase">
        {pageLabel}
      </p>
      <div className="grid grid-cols-3 grid-rows-3 gap-2" style={{ minHeight: 'min(420px, 52vw)' }}>
        {slots.map((placed, index) => {
          const { slot, row, col, colSpan } = placed
          const selected = selectedIndex === index
          return (
            <div
              key={`${pageLabel}-${row}-${col}`}
              className={`bg-card relative overflow-hidden rounded-md border shadow-xs transition ${
                selected ? 'ring-primary ring-2 ring-offset-2' : 'hover:border-primary/60'
              } ${colSpan === 2 ? 'aspect-[10/7] min-h-0' : 'aspect-[5/7] min-h-0'}`}
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
                  <MichiSceneArtImage
                    scene={slot.scene}
                    displayName={slot.displayName}
                    sizes={colSpan === 2 ? '240px' : '120px'}
                  />
                </div>
              ) : slot.kind === 'back' ? (
                <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-700 p-2 text-white">
                  <div className="absolute inset-1 rounded-xs border border-white/30" />
                  <div className="absolute inset-2 rounded-xs border border-white/20" />
                  <div className="relative text-center">
                    <p className="text-[9px] tracking-[0.18em] text-white/80 uppercase">
                      Pokémon TCG
                    </p>
                    <p className="mt-1 text-[10px] font-semibold tracking-wide">Empty Slot</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 relative flex h-full w-full items-center justify-center p-1 opacity-40">
                  <div className="relative h-12 w-12">
                    <RemoteImageWithFallback
                      candidates={[slot.url]}
                      alt={slot.alt}
                      fill={false}
                      width={48}
                      height={48}
                      className="object-contain"
                      sizes="48px"
                      imageVariant="small"
                    />
                  </div>
                </div>
              )}
              <button
                type="button"
                aria-pressed={selected}
                aria-label={`${selected ? 'Cancel moving' : 'Move'} ${pageLabel} pocket ${row * 3 + col + 1}`}
                onClick={() => onSelect(pageKey, index)}
                className="bg-background/90 text-foreground hover:bg-background focus-visible:ring-ring absolute top-1 right-1 z-20 rounded-full border border-white/70 px-2 py-1 text-[10px] font-semibold shadow-md backdrop-blur transition focus-visible:ring-2 focus-visible:outline-hidden"
              >
                {selected ? 'Selected' : 'Move'}
              </button>
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
  persistenceKey,
}: {
  pageOne: PositionedBinderSpreadSlot[]
  pageTwo: PositionedBinderSpreadSlot[]
  title?: string
  description?: string
  leftPageLabel?: string
  rightPageLabel?: string
  /** Stable article identifier so layouts never leak between posts. */
  persistenceKey?: string
}) {
  const initialLayout = useMemo<BinderLayout>(
    () => ({
      pageOne: materializePage(pageOne, 'pageOne'),
      pageTwo: materializePage(pageTwo, 'pageTwo'),
    }),
    [pageOne, pageTwo]
  )
  const storageKey = useMemo(
    () => layoutStorageKey(initialLayout, title, persistenceKey),
    [initialLayout, persistenceKey, title]
  )
  const [layout, setLayout] = useState(initialLayout)
  const [selected, setSelected] = useState<{ page: BinderPageKey; index: number } | null>(null)
  const [storageReady, setStorageReady] = useState(false)
  const [status, setStatus] = useState('Choose Move on two pockets to swap them.')
  const skipNextSave = useRef(true)

  useEffect(() => {
    skipNextSave.current = true
    let serialized: string | null = null
    try {
      serialized = window.localStorage.getItem(storageKey)
    } catch {
      setStatus('Pocket moves work here, but this browser has disabled local saving.')
    }
    const saved = restoreLayout(initialLayout, serialized)
    if (saved) {
      setLayout(saved)
      setStatus('Your saved pocket layout is ready.')
    } else {
      setLayout(initialLayout)
    }
    setSelected(null)
    setStorageReady(true)
  }, [initialLayout, storageKey])

  useEffect(() => {
    if (!storageReady) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          pageOne: layout.pageOne.map((slot) => slot.contentId),
          pageTwo: layout.pageTwo.map((slot) => slot.contentId),
        })
      )
    } catch {
      setStatus('Pocket move applied for this visit; local saving is unavailable.')
    }
  }, [layout, storageKey, storageReady])

  if (pageOne.length === 0 && pageTwo.length === 0) return null

  function selectPocket(page: BinderPageKey, index: number) {
    if (!selected) {
      setSelected({ page, index })
      setStatus('First pocket selected. Choose a second pocket to swap.')
      return
    }
    if (selected.page === page && selected.index === index) {
      setSelected(null)
      setStatus('Move cancelled.')
      return
    }

    setLayout((current) => {
      const next: BinderLayout = {
        pageOne: current.pageOne.map((slot) => ({ ...slot })),
        pageTwo: current.pageTwo.map((slot) => ({ ...slot })),
      }
      const first = next[selected.page][selected.index]!
      const second = next[page][index]!
      const firstContent = { contentId: first.contentId, slot: first.slot }
      first.contentId = second.contentId
      first.slot = second.slot
      second.contentId = firstContent.contentId
      second.slot = firstContent.slot
      return next
    })
    setSelected(null)
    setStatus('Pockets swapped and saved on this device.')
  }

  function resetLayout() {
    setLayout(initialLayout)
    setSelected(null)
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      // Reset still succeeds in memory when storage is unavailable.
    }
    setStatus('Binder layout reset.')
  }

  return (
    <section className="bg-card rounded-2xl border p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
          ) : null}
          <p className="text-primary mt-2 text-xs font-medium">
            Interactive Pocket Binder · changes stay on this device
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetLayout} className="shrink-0">
          Reset pockets
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <BinderPage
          slots={layout.pageOne}
          pageKey="pageOne"
          pageLabel={leftPageLabel}
          selectedIndex={selected?.page === 'pageOne' ? selected.index : null}
          onSelect={selectPocket}
        />
        <BinderPage
          slots={layout.pageTwo}
          pageKey="pageTwo"
          pageLabel={rightPageLabel}
          selectedIndex={selected?.page === 'pageTwo' ? selected.index : null}
          onSelect={selectPocket}
        />
      </div>
    </section>
  )
}
