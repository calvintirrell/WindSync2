import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { ensureSeeded, resetToSeed, TECHNICIAN_ID } from './seed'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('ensureSeeded', () => {
  it('seeds technician, assets, and work orders into an empty database', async () => {
    await ensureSeeded()
    expect(await db.technicians.count()).toBe(1)
    expect(await db.assets.count()).toBe(3)
    expect(await db.workOrders.count()).toBe(4)

    const tech = await db.technicians.get(TECHNICIAN_ID)
    expect(tech?.name).toBe('Alex Ray')

    const completed = await db.workOrders.where('status').equals('Completed').toArray()
    expect(completed).toHaveLength(1)
    expect(completed[0].title).toBe('Past Filter Change')
  })

  it('is idempotent — does not duplicate or overwrite on repeat calls', async () => {
    await ensureSeeded()
    await db.workOrders.update(1, { status: 'In Progress' })
    await ensureSeeded()
    expect(await db.workOrders.count()).toBe(4)
    expect((await db.workOrders.get(1))?.status).toBe('In Progress')
  })
})

describe('resetToSeed', () => {
  it('clears logs and notifications and restores work orders', async () => {
    await ensureSeeded()
    await db.logs.add({ workOrderId: 1, logText: 'Checklist item completed: Cleanup', timestamp: new Date().toISOString() })
    await db.notifications.add({
      title: '🌪️ High Wind Warning',
      message: 'Wind speeds exceeding 25 mph detected.',
      priority: 'critical',
      category: 'safety',
      metadata: {},
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      requiresAcknowledgment: true,
      readAt: null,
      acknowledgedAt: null,
    })
    await db.workOrders.update(1, { status: 'Completed' })

    await resetToSeed()

    expect(await db.logs.count()).toBe(0)
    expect(await db.notifications.count()).toBe(0)
    expect(await db.workOrders.count()).toBe(4)
    expect((await db.workOrders.get(1))?.status).toBe('New')
    expect(await db.assets.count()).toBe(3)
  })
})
