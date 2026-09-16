import { describe, expect, test } from 'bun:test'
import { fireEvent, render, screen } from '@solidjs/testing-library'

import { SearchableSelect, type SearchableSelectOption } from './searchable-select'

const MANY_OPTIONS: SearchableSelectOption[] = Array.from({ length: 250 }, (_, index) => ({
  value: `option-${index}`,
  label: `Option ${index}`,
}))

function openDropdown() {
  fireEvent.click(screen.getByRole('combobox'))
}

function renderedOptionLabels(): string[] {
  return [...document.querySelectorAll('button[type="button"]')]
    .map((button) => button.textContent ?? '')
    .filter((text) => text.startsWith('Option '))
}

describe('ui/components/searchable-select', () => {
  test('selects an option and reports it through onValueChange', () => {
    const selections: (string | null)[] = []
    const options: SearchableSelectOption[] = [
      { value: 'fire', label: 'Fire' },
      { value: 'water', label: 'Water' },
    ]
    render(() => (
      <SearchableSelect options={options} value={null} onValueChange={(v) => selections.push(v)} />
    ))

    openDropdown()
    fireEvent.click(screen.getByText('Water'))
    expect(selections).toEqual(['water'])
  })

  test('mounts a bounded option window for large catalogs, with an overflow hint', () => {
    render(() => <SearchableSelect options={MANY_OPTIONS} value={null} onValueChange={() => {}} />)

    openDropdown()
    const mounted = renderedOptionLabels()
    expect(mounted.length).toBe(100)
    expect(screen.getByText(/more matches/).textContent).toMatch(/150/)
  })

  test('searching narrows the catalog and clears the overflow hint', async () => {
    render(() => <SearchableSelect options={MANY_OPTIONS} value={null} onValueChange={() => {}} />)

    openDropdown()
    const search = screen.getByPlaceholderText('Search…') as HTMLInputElement
    search.value = 'Option 249'
    fireEvent.input(search)
    // Option filtering is debounced; the input value itself updates instantly.
    expect(search.value).toBe('Option 249')
    await Bun.sleep(120)

    const mounted = renderedOptionLabels()
    expect(mounted).toEqual(['Option 249'])
    expect(screen.queryByText(/more matches/)).toBeNull()
  })

  test('option filtering is debounced — the ranked list lags the input slightly', async () => {
    render(() => <SearchableSelect options={MANY_OPTIONS} value={null} onValueChange={() => {}} />)

    openDropdown()
    const search = screen.getByPlaceholderText('Search…') as HTMLInputElement
    search.value = 'Option 249'
    fireEvent.input(search)
    // Inside the debounce window the full (capped) list is still mounted.
    expect(renderedOptionLabels().length).toBe(100)
    await Bun.sleep(120)
    expect(renderedOptionLabels()).toEqual(['Option 249'])
  })

  test('loading state shows a spinner and a loading row instead of "No results"', () => {
    render(() => (
      <SearchableSelect
        options={[]}
        value={null}
        onValueChange={() => {}}
        loading
        loadingLabel="Loading tag catalog…"
      />
    ))

    expect(document.querySelector('.animate-spin')).not.toBeNull()
    openDropdown()
    expect(screen.getByText('Loading tag catalog…')).not.toBeNull()
    expect(screen.queryByText('No results')).toBeNull()
  })

  test('free-text search stays usable while the catalog loads', () => {
    const commits: string[] = []
    render(() => (
      <SearchableSelect
        options={[]}
        value={null}
        onValueChange={() => {}}
        loading
        freeText={{
          labelFor: (search) => `Search for "${search}"`,
          onAction: (search) => commits.push(search),
        }}
      />
    ))

    openDropdown()
    const search = screen.getByPlaceholderText('Search…') as HTMLInputElement
    search.value = 'pika'
    fireEvent.input(search)
    fireEvent.click(screen.getByText('Search for "pika"'))
    expect(commits).toEqual(['pika'])
  })

  test('the selected chip renders even when the option sits outside the mounted window', () => {
    render(() => (
      <SearchableSelect
        options={MANY_OPTIONS}
        value="option-249"
        onValueChange={() => {}}
        renderSelected={(option) => <span>chip:{option.label}</span>}
      />
    ))

    expect(screen.getByText('chip:Option 249')).not.toBeNull()
  })
})
