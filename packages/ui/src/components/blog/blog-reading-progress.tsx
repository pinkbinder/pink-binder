import { createEffect, createSignal, onCleanup } from 'solid-js'

export function BlogReadingProgress(props: { articleId: string }) {
  const [indicator, setIndicator] = createSignal<HTMLDivElement>()

  createEffect(() => {
    const article = document.getElementById(props.articleId)

    const el = indicator()
    if (!article || !el) {
      return
    }

    const bar = el
    let animationFrame = 0

    const updateProgress = () => {
      animationFrame = 0

      const articleRect = article.getBoundingClientRect()
      const readableDistance = Math.max(articleRect.height - window.innerHeight, 1)
      const progress = Math.min(Math.max(-articleRect.top / readableDistance, 0), 1)

      bar.style.transform = `scaleX(${progress})`
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

    onCleanup(() => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame)
      }
      resizeObserver?.disconnect()
      window.removeEventListener('scroll', scheduleProgressUpdate)
      window.removeEventListener('resize', scheduleProgressUpdate)
    })
  })

  return (
    <div
      ref={setIndicator}
      class="bg-primary h-full origin-left scale-x-0 shadow-[0_1px_6px_hsl(var(--primary))] will-change-transform"
    />
  )
}
