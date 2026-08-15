import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { createNotification } from '../lib/notifications'
import { showToast } from '../components/Toaster'

// Static demo data, ported from the original manager_dashboard_view
export const COST_DATA = [
  { month: 'Jan', before: 55000, with: 47000 },
  { month: 'Feb', before: 62000, with: 52000 },
  { month: 'Mar', before: 48000, with: 41000 },
  { month: 'Apr', before: 51000, with: 44000 },
  { month: 'May', before: 75000, with: 63000 },
  { month: 'Jun', before: 68000, with: 59000 },
]

// Validated pair (CVD-safe, >=3:1 on light surface): warm orange vs sky blue
const BEFORE_COLOR = '#c2410c'
const WITH_COLOR = '#0284c7'

const fmtThousands = (v: number) => `$${Math.round(v / 1000)}k`

export default function ManagerDashboard() {
  const sendEmergencyBroadcast = async () => {
    await createNotification({
      title: '📢 EMERGENCY BROADCAST',
      message: 'Site-wide emergency declared. All personnel report to muster points immediately.',
      priority: 'critical',
      category: 'safety',
      metadata: { broadcastType: 'site_emergency', musterPoint: 'Main Office', sender: 'operations_manager' },
    })
    showToast('Emergency broadcast sent to all technicians!')
  }

  const sendShiftUpdate = async () => {
    await createNotification({
      title: '📋 Shift Update',
      message: 'New shift assignments have been posted. Check your updated work orders.',
      priority: 'medium',
      category: 'task',
      metadata: { updateType: 'shift_assignment', sender: 'operations_manager' },
    })
    showToast('Shift update notification sent!')
  }

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <h2 className="text-2xl font-semibold">Manager: Downtime Cost Savings 📈</h2>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COST_DATA} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barGap={2}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 13 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tickFormatter={fmtThousands} tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="before" name="Before WindSync ($)" fill={BEFORE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="with" name="With WindSync ($)" fill={WITH_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <details className="mt-2 text-sm text-slate-600">
          <summary className="cursor-pointer">View as table</summary>
          <table className="mt-2 w-full max-w-sm text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-1 pr-4 font-medium">Month</th>
                <th className="py-1 pr-4 font-medium">Before WindSync</th>
                <th className="py-1 font-medium">With WindSync</th>
              </tr>
            </thead>
            <tbody>
              {COST_DATA.map((row) => (
                <tr key={row.month}>
                  <td className="py-1 pr-4">{row.month}</td>
                  <td className="py-1 pr-4">${row.before.toLocaleString()}</td>
                  <td className="py-1">${row.with.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>

      <div>
        <h3 className="mb-2 border-t border-slate-200 pt-4 text-lg font-semibold">
          📢 Manager Notification Controls
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={sendEmergencyBroadcast}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            🚨 Send Emergency Broadcast
          </button>
          <button
            onClick={sendShiftUpdate}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            📋 Send Shift Update
          </button>
        </div>
      </div>
    </section>
  )
}
