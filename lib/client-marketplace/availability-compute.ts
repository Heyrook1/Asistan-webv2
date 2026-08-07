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
    const step = Math.max(5, Number(rule.slotIntervalMin) || 15)
    if (!Number.isFinite(step)) continue
    const startMin = parseTimeToMinutes(rule.startTime)
    const endMin = parseTimeToMinutes(rule.endTime)
    if (!Number.isFinite(startMin) || !Number.isFinite(endMin)) continue
    const duration = input.durationMin
    if (!Number.isFinite(duration) || duration <= 0) continue
    const lastStart = endMin - duration
    if (lastStart < startMin) continue

    // Hard cap — bad data must not spin the event loop (prod 500 / empty upstream).
    const maxIterations = Math.floor((lastStart - startMin) / step) + 1
    if (maxIterations > 500) continue

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
