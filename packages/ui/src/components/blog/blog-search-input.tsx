'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BlogSearchInputProps {
  /** Committed search term (mirrors the `q` URL parameter). */
  value: string
  /** Called with the trimmed term once typing settles, on submit, or on clear. */
  onCommit: (term: string) => void
  /** Debounce before a keystroke commits; 0 commits on the next macrotask. */
  commitDelayMs?: number
  label?: string
  placeholder?: string
  className?: string
}

/**
 * Free-text blog search field. Typing commits to the URL state after a short
 * pause so results (and analytics) update once per phrase instead of once per
 * keystroke; Enter commits immediately and Escape or the clear button resets.
 */
export function BlogSearchInput({
  value,
  onCommit,
  commitDelayMs = 350,
  label = 'Search posts',
  placeholder = 'Search collector guides…',
  className,
}: BlogSearchInputProps) {
  const [draft, setDraft] = useState(value)
  const lastCommittedRef = useRef(value)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Follow external URL changes (back/forward, clear-all filters).
  useEffect(() => {
    if (value !== lastCommittedRef.current) {
      lastCommittedRef.current = value
      setDraft(value)
    }
  }, [value])

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  function commit(term: string) {
    clearTimeout(debounceRef.current)
    const trimmed = term.trim()
    if (trimmed === lastCommittedRef.current) return
    lastCommittedRef.current = trimmed
    onCommit(trimmed)
  }

  function handleChange(next: string) {
    setDraft(next)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => commit(next), commitDelayMs)
  }

  function handleClear() {
    setDraft('')
    commit('')
  }

  const showClear = draft.length > 0

  return (
    <form
      role="search"
      data-analytics-section="blog-search"
      onSubmit={(event) => {
        event.preventDefault()
        commit(draft)
      }}
      className={cn('relative flex items-center', className)}
    >
      <Search
        className="text-muted-foreground pointer-events-none absolute left-3 h-4 w-4"
        aria-hidden
      />
      <label className="sr-only" htmlFor="blog-search-input">
        {label}
      </label>
      <input
        id="blog-search-input"
        type="search"
        value={draft}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && draft) {
            event.preventDefault()
            handleClear()
          }
        }}
        className={cn(
          'bg-background border-border/70 focus-visible:ring-ring h-10 w-full rounded-xl border pl-9',
          'placeholder:text-muted-foreground text-sm shadow-xs transition-colors',
          'focus-visible:ring-primary/30 focus-visible:border-primary/40 outline-none focus-visible:ring-2',
          showClear ? 'pr-9' : 'pr-3'
        )}
      />
      {showClear ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          data-analytics-id="blog-search-clear"
          className="text-muted-foreground hover:text-foreground absolute right-2 grid h-7 w-7 place-items-center rounded-full"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </form>
  )
}
