'use client'

import { useEffect, useRef } from 'react'

export function BlogReadingProgress({ articleId }: { articleId: string }) {
  const indicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const article = document.getElementById(articleId)
    const indicator = indicatorRef.current

    if (!article || !indicator) {
      return
    }

    let animationFrame = 0

    const updateProgress = () => {
      animationFrame = 0

      const articleRect = article.getBoundingClientRect()
      const readableDistance = Math.max(articleRect.height - window.innerHeight, 1)
      const progress = Math.min(Math.max(-articleRect.top / readableDistance, 0), 1)

      indicator.style.transform = `scaleX(${progress})`
    }

    const scheduleProgressUpdate = () => {
      if (animationFrame) {
        return
      }

      animationFrame = window.requestAnimationFrame(updateProgress)
    }

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => scheduleProgressUpdate())

    resizeObserver?.observe(article)
    window.addEventListener('scroll', scheduleProgressUpdate, { passive: true })
    window.addEventListener('resize', scheduleProgressUpdate)
    scheduleProgressUpdate()

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame)
      }
      resizeObserver?.disconnect()
      window.removeEventListener('scroll', scheduleProgressUpdate)
      window.removeEventListener('resize', scheduleProgressUpdate)
    }
  }, [articleId])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden>
      <div
        ref={indicatorRef}
        className="bg-primary h-full origin-left scale-x-0 shadow-[0_1px_6px_hsl(var(--primary))] will-change-transform"
      />
    </div>
  )
}
