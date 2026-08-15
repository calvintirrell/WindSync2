import { useLiveQuery } from 'dexie-react-hooks'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db } from '../db/db'
import { TECHNICIAN_ID } from '../db/seed'
import { PRIORITY_ORDER } from '../lib/planOfDay'
import Metric from '../components/Metric'

const BAR_COLOR = '#0284c7'

export default function TechnicianDashboard() {
  const workOrders = useLiveQuery(() =>
    db.workOrders.where('technicianId').equals(TECHNICIAN_ID).toArray(),
  )

  if (workOrders === undefined) return <p className="text-slate-400">Loading…</p>

  const completed = workOrders.filter((wo) => wo.status === 'Completed').length
  const active = workOrders.filter((wo) => wo.status !== 'Completed').length
  const highPriority = workOrders.filter((wo) => wo.priority === 'High').length

  const priorityCounts = PRIORITY_ORDER.map((priority) => ({
    priority,
    count: workOrders.filter((wo) => wo.priority === priority).length,
  }))

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <h2 className="text-2xl font-semibold">My Performance Dashboard</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Tasks Completed (Today)" value={completed} />
        <Metric label="Active Tasks" value={active} />
        <Metric label="High-Priority Tasks" value={highPriority} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold">Task Completion by Priority</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityCounts} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="priority" tick={{ fill: '#475569', fontSize: 13 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="count" name="Work orders" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <details className="mt-2 text-sm text-slate-600">
          <summary className="cursor-pointer">View as table</summary>
          <table className="mt-2 w-full max-w-xs text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-1 pr-4 font-medium">Priority</th>
                <th className="py-1 font-medium">Work orders</th>
              </tr>
            </thead>
            <tbody>
              {priorityCounts.map((row) => (
                <tr key={row.priority}>
                  <td className="py-1 pr-4">{row.priority}</td>
                  <td className="py-1">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>
    </section>
  )
}
