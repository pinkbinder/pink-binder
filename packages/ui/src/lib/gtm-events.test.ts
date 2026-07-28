import { beforeEach, describe, expect, it, mock } from 'bun:test'

const sendGTMEventMock = mock()
mock.module('@next/third-parties/google', () => ({
  sendGTMEvent: sendGTMEventMock,
}))

const { trackSelectContent, trackViewItem, trackSearch, trackShare } = await import('./gtm-events')

describe('ui/lib/gtm-events', () => {
  beforeEach(() => {
    sendGTMEventMock.mockReset()
  })

  describe('trackSelectContent', () => {
    it('fires a select_content event with content type and item id', () => {
      trackSelectContent({ contentType: 'blog_post', itemId: 'pikachu' })
      expect(sendGTMEventMock).toHaveBeenCalledTimes(1)
      expect(sendGTMEventMock).toHaveBeenCalledWith({
        event: 'select_content',
        content_type: 'blog_post',
        item_id: 'pikachu',
      })
    })

    it('fires for arbitrary content type values', () => {
      trackSelectContent({ contentType: 'illustrator', itemId: 'yuka-morii' })
      expect(sendGTMEventMock).toHaveBeenCalledWith(
        expect.objectContaining({ content_type: 'illustrator' })
      )
    })

    it('passes item_id through unchanged', () => {
      trackSelectContent({ contentType: 'x', itemId: '123-ABC' })
      expect(sendGTMEventMock).toHaveBeenCalledWith(expect.objectContaining({ item_id: '123-ABC' }))
    })
  })

  describe('trackViewItem', () => {
    it('fires a view_item event with required fields', () => {
      trackViewItem({ itemId: 'sv1-25', itemName: 'Pikachu ex' })
      expect(sendGTMEventMock).toHaveBeenCalledTimes(1)
      expect(sendGTMEventMock).toHaveBeenCalledWith({
        event: 'view_item',
        ecommerce: {
          currency: 'USD',
          items: [{ item_id: 'sv1-25', item_name: 'Pikachu ex' }],
        },
      })
    })

    it('defaults currency to USD when omitted', () => {
      trackViewItem({ itemId: 'x', itemName: 'y' })
      expect(sendGTMEventMock).toHaveBeenCalledTimes(1)
      const call = sendGTMEventMock.mock.calls[0]!
      expect(call[0].ecommerce.currency).toBe('USD')
    })

    it('honors an explicit currency', () => {
      trackViewItem({ itemId: 'x', itemName: 'y', currency: 'EUR' })
      expect(sendGTMEventMock).toHaveBeenCalledTimes(1)
      const call = sendGTMEventMock.mock.calls[0]!
      expect(call[0].ecommerce.currency).toBe('EUR')
    })

    it('includes item_category when provided', () => {
      trackViewItem({
        itemId: 'x',
        itemName: 'y',
        itemCategory: 'Pokemon Card',
      })
      expect(sendGTMEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ecommerce: expect.objectContaining({
            items: [expect.objectContaining({ item_category: 'Pokemon Card' })],
          }),
        })
      )
    })

    it('omits item_category when not provided', () => {
      trackViewItem({ itemId: 'x', itemName: 'y' })
      expect(sendGTMEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ecommerce: expect.objectContaining({
            items: [expect.not.objectContaining({ item_category: expect.anything() })],
          }),
        })
      )
    })
  })

  describe('trackSearch', () => {
    it('fires a search event with the trimmed search term', () => {
      trackSearch({ searchTerm: '  pikachu  ' })
      expect(sendGTMEventMock).toHaveBeenCalledTimes(1)
      expect(sendGTMEventMock).toHaveBeenCalledWith({
        event: 'search',
        search_term: 'pikachu',
      })
    })

    it('truncates search term to 100 characters', () => {
      const longTerm = 'a'.repeat(200)
      trackSearch({ searchTerm: longTerm })
      expect(sendGTMEventMock).toHaveBeenCalledWith(
        expect.objectContaining({ search_term: 'a'.repeat(100) })
      )
    })

    it('does nothing when search term is empty after trim', () => {
      trackSearch({ searchTerm: '   ' })
      expect(sendGTMEventMock).not.toHaveBeenCalled()
    })

    it('does nothing when search term is empty string', () => {
      trackSearch({ searchTerm: '' })
      expect(sendGTMEventMock).not.toHaveBeenCalled()
    })
  })

  describe('trackShare', () => {
    it('fires a share event with method, content type, and item id', () => {
      trackShare({
        method: 'twitter',
        contentType: 'blog_post',
        itemId: 'pikachu',
      })
      expect(sendGTMEventMock).toHaveBeenCalledTimes(1)
      expect(sendGTMEventMock).toHaveBeenCalledWith({
        event: 'share',
        method: 'twitter',
        content_type: 'blog_post',
        item_id: 'pikachu',
      })
    })

    it('fires with a different share method', () => {
      trackShare({ method: 'clipboard', contentType: 'card', itemId: 'sv1-25' })
      expect(sendGTMEventMock).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'clipboard' })
      )
    })
  })
})
