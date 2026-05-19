import { cn } from '../../lib/utils'
import { PokemonTypeBadge } from './pokemon-type-badge'

export function PokemonTypeBadgeList({
  types,
  getHref,
  className,
}: {
  types: string[]
  getHref: (type: string) => string
  className?: string
}) {
  if (types.length === 0) {
    return null
  }

  return (
    <div className={cn('mt-2 flex flex-wrap gap-2', className)}>
      {types.map((type) => (
        <PokemonTypeBadge key={type} type={type} href={getHref(type)} />
      ))}
    </div>
  )
}
