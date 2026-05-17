'use client'

import * as React from 'react'
import { cn } from '../lib/utils'

interface LazyWhenVisibleProps {
  children: React.ReactNode
  className?: string
  /** IntersectionObserver rootMargin — load slightly before entering the viewport. */
  rootMargin?: string
}

/**
 * Defers mounting children until the placeholder nears the viewport.
 * Use for below-the-fold sections so hero content gets priority.
 */
function LazyWhenVisible({ children, className, rootMargin = '240px' }: LazyWhenVisibleProps) {
  const placeholderRef = React.useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (isVisible) {
      return
    }

    const node = placeholderRef.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [isVisible, rootMargin])

  return (
    <div ref={placeholderRef} className={cn('w-full', className)}>
      {isVisible ? children : null}
    </div>
  )
}

export { LazyWhenVisible }
