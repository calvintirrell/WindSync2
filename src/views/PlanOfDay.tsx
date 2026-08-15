import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { TECHNICIAN_ID } from '../db/seed'
import type { Priority } from '../db/types'
import {
  PRIORITY_ORDER,
  findSecondaryTask,
  sortPlanItems,
  type PlanItem,
  type SortMode,
} from '../lib/planOfDay'
import JobSiteMap from './JobSiteMap'
import { createNotification } from '../lib/notifications'
import { showToast } from '../components/Toaster'

const PRIORITY_BADGE: Record<Priority, string> = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-green-100 text-green-800',
}

export default function PlanOfDay() {
  const [sortMode, setSortMode] = useState<SortMode>('Priority')
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([...PRIORITY_ORDER])

  const items = useLiveQuery(async () => {
    const workOrders = await db.workOrders
      .where('technicianId')
      .equals(TECHNICIAN_ID)
      .and((wo) => wo.status !== 'Completed')
      .toArray()
    const assets = await db.assets.toArray()
    const assetById = new Map(assets.map((a) => [a.id, a]))
    return workOrders.flatMap((wo) => {
      const asset = assetById.get(wo.assetId)
      return asset && wo.id !== undefined ? [{ ...wo, id: wo.id, asset } as PlanItem] : []
    })
  })

  if (items === undefined) return <p className="text-slate-400">Loading…</p>

  if (items.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-semibold">Plan of Day (POD)</h2>
        <p className="mt-4 rounded-lg bg-green-50 p-4 text-green-800">
          No active work orders. Great job!
        </p>
      </section>
    )
  }

  const filtered = sortPlanItems(
    items.filter((i) => selectedPriorities.includes(i.priority)),
    sortMode,
  )

  const togglePriority = (p: Priority) =>
    setSelectedPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">Plan of Day (POD)</h2>

          <div className="flex flex-wrap items-end gap-6">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Sort tasks by:
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                <option>Priority</option>
                <option>Default Order</option>
              </select>
            </label>
            <fieldset className="flex items-center gap-3">
              <legend className="mb-1 text-sm font-medium text-slate-700">Filter by priority:</legend>
              {PRIORITY_ORDER.map((p) => (
                <label key={p} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedPriorities.includes(p)}
                    onChange={() => togglePriority(p)}
                    className="h-4 w-4 accent-sky-600"
                  />
                  {p}
                </label>
              ))}
            </fieldset>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-lg font-semibold">🔔 Notification Testing</h3>
          <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              await createNotification({
                title: '🌪️ High Wind Warning',
                message: 'Wind speeds exceeding 25 mph detected. Suspend all tower work immediately.',
                priority: 'critical',
                category: 'safety',
                metadata: { windSpeed: 28, location: 'North Ridge' },
              })
              showToast('🚨 Safety alert created — see the 🔔 Notifications view')
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            🚨 Simulate High Wind Alert
          </button>
          <button
            onClick={async () => {
              const first = filtered[0]
              if (!first) return
              await createNotification({
                title: '📋 Work Order Update',
                message: `Work order #${first.id} priority changed to High`,
                priority: 'high',
                category: 'task',
                metadata: {
                  workOrderId: first.id,
                  title: first.title,
                  updateTime: new Date().toISOString(),
                },
              })
              showToast(
                `📋 Priority-change notification created for work order #${first.id} — see the 🔔 Notifications view`,
              )
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            📋 Simulate Priority Change
          </button>
          </div>
        </div>
      </div>

      <p className="rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-900">
        💡 <strong>Optimization Simulation</strong>: Tasks are clustered by location.
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-lg bg-amber-50 p-4 text-amber-800">
          No work orders match filter selection.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {filtered.map((item) => {
              const secondary = findSecondaryTask(item, filtered)
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div>
                    <p className="font-medium">
                      Primary Task: {item.title}{' '}
                      <span className="text-slate-500">({item.asset.name})</span>
                    </p>
                    <span
                      className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_BADGE[item.priority]}`}
                    >
                      {item.priority} priority
                    </span>
                  </div>
                  <div className="min-w-48 text-sm">
                    {secondary ? (
                      <p className="rounded-lg bg-green-50 px-3 py-2 text-green-800">
                        <strong>Suggested Secondary Task:</strong>
                        <br />
                        {secondary.title}
                      </p>
                    ) : (
                      <p className="text-slate-400">No nearby secondary task found.</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Job Site Locations</h3>
            <JobSiteMap items={filtered} />
          </div>
        </>
      )}
    </section>
  )
}
