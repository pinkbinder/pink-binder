import { cn } from '../../lib/utils'

export function PokemonDexNumber({ number, class: className }: { number: number; class?: string }) {
  return (
    <span class={cn('text-muted-foreground font-mono text-xs', className)}>
      #{number.toString().padStart(4, '0')}
    </span>
  )
}
