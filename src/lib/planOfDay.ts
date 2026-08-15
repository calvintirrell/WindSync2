import type { Asset, Priority, WorkOrder } from '../db/types'
import { haversineMiles } from './geo'

export const PRIORITY_ORDER: Priority[] = ['High', 'Medium', 'Low']
export const NEARBY_RADIUS_MILES = 10

export interface PlanItem extends WorkOrder {
  id: number
  asset: Asset
}

export type SortMode = 'Priority' | 'Default Order'

export function sortPlanItems(items: PlanItem[], mode: SortMode): PlanItem[] {
  if (mode === 'Default Order') return [...items]
  return [...items].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority),
  )
}

/**
 * Suggested secondary task: another work order within NEARBY_RADIUS_MILES whose
 * priority is strictly lower — worth bundling into the same site visit.
 */
export function findSecondaryTask(item: PlanItem, all: PlanItem[]): PlanItem | null {
  for (const other of all) {
    if (other.id === item.id) continue
    const dist = haversineMiles(
      item.asset.latitude,
      item.asset.longitude,
      other.asset.latitude,
      other.asset.longitude,
    )
    if (
      dist <= NEARBY_RADIUS_MILES &&
      PRIORITY_ORDER.indexOf(other.priority) > PRIORITY_ORDER.indexOf(item.priority)
    ) {
      return other
    }
  }
  return null
}
