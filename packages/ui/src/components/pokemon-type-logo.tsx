interface PokemonTypeLogoProps {
  logoUrl: string
  color: string
}

export function PokemonTypeLogo(props: PokemonTypeLogoProps) {
  return (
    <span
      aria-hidden="true"
      class="type-logo-mask inline-block size-3.5 shrink-0"
      style={{
        '--type-logo-url': `url(${props.logoUrl})`,
        '--type-logo-color': props.color,
      }}
    />
  )
}
