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
