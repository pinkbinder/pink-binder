import { describe, expect, test } from 'bun:test'
import { createSignal } from 'solid-js'
import { render, screen } from '@solidjs/testing-library'

import { DebouncedInput } from '../src/components/debounced-input'

function typeText(value: string) {
  const input = screen.getByRole('textbox') as HTMLInputElement
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('admin debounced input', () => {
  test('commits once after the idle window, not per keystroke', async () => {
    const commits: string[] = []
    render(() => <DebouncedInput value="" onCommit={(value) => commits.push(value)} delayMs={15} />)

    typeText('pik')
    typeText('pika')
    expect(commits).toEqual([])

    await Bun.sleep(60)
    expect(commits).toEqual(['pika'])
  })

  test('Enter commits immediately', () => {
    const commits: string[] = []
    render(() => (
      <DebouncedInput value="" onCommit={(value) => commits.push(value)} delayMs={5_000} />
    ))

    typeText('eevee')
    const input = screen.getByRole('textbox') as HTMLInputElement
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(commits).toEqual(['eevee'])
  })

  test('an external value change resets the draft and cancels the pending commit', async () => {
    const commits: string[] = []
    const [value, setValue] = createSignal('committed')
    render(() => (
      <DebouncedInput
        value={value()}
        onCommit={(next) => {
          commits.push(next)
          setValue(next)
        }}
        delayMs={15}
      />
    ))

    typeText('char')
    // Back/forward or a filter reset lands while the commit is still pending.
    setValue('committed-from-history')
    await Bun.sleep(60)
    expect(commits).toEqual([])

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('committed-from-history')
  })

  test('committing the same value is a no-op', async () => {
    const commits: string[] = []
    render(() => (
      <DebouncedInput value="same" onCommit={(value) => commits.push(value)} delayMs={15} />
    ))

    typeText('same')
    await Bun.sleep(60)
    expect(commits).toEqual([])
  })
})
