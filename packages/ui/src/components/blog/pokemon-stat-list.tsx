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
            <div key={stat.name} className="flex items-center gap-3">
              <p className="inline-flex w-20 shrink-0 items-center justify-end gap-1 text-right text-xs text-muted-foreground">
                <span aria-hidden>{emoji}</span>
                <span>{stat.label}</span>
              </p>
              <p className="w-8 shrink-0 text-sm font-semibold tabular-nums">{stat.value}</p>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: statBarColor(stat.value) }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Total: <span className="font-semibold text-foreground">{total}</span>
      </p>
    </div>
  )
}
