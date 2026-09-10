'use client'

import { usePathname } from '../../lib/compat-navigation'
import { useEffect, useRef } from 'react'

/**
 * Smooth scroll to top when navigating between blog routes (e.g. index ↔ post).
 * Skips search-param-only updates on the same path (index filters use `scroll: false`).
 */
export function BlogScrollToTop() {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return
    }
    previousPathname.current = pathname

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [pathname])

  return null
}
