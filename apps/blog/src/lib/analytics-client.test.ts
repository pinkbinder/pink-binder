import { describe, expect, it } from 'bun:test'
import { resolveClickInfo } from './analytics-client'

const BASE_URL = 'https://pinkbinder.blog/posts/species/pikachu'

function firstElement(html: string): Element {
  const container = document.createElement('div')
  container.innerHTML = html
  return container.firstElementChild as Element
}

describe('blog analytics click resolver', () => {
  it('resolves outbound anchors with their visible text', () => {
    const anchor = firstElement('<a href="https://www.tcgplayer.com/x?y=1">Buy on TCGplayer</a>')

    expect(resolveClickInfo(anchor, BASE_URL)).toEqual({
      kind: 'outbound',
      url: new URL('https://www.tcgplayer.com/x?y=1'),
      linkText: 'Buy on TCGplayer',
    })
  })

  it('ignores internal navigation links', () => {
    const anchor = firstElement('<a href="/posts/species/eevee">Eevee guide</a>')
    expect(resolveClickInfo(anchor, BASE_URL)).toBeNull()
  })

  it('resolves relative hrefs against the page URL', () => {
    const anchor = firstElement('<a href="pikachu/gallery">Gallery</a>')
    expect(resolveClickInfo(anchor, BASE_URL)).toBeNull()
  })

  it('ignores fragment and non-http links', () => {
    expect(resolveClickInfo(firstElement('<a href="#results">Jump</a>'), BASE_URL)).toBeNull()
    expect(
      resolveClickInfo(firstElement('<a href="mailto:hi@example.com">Mail</a>'), BASE_URL)
    ).toBeNull()
    expect(
      resolveClickInfo(firstElement('<a href="javascript:void(0)">Do</a>'), BASE_URL)
    ).toBeNull()
  })

  it('resolves buttons with their label text', () => {
    const button = firstElement('<button> Load   more guides </button>')

    expect(resolveClickInfo(button, BASE_URL)).toEqual({
      kind: 'button',
      buttonText: 'Load more guides',
      buttonId: null,
      buttonSection: null,
    })
  })

  it('prefers data-analytics-id and ignores generated framework ids', () => {
    const override = resolveClickInfo(
      firstElement('<button data-analytics-id="hero-cta">Go</button>'),
      BASE_URL
    ) as { buttonId: string | null }
    expect(override.buttonId).toBe('hero-cta')

    const generated = resolveClickInfo(
      firstElement('<button id="radix-:r1:">Toggle</button>'),
      BASE_URL
    ) as { buttonId: string | null }
    expect(generated.buttonId).toBeNull()
  })

  it('picks up the nearest analytics section', () => {
    const container = document.createElement('div')
    container.innerHTML =
      '<section data-analytics-section="blog-filters"><button>Clear all</button></section>'
    const button = container.querySelector('button')

    expect(resolveClickInfo(button, BASE_URL)).toMatchObject({
      kind: 'button',
      buttonText: 'Clear all',
      buttonSection: 'blog-filters',
    })
  })

  it('returns null for clicks outside interactive elements', () => {
    expect(resolveClickInfo(firstElement('<p>Plain text</p>'), BASE_URL)).toBeNull()
    expect(resolveClickInfo(null, BASE_URL)).toBeNull()
  })
})
