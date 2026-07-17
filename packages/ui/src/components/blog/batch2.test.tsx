import { describe, expect, it } from 'bun:test'
import { render, screen } from '@testing-library/react'

import { BlogRankedListItem } from './blog-ranked-list-item'
import { RoundupCutestHeroImage } from './roundup-cutest-hero-image'

describe('ui/components/blog batch2', () => {
  describe('BlogRankedListItem', () => {
    it('renders the rank number and child content', () => {
      render(<BlogRankedListItem rank={3}>Pikachu</BlogRankedListItem>)
      expect(screen.getByText('#3')).toBeTruthy()
      expect(screen.getByText('Pikachu')).toBeTruthy()
    })
  })

  describe('RoundupCutestHeroImage', () => {
    it('renders an image for the first candidate', () => {
      render(<RoundupCutestHeroImage candidates={['/a.png', '/b.png']} alt="Cute" />)
      const img = screen.getByRole('img')
      expect(img?.getAttribute('alt')).toBe('Cute')
    })

    it('renders nothing when there are no candidates', () => {
      const { container } = render(<RoundupCutestHeroImage candidates={[]} alt="Cute" />)
      expect(container?.textContent?.trim()).toBe('')
    })
  })
})
