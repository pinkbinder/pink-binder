import type { PokemonTcgCard } from '@repo/data/client'

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount)
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
    <div className="flex flex-wrap items-center gap-2 px-0.5">
      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
        {formatUsd(market)} <span className="font-normal text-muted-foreground">NM market</span>
      </p>
      {card.tcgplayerUrl ? (
        <a
          href={card.tcgplayerUrl}
          target="_blank"
          rel="noreferrer sponsored"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline underline-offset-2"
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
