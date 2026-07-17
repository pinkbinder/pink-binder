import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

describe('ui/components/card', () => {
  it('renders a card with merged class names', () => {
    render(
      <Card data-testid="card" className="custom-card">
        content
      </Card>
    )
    const card = screen.getByTestId('card')
    expect(card.className).toContain('bg-card')
    expect(card.className).toContain('custom-card')
    expect(card).toHaveTextContent('content')
  })

  it('forwards a ref to the underlying element', () => {
    let node: HTMLDivElement | null = null
    render(
      <Card
        ref={(el) => {
          node = el
        }}
      >
        x
      </Card>
    )
    expect(node).toBeInstanceOf(HTMLDivElement)
  })

  it('renders the full card composition', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title text</CardTitle>
          <CardDescription>Desc text</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>
    )
    expect(screen.getByText('Title text')).toBeTruthy()
    expect(screen.getByText('Desc text')).toBeTruthy()
    expect(screen.getByText('Body')).toBeTruthy()
    expect(screen.getByText('Foot')).toBeTruthy()
  })

  it('applies custom class names to subcomponents', () => {
    render(<CardTitle className="my-title">x</CardTitle>)
    expect(screen.getByText('x').className).toContain('my-title')
    expect(screen.getByText('x').className).toContain('text-2xl')
  })
})
