import type { JSX } from 'solid-js'

export function BlogCardHighlightItem({
  children,
  supportingText,
  supportingSlot,
}: {
  children: JSX.Element
  supportingText: string
  supportingSlot?: JSX.Element
}) {
  return (
    <div class="space-y-2">
      {children}
      {supportingSlot}
      <p class="text-muted-foreground text-xs leading-relaxed">{supportingText}</p>
    </div>
  )
}
