import type { PokemonTcgCard } from '@repo/data/client'

// Hoisted: Intl.NumberFormat construction is comparatively expensive, so the
// shared USD formatter is created once, not per rendered price label.
const USD_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

function formatUsd(amount: number): string {
  return USD_FORMAT.format(amount)
}

export function TcgCardPriceLabel({
  card,
  showTcgplayerLogo = false,
}: {
  card: PokemonTcgCard
  showTcgplayerLogo?: boolean
}) {
  const market = card.price?.market ?? card.price?.mid
  if (market === undefined || market <= 0) {
    return null
  }

  return (
    <div class="flex flex-wrap items-center gap-2 px-0.5">
      <p class="text-success-foreground text-sm font-semibold">
        {formatUsd(market)} <span class="text-muted-foreground font-normal">NM market</span>
      </p>
      {card.tcgplayerUrl ? (
        <a
          href={card.tcgplayerUrl}
          target="_blank"
          rel="noreferrer sponsored"
          class="text-primary-deep inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-2"
        >
          {showTcgplayerLogo ? (
            <img
              src="https://www.tcgplayer.com/favicon.ico"
              alt="TCGPlayer"
              width={12}
              height={12}
              loading="lazy"
              decoding="async"
            />
          ) : null}
          View on TCGPlayer
        </a>
      ) : null}
    </div>
  )
}
