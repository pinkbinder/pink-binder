import type { ReactNode } from 'react'

export function BlogCardHighlightItem({
  children,
  supportingText,
  supportingSlot,
}: {
  children: ReactNode
  supportingText: string
  supportingSlot?: ReactNode
}) {
  return (
    <div className="space-y-2">
      {children}
      {supportingSlot}
      <p className="text-xs leading-relaxed text-muted-foreground">{supportingText}</p>
    </div>
  )
}
