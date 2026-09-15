'use client'

import * as React from 'react'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '../lib/utils'

export interface SearchableSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
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
  className?: string
  /** Render a custom chip for the selected value (shown in trigger). */
  renderSelected?: (option: SearchableSelectOption) => React.ReactNode
  /** Custom option filtering (e.g. fuzzy match); defaults to case-insensitive substring on label. */
  filterOptions?: (options: SearchableSelectOption[], search: string) => SearchableSelectOption[]
  /** When set, non-empty search text offers a free-text action row (and Enter
   *  in the input triggers it) so the box doubles as a text search. */
  freeText?: {
    labelFor: (search: string) => string
    onAction: (search: string) => void
  }
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'All',
  clearLabel,
  label,
  className,
  renderSelected,
  filterOptions,
  freeText,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const resolvedClearLabel = clearLabel ?? placeholder

  const filtered = React.useMemo(() => {
    if (!search) return options
    if (filterOptions) {
      return filterOptions(options, search)
    }
    const lower = search.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(lower))
  }, [options, search, filterOptions])

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value) ?? null,
    [options, value]
  )

  function handleSelect(optionValue: string) {
    onValueChange(value === optionValue ? null : optionValue)
    setOpen(false)
    setSearch('')
  }

  function handleClear() {
    onValueChange(null)
    setOpen(false)
    setSearch('')
  }

  function handleFreeText() {
    if (!freeText || !search.trim()) return
    freeText.onAction(search.trim())
    setOpen(false)
    setSearch('')
  }

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next: boolean) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
    >
      <PopoverPrimitive.Trigger
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label={label}
        className={cn(
          'border-input bg-background ring-offset-background hover:bg-accent/50 focus-visible:ring-ring flex h-9 w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
          className
        )}
      >
        <span className="truncate">
          {selectedOption ? (
            renderSelected ? (
              renderSelected(selectedOption)
            ) : selectedOption.icon ? (
              <span className="inline-flex items-center gap-1.5">
                {selectedOption.icon}
                <span>{selectedOption.label}</span>
              </span>
            ) : (
              <span className={cn(selectedOption.emphasized && 'font-bold')}>
                {selectedOption.label}
              </span>
            )
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={4} align="start" className="z-50">
          <PopoverPrimitive.Popup
            initialFocus={inputRef}
            className="bg-popover text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 w-(--anchor-width) min-w-50 rounded-xl border p-0 shadow-md outline-hidden"
          >
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Search className="text-muted-foreground h-4 w-4 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && freeText && search.trim()) {
                    e.preventDefault()
                    handleFreeText()
                  }
                }}
                className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-hidden"
              />
            </div>
            <div className="max-h-[240px] overflow-y-auto p-1">
              {freeText && search.trim() ? (
                <button
                  type="button"
                  onClick={handleFreeText}
                  className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    <Search className="text-muted-foreground h-3.5 w-3.5" />
                  </span>
                  <span className="truncate font-medium">{freeText.labelFor(search.trim())}</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  'hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  !value && 'font-medium'
                )}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {!value ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
                <span>{resolvedClearLabel}</span>
              </button>
              {filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    value === option.value && 'font-medium'
                  )}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {value === option.value ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span className="inline-flex items-center gap-1.5 truncate">
                    {option.icon}
                    <span className={cn(option.emphasized && 'font-bold')}>{option.label}</span>
                  </span>
                </button>
              ))}
              {filtered.length === 0 ? (
                <p className="text-muted-foreground px-2 py-4 text-center text-sm">No results</p>
              ) : null}
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
