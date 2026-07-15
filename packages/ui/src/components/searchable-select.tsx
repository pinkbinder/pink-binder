'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '../lib/utils'

export interface SearchableSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  /** Stronger label weight in the dropdown (e.g. fan-favorite species). */
  emphasized?: boolean
}

export interface SearchableSelectProps {
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

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next: boolean) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
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
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] rounded-xl border p-0 shadow-md outline-hidden"
          onOpenAutoFocus={(e: Event) => {
            e.preventDefault()
            inputRef.current?.focus()
          }}
        >
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="text-muted-foreground h-4 w-4 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-hidden"
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto p-1">
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
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
