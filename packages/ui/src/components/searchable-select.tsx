import * as PopoverPrimitive from '@kobalte/core/popover'
import { Check, ChevronDown, Search } from 'lucide-solid'
import { createMemo, createSignal, For, Show, type JSX } from 'solid-js'
import { cn } from '../lib/utils'

export interface SearchableSelectOption {
  value: string
  label: string
  icon?: JSX.Element
  /** Stronger label weight in the dropdown (e.g. fan-favorite species). */
  emphasized?: boolean
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  /** Label for the clear row in the dropdown (defaults to placeholder, then "All"). */
  clearLabel?: string
  label?: string
  class?: string
  /** Render a custom chip for the selected value (shown in trigger). */
  renderSelected?: (option: SearchableSelectOption) => JSX.Element
  /** Custom option filtering (e.g. fuzzy match); defaults to case-insensitive substring on label. */
  filterOptions?: (options: SearchableSelectOption[], search: string) => SearchableSelectOption[]
  /** When set, non-empty search text offers a free-text action row (and Enter
   *  in the input triggers it) so the box doubles as a text search. */
  freeText?: {
    labelFor: (search: string) => string
    onAction: (search: string) => void
  }
}

export function SearchableSelect(props: SearchableSelectProps) {
  const [open, setOpen] = createSignal(false)
  const [search, setSearch] = createSignal('')
  const resolvedClearLabel = () => props.clearLabel ?? props.placeholder ?? 'All'

  const filtered = createMemo(() => {
    const term = search()
    if (!term) return props.options
    if (props.filterOptions) {
      return props.filterOptions(props.options, term)
    }
    const lower = term.toLowerCase()
    return props.options.filter((opt) => opt.label.toLowerCase().includes(lower))
  })

  const selectedOption = createMemo(
    () => props.options.find((opt) => opt.value === props.value) ?? null
  )

  function handleSelect(optionValue: string) {
    props.onValueChange(props.value === optionValue ? null : optionValue)
    setOpen(false)
    setSearch('')
  }

  function handleClear() {
    props.onValueChange(null)
    setOpen(false)
    setSearch('')
  }

  function handleFreeText() {
    const term = search().trim()
    if (!props.freeText || !term) return
    props.freeText.onAction(term)
    setOpen(false)
    setSearch('')
  }

  return (
    <PopoverPrimitive.Root
      open={open()}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
      placement="bottom-start"
      gutter={4}
    >
      <PopoverPrimitive.Trigger
        type="button"
        role="combobox"
        aria-expanded={open()}
        aria-label={props.label}
        class={cn(
          'border-input bg-background ring-offset-background hover:bg-accent/50 focus-visible:ring-ring flex h-9 w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
          props.class
        )}
      >
        <span class="truncate">
          <Show when={selectedOption()} fallback={props.placeholder ?? 'All'}>
            {(selected) =>
              props.renderSelected ? (
                props.renderSelected(selected())
              ) : selected().icon ? (
                <span class="inline-flex items-center gap-1.5">
                  {selected().icon}
                  <span>{selected().label}</span>
                </span>
              ) : (
                <span class={cn(selected().emphasized && 'font-bold')}>{selected().label}</span>
              )
            }
          </Show>
        </span>
        <ChevronDown class="h-3.5 w-3.5 shrink-0 opacity-50" />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content class="bg-popover text-popover-foreground data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:animate-in data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 w-(--kb-popper-anchor-width) min-w-50 rounded-xl border p-0 shadow-md outline-hidden">
          <div class="flex items-center gap-2 border-b px-3 py-2">
            <Search class="text-muted-foreground h-4 w-4 shrink-0" />
            <input
              type="text"
              placeholder="Search…"
              autofocus
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && props.freeText && search().trim()) {
                  e.preventDefault()
                  handleFreeText()
                }
              }}
              class="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-hidden"
            />
          </div>
          <div class="max-h-60 overflow-y-auto p-1">
            <Show when={props.freeText && search().trim() ? props.freeText : undefined}>
              {(freeText) => (
                <button
                  type="button"
                  onClick={handleFreeText}
                  class="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
                >
                  <span class="flex h-4 w-4 shrink-0 items-center justify-center">
                    <Search class="text-muted-foreground h-3.5 w-3.5" />
                  </span>
                  <span class="truncate font-medium">{freeText().labelFor(search().trim())}</span>
                </button>
              )}
            </Show>
            <button
              type="button"
              onClick={handleClear}
              class={cn(
                'hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                !props.value && 'font-medium'
              )}
            >
              <span class="flex h-4 w-4 shrink-0 items-center justify-center">
                <Show when={!props.value}>
                  <Check class="h-3.5 w-3.5" />
                </Show>
              </span>
              <span>{resolvedClearLabel()}</span>
            </button>
            <For each={filtered()}>
              {(option) => (
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  class={cn(
                    'hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    props.value === option.value && 'font-medium'
                  )}
                >
                  <span class="flex h-4 w-4 shrink-0 items-center justify-center">
                    <Show when={props.value === option.value}>
                      <Check class="h-3.5 w-3.5" />
                    </Show>
                  </span>
                  <span class="inline-flex items-center gap-1.5 truncate">
                    {option.icon}
                    <span class={cn(option.emphasized && 'font-bold')}>{option.label}</span>
                  </span>
                </button>
              )}
            </For>
            <Show when={filtered().length === 0}>
              <p class="text-muted-foreground px-2 py-4 text-center text-sm">No results</p>
            </Show>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
