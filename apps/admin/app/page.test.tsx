import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'
import AdminDashboard from './page'

describe('AdminDashboard', () => {
  it('summarizes operations and recent orders accessibly', () => {
    render(<AdminDashboard />)

    expect(screen.getByRole('heading', { name: 'Dashboard' })).not.toBeNull()
    expect(screen.getByText('Welcome back, Admin')).not.toBeNull()
    expect(screen.getByText('$12,450')).not.toBeNull()
    expect(screen.getAllByRole('row')).toHaveLength(5)
    expect(screen.getByRole('button', { name: 'View All' })).not.toBeNull()
    expect(screen.getByText('Pending')).not.toBeNull()
  })
})
