import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlogSearchInput } from '../src/components/blog/blog-search-input'

const onCommit = mock()

describe('BlogSearchInput', () => {
  beforeEach(() => {
    onCommit.mockReset()
  })

  function input() {
    return screen.getByLabelText('Search posts')
  }

  it('commits the final term once typing settles', async () => {
    const user = userEvent.setup()
    render(<BlogSearchInput value="" onCommit={onCommit} commitDelayMs={0} />)

    await user.type(input(), 'pika')
    await waitFor(() => expect(onCommit).toHaveBeenLastCalledWith('pika'))
  })

  it('commits on Enter immediately and deduplicates repeated submits', async () => {
    const user = userEvent.setup()
    render(<BlogSearchInput value="" onCommit={onCommit} commitDelayMs={0} />)

    await user.type(input(), 'pika{Enter}')
    await waitFor(() => expect(onCommit).toHaveBeenLastCalledWith('pika'))

    const callsBeforeRepeat = onCommit.mock.calls.length
    await user.type(input(), '{Enter}')
    expect(onCommit.mock.calls.length).toBe(callsBeforeRepeat)
  })

  it('clears with the clear button and fires an empty commit', async () => {
    const user = userEvent.setup()
    render(<BlogSearchInput value="pika" onCommit={onCommit} commitDelayMs={0} />)

    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(onCommit).toHaveBeenCalledWith('')
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
  })

  it('clears with Escape', async () => {
    const user = userEvent.setup()
    render(<BlogSearchInput value="pika" onCommit={onCommit} commitDelayMs={0} />)

    await user.type(input(), '{Escape}')
    await waitFor(() => expect(onCommit).toHaveBeenCalledWith(''))
  })

  it('follows external value changes such as back/forward navigation', () => {
    const { rerender } = render(<BlogSearchInput value="" onCommit={onCommit} commitDelayMs={0} />)
    rerender(<BlogSearchInput value="eevee" onCommit={onCommit} commitDelayMs={0} />)

    expect((input() as HTMLInputElement).value).toBe('eevee')
  })

  it('renders as a search landmark with a clear button when non-empty', () => {
    render(<BlogSearchInput value="pika" onCommit={onCommit} commitDelayMs={0} />)

    expect(screen.getByRole('search')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Clear search' })).not.toBeNull()
  })
})
