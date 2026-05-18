import type { PokemonTcgCard } from '@repo/data/client'

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount)
}

export function TcgCardPriceLabel({ card }: { card: PokemonTcgCard }) {
  const market = card.price?.market ?? card.price?.mid
  if (market === undefined || market <= 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-0.5">
      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
        {formatUsd(market)} <span className="text-muted-foreground font-normal">NM market</span>
      </p>
      {card.tcgplayerUrl ? (
        <a
          href={card.tcgplayerUrl}
          target="_blank"
          rel="noreferrer sponsored"
          className="text-primary text-xs font-semibold underline underline-offset-2"
        >
          View on TCGPlayer
        </a>
      ) : null}
    </div>
  )
}
