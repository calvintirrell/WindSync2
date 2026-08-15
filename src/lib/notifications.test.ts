import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/db'
import {
  acknowledge,
  acknowledgeAllCritical,
  createNotification,
  markAllRead,
  markAsRead,
} from './notifications'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('createNotification', () => {
  it('stores the notification unread with metadata', async () => {
    const id = await createNotification({
      title: '📋 Work Order Update',
      message: 'Work order #1 priority changed to High',
      priority: 'high',
      category: 'task',
      metadata: { workOrderId: 1 },
    })
    const n = (await db.notifications.get(id))!
    expect(n.readAt).toBeNull()
    expect(n.acknowledgedAt).toBeNull()
    expect(n.requiresAcknowledgment).toBe(false)
    expect(n.metadata.workOrderId).toBe(1)
  })

  it('critical notifications require acknowledgment by default', async () => {
    const id = await createNotification({
      title: '🌪️ High Wind Warning',
      message: 'Suspend all tower work.',
      priority: 'critical',
      category: 'safety',
    })
    expect((await db.notifications.get(id))!.requiresAcknowledgment).toBe(true)
  })
})

describe('read/acknowledge operations', () => {
  it('markAsRead sets readAt once and never overwrites', async () => {
    const id = await createNotification({ title: 't', message: 'm', priority: 'low', category: 'system' })
    await markAsRead(id)
    const first = (await db.notifications.get(id))!.readAt
    expect(first).not.toBeNull()
    await markAsRead(id)
    expect((await db.notifications.get(id))!.readAt).toBe(first)
  })

  it('acknowledge also marks as read', async () => {
    const id = await createNotification({ title: 't', message: 'm', priority: 'critical', category: 'safety' })
    await acknowledge(id)
    const n = (await db.notifications.get(id))!
    expect(n.acknowledgedAt).not.toBeNull()
    expect(n.readAt).not.toBeNull()
  })

  it('markAllRead reads everything; acknowledgeAllCritical only touches critical pending', async () => {
    const critId = await createNotification({ title: 'c', message: 'm', priority: 'critical', category: 'safety' })
    const lowId = await createNotification({ title: 'l', message: 'm', priority: 'low', category: 'system' })
    await acknowledgeAllCritical()
    expect((await db.notifications.get(critId))!.acknowledgedAt).not.toBeNull()
    expect((await db.notifications.get(lowId))!.acknowledgedAt).toBeNull()
    expect((await db.notifications.get(lowId))!.readAt).toBeNull()
    await markAllRead()
    expect((await db.notifications.get(lowId))!.readAt).not.toBeNull()
  })
})
