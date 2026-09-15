import * as SeparatorPrimitive from '@kobalte/core/separator'
import { splitProps } from 'solid-js'
import { cn } from '../lib/utils'

type SeparatorProps = SeparatorPrimitive.SeparatorRootProps & { class?: string }

function Separator(props: SeparatorProps) {
  const [local, rest] = splitProps(props, ['class', 'orientation'])
  const orientation = () => local.orientation ?? 'horizontal'
  return (
    <SeparatorPrimitive.Root
      orientation={orientation()}
      class={cn(
        'bg-border shrink-0',
        orientation() === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        local.class
      )}
      {...rest}
    />
  )
}

export { Separator }
