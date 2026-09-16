import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library'
import { describe, expect, it } from 'bun:test'
import { createSignal } from 'solid-js'
import { RemoteImageWithFallback } from '../src/components/remote-image-with-fallback'

describe('RemoteImageWithFallback', () => {
  it('prefers the static R2 variant and falls back to the source URL', async () => {
    render(() => (
      <RemoteImageWithFallback
        candidates={[
          'https://images.pinkbinder.shop/pokemon/sprites/pikachu/official.png',
          '/images/logo.png',
        ]}
        imageVariant="small"
        alt="Pikachu"
        fill={false}
        width={160}
        height={160}
      />
    ))

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

  it('restarts the fallback chain when the candidates change', async () => {
    const [candidates, setCandidates] = createSignal(['/a.png', '/b.png'])
    render(() => <RemoteImageWithFallback candidates={candidates()} alt="Card" fill={false} />)

    const image = screen.getByRole('img', { name: 'Card' })
    expect(image.getAttribute('src')).toBe('/a.png')
    fireEvent.error(image)
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Card' }).getAttribute('src')).toBe('/b.png')
    })

    setCandidates(['/c.png', '/d.png'])
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Card' }).getAttribute('src')).toBe('/c.png')
    })
  })

  it('calls onExhausted after the last candidate fails', async () => {
    let exhausted = 0
    render(() => (
      <RemoteImageWithFallback
        candidates={['/a.png', '/b.png']}
        alt="Card"
        fill={false}
        onExhausted={() => {
          exhausted += 1
        }}
      />
    ))

    fireEvent.error(screen.getByRole('img', { name: 'Card' }))
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Card' }).getAttribute('src')).toBe('/b.png')
    })
    fireEvent.error(screen.getByRole('img', { name: 'Card' }))
    await waitFor(() => {
      expect(exhausted).toBe(1)
    })
  })
})
