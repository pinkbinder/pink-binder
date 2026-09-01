import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'
import { BLOG_R2_ASSETS, BLOG_LOCAL_ASSETS } from '../src/components/blog/blog-r2-assets'
import { BlogR2ResponsiveImage } from '../src/components/blog/blog-r2-responsive-image'

describe('BlogR2ResponsiveImage', () => {
  it('emits native responsive R2 sources with the local asset as a fallback', () => {
    render(
      <BlogR2ResponsiveImage
        sources={[
          { src: BLOG_R2_ASSETS.promo.small, width: 320 },
          { src: BLOG_R2_ASSETS.promo.medium, width: 640 },
          { src: BLOG_R2_ASSETS.promo.large, width: 886 },
        ]}
        fallbackSrc={BLOG_LOCAL_ASSETS.promo}
        alt="The Pink Binder live promo"
        width={886}
        height={886}
        sizes="(max-width: 640px) 100vw, 272px"
      />
    )

    const image = screen.getByRole('img', { name: 'The Pink Binder live promo' })
    const source = image.parentElement?.querySelector('source')

    expect(image.getAttribute('src')).toBe(BLOG_R2_ASSETS.promo.small)
    expect(source?.getAttribute('srcset')).toContain(`${BLOG_R2_ASSETS.promo.medium} 640w`)
    expect(source?.getAttribute('sizes')).toBe('(max-width: 640px) 100vw, 272px')
  })

  it('switches to the local fallback after the R2 image fails', () => {
    render(
      <BlogR2ResponsiveImage
        sources={[{ src: BLOG_R2_ASSETS.logo.small, width: 64 }]}
        fallbackSrc={BLOG_LOCAL_ASSETS.logo}
        alt="The Pink Binder logo"
        width={40}
        height={40}
        sizes="40px"
      />
    )

    const image = screen.getByRole('img', { name: 'The Pink Binder logo' })
    fireEvent.error(image)

    expect(image.getAttribute('src')).toBe(BLOG_LOCAL_ASSETS.logo)
    expect(image.parentElement?.querySelector('source')).toBeNull()
  })
})
