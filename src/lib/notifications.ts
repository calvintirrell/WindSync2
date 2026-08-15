import { db } from '../db/db'
import type { AppNotification, NotificationCategory, NotificationPriority } from '../db/types'

export interface CreateNotificationInput {
  title: string
  message: string
  priority: NotificationPriority
  category: NotificationCategory
  metadata?: Record<string, unknown>
  requiresAcknowledgment?: boolean
}

export async function createNotification(input: CreateNotificationInput): Promise<number> {
  const notification: AppNotification = {
    title: input.title,
    message: input.message,
    priority: input.priority,
    category: input.category,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    // Original system requires acknowledgment for critical/safety alerts
    requiresAcknowledgment: input.requiresAcknowledgment ?? input.priority === 'critical',
    readAt: null,
    acknowledgedAt: null,
  }
  return (await db.notifications.add(notification)) as number
}

export async function markAsRead(id: number): Promise<void> {
  const n = await db.notifications.get(id)
  if (n && !n.readAt) await db.notifications.update(id, { readAt: new Date().toISOString() })
}

export async function acknowledge(id: number): Promise<void> {
  const n = await db.notifications.get(id)
  if (!n || n.acknowledgedAt) return
  // Acknowledging implies having read it
  await db.notifications.update(id, {
    acknowledgedAt: new Date().toISOString(),
    readAt: n.readAt ?? new Date().toISOString(),
  })
}

export async function markAllRead(): Promise<void> {
  const now = new Date().toISOString()
  await db.notifications.toCollection().modify((n) => {
    if (!n.readAt) n.readAt = now
  })
}

export async function acknowledgeAllCritical(): Promise<void> {
  const now = new Date().toISOString()
  await db.notifications.toCollection().modify((n) => {
    if (n.priority === 'critical' && n.requiresAcknowledgment && !n.acknowledgedAt) {
      n.acknowledgedAt = now
      if (!n.readAt) n.readAt = now
    }
  })
}

export const PRIORITY_EMOJIS: Record<string, string> = {
  critical: '🚨',
  high: '⚠️',
  medium: '📋',
  low: '💡',
}
