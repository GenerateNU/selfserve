import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '../components/Header'

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isSignedIn: false }),
  UserButton: () => null,
}))

// Mock the TanStack Router Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

describe('Header', () => {
  it('renders the header element', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toBeDefined()
  })

  it('renders the logo image', () => {
    render(<Header />)
    const logo = screen.getByAltText('SelfServe Logo')
    expect(logo).toBeDefined()
    expect(logo.getAttribute('src')).toBe('/logo.webp')
  })

  it('has a link to home page', () => {
    render(<Header />)
    const link = screen.getByRole('link')
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/')
  })

})
