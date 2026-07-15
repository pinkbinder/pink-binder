import Link from 'next/link'
import {
  CLICKABLE_BADGE_CLASS,
  getPokemonTypeColors,
  getPokemonTypeLogoUrl,
} from '@repo/data/client'
import { PokemonTypeLogo } from '../pokemon-type-logo'

export function PokemonTypeBadge({ type, href }: { type: string; href: string }) {
  const colors = getPokemonTypeColors(type)
  const logoUrl = getPokemonTypeLogoUrl(type)

  return (
    <Link
      href={href}
      className={`${CLICKABLE_BADGE_CLASS} tracking-wider uppercase`}
      style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.bg }}
    >
      <span className="inline-flex items-center gap-1.5">
        {logoUrl ? <PokemonTypeLogo logoUrl={logoUrl} color={colors.text} /> : null}
        <span>{type}</span>
      </span>
    </Link>
  )
}
