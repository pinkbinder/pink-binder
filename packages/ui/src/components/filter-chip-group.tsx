import { For } from 'solid-js'
import { Button } from './button'

interface FilterChipGroupProps {
  options: readonly string[]
  currentValue: () => string
  getLabel: (option: string) => string
  onSelect: (value: string | null) => void
}

/**
 * Reusable filter chip row: a set of `variant="filterChip"` buttons
 * where one is `aria-pressed` at a time. Used by the inventory, content,
 * and ads console dashboards to eliminate duplicated filter-bar markup.
 */
export function FilterChipGroup(props: FilterChipGroupProps) {
  return (
    <div class="flex flex-wrap items-center gap-1.5">
      <For each={props.options}>
        {(option) => (
          <Button
            size="sm"
            variant="filterChip"
            aria-pressed={props.currentValue() === option}
            onClick={() => props.onSelect(option === 'all' ? null : option)}
          >
            {props.getLabel(option)}
          </Button>
        )}
      </For>
    </div>
  )
}
