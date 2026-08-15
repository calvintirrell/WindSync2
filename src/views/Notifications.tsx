import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { NotificationPriority } from '../db/types'
import {
  PRIORITY_EMOJIS,
  acknowledge,
  acknowledgeAllCritical,
  markAllRead,
  markAsRead,
} from '../lib/notifications'
import { showToast } from '../components/Toaster'

const ALL_PRIORITIES: NotificationPriority[] = ['critical', 'high', 'medium', 'low']

const CARD_ACCENT: Record<NotificationPriority, string> = {
  critical: 'border-l-red-600 bg-red-50',
  high: 'border-l-orange-500 bg-slate-50',
  medium: 'border-l-amber-400 bg-slate-50',
  low: 'border-l-green-600 bg-slate-50',
}

function Metric({ label, value, flag }: { label: string; value: number; flag?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {value}
        {flag && value > 0 && <span className="ml-2 text-base">{flag}</span>}
      </p>
    </div>
  )
}

export default function Notifications() {
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority[]>([...ALL_PRIORITIES])
  const [showRead, setShowRead] = useState(true)

  const notifications = useLiveQuery(async () =>
    (await db.notifications.toArray()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )

  if (notifications === undefined) return <p className="text-slate-400">Loading…</p>

  const unread = notifications.filter((n) => !n.readAt)
  const critical = notifications.filter((n) => n.priority === 'critical')
  const pendingAck = notifications.filter((n) => n.requiresAcknowledgment && !n.acknowledgedAt)
  const criticalUnread = critical.filter((n) => !n.readAt)

  const filtered = notifications.filter(
    (n) => priorityFilter.includes(n.priority) && (showRead || !n.readAt),
  )

  const togglePriority = (p: NotificationPriority) =>
    setPriorityFilter((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))

  return (
    <section className="flex max-w-4xl flex-col gap-6">
      <h2 className="text-2xl font-semibold">🔔 Notifications Center</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Total Notifications" value={notifications.length} />
        <Metric label="Unread" value={unread.length} />
        <Metric label="Critical" value={critical.length} flag="⚠️" />
        <Metric label="Pending ACK" value={pendingAck.length} flag="⏳" />
      </div>

      {notifications.length === 0 ? (
        <p className="rounded-lg bg-sky-50 p-4 text-sky-900">No notifications found.</p>
      ) : (
        <>
          <div>
            <h3 className="mb-2 text-lg font-semibold">Quick Actions</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={async () => {
                  await markAllRead()
                  showToast('All notifications marked as read!')
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Mark All as Read
              </button>
              <button
                onClick={async () => {
                  await acknowledgeAllCritical()
                  showToast('All critical notifications acknowledged!')
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Acknowledge All Critical
              </button>
              {criticalUnread.length > 0 && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  ⚠️ {criticalUnread.length} Critical Unread
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <fieldset className="flex items-center gap-3">
              <legend className="mb-1 text-sm font-medium text-slate-700">Filter by Priority:</legend>
              {ALL_PRIORITIES.map((p) => (
                <label key={p} className="flex items-center gap-1.5 text-sm capitalize">
                  <input
                    type="checkbox"
                    checked={priorityFilter.includes(p)}
                    onChange={() => togglePriority(p)}
                    className="h-4 w-4 accent-sky-600"
                  />
                  {p}
                </label>
              ))}
            </fieldset>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={showRead}
                onChange={(e) => setShowRead(e.target.checked)}
                className="h-4 w-4 accent-sky-600"
              />
              Show Read Notifications
            </label>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Notifications ({filtered.length} shown)</h3>
            <ul className="flex flex-col gap-3">
              {filtered.map((n) => (
                <li
                  key={n.id}
                  className={`rounded-r-xl border-l-4 p-4 ${CARD_ACCENT[n.priority]} flex flex-wrap items-start justify-between gap-4`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {PRIORITY_EMOJIS[n.priority]} {n.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{n.message}</p>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>
                      <strong>Status:</strong> {n.readAt ? '👁️ Read' : '📬 Unread'}
                    </p>
                    <p>
                      <strong>Time:</strong>{' '}
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!n.readAt && (
                      <button
                        onClick={() => markAsRead(n.id!)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                      >
                        Mark Read
                      </button>
                    )}
                    {n.requiresAcknowledgment && !n.acknowledgedAt && (
                      <button
                        onClick={() => acknowledge(n.id!)}
                        className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  )
}
