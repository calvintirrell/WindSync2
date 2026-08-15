export type Priority = 'High' | 'Medium' | 'Low'
export type WorkOrderStatus = 'New' | 'In Progress' | 'Completed'
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low'
export type NotificationCategory = 'safety' | 'task' | 'equipment' | 'system'

export interface Technician {
  id: string
  name: string
  certifications: string
}

export interface Asset {
  id: string
  name: string
  latitude: number
  longitude: number
  model: string
}

export interface WorkOrder {
  id?: number
  technicianId: string
  assetId: string
  title: string
  description: string
  priority: Priority
  status: WorkOrderStatus
  toolsRequired: string
  partsRequired: string
  aiAlertTitle: string
  aiConfidence: number
  tribalKnowledgeNote: string
}

export interface LogEntry {
  id?: number
  workOrderId: number
  logText: string
  photo?: Blob
  timestamp: string // ISO 8601
}

// Single-technician demo: recipient/read state lives on the notification itself
export interface AppNotification {
  id?: number
  title: string
  message: string
  priority: NotificationPriority
  category: NotificationCategory
  metadata: Record<string, unknown>
  createdAt: string // ISO 8601
  createdBy: string
  requiresAcknowledgment: boolean
  readAt: string | null
  acknowledgedAt: string | null
}
