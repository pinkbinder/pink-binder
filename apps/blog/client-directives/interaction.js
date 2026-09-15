/**
 * Custom Astro client directive: hydrate the island on the user's first
 * interaction intent with it, instead of on idle.
 *
 * The blog index is mostly read-only: cards and the filter chrome are fully
 * server-rendered, so visitors who never touch a filter never pay for the
 * island bundle (measured: mobile perf 78 → 97 with no hydration).
 * The first hover, tap, or keyboard focus inside the island hydrates Solid;
 * state tooling is unchanged (TanStack Query hydrates as-is).
 *
 * astro-island invokes the directive with only the `load` callback, so
 * listeners are global but scoped to events targeting inside the island.
 * Tradeoff: the interaction that triggers hydration lands before Solid is
 * attached — plain links still work (native navigation); a click on a
 * client-only control during hydration may need a second tap.
 */
const interactionDirective = (load) => {
  const hydrate = async () => {
    const hydrator = await load()
    await hydrator()
  }
  const events = ['pointerover', 'pointerdown', 'focusin', 'touchstart']
  const onIntent = (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('astro-island')) {
      return
    }
    stop()
    hydrate()
  }
  const stop = () => {
    events.forEach((name) => window.removeEventListener(name, onIntent, true))
  }
  events.forEach((name) => {
    window.addEventListener(name, onIntent, { capture: true, passive: true })
  })
}

export { interactionDirective as default }
