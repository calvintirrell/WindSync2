import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/db'
import { ensureSeeded } from '../db/seed'
import WorkOrderDetails, { CHECKLIST_ITEMS } from './WorkOrderDetails'

beforeEach(async () => {
  await db.delete()
  await db.open()
  await ensureSeeded()
})

describe('WorkOrderDetails', () => {
  it('defaults to the first work order and shows its AI alert and tribal knowledge', async () => {
    render(<WorkOrderDetails />)
    expect(await screen.findByText(/Gearbox Bearing Fault \(95% confidence\)/)).toBeInTheDocument()
    expect(screen.getByText(/yaw motor alignment last quarter/)).toBeInTheDocument()
    expect(screen.getByText(/Vibration Analyzer, Torque Wrench Set/)).toBeInTheDocument()
  })

  it('switches work orders via the selector', async () => {
    render(<WorkOrderDetails />)
    await screen.findByText(/Gearbox Bearing Fault/)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } })
    expect(await screen.findByText(/Hydraulic Hose Fatigue \(85% confidence\)/)).toBeInTheDocument()
    expect(screen.getByText(/prone to hose fatigue near the main pump/)).toBeInTheDocument()
  })

  it('hides the AI alert banner for N/A alerts (completed order)', async () => {
    render(<WorkOrderDetails />)
    await screen.findByText(/Gearbox Bearing Fault/)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '4' } })
    await waitFor(() =>
      expect(screen.queryByText(/AI Diagnostic Alert/)).not.toBeInTheDocument(),
    )
  })

  it('logs a checklist item exactly once and disables it', async () => {
    render(<WorkOrderDetails />)
    await screen.findByText(/Gearbox Bearing Fault/)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Safety lockout/tagout' }))
    expect(
      await screen.findByText(/Checklist item completed: Safety lockout\/tagout/),
    ).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Safety lockout/tagout' })).toBeDisabled()
    expect(await db.logs.count()).toBe(1)
  })

  it('shows completion controls when all checklist items are done, and creates the notification', async () => {
    render(<WorkOrderDetails />)
    await screen.findByText(/Gearbox Bearing Fault/)
    for (const item of CHECKLIST_ITEMS) {
      fireEvent.click(screen.getByRole('checkbox', { name: item }))
      await screen.findByText(new RegExp(`Checklist item completed: ${item.replace(/[/]/g, '\\/')}`))
    }
    expect(screen.getByText('🎉 All checklist items completed!')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '🔔 Create Completion Notification' }))
    await waitFor(async () => expect(await db.notifications.count()).toBe(1))
    const n = (await db.notifications.toArray())[0]
    expect(n.title).toBe('✅ Work Order Completed')
    expect(n.category).toBe('task')
    expect(n.metadata.workOrderId).toBe(1)
  })

  it('creates an equipment notification from the AI alert with high priority above 80% confidence', async () => {
    render(<WorkOrderDetails />)
    await screen.findByText(/Gearbox Bearing Fault/)
    fireEvent.click(screen.getByRole('button', { name: '🔔 Create Notification from AI Alert' }))
    await waitFor(async () => expect(await db.notifications.count()).toBe(1))
    const n = (await db.notifications.toArray())[0]
    expect(n.priority).toBe('high')
    expect(n.category).toBe('equipment')
    expect(n.message).toContain('95% confidence')
  })

  it('saves a custom note and shows it in the activity log', async () => {
    render(<WorkOrderDetails />)
    await screen.findByText(/Gearbox Bearing Fault/)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Found loose bolt on housing' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Custom Log' }))
    expect(await screen.findByText(/Found loose bolt on housing/)).toBeInTheDocument()
    const logs = await db.logs.toArray()
    expect(logs).toHaveLength(1)
    expect(logs[0].workOrderId).toBe(1)
  })

  it('keeps logs scoped per work order', async () => {
    render(<WorkOrderDetails />)
    await screen.findByText(/Gearbox Bearing Fault/)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Cleanup' }))
    await screen.findByText(/Checklist item completed: Cleanup/)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })
    await screen.findByText(/No Fault Detected/)
    await waitFor(() =>
      expect(screen.queryByText(/Checklist item completed: Cleanup/)).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('checkbox', { name: 'Cleanup' })).not.toBeChecked()
  })
})
