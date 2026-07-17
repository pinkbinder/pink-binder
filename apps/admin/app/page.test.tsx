import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'
import AdminDashboard from './page'

describe('AdminDashboard', () => {
  it('summarizes operations and recent orders accessibly', () => {
    render(<AdminDashboard />)

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Welcome back, Admin')).toBeInTheDocument()
    expect(screen.getByText('$12,450')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(5)
    expect(screen.getByRole('button', { name: 'View All' })).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })
})
