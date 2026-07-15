import { cn } from '../../lib/utils'

export function PokemonDexNumber({ number, className }: { number: number; className?: string }) {
  return (
    <span className={cn('text-muted-foreground font-mono text-xs', className)}>
      #{number.toString().padStart(4, '0')}
    </span>
  )
}
