import { describe, expect, it, mock } from 'bun:test'
import { render, screen } from '@testing-library/react'

mock.module('../../lib/blog-inline-text', () => ({
  BlogInlineText: ({ text }: { text: string }) => <span data-testid="inline">{text}</span>,
}))

import { BlogInfoPill } from './blog-info-pill'
import { BlogParagraphList } from './blog-paragraph-list'
import { RoundupMethodologyCard } from './roundup-methodology-card'

describe('ui/components/blog simple components', () => {
  describe('BlogInfoPill', () => {
    it('renders label and value', () => {
      render(<BlogInfoPill label="Author" value="Andy" />)
      expect(screen.getByText('Author')).toBeTruthy()
      expect(screen.getByText('Andy')).toBeTruthy()
    })

    it('applies custom class names', () => {
      const { container } = render(<BlogInfoPill label="L" value="V" className="my-pill" />)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('my-pill')
    })
  })

  describe('BlogParagraphList', () => {
    it('renders nothing for an empty list', () => {
      const { container } = render(<BlogParagraphList paragraphs={[]} />)
      expect(container?.textContent?.trim()).toBe('')
    })

    it('renders each paragraph with inline text', () => {
      render(<BlogParagraphList paragraphs={['One', 'Two']} />)
      expect(screen.getAllByTestId('inline')).toHaveLength(2)
      expect(screen.getByText('One')).toBeTruthy()
      expect(screen.getByText('Two')).toBeTruthy()
    })
  })

  describe('RoundupMethodologyCard', () => {
    it('renders intro and methodology copy', () => {
      render(<RoundupMethodologyCard intro="How we rank" methodology="We use stats." />)
      expect(screen.getByText('How we rank')).toBeTruthy()
      expect(screen.getByText('We use stats.')).toBeTruthy()
    })
  })
})
