import type { CSSProperties } from 'react'
import Link from '../compat-link'
import {
  CLICKABLE_BADGE_CLASS,
  getPokemonTypeColors,
  getPokemonTypeLogoUrl,
  readableTextColorOn,
} from '@repo/data/client'
import { PokemonTypeLogo } from '../pokemon-type-logo'

export function PokemonTypeBadge({ type, href }: { type: string; href: string }) {
  const colors = getPokemonTypeColors(type)
  const logoUrl = getPokemonTypeLogoUrl(type)

  return (
    <Link
      href={href}
      className={`${CLICKABLE_BADGE_CLASS} border-(--type-bg) bg-(--type-bg) tracking-wider text-(--type-fg) uppercase`}
      style={
        {
          '--type-bg': colors.bg,
          '--type-fg': readableTextColorOn(colors.bg),
        } as CSSProperties
      }
    >
      <span className="inline-flex items-center gap-1.5">
        {logoUrl ? (
          <PokemonTypeLogo logoUrl={logoUrl} color={readableTextColorOn(colors.bg)} />
        ) : null}
        <span>{type}</span>
      </span>
    </Link>
  )
}
