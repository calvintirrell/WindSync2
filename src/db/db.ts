import Dexie, { type EntityTable } from 'dexie'
import type { Technician, Asset, WorkOrder, LogEntry, AppNotification } from './types'

export class WindSyncDB extends Dexie {
  technicians!: EntityTable<Technician, 'id'>
  assets!: EntityTable<Asset, 'id'>
  workOrders!: EntityTable<WorkOrder, 'id'>
  logs!: EntityTable<LogEntry, 'id'>
  notifications!: EntityTable<AppNotification, 'id'>

  constructor() {
    super('windsync')
    this.version(1).stores({
      technicians: 'id',
      assets: 'id',
      workOrders: '++id, technicianId, assetId, status',
      logs: '++id, workOrderId',
      notifications: '++id, priority, category, createdAt, readAt',
    })
  }
}

export const db = new WindSyncDB()
