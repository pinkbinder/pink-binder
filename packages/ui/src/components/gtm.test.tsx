import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { render } from '@testing-library/react'

const nextGtmMock = mock()
mock.module('@next/third-parties/google', () => ({
  GoogleTagManager: (props: { gtmId: string }) => {
    nextGtmMock(props.gtmId)
    return null
  },
}))

import { GoogleTagManager } from './gtm'

describe('ui/components/gtm', () => {
  beforeEach(() => {
    nextGtmMock.mockReset()
  })

  it('renders the next GTM component with a valid prop id', () => {
    render(<GoogleTagManager gtmId="GTM-ABC123" />)
    expect(nextGtmMock).toHaveBeenCalledWith('GTM-ABC123')
  })

  it('falls back to the env var when no prop is given', () => {
    const prev = process.env.NEXT_PUBLIC_GTM_ID
    process.env.NEXT_PUBLIC_GTM_ID = 'GTM-XYZ789'
    render(<GoogleTagManager />)
    expect(nextGtmMock).toHaveBeenCalledWith('GTM-XYZ789')
    process.env.NEXT_PUBLIC_GTM_ID = prev
  })

  it('renders nothing for an invalid id format', () => {
    const { container } = render(<GoogleTagManager gtmId="not-a-gtm-id" />)
    expect(nextGtmMock).not.toHaveBeenCalled()
    expect(container?.textContent?.trim()).toBe('')
  })

  it('renders nothing when no id is available', () => {
    const prev = process.env.NEXT_PUBLIC_GTM_ID
    delete process.env.NEXT_PUBLIC_GTM_ID
    const { container } = render(<GoogleTagManager />)
    expect(nextGtmMock).not.toHaveBeenCalled()
    expect(container?.textContent?.trim()).toBe('')
    process.env.NEXT_PUBLIC_GTM_ID = prev
  })
})
