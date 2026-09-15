import { createEffect } from 'solid-js'
import { usePathname } from '../../lib/compat-navigation'

/**
 * Smooth scroll to top when navigating between blog routes (e.g. index ↔ post).
 * Skips search-param-only updates on the same path (index filters use `scroll: false`).
 */
export function BlogScrollToTop() {
  const pathname = usePathname()
  let previousPathname = pathname()

  createEffect(() => {
    const current = pathname()
    if (previousPathname === current) {
      return
    }
    previousPathname = current

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  })

  return null
}
