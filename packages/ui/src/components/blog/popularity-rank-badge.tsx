export interface PopularityRankBadgeProps {
  globalRank: number
  totalCount: number
  rank2025?: number
  rank2019?: number
  surveyYear2025?: number
  surveyAuthor2025?: string
  surveyYear2019?: number
  surveyAuthor2019?: string
}

export function PopularityRankBadge({
  globalRank,
  totalCount,
  rank2025,
  rank2019,
  surveyYear2025 = 2025,
  surveyAuthor2025 = 'Jawnysparklez',
  surveyYear2019 = 2019,
  surveyAuthor2019 = 'mamamia1001',
}: PopularityRankBadgeProps) {
  const tooltipId = `pop-rank-tooltip-${globalRank}`
  const tooltipLines: string[] = [
    `Blended rank from two r/pokemon "favourite Pokémon" surveys, weighted 60/40 toward the ${surveyYear2025} results (u/${surveyAuthor2025}; u/${surveyAuthor2019} ${surveyYear2019}).`,
  ]
  if (rank2025 !== undefined) {
    tooltipLines.push(`${surveyYear2025} survey: #${rank2025}`)
  }
  if (rank2019 !== undefined) {
    tooltipLines.push(`${surveyYear2019} survey: #${rank2019}`)
  }

  return (
    <div className="group relative inline-block">
      <span
        tabIndex={0}
        role="note"
        aria-describedby={tooltipId}
        aria-label={`Popularity rank #${globalRank} out of ${totalCount} in blended r/pokemon surveys`}
        className="border-border bg-muted text-muted-foreground focus:ring-ring group-hover:bg-muted/80 inline-flex cursor-default items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-hidden"
      >
        <span>Popularity Rank: #{globalRank}</span>
        <span aria-hidden className="text-[10px] opacity-60">
          ℹ
        </span>
      </span>
      <div
        id={tooltipId}
        role="tooltip"
        className="bg-popover text-popover-foreground invisible absolute top-full right-0 z-30 mt-1.5 w-96 max-w-[min(24rem,calc(100vw-2rem))] rounded-xl border p-3 text-xs leading-snug opacity-0 shadow-md transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        <p className="text-foreground font-medium">Fan survey data</p>
        {tooltipLines.map((line) => (
          <p key={line} className="text-muted-foreground mt-1">
            {line}
          </p>
        ))}
        <p className="text-foreground mt-2 font-medium">
          #{globalRank} / {totalCount}
        </p>
      </div>
    </div>
  )
}
