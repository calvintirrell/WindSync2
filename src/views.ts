export const VIEWS = [
  { id: 'plan-of-day', label: 'Technician: Plan of Day' },
  { id: 'work-order-details', label: 'Technician: Work Order Details' },
  { id: 'my-dashboard', label: 'Technician: My Dashboard' },
  { id: 'notifications', label: '🔔 Notifications' },
  { id: 'manager-dashboard', label: 'Manager: Dashboard' },
] as const

export type ViewId = (typeof VIEWS)[number]['id']
