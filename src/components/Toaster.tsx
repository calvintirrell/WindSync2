import { useEffect, useState } from 'react'

const TOAST_EVENT = 'windsync:toast'
const TOAST_DURATION_MS = 4000

export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }))
}

interface Toast {
  id: number
  message: string
}

let nextId = 1

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const onToast = (e: Event) => {
      const toast = { id: nextId++, message: (e as CustomEvent<string>).detail }
      setToasts((prev) => [...prev, toast])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), TOAST_DURATION_MS)
    }
    window.addEventListener(TOAST_EVENT, onToast)
    return () => window.removeEventListener(TOAST_EVENT, onToast)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-[1000] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {t.message}
        </div>
      ))}
    </div>
  )
}
