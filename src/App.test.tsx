import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { VIEWS } from './views'

describe('App shell', () => {
  it('renders the sidebar with all five views', () => {
    render(<App />)
    expect(screen.getByText('⚡ WindSync')).toBeInTheDocument()
    for (const v of VIEWS) {
      expect(screen.getByRole('button', { name: v.label })).toBeInTheDocument()
    }
  })

  it('starts on Plan of Day once the database is ready', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { level: 2, name: 'Plan of Day (POD)' })).toBeInTheDocument()
  })

  it('switches views when a nav item is clicked', async () => {
    render(<App />)
    await screen.findByRole('heading', { level: 2, name: 'Plan of Day (POD)' })
    fireEvent.click(screen.getByRole('button', { name: '🔔 Notifications' }))
    expect(await screen.findByRole('heading', { level: 2, name: 'Notification Center' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '🔔 Notifications' })).toHaveAttribute('aria-current', 'page')
  })
})
