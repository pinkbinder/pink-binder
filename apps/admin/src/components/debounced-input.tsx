import { createEffect, createSignal, on, onCleanup, splitProps } from 'solid-js'
import { Input } from '@repo/ui'

/** Idle window before a keystroke commits to the URL/router. */
const DEFAULT_COMMIT_DELAY_MS = 300

interface DebouncedInputProps {
  /** Committed value (the URL/router state). */
  value: string
  /** Called after the user stops typing, and immediately on Enter/blur. */
  onCommit: (value: string) => void
  delayMs?: number
  placeholder?: string
  class?: string
  'aria-label'?: string
}

/**
 * Text input that decouples typing from router state. Text filters should
 * never write `history`/trigger loaders per keystroke — the draft lives in a
 * local signal and only the settled value reaches `onCommit`, so URL writes
 * and loader refetches happen once per pause instead of once per character.
 *
 * External value changes (back/forward navigation, filter reset) always win:
 * they overwrite the draft and cancel any pending commit.
 */
export function DebouncedInput(props: DebouncedInputProps) {
  const [local, rest] = splitProps(props, ['value', 'onCommit', 'delayMs'])
  const [draft, setDraft] = createSignal(local.value)
  let timer: ReturnType<typeof setTimeout> | undefined

  const cancelPending = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  const commit = (value: string) => {
    cancelPending()
    if (value !== local.value) {
      local.onCommit(value)
    }
  }

  createEffect(
    on(
      () => local.value,
      (committed) => {
        cancelPending()
        setDraft(committed)
      }
    )
  )

  onCleanup(cancelPending)

  return (
    <Input
      {...rest}
      value={draft()}
      onInput={(event) => {
        const next = event.currentTarget.value
        setDraft(next)
        cancelPending()
        timer = setTimeout(() => commit(next), local.delayMs ?? DEFAULT_COMMIT_DELAY_MS)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          commit(event.currentTarget.value)
        }
      }}
      onBlur={(event) => commit(event.currentTarget.value)}
    />
  )
}
