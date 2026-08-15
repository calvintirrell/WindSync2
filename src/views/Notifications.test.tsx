import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/db'
import { createNotification } from '../lib/notifications'
import Notifications from './Notifications'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

async function seedNotifications() {
  await createNotification({
    title: '🌪️ High Wind Warning',
    message: 'Wind speeds exceeding 25 mph detected.',
    priority: 'critical',
    category: 'safety',
  })
  await createNotification({
    title: '📋 Work Order Update',
    message: 'Work order #1 priority changed to High',
    priority: 'high',
    category: 'task',
  })
}

describe('Notifications view', () => {
  it('shows empty state when there are no notifications', async () => {
    render(<Notifications />)
    expect(await screen.findByText('No notifications found.')).toBeInTheDocument()
  })

  it('shows metrics and cards', async () => {
    await seedNotifications()
    render(<Notifications />)
    expect(await screen.findByText('🚨 🌪️ High Wind Warning')).toBeInTheDocument()
    expect(screen.getByText('⚠️ 📋 Work Order Update')).toBeInTheDocument()
    expect(screen.getByText('Total Notifications').nextElementSibling).toHaveTextContent('2')
    expect(screen.getByText('Unread').nextElementSibling).toHaveTextContent('2')
    expect(screen.getByText('Pending ACK').nextElementSibling).toHaveTextContent('1')
    expect(screen.getByText('⚠️ 1 Critical Unread')).toBeInTheDocument()
  })

  it('marks a single notification read', async () => {
    await seedNotifications()
    render(<Notifications />)
    await screen.findByText('🚨 🌪️ High Wind Warning')
    fireEvent.click(screen.getAllByRole('button', { name: 'Mark Read' })[0])
    await waitFor(async () => {
      const all = await db.notifications.toArray()
      expect(all.filter((n) => n.readAt)).toHaveLength(1)
    })
  })

  it('acknowledges critical and updates Pending ACK', async () => {
    await seedNotifications()
    render(<Notifications />)
    await screen.findByText('🚨 🌪️ High Wind Warning')
    fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))
    await waitFor(() =>
      expect(screen.getByText('Pending ACK').nextElementSibling).toHaveTextContent('0'),
    )
  })

  it('Mark All as Read clears the unread metric', async () => {
    await seedNotifications()
    render(<Notifications />)
    await screen.findByText('🚨 🌪️ High Wind Warning')
    fireEvent.click(screen.getByRole('button', { name: 'Mark All as Read' }))
    await waitFor(() => expect(screen.getByText('Unread').nextElementSibling).toHaveTextContent('0'))
  })

  it('filters by priority and hides read notifications', async () => {
    await seedNotifications()
    render(<Notifications />)
    await screen.findByText('🚨 🌪️ High Wind Warning')
    fireEvent.click(screen.getByRole('checkbox', { name: 'critical' }))
    await waitFor(() =>
      expect(screen.queryByText('🚨 🌪️ High Wind Warning')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('⚠️ 📋 Work Order Update')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: 'critical' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mark All as Read' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show Read Notifications' }))
    await waitFor(() => expect(screen.getByText(/0 shown/)).toBeInTheDocument())
  })
})
