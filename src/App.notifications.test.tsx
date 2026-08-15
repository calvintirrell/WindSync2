import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from './db/db'
import { createNotification } from './lib/notifications'
import App from './App'

vi.mock('./views/JobSiteMap', () => ({
  default: () => <div data-testid="job-site-map" />,
}))

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('sidebar notification badge and demo controls', () => {
  it('shows unread badge and critical alert list', async () => {
    await createNotification({
      title: '🌪️ High Wind Warning',
      message: 'Suspend all tower work.',
      priority: 'critical',
      category: 'safety',
    })
    render(<App />)
    expect(await screen.findByText('🔔 1 New Notification')).toBeInTheDocument()
    expect(screen.getByText('⚠️ 1 Critical Alert')).toBeInTheDocument()
    expect(screen.getByText('• 🌪️ High Wind Warning')).toBeInTheDocument()
  })

  it('simulate buttons on Plan of Day create notifications and bump the badge', async () => {
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: '🚨 Simulate High Wind Alert' }))
    expect(await screen.findByText('🔔 1 New Notification')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '📋 Simulate Priority Change' }))
    expect(await screen.findByText('🔔 2 New Notifications')).toBeInTheDocument()

    const all = await db.notifications.toArray()
    expect(all.map((n) => n.priority).sort()).toEqual(['critical', 'high'])
    // priority change targets the first (highest-priority) work order
    const update = all.find((n) => n.category === 'task')!
    expect(update.message).toMatch(/Work order #1 priority changed to High/)
  })

  it('Clear Logs & Notifications resets logs, notifications, and shows a toast', async () => {
    await createNotification({ title: 't', message: 'm', priority: 'low', category: 'system' })
    await db.logs.add({ workOrderId: 1, logText: 'note', timestamp: new Date().toISOString() })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: '⚠️ Clear Logs & Notifications' }))
    await waitFor(async () => {
      expect(await db.notifications.count()).toBe(0)
      expect(await db.logs.count()).toBe(0)
    })
    expect(
      await screen.findByText('✅ Success: All logs and notifications have been cleared!'),
    ).toBeInTheDocument()
    expect(await db.workOrders.count()).toBe(4)
  })
})
