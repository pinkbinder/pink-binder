import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'
import StorePage from './page'

describe('StorePage', () => {
  it('renders the catalog navigation and every product card', () => {
    render(<StorePage />)

    expect(screen.getByRole('heading', { name: 'Pink Binder Store' })).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'All Products' })).not.toBeNull()
    expect(screen.getAllByRole('button', { name: 'Add to Cart' })).toHaveLength(6)
    expect(screen.getByText('Digital Template')).not.toBeNull()
    expect(screen.getByText('Bestseller')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Cart (0)' })).not.toBeNull()
  })
})
