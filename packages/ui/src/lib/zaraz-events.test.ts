import { beforeEach, describe, expect, it, mock } from 'bun:test'
import {
  type ZarazApi,
  trackSearch,
  trackSelectContent,
  trackShare,
  trackViewItem,
} from './zaraz-events'

const trackMock = mock()
const ecommerceMock = mock()

const zaraz: ZarazApi = {
  track: trackMock,
  ecommerce: ecommerceMock,
}

function installZaraz() {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { zaraz },
  })
}

describe('ui/lib/zaraz-events', () => {
  beforeEach(() => {
    trackMock.mockReset()
    ecommerceMock.mockReset()
    installZaraz()
  })

  it('forwards select_content through Zaraz', () => {
    trackSelectContent({ contentType: 'blog_post', itemId: 'pikachu' })
    expect(trackMock).toHaveBeenCalledWith('select_content', {
      content_type: 'blog_post',
      item_id: 'pikachu',
    })
  })

  it('forwards Product Viewed through Zaraz ecommerce', () => {
    trackViewItem({ itemId: 'sv1-25', itemName: 'Pikachu ex', itemCategory: 'Pokemon Card' })
    expect(ecommerceMock).toHaveBeenCalledWith('Product Viewed', {
      product_id: 'sv1-25',
      name: 'Pikachu ex',
      category: 'Pokemon Card',
      currency: 'USD',
    })
  })

  it('omits an absent product category', () => {
    trackViewItem({ itemId: 'x', itemName: 'y', currency: 'EUR' })
    expect(ecommerceMock).toHaveBeenCalledWith('Product Viewed', {
      product_id: 'x',
      name: 'y',
      currency: 'EUR',
    })
  })

  it('trims and truncates search terms', () => {
    trackSearch({ searchTerm: `  ${'a'.repeat(200)}  ` })
    expect(trackMock).toHaveBeenCalledWith('search', { search_term: 'a'.repeat(100) })
  })

  it('does not send an empty search event', () => {
    trackSearch({ searchTerm: '   ' })
    expect(trackMock).not.toHaveBeenCalled()
  })

  it('forwards share events through Zaraz', () => {
    trackShare({ method: 'clipboard', contentType: 'blog_post', itemId: 'pikachu' })
    expect(trackMock).toHaveBeenCalledWith('share', {
      method: 'clipboard',
      content_type: 'blog_post',
      item_id: 'pikachu',
    })
  })

  it('does not throw when Zaraz has not loaded', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {},
    })
    expect(() => trackSelectContent({ contentType: 'blog_post', itemId: 'pikachu' })).not.toThrow()
    expect(trackMock).not.toHaveBeenCalled()
  })
})
