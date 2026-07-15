import { BlogInlineText } from '../../lib/blog-inline-text'
import { cn } from '../../lib/utils'

export function BlogParagraphList({
  paragraphs,
  className,
  paragraphClassName,
}: {
  paragraphs: string[]
  className?: string
  paragraphClassName?: string
}) {
  if (paragraphs.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      {paragraphs.map((paragraph, index) => (
        <p
          key={`${index}-${paragraph.slice(0, 48)}`}
          className={cn('text-foreground/85 leading-relaxed', paragraphClassName)}
        >
          <BlogInlineText text={paragraph} />
        </p>
      ))}
    </div>
  )
}
