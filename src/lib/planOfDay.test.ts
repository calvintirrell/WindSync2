import { describe, expect, it } from 'vitest'
import { haversineMiles } from './geo'
import { findSecondaryTask, sortPlanItems, type PlanItem } from './planOfDay'
import type { Asset } from '../db/types'

const ASSETS: Record<string, Asset> = {
  A01: { id: 'WTG-A01', name: 'Turbine A01 - North Ridge', latitude: 47.6588, longitude: -122.1411, model: 'SG' },
  A04: { id: 'WTG-A04', name: 'Turbine A04 - North Ridge', latitude: 47.6519, longitude: -122.1333, model: 'SG' },
  C12: { id: 'WTG-C12', name: 'Turbine C12 - West Valley', latitude: 47.5952, longitude: -122.3321, model: 'V' },
}

function item(id: number, priority: PlanItem['priority'], asset: Asset, title = `WO ${id}`): PlanItem {
  return {
    id,
    technicianId: 'tech_007',
    assetId: asset.id,
    title,
    description: '',
    priority,
    status: 'New',
    toolsRequired: '',
    partsRequired: '',
    aiAlertTitle: '',
    aiConfidence: 0,
    tribalKnowledgeNote: '',
    asset,
  }
}

describe('haversineMiles', () => {
  it('matches known distances from the seed turbines', () => {
    // A01 ↔ A04 are ~0.6 mi apart on North Ridge
    expect(haversineMiles(47.6588, -122.1411, 47.6519, -122.1333)).toBeCloseTo(0.59, 1)
    // zero distance to self
    expect(haversineMiles(47.6588, -122.1411, 47.6588, -122.1411)).toBe(0)
  })
})

describe('sortPlanItems', () => {
  it('orders High before Medium before Low', () => {
    const items = [item(1, 'Low', ASSETS.A01), item(2, 'High', ASSETS.A04), item(3, 'Medium', ASSETS.C12)]
    expect(sortPlanItems(items, 'Priority').map((i) => i.priority)).toEqual(['High', 'Medium', 'Low'])
  })

  it('leaves Default Order untouched', () => {
    const items = [item(1, 'Low', ASSETS.A01), item(2, 'High', ASSETS.A04)]
    expect(sortPlanItems(items, 'Default Order').map((i) => i.id)).toEqual([1, 2])
  })
})

describe('findSecondaryTask', () => {
  it('suggests a nearby lower-priority task', () => {
    const high = item(1, 'High', ASSETS.A01)
    const medium = item(2, 'Medium', ASSETS.A04)
    expect(findSecondaryTask(high, [high, medium])?.id).toBe(2)
  })

  it('never suggests an equal or higher priority task', () => {
    const high = item(1, 'High', ASSETS.A01)
    const alsoHigh = item(2, 'High', ASSETS.A04)
    expect(findSecondaryTask(high, [high, alsoHigh])).toBeNull()
    // and the lower-priority task can point back up? No — medium must not suggest high
    const medium = item(3, 'Medium', ASSETS.A04)
    expect(findSecondaryTask(medium, [high, medium])).toBeNull()
  })

  it('ignores tasks beyond the 10-mile radius', () => {
    const farAway: Asset = { ...ASSETS.C12, latitude: 48.5, longitude: -123.5 }
    const high = item(1, 'High', ASSETS.A01)
    const low = item(2, 'Low', farAway)
    expect(findSecondaryTask(high, [high, low])).toBeNull()
  })
})
