import { Suspense, lazy, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { VIEWS, type ViewId } from './views'
import { db } from './db/db'
import { ensureSeeded, resetToSeed } from './db/seed'
import { showToast } from './components/Toaster'
import Toaster from './components/Toaster'

// Lazy views keep Leaflet (Plan of Day) and Recharts (dashboards) out of the first paint
const PlanOfDay = lazy(() => import('./views/PlanOfDay'))
const WorkOrderDetails = lazy(() => import('./views/WorkOrderDetails'))
const TechnicianDashboard = lazy(() => import('./views/TechnicianDashboard'))
const Notifications = lazy(() => import('./views/Notifications'))
const ManagerDashboard = lazy(() => import('./views/ManagerDashboard'))

const VIEW_COMPONENTS: Record<ViewId, React.ComponentType> = {
  'plan-of-day': PlanOfDay,
  'work-order-details': WorkOrderDetails,
  'my-dashboard': TechnicianDashboard,
  'notifications': Notifications,
  'manager-dashboard': ManagerDashboard,
}

export default function App() {
  const [view, setView] = useState<ViewId>('plan-of-day')
  const [ready, setReady] = useState(false)
  const ActiveView = VIEW_COMPONENTS[view]

  useEffect(() => {
    ensureSeeded().then(() => setReady(true))
  }, [])

  const notifications = useLiveQuery(() => db.notifications.toArray(), [], [])
  const unread = notifications.filter((n) => !n.readAt)
  const criticalUnread = unread.filter((n) => n.priority === 'critical')

  const handleReset = async () => {
    await resetToSeed()
    showToast('✅ Success: All logs and notifications have been cleared!')
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-4 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">⚡ WindSync</h1>
          <p className="text-xs text-slate-500 mt-1">Field maintenance for wind farms</p>
        </div>
        {unread.length > 0 && (
          <p className="rounded-full bg-red-600 px-3 py-1 text-center text-sm font-bold text-white">
            🔔 {unread.length} New Notification{unread.length !== 1 ? 's' : ''}
          </p>
        )}
        <nav aria-label="Main navigation" className="flex flex-col gap-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              aria-current={view === v.id ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                view === v.id
                  ? 'bg-sky-100 text-sky-900'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {v.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-slate-200 pt-4">
          {criticalUnread.length > 0 && (
            <div className="rounded-lg bg-red-50 p-3 text-sm">
              <p className="font-semibold text-red-700">
                ⚠️ {criticalUnread.length} Critical Alert{criticalUnread.length !== 1 ? 's' : ''}
              </p>
              <ul className="mt-1 text-xs text-red-900">
                {criticalUnread.slice(0, 2).map((n) => (
                  <li key={n.id}>• {n.title}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Demo Controls
            </p>
            <button
              onClick={handleReset}
              className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-left text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              ⚠️ Clear Logs & Notifications
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-6">
        {ready ? (
          <Suspense fallback={<p className="text-slate-400">Loading…</p>}>
            <ActiveView />
          </Suspense>
        ) : (
          <p className="text-slate-400">Loading…</p>
        )}
      </main>
      <Toaster />
    </div>
  )
}
