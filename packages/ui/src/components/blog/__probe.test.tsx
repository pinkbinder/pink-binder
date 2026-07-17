import { describe, expect, it } from 'bun:test'
import * as React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import { render, screen } from '@testing-library/react'

function Hooky() {
  const v = React.useMemo(() => 'hello', [])
  const [n] = React.useState(v)
  return <span>{n}</span>
}

describe('probe', () => {
  it('react identity', () => {
    console.log('react version', React.version)
    // check dispatcher presence
    const internals = (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE
    console.log('has internals', !!internals)
    console.log('reactdomclient createRoot', typeof ReactDOMClient.createRoot)
    expect(React.version).toBeTruthy()
  })
  it('renders hook component', () => {
    render(<Hooky />)
    expect(screen.getByText('hello')).toBeTruthy()
  })
})
