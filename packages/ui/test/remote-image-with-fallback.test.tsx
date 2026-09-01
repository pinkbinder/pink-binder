import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'
import { RemoteImageWithFallback } from '../src/components/remote-image-with-fallback'

describe('RemoteImageWithFallback', () => {
  it('prefers the static R2 variant and falls back to the source URL', async () => {
    render(
      <RemoteImageWithFallback
        candidates={[
          'https://images.pinkbinder.shop/pokemon/sprites/pikachu/official.png',
          '/images/logo.png',
        ]}
        imageVariant="small"
        alt="Pikachu"
        sizes="160px"
        fill={false}
        width={160}
        height={160}
      />
    )

    const image = screen.getByRole('img', { name: 'Pikachu' })
    expect(image.getAttribute('src')).toBe(
      'https://images.pinkbinder.shop/v1/images/pokemon/small/sprites/pikachu/official.webp'
    )

    fireEvent.error(image)
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Pikachu' }).getAttribute('src')).toBe(
        'https://images.pinkbinder.shop/pokemon/sprites/pikachu/official.png'
      )
    })
  })
})
