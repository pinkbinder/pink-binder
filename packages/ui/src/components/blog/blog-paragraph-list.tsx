import { BlogInlineText } from '../../lib/blog-inline-text'
import { cn } from '../../lib/utils'

export function BlogParagraphList({
  paragraphs,
  class: className,
  paragraphClassName,
}: {
  paragraphs: string[]
  class?: string
  paragraphClassName?: string
}) {
  if (paragraphs.length === 0) {
    return null
  }

  return (
    <div class={cn('space-y-3', className)}>
      {paragraphs.map((paragraph) => (
        <p class={cn('text-foreground/85 leading-relaxed', paragraphClassName)}>
          <BlogInlineText text={paragraph} />
        </p>
      ))}
    </div>
  )
}
