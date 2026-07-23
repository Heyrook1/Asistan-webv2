/**
 * Pure slot math — no DB. Used by getAvailableSlots and batched fill-the-gap.
 */

import type { AvailabilitySlot } from '@/lib/client-marketplace/types'
import {
  addMinutesToTime,
  parseTimeToMinutes,
  rangesOverlap,
} from '@/lib/client-marketplace/time'

export type AvailabilityRuleRow = {
  startTime: string
  endTime: string
  slotIntervalMin: number
  locationId: string | null
}

export type BusyInterval = {
  startTime: string
  endTime: string
}

export function deDupeSlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  const map = new Map<string, AvailabilitySlot>()
  for (const slot of slots) {
    map.set(`${slot.startTime}-${slot.endTime}`, slot)
  }
  return Array.from(map.values()).sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function selectActiveRules(
  allRules: AvailabilityRuleRow[],
  locationId?: string | null
): AvailabilityRuleRow[] {
  const locationRules =
    locationId != null ? allRules.filter((rule) => rule.locationId === locationId) : []
  const globalRules = allRules.filter((rule) => rule.locationId == null)
  return locationRules.length > 0 ? locationRules : globalRules
}

export function computeAvailableSlots(input: {
  durationMin: number
  rules: AvailabilityRuleRow[]
  appointments: BusyInterval[]
  blocks: BusyInterval[]
  date: string
  nowDate: string
  nowTime: string
  locationId?: string | null
}): AvailabilitySlot[] {
  if (input.date < input.nowDate) return []

  const activeRules = selectActiveRules(input.rules, input.locationId)
  if (activeRules.length === 0) return []

  const candidateSlots: AvailabilitySlot[] = []

  for (const rule of activeRules) {
    const step = Math.max(5, rule.slotIntervalMin || 15)
    const startMin = parseTimeToMinutes(rule.startTime)
    const endMin = parseTimeToMinutes(rule.endTime)
    const duration = input.durationMin
    const lastStart = endMin - duration
    if (lastStart < startMin) continue

    for (let current = startMin; current <= lastStart; current += step) {
      const startTime = addMinutesToTime('00:00', current)
      const endTime = addMinutesToTime(startTime, duration)

      if (input.date === input.nowDate && startTime <= input.nowTime) {
        continue
      }

      const collidesAppointment = input.appointments.some((item) =>
        rangesOverlap(startTime, endTime, item.startTime, item.endTime)
      )
      if (collidesAppointment) continue

      const collidesBlock = input.blocks.some((item) =>
        rangesOverlap(startTime, endTime, item.startTime, item.endTime)
      )
      if (collidesBlock) continue

      candidateSlots.push({ startTime, endTime })
    }
  }

  return deDupeSlots(candidateSlots)
}
