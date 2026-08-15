import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../db/db'
import { ensureSeeded } from '../db/seed'
import PlanOfDay from './PlanOfDay'

// Leaflet needs a real DOM with layout; mock the map in jsdom
vi.mock('./JobSiteMap', () => ({
  default: ({ items }: { items: unknown[] }) => (
    <div data-testid="job-site-map">map with {items.length} sites</div>
  ),
}))

beforeEach(async () => {
  await db.delete()
  await db.open()
  await ensureSeeded()
})

describe('PlanOfDay', () => {
  it('lists only active work orders with their assets', async () => {
    render(<PlanOfDay />)
    expect(await screen.findByText(/Primary Task: Gearbox Vibration Analysis/)).toBeInTheDocument()
    expect(screen.getByText(/Primary Task: Routine Blade Inspection/)).toBeInTheDocument()
    expect(screen.getByText(/Primary Task: Hydraulic Leak Repair/)).toBeInTheDocument()
    // completed order excluded
    expect(screen.queryByText(/Past Filter Change/)).not.toBeInTheDocument()
  })

  it('suggests the nearby lower-priority blade inspection as secondary task for the gearbox job', async () => {
    render(<PlanOfDay />)
    const gearboxCard = (await screen.findByText(/Gearbox Vibration Analysis/)).closest('li')!
    expect(gearboxCard).toHaveTextContent('Suggested Secondary Task')
    expect(gearboxCard).toHaveTextContent('Routine Blade Inspection')
  })

  it('filters work orders by priority', async () => {
    render(<PlanOfDay />)
    await screen.findByText(/Gearbox Vibration Analysis/)
    fireEvent.click(screen.getByRole('checkbox', { name: 'High' }))
    expect(screen.queryByText(/Gearbox Vibration Analysis/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Hydraulic Leak Repair/)).not.toBeInTheDocument()
    expect(screen.getByText(/Primary Task: Routine Blade Inspection/)).toBeInTheDocument()
  })

  it('shows a warning when no priorities are selected', async () => {
    render(<PlanOfDay />)
    await screen.findByText(/Gearbox Vibration Analysis/)
    for (const p of ['High', 'Medium', 'Low']) {
      fireEvent.click(screen.getByRole('checkbox', { name: p }))
    }
    expect(screen.getByText('No work orders match filter selection.')).toBeInTheDocument()
  })

  it('renders the map with the filtered sites', async () => {
    render(<PlanOfDay />)
    expect(await screen.findByTestId('job-site-map')).toHaveTextContent('map with 3 sites')
  })
})
