import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import { BlogInlineText, splitBlogInlineText } from './blog-inline-text'

describe('splitBlogInlineText', () => {
  it('returns a single text segment for plain text', () => {
    expect(splitBlogInlineText('Hello world')).toEqual([{ kind: 'text', value: 'Hello world' }])
  })

  it('returns a single empty text segment for an empty string', () => {
    expect(splitBlogInlineText('')).toEqual([{ kind: 'text', value: '' }])
  })

  it('parses a markdown [label](url) link', () => {
    expect(splitBlogInlineText('[Pikachu](https://example.com/pikachu)')).toEqual([
      { kind: 'link', href: 'https://example.com/pikachu', label: 'Pikachu' },
    ])
  })

  it('splits leading and trailing text around a markdown link', () => {
    expect(splitBlogInlineText('See [Pikachu](https://example.com/pikachu) for details')).toEqual([
      { kind: 'text', value: 'See ' },
      { kind: 'link', href: 'https://example.com/pikachu', label: 'Pikachu' },
      { kind: 'text', value: ' for details' },
    ])
  })

  it('parses multiple markdown links with text between them', () => {
    expect(splitBlogInlineText('[A](https://a.example) [B](https://b.example)')).toEqual([
      { kind: 'link', href: 'https://a.example', label: 'A' },
      { kind: 'text', value: ' ' },
      { kind: 'link', href: 'https://b.example', label: 'B' },
    ])
  })

  it('parses the legacy Bulbapedia [url label] format', () => {
    expect(splitBlogInlineText('See [https://bulbapedia.com/Pikachu Pikachu] for info')).toEqual([
      { kind: 'text', value: 'See ' },
      { kind: 'link', href: 'https://bulbapedia.com/Pikachu', label: 'Pikachu' },
      { kind: 'text', value: ' for info' },
    ])
  })

  it('mixes markdown and legacy links in one string', () => {
    expect(
      splitBlogInlineText('[A](https://a.example) [https://b.example B] [C](https://c.example)')
    ).toEqual([
      { kind: 'link', href: 'https://a.example', label: 'A' },
      { kind: 'text', value: ' ' },
      { kind: 'link', href: 'https://b.example', label: 'B' },
      { kind: 'text', value: ' ' },
      { kind: 'link', href: 'https://c.example', label: 'C' },
    ])
  })

  it('treats text with balanced brackets but no url as plain text', () => {
    expect(splitBlogInlineText('an [unbalanced] bracket pair')).toEqual([
      { kind: 'text', value: 'an [unbalanced] bracket pair' },
    ])
  })

  it('does not turn a bare url into a link', () => {
    expect(splitBlogInlineText('Visit https://example.com today')).toEqual([
      { kind: 'text', value: 'Visit https://example.com today' },
    ])
  })

  it('handles a markdown link at the start of the string', () => {
    expect(splitBlogInlineText('[Pikachu](https://example.com/pikachu) details')).toEqual([
      { kind: 'link', href: 'https://example.com/pikachu', label: 'Pikachu' },
      { kind: 'text', value: ' details' },
    ])
  })

  it('handles a markdown link at the end of the string', () => {
    expect(splitBlogInlineText('See [Pikachu](https://example.com/pikachu)')).toEqual([
      { kind: 'text', value: 'See ' },
      { kind: 'link', href: 'https://example.com/pikachu', label: 'Pikachu' },
    ])
  })
})

describe('BlogInlineText', () => {
  it('renders plain text when there are no links', () => {
    const { container } = render(<BlogInlineText text="Hello world" />)
    expect(container?.textContent).toBe('Hello world')
    expect(container?.querySelector('a')).toBeNull()
  })

  it('renders an anchor with correct attributes for a markdown link', () => {
    const { container } = render(<BlogInlineText text="[Pikachu](https://example.com/pikachu)" />)
    const anchor = container?.querySelector('a')
    expect(anchor).not.toBeNull()
    expect(anchor?.getAttribute('href')).toBe('https://example.com/pikachu')
    expect(anchor?.textContent).toBe('Pikachu')
    expect(anchor?.getAttribute('target')).toBe('_blank')
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('renders surrounding text and anchors together', () => {
    const { container } = render(
      <BlogInlineText text="See [Pikachu](https://example.com/pikachu) now" />
    )
    expect(container?.textContent).toBe('See Pikachu now')
    expect(container?.querySelectorAll('a').length).toBe(1)
  })

  it('applies a custom linkClassName', () => {
    const { container } = render(
      <BlogInlineText text="[Pikachu](https://example.com/pikachu)" linkClassName="text-red-500" />
    )
    expect(container?.querySelector('a')?.className).toBe('text-red-500')
  })

  it('renders anchors for the legacy Bulbapedia link format', () => {
    const { container } = render(
      <BlogInlineText text="See [https://bulbapedia.com/Pikachu Pikachu]" />
    )
    const anchor = container?.querySelector('a')
    expect(anchor).not.toBeNull()
    expect(anchor?.getAttribute('href')).toBe('https://bulbapedia.com/Pikachu')
    expect(anchor?.textContent).toBe('Pikachu')
  })
})
