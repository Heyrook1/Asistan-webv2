'use client'

/**
 * Lightweight UI preference helpers (localStorage).
 * Tenant-safe: keys are namespaced; never store PHI.
 */

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readUiPreference<T>(key: string): T | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeUiPreference<T>(key: string, value: T) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function clearUiPreference(key: string) {
  if (!canUseStorage()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

/** @deprecated alias */
export const readUiPref = <T,>(key: string, fallback: T): T =>
  readUiPreference<T>(key) ?? fallback

/** @deprecated alias */
export const writeUiPref = writeUiPreference

export const UI_PREF_KEYS = {
  appointmentDefaults: 'asistan.appt-defaults.v1',
  appointmentStatusFilter: 'asistan.appt-status-filter.v1',
  calendarPrefs: 'asistan.calendar-prefs.v1',
  patientsToolbar: 'asistan.patients-toolbar.v1',
  clientDiscovery: 'asistan.client-discovery.v1',
  settingsTab: 'asistan.settings-tab.v1',
  mobileSearch: 'asistan.mobile-search.v1',
} as const

export type AppointmentDefaultsPref = {
  locationId?: string
  serviceId?: string
  staffId?: string
  startTime?: string
}

export type CalendarPrefs = {
  view?: 'day' | 'week' | 'month'
  staffFilter?: string
  serviceFilter?: string
  statusFilter?: string
}

export type PatientsToolbarPref = {
  archived?: boolean
  q?: string
}

export type ClientDiscoveryPref = {
  sort?: string
  availableToday?: boolean
  minRating?: string
  maxDistanceKm?: string
  maxPrice?: string
  city?: string
}

/** Next half-hour clock time in HH:mm (local). */
export function nextHalfHourTime(now = new Date()) {
  const minutes = now.getMinutes()
  const add = minutes === 0 || minutes === 30 ? 30 : minutes < 30 ? 30 - minutes : 60 - minutes
  const next = new Date(now.getTime() + add * 60_000)
  return `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}`
}

/** Today as YYYY-MM-DD (local). */
export function todayIsoDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
