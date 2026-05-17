interface PokemonTypeLogoProps {
  logoUrl: string
  color: string
}

export function PokemonTypeLogo({ logoUrl, color }: PokemonTypeLogoProps) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5 shrink-0"
      style={{
        backgroundColor: color,
        WebkitMaskImage: `url(${logoUrl})`,
        maskImage: `url(${logoUrl})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
      }}
    />
  )
}
