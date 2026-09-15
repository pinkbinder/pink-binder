import { cn } from '../../lib/utils'
import { PokemonTypeBadge } from './pokemon-type-badge'

export function PokemonTypeBadgeList({
  types,
  getHref,
  class: className,
}: {
  types: string[]
  getHref: (type: string) => string
  class?: string
}) {
  if (types.length === 0) {
    return null
  }

  return (
    <div class={cn('mt-2 flex flex-wrap gap-2', className)}>
      {types.map((type) => (
        <PokemonTypeBadge type={type} href={getHref(type)} />
      ))}
    </div>
  )
}
