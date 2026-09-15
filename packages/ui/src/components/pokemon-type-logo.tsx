import type { CSSProperties } from 'react'

interface PokemonTypeLogoProps {
  logoUrl: string
  color: string
}

export function PokemonTypeLogo({ logoUrl, color }: PokemonTypeLogoProps) {
  return (
    <span
      aria-hidden="true"
      className="type-logo-mask inline-block size-3.5 shrink-0"
      style={{ '--type-logo-url': `url(${logoUrl})`, '--type-logo-color': color } as CSSProperties}
    />
  )
}
