import { cn } from '../../lib/utils'

export function PokemonDexNumber({ number, className }: { number: number; className?: string }) {
  return (
    <span className={cn('font-mono text-xs text-muted-foreground', className)}>
      #{number.toString().padStart(4, '0')}
    </span>
  )
}
