import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/db'
import { ensureSeeded } from '../db/seed'
import TechnicianDashboard from './TechnicianDashboard'
import ManagerDashboard, { COST_DATA } from './ManagerDashboard'

beforeEach(async () => {
  await db.delete()
  await db.open()
  await ensureSeeded()
})

describe('TechnicianDashboard', () => {
  it('computes metrics from the seeded work orders', async () => {
    render(<TechnicianDashboard />)
    expect(await screen.findByText('Tasks Completed (Today)')).toBeInTheDocument()
    expect(screen.getByText('Tasks Completed (Today)').nextElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Active Tasks').nextElementSibling).toHaveTextContent('3')
    expect(screen.getByText('High-Priority Tasks').nextElementSibling).toHaveTextContent('2')
  })

  it('reflects status changes live', async () => {
    render(<TechnicianDashboard />)
    await screen.findByText('Tasks Completed (Today)')
    await db.workOrders.update(1, { status: 'Completed' })
    await waitFor(() =>
      expect(screen.getByText('Tasks Completed (Today)').nextElementSibling).toHaveTextContent('2'),
    )
  })

  it('provides the priority counts as an accessible table', async () => {
    render(<TechnicianDashboard />)
    await screen.findByText('View as table')
    const rows = screen.getAllByRole('row').slice(1) // skip header
    expect(rows.map((r) => r.textContent)).toEqual(['High2', 'Medium1', 'Low1'])
  })
})

describe('ManagerDashboard', () => {
  it('renders the cost data table matching the chart data', () => {
    render(<ManagerDashboard />)
    expect(screen.getByText('Manager: Downtime Cost Savings 📈')).toBeInTheDocument()
    for (const row of COST_DATA) {
      expect(screen.getByText(row.month)).toBeInTheDocument()
    }
    expect(screen.getByText('$55,000')).toBeInTheDocument()
    expect(screen.getByText('$59,000')).toBeInTheDocument()
  })

  it('sends an emergency broadcast as a critical safety notification', async () => {
    render(<ManagerDashboard />)
    fireEvent.click(screen.getByRole('button', { name: '🚨 Send Emergency Broadcast' }))
    await waitFor(async () => expect(await db.notifications.count()).toBe(1))
    const n = (await db.notifications.toArray())[0]
    expect(n.priority).toBe('critical')
    expect(n.category).toBe('safety')
    expect(n.requiresAcknowledgment).toBe(true)
    expect(n.metadata.musterPoint).toBe('Main Office')
  })

  it('sends a shift update as a medium task notification', async () => {
    render(<ManagerDashboard />)
    fireEvent.click(screen.getByRole('button', { name: '📋 Send Shift Update' }))
    await waitFor(async () => expect(await db.notifications.count()).toBe(1))
    const n = (await db.notifications.toArray())[0]
    expect(n.priority).toBe('medium')
    expect(n.category).toBe('task')
    expect(n.title).toBe('📋 Shift Update')
  })
})
