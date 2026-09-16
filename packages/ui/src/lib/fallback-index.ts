import { createEffect, createSignal, on, type Accessor } from 'solid-js'

/**
 * Cursor over an ordered fallback-URL list shared by the image components.
 * Resets to the first candidate whenever the list identity changes (so a new
 * post/card/slug can never render a stale or out-of-range index) and advances
 * one candidate per failure, clamped at the last entry.
 */
export function createFallbackIndex(candidates: Accessor<readonly unknown[]>) {
  const [index, setIndex] = createSignal(0)
  createEffect(on(candidates, () => setIndex(0), { defer: true }))
  const advance = () =>
    setIndex((current) => (current + 1 < candidates().length ? current + 1 : current))
  return { index, advance }
}
