import { useEffect, useState } from 'react'
import { VIEWS, type ViewId } from './views'
import { ensureSeeded } from './db/seed'
import PlanOfDay from './views/PlanOfDay'
import WorkOrderDetails from './views/WorkOrderDetails'
import TechnicianDashboard from './views/TechnicianDashboard'
import Notifications from './views/Notifications'
import ManagerDashboard from './views/ManagerDashboard'
import Toaster from './components/Toaster'

const VIEW_COMPONENTS: Record<ViewId, () => React.JSX.Element> = {
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

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-4 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">⚡ WindSync</h1>
          <p className="text-xs text-slate-500 mt-1">Field maintenance for wind farms</p>
        </div>
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
      </aside>
      <main className="flex-1 p-6">
        {ready ? <ActiveView /> : <p className="text-slate-400">Loading…</p>}
      </main>
      <Toaster />
    </div>
  )
}
