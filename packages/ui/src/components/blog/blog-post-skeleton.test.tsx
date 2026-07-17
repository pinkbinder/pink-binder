import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { BlogPostSkeleton } from './blog-post-skeleton'

describe('ui/components/blog/blog-post-skeleton', () => {
  it('renders an accessible loading placeholder', () => {
    const { container } = render(<BlogPostSkeleton />)
    const article = container.querySelector('article')
    expect(article).not.toBeNull()
    expect(article?.getAttribute('aria-busy')).toBe('true')
    expect(article?.getAttribute('aria-label')).toBe('Loading blog post')
  })
})
