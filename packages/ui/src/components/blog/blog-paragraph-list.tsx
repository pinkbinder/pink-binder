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
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className={cn('leading-relaxed text-foreground/85', paragraphClassName)}>
          {paragraph}
        </p>
      ))}
    </div>
  )
}
