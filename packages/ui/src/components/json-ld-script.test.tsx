import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { JsonLdScript } from './json-ld-script'

describe('ui/components/json-ld-script', () => {
  it('serializes the data into a JSON-LD script', () => {
    render(<JsonLdScript data={{ '@type': 'Article', name: 'Test' }} />)
    const script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement
    expect(script).not.toBeNull()
    expect(JSON.parse(script.textContent!)).toEqual({ '@type': 'Article', name: 'Test' })
  })

  it('escapes HTML-sensitive characters', () => {
    render(<JsonLdScript data={{ html: '<b>&</b>' }} />)
    const script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement
    expect(script.textContent).toContain('\\u003c')
    expect(script.textContent).toContain('\\u0026')
    expect(script.textContent).not.toContain('<b>')
  })
})
