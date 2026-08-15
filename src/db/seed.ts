import { db } from './db'
import type { Technician, Asset, WorkOrder } from './types'

// Demo data ported verbatim from the original database_setup.py
export const TECHNICIAN_ID = 'tech_007'

const TECHNICIAN: Technician = {
  id: TECHNICIAN_ID,
  name: 'Alex Ray',
  certifications: 'GWO Certified, Electrical Level II',
}

const ASSETS: Asset[] = [
  { id: 'WTG-A01', name: 'Turbine A01 - North Ridge', latitude: 47.6588, longitude: -122.1411, model: 'Siemens Gamesa 4.5-145' },
  { id: 'WTG-A04', name: 'Turbine A04 - North Ridge', latitude: 47.6519, longitude: -122.1333, model: 'Siemens Gamesa 4.5-145' },
  { id: 'WTG-C12', name: 'Turbine C12 - West Valley', latitude: 47.5952, longitude: -122.3321, model: 'Vestas V117-4.2' },
]

const WORK_ORDERS: WorkOrder[] = [
  {
    id: 1,
    technicianId: TECHNICIAN_ID,
    assetId: 'WTG-A01',
    title: 'Gearbox Vibration Analysis',
    description: 'High vibrations detected. Perform full diagnostic check.',
    priority: 'High',
    status: 'New',
    toolsRequired: 'Vibration Analyzer, Torque Wrench Set',
    partsRequired: 'Vibration Sensor #789',
    aiAlertTitle: 'Gearbox Bearing Fault',
    aiConfidence: 95,
    tribalKnowledgeNote: 'Note: This unit had a yaw motor alignment last quarter. Check for related stress.',
  },
  {
    id: 2,
    technicianId: TECHNICIAN_ID,
    assetId: 'WTG-A04',
    title: 'Routine Blade Inspection',
    description: 'Annual visual inspection of all three blades for wear and tear.',
    priority: 'Medium',
    status: 'New',
    toolsRequired: 'High-Res Camera, Drone (optional)',
    partsRequired: 'Blade Sealant Kit',
    aiAlertTitle: 'No Fault Detected',
    aiConfidence: 100,
    tribalKnowledgeNote: 'Standard procedure. No known issues with this asset.',
  },
  {
    id: 3,
    technicianId: TECHNICIAN_ID,
    assetId: 'WTG-C12',
    title: 'Hydraulic Leak Repair',
    description: 'Small hydraulic leak detected at the base. Identify source and repair.',
    priority: 'High',
    status: 'New',
    toolsRequired: 'Hydraulic Fluid Pump, Oil Spill Kit',
    partsRequired: 'Hydraulic Hose #H-12',
    aiAlertTitle: 'Hydraulic Hose Fatigue',
    aiConfidence: 85,
    tribalKnowledgeNote: 'This model is prone to hose fatigue near the main pump connection. Check there first.',
  },
  {
    id: 4,
    technicianId: TECHNICIAN_ID,
    assetId: 'WTG-A04',
    title: 'Past Filter Change',
    description: 'Completed filter change.',
    priority: 'Low',
    status: 'Completed',
    toolsRequired: 'Wrench',
    partsRequired: 'Filter #123',
    aiAlertTitle: 'N/A',
    aiConfidence: 100,
    tribalKnowledgeNote: '',
  },
]

/** Seed core demo data if the database is empty. Safe to call on every app start. */
export async function ensureSeeded(): Promise<void> {
  const count = await db.workOrders.count()
  if (count > 0) return
  await db.transaction('rw', [db.technicians, db.assets, db.workOrders], async () => {
    await db.technicians.put(TECHNICIAN)
    await db.assets.bulkPut(ASSETS)
    await db.workOrders.bulkPut(WORK_ORDERS)
  })
}

/** Demo reset: clear logs + notifications, restore work orders to their seeded state. */
export async function resetToSeed(): Promise<void> {
  await db.transaction('rw', [db.technicians, db.assets, db.workOrders, db.logs, db.notifications], async () => {
    await db.logs.clear()
    await db.notifications.clear()
    await db.workOrders.clear()
    await db.technicians.put(TECHNICIAN)
    await db.assets.bulkPut(ASSETS)
    await db.workOrders.bulkPut(WORK_ORDERS)
  })
}
