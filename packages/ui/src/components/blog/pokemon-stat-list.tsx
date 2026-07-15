import { cn } from '../../lib/utils'

type PokemonStatListEntry = {
  name: string
  label: string
  value: number
}

const STAT_EMOJI_BY_NAME: Record<string, string> = {
  hp: '❤️',
  attack: '⚔️',
  defense: '🛡️',
  'special-attack': '✨',
  'special-defense': '🔮',
  speed: '💨',
}

function statBarColor(value: number): string {
  if (value >= 150) return '#5A8FFF'
  if (value >= 100) return '#50C878'
  if (value >= 60) return '#F5A623'
  return '#FF6B6B'
}

function statCommentary(name: string, value: number): string {
  if (name === 'speed') {
    if (value >= 110) return 'Sweeper-tier pace'
    if (value >= 85) return 'Quick mover'
    if (value < 50) return 'Deliberately slow'
  }
  if (name === 'attack' || name === 'special-attack') {
    if (value >= 120) return 'Heavy hitter'
    if (value >= 95) return 'Strong pressure'
  }
  if (name === 'defense' || name === 'special-defense') {
    if (value >= 120) return 'Wall-level bulk'
    if (value >= 95) return 'Sturdy matchup'
  }
  if (name === 'hp' && value >= 100) return 'Deep HP pool'
  if (value >= 100) return 'Standout stat'
  if (value >= 75) return 'Solid range'
  if (value < 50) return 'Clear trade-off'
  return 'Balanced range'
}

export function PokemonStatList({
  stats,
  total,
  className,
}: {
  stats: PokemonStatListEntry[]
  total: number
  className?: string
}) {
  return (
    <div className={cn(className)}>
      <div className="space-y-3">
        {stats.map((stat) => {
          const pct = Math.min(Math.round((stat.value / 255) * 100), 100)
          const emoji = STAT_EMOJI_BY_NAME[stat.name] ?? '•'

          return (
            <div
              key={stat.name}
              className="grid grid-cols-[5.5rem_2.5rem_1fr] items-center gap-x-3 gap-y-1 sm:grid-cols-[7rem_2.5rem_1fr_8rem]"
            >
              <p className="text-muted-foreground inline-flex items-center justify-end gap-1 text-right text-xs">
                <span aria-hidden>{emoji}</span>
                <span>{stat.label}</span>
              </p>
              <p className="text-sm font-semibold tabular-nums">{stat.value}</p>
              <div
                className="bg-muted h-2 overflow-hidden rounded-full"
                role="progressbar"
                aria-label={`${stat.label}: ${stat.value}`}
                aria-valuenow={stat.value}
                aria-valuemin={0}
                aria-valuemax={255}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: statBarColor(stat.value) }}
                />
              </div>
              <p className="text-muted-foreground col-start-3 text-xs font-medium sm:col-start-4 sm:text-right">
                {statCommentary(stat.name, stat.value)}
              </p>
            </div>
          )
        })}
      </div>
      <p className="text-muted-foreground mt-4 text-sm">
        Total: <span className="text-foreground font-semibold">{total}</span>
      </p>
    </div>
  )
}
