import { beforeEach, describe, expect, it, mock } from 'bun:test'
import {
  flushQueuedZarazEvents,
  getQueuedZarazEventCount,
  trackButtonClick,
  type ZarazApi,
  trackFilter,
  trackOutboundClick,
  trackPostView,
  trackSearch,
  trackSelectContent,
  trackShare,
  trackViewItem,
} from './zaraz-events'

const trackMock = mock()
const ecommerceMock = mock()
const clarityMock = mock()

const zaraz: ZarazApi = {
  track: trackMock,
  ecommerce: ecommerceMock,
}

function installZaraz() {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { zaraz, clarity: clarityMock },
  })
}

function installWindowWithoutTools() {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {},
  })
}

describe('ui/lib/zaraz-events', () => {
  beforeEach(() => {
    trackMock.mockReset()
    ecommerceMock.mockReset()
    clarityMock.mockReset()
    // Drain any queue left by a previous test so state cannot leak.
    installZaraz()
    flushQueuedZarazEvents()
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

  it('mirrors search to Clarity as a custom event', () => {
    trackSearch({ searchTerm: 'pikachu' })
    expect(clarityMock).toHaveBeenCalledWith('event', 'search')
  })

  it('forwards share events through Zaraz', () => {
    trackShare({ method: 'clipboard', contentType: 'blog_post', itemId: 'pikachu' })
    expect(trackMock).toHaveBeenCalledWith('share', {
      method: 'clipboard',
      content_type: 'blog_post',
      item_id: 'pikachu',
    })
  })

  it('forwards filter applies with a value', () => {
    trackFilter({ filterGroup: 'pokemon', filterValue: 'pikachu', filterAction: 'apply' })
    expect(trackMock).toHaveBeenCalledWith('filter', {
      filter_group: 'pokemon',
      filter_value: 'pikachu',
      filter_action: 'apply',
    })
    expect(clarityMock).toHaveBeenCalledWith('event', 'filter')
  })

  it('drops the value on clear actions so popularity counts stay clean', () => {
    trackFilter({ filterGroup: 'pokemon', filterValue: 'pikachu', filterAction: 'clear' })
    expect(trackMock).toHaveBeenCalledWith('filter', {
      filter_group: 'pokemon',
      filter_action: 'clear',
    })
  })

  it('truncates overlong filter values', () => {
    trackFilter({
      filterGroup: 'illustrator',
      filterValue: `x`.repeat(300),
      filterAction: 'apply',
    })
    expect(trackMock).toHaveBeenCalledWith('filter', {
      filter_group: 'illustrator',
      filter_value: 'x'.repeat(120),
      filter_action: 'apply',
    })
  })

  it('forwards button clicks with normalized labels', () => {
    trackButtonClick({
      buttonText: `  Load   more  `,
      buttonId: 'load-more',
      buttonSection: 'blog-grid',
    })
    expect(trackMock).toHaveBeenCalledWith('button_click', {
      button_text: 'Load more',
      button_id: 'load-more',
      button_section: 'blog-grid',
    })
  })

  it('skips button clicks with no identifying attributes', () => {
    trackButtonClick({ buttonText: '  ', buttonId: null, buttonSection: null })
    expect(trackMock).not.toHaveBeenCalled()
  })

  it('forwards outbound clicks with domain and text', () => {
    trackOutboundClick({ url: 'https://www.tcgplayer.com/path?query=1', linkText: 'Buy' })
    expect(trackMock).toHaveBeenCalledWith(
      'click',
      expect.objectContaining({
        link_domain: 'www.tcgplayer.com',
        link_text: 'Buy',
        outbound: true,
      })
    )
  })

  it('ignores unparseable outbound URLs', () => {
    trackOutboundClick({ url: 'not a url' })
    expect(trackMock).not.toHaveBeenCalled()
  })

  it('forwards post views with slug and title', () => {
    trackPostView({ postId: 'species/pikachu', postTitle: 'Cute Pikachu Cards' })
    expect(trackMock).toHaveBeenCalledWith('post_view', {
      post_id: 'species/pikachu',
      post_title: 'Cute Pikachu Cards',
    })
    expect(clarityMock).toHaveBeenCalledWith('event', 'post_view')
  })

  it('ignores empty post ids', () => {
    trackPostView({ postId: '   ' })
    expect(trackMock).not.toHaveBeenCalled()
  })

  describe('event queue', () => {
    it('queues events fired before Zaraz loads and flushes on arrival', () => {
      installWindowWithoutTools()

      trackFilter({ filterGroup: 'type', filterValue: 'Electric', filterAction: 'apply' })
      expect(getQueuedZarazEventCount()).toBe(1)
      expect(trackMock).not.toHaveBeenCalled()

      installZaraz()
      expect(flushQueuedZarazEvents()).toBe(true)
      expect(trackMock).toHaveBeenCalledWith('filter', {
        filter_group: 'type',
        filter_value: 'Electric',
        filter_action: 'apply',
      })
      expect(getQueuedZarazEventCount()).toBe(0)
    })

    it('drains the queue before sending a direct event', () => {
      installWindowWithoutTools()
      trackFilter({ filterGroup: 'type', filterValue: 'Fire', filterAction: 'apply' })

      installZaraz()
      trackSelectContent({ contentType: 'blog_post', itemId: 'pikachu' })

      expect(trackMock).toHaveBeenNthCalledWith(1, 'filter', expect.anything())
      expect(trackMock).toHaveBeenNthCalledWith(2, 'select_content', {
        content_type: 'blog_post',
        item_id: 'pikachu',
      })
    })

    it('bounds the queue so blocked pages cannot grow it forever', () => {
      installWindowWithoutTools()
      for (let index = 0; index < 60; index += 1) {
        trackSelectContent({ contentType: 'blog_post', itemId: `post-${index}` })
      }
      expect(getQueuedZarazEventCount()).toBeLessThanOrEqual(50)

      installZaraz()
      expect(flushQueuedZarazEvents()).toBe(true)
    })

    it('does not queue on the server (no window)', () => {
      Object.defineProperty(globalThis, 'window', { configurable: true, value: undefined })
      trackFilter({ filterGroup: 'type', filterValue: 'Water', filterAction: 'apply' })
      expect(getQueuedZarazEventCount()).toBe(0)
      expect(trackMock).not.toHaveBeenCalled()
    })
  })

  it('does not throw when Zaraz has not loaded', () => {
    installWindowWithoutTools()
    expect(() => trackSelectContent({ contentType: 'blog_post', itemId: 'pikachu' })).not.toThrow()
    expect(trackMock).not.toHaveBeenCalled()
  })
})
