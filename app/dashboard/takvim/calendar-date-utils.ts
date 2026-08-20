export function toISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day + 6) % 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function formatAccessibleDate(date: Date) {
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function hourSlotAriaLabel(date: Date, hour: number, eventCount: number, canCreateSlot: boolean) {
  const hourLabel = `${String(hour).padStart(2, '0')}:00`
  const dateLabel = formatAccessibleDate(date)
  if (eventCount > 0) return `${dateLabel}, ${hourLabel}, ${eventCount} randevu`
  if (canCreateSlot) return `${dateLabel}, ${hourLabel}, müsait, randevu oluştur`
  return `${dateLabel}, ${hourLabel}, müsait`
}

export function dayCellAriaLabel(day: Date, eventCount: number) {
  const dateLabel = formatAccessibleDate(day)
  if (eventCount > 0) return `${dateLabel}, ${eventCount} randevu, güne git`
  return `${dateLabel}, randevu oluştur`
}
