import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { TECHNICIAN_ID } from '../db/seed'
import { createNotification } from '../lib/notifications'
import { showToast } from '../components/Toaster'

export const CHECKLIST_ITEMS = [
  'Safety lockout/tagout',
  'Visual inspection',
  'Primary task',
  'System diagnostics',
  'Cleanup',
]

const checklistLogText = (item: string) => `Checklist item completed: ${item}`

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function LogPhoto({ photo }: { photo: Blob }) {
  const urlRef = useRef<string | null>(null)
  if (urlRef.current === null && typeof URL.createObjectURL === 'function') {
    urlRef.current = URL.createObjectURL(photo)
  }
  if (!urlRef.current) return null
  return <img src={urlRef.current} alt="Attached log photo" className="mt-2 w-52 rounded-lg border border-slate-200" />
}

export default function WorkOrderDetails() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const workOrders = useLiveQuery(async () => {
    const orders = await db.workOrders.where('technicianId').equals(TECHNICIAN_ID).toArray()
    const assets = new Map((await db.assets.toArray()).map((a) => [a.id, a]))
    return orders.map((wo) => ({ ...wo, assetName: assets.get(wo.assetId)?.name ?? wo.assetId }))
  })

  const effectiveId = selectedId ?? workOrders?.[0]?.id ?? null
  const selected = workOrders?.find((wo) => wo.id === effectiveId)

  const logs = useLiveQuery(
    async () =>
      effectiveId === null
        ? []
        : (await db.logs.where('workOrderId').equals(effectiveId).toArray()).sort((a, b) =>
            b.timestamp.localeCompare(a.timestamp),
          ),
    [effectiveId],
  )

  if (workOrders === undefined || logs === undefined) return <p className="text-slate-400">Loading…</p>

  const completedChecklist = new Set(
    CHECKLIST_ITEMS.filter((item) => logs.some((l) => l.logText === checklistLogText(item))),
  )
  const allComplete = completedChecklist.size === CHECKLIST_ITEMS.length

  const logChecklistItem = async (item: string) => {
    if (effectiveId === null || completedChecklist.has(item)) return
    await db.logs.add({
      workOrderId: effectiveId,
      logText: checklistLogText(item),
      timestamp: new Date().toISOString(),
    })
    showToast(`Logged: ${item}`)
  }

  const saveCustomLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (effectiveId === null) return
    const file = fileInputRef.current?.files?.[0]
    if (!noteText.trim() && !file) return
    await db.logs.add({
      workOrderId: effectiveId,
      logText: noteText,
      photo: file ?? undefined,
      timestamp: new Date().toISOString(),
    })
    setNoteText('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    showToast('Custom log entry saved!')
  }

  const createCompletionNotification = async () => {
    if (!selected) return
    await createNotification({
      title: '✅ Work Order Completed',
      message: `All checklist items completed for work order: ${selected.title}`,
      priority: 'medium',
      category: 'task',
      metadata: {
        workOrderId: selected.id,
        completionTime: new Date().toISOString(),
        completedItems: CHECKLIST_ITEMS.length,
      },
    })
    showToast('Completion notification created — see 🔔 Notifications')
  }

  const createDiagnosticNotification = async () => {
    if (!selected) return
    await createNotification({
      title: `🤖 AI Diagnostic: ${selected.aiAlertTitle}`,
      message: `AI system detected ${selected.aiAlertTitle} on ${selected.title} with ${selected.aiConfidence}% confidence.`,
      priority: selected.aiConfidence > 80 ? 'high' : 'medium',
      category: 'equipment',
      metadata: { assetName: selected.assetName, aiConfidence: selected.aiConfidence },
    })
    showToast('Equipment diagnostic notification created — see 🔔 Notifications')
  }

  return (
    <section className="flex max-w-3xl flex-col gap-5">
      <h2 className="text-2xl font-semibold">Work Order Details & Logging</h2>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Select a Work Order to view details:
        <select
          value={effectiveId ?? ''}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        >
          {workOrders.map((wo) => (
            <option key={wo.id} value={wo.id}>
              {wo.id}: {wo.title} ({wo.assetName})
            </option>
          ))}
        </select>
      </label>

      {selected && (
        <>
          {selected.aiAlertTitle && selected.aiAlertTitle !== 'N/A' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-900">
                <strong>AI Diagnostic Alert:</strong> {selected.aiAlertTitle} ({selected.aiConfidence}%
                confidence)
              </p>
              <button
                onClick={createDiagnosticNotification}
                className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                🔔 Create Notification from AI Alert
              </button>
            </div>
          )}

          {selected.tribalKnowledgeNote && (
            <p className="rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-900">
              <strong>Tribal Knowledge:</strong> {selected.tribalKnowledgeNote}
            </p>
          )}

          <div>
            <h3 className="text-lg font-semibold">{selected.title}</h3>
            <p className="mt-1 text-sm text-slate-600">
              <strong>Required Tools:</strong> {selected.toolsRequired} | <strong>Required Parts:</strong>{' '}
              {selected.partsRequired}
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">"Tap-to-Log" Checklist</h3>
            <ul className="flex flex-col gap-1.5">
              {CHECKLIST_ITEMS.map((item) => {
                const done = completedChecklist.has(item)
                return (
                  <li key={item}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={done}
                        disabled={done}
                        onChange={() => logChecklistItem(item)}
                        className="h-4 w-4 accent-sky-600"
                      />
                      <span className={done ? 'text-slate-400 line-through' : ''}>{item}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            {allComplete && (
              <div className="mt-3 rounded-lg bg-green-50 p-3">
                <p className="text-sm font-medium text-green-800">🎉 All checklist items completed!</p>
                <button
                  onClick={createCompletionNotification}
                  className="mt-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                >
                  🔔 Create Completion Notification
                </button>
              </div>
            )}
          </div>

          <form onSubmit={saveCustomLog} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Add a custom note or upload a photo:
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Upload Photo:
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="text-sm font-normal" />
            </label>
            <button
              type="submit"
              className="self-start rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              Save Custom Log
            </button>
          </form>

          <div>
            <h3 className="mb-2 border-t border-slate-200 pt-4 text-lg font-semibold">Activity Log</h3>
            {logs.length === 0 ? (
              <p className="text-sm text-slate-400">No log entries yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {logs.map((log) => (
                  <li key={log.id} className="text-sm">
                    <p>
                      <strong>{formatTimestamp(log.timestamp)}</strong>: {log.logText}
                    </p>
                    {log.photo instanceof Blob && <LogPhoto photo={log.photo} />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  )
}
