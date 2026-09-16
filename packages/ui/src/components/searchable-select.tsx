import * as PopoverPrimitive from '@kobalte/core/popover'
import { Check, ChevronDown, LoaderCircle, Search } from 'lucide-solid'
import { createMemo, createSignal, For, onCleanup, Show, type JSX } from 'solid-js'
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
  /** Max options mounted in the open dropdown (default 100). Large catalogs
   *  (2k+ tag entries) only need the top of a ranked list; typing narrows
   *  further. Selection display reads the full `options`, not this window. */
  renderLimit?: number
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
  /** Set while the option catalog is still loading: the trigger shows a
   *  spinner and the open dropdown shows a loading row instead of "No
   *  results". Free-text actions stay usable the whole time. */
  loading?: boolean
  /** Dropdown row text while `loading` (default "Loading…"). */
  loadingLabel?: string
}

/** Cap on mounted dropdown rows. Opening a 2,000-button list costs far more
 *  than the interaction it serves; the overflow hint routes users to search. */
const DEFAULT_RENDER_LIMIT = 100

/** Idle window before keystrokes re-rank/filter the option list. The ranked
 *  catalogs can hold 2k+ entries, so the filter memo must not run per
 *  character; the input value itself stays unsprung for immediate feedback. */
const FILTER_DEBOUNCE_MS = 60

export function SearchableSelect(props: SearchableSelectProps) {
  const [open, setOpen] = createSignal(false)
  const [searchInput, setSearchInput] = createSignal('')
  const [appliedSearch, setAppliedSearch] = createSignal('')
  const resolvedClearLabel = () => props.clearLabel ?? props.placeholder ?? 'All'

  const filtered = createMemo(() => {
    const term = appliedSearch()
    if (!term) return props.options
    if (props.filterOptions) {
      return props.filterOptions(props.options, term)
    }
    const lower = term.toLowerCase()
    return props.options.filter((opt) => opt.label.toLowerCase().includes(lower))
  })

  const rendered = createMemo(() => filtered().slice(0, props.renderLimit ?? DEFAULT_RENDER_LIMIT))
  const overflowCount = createMemo(() => filtered().length - rendered().length)

  const selectedOption = createMemo(
    () => props.options.find((opt) => opt.value === props.value) ?? null
  )

  let filterTimer: ReturnType<typeof setTimeout> | undefined

  function resetSearch() {
    if (filterTimer !== undefined) {
      clearTimeout(filterTimer)
      filterTimer = undefined
    }
    setSearchInput('')
    setAppliedSearch('')
  }

  function handleSelect(optionValue: string) {
    props.onValueChange(props.value === optionValue ? null : optionValue)
    setOpen(false)
    resetSearch()
  }

  function handleClear() {
    props.onValueChange(null)
    setOpen(false)
    resetSearch()
  }

  function handleFreeText() {
    const term = searchInput().trim()
    if (!props.freeText || !term) return
    props.freeText.onAction(term)
    setOpen(false)
    resetSearch()
  }

  function handleSearchInput(value: string) {
    setSearchInput(value)
    if (filterTimer !== undefined) {
      clearTimeout(filterTimer)
      filterTimer = undefined
    }
    if (!value) {
      setAppliedSearch('')
      return
    }
    filterTimer = setTimeout(() => {
      filterTimer = undefined
      setAppliedSearch(searchInput().trim())
    }, FILTER_DEBOUNCE_MS)
  }

  onCleanup(() => {
    if (filterTimer !== undefined) clearTimeout(filterTimer)
  })

  return (
    <PopoverPrimitive.Root
      open={open()}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetSearch()
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
        <Show
          when={props.loading}
          fallback={<ChevronDown class="h-3.5 w-3.5 shrink-0 opacity-50" />}
        >
          <LoaderCircle class="h-3.5 w-3.5 shrink-0 animate-spin opacity-50" aria-hidden />
        </Show>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content class="bg-popover text-popover-foreground data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:animate-in data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 w-(--kb-popper-anchor-width) min-w-50 rounded-xl border p-0 shadow-md outline-hidden">
          <div class="flex items-center gap-2 border-b px-3 py-2">
            <Search class="text-muted-foreground h-4 w-4 shrink-0" />
            <input
              type="text"
              placeholder="Search…"
              autofocus
              value={searchInput()}
              onInput={(e) => handleSearchInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && props.freeText && searchInput().trim()) {
                  e.preventDefault()
                  handleFreeText()
                }
              }}
              class="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-hidden"
            />
          </div>
          <div class="max-h-60 overflow-y-auto p-1">
            <Show when={props.freeText && searchInput().trim() ? props.freeText : undefined}>
              {(freeText) => (
                <button
                  type="button"
                  onClick={handleFreeText}
                  class="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
                >
                  <span class="flex h-4 w-4 shrink-0 items-center justify-center">
                    <Search class="text-muted-foreground h-3.5 w-3.5" />
                  </span>
                  <span class="truncate font-medium">
                    {freeText().labelFor(searchInput().trim())}
                  </span>
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
            <For each={rendered()}>
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
            <Show when={overflowCount() > 0}>
              <p class="text-muted-foreground px-2 py-2 text-center text-xs">
                Keep typing — {overflowCount().toLocaleString()} more matches
              </p>
            </Show>
            <Show when={props.loading && filtered().length === 0}>
              <p class="text-muted-foreground flex items-center justify-center gap-2 px-2 py-4 text-sm">
                <LoaderCircle class="h-3.5 w-3.5 animate-spin" aria-hidden />
                {props.loadingLabel ?? 'Loading…'}
              </p>
            </Show>
            <Show when={!props.loading && filtered().length === 0}>
              <p class="text-muted-foreground px-2 py-4 text-center text-sm">No results</p>
            </Show>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
