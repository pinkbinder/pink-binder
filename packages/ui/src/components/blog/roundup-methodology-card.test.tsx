import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'
import { RoundupMethodologyCard } from './roundup-methodology-card'

describe('RoundupMethodologyCard', () => {
  it('renders the intro and methodology copy', () => {
    render(<RoundupMethodologyCard intro="How we pick" methodology="We score by X" />)
    expect(screen.getByText('How we pick')).not.toBeNull()
    expect(screen.getByText('We score by X')).not.toBeNull()
  })

  it('renders inside a section element', () => {
    const { container } = render(<RoundupMethodologyCard intro="i" methodology="m" />)
    expect(container.querySelector('section')).not.toBeNull()
  })
})
