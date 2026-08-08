// Date, money, and label formatting utilities — Turkish locale.

export const trMoney = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
})

export const trMoneyPrecise = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
})

export const trNumber = new Intl.NumberFormat('tr-TR')

const dfDate = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
const dfDateShort = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const dfDateTime = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

export function formatCurrency(amount: number, currency = 'TRY') {
  // Avoid ICU currency-symbol drift (₺ vs TL vs TRY) between Node SSR and browser — React #418.
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
  const code = currency.trim().toUpperCase()
  if (code === 'TRY' || code === 'TL') return `${formatted} TL`
  return `${formatted} ${code}`
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} dk`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} saat` : `${hours} sa ${rest} dk`
}

export function formatTime(time: string | null | undefined) {
  if (!time) return '—'
  const [h, m] = time.split(':')
  return `${h}:${m}`
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return dfDate.format(d)
}

export function formatShortDate(date: Date | string | null | undefined) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return dfDateShort.format(d)
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return dfDateTime.format(d)
}

export function formatRelativeDate(input: Date | string | null | undefined) {
  if (!input) return '—'
  const d = typeof input === 'string' ? new Date(input) : new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const compare = new Date(d)
  compare.setHours(0, 0, 0, 0)
  if (compare.getTime() === today.getTime()) return 'Bugün'
  if (compare.getTime() === tomorrow.getTime()) return 'Yarın'
  const diff = Math.round((compare.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff > 0 && diff <= 7) return `${diff} gün sonra`
  if (diff < 0 && diff >= -7) return `${Math.abs(diff)} gün önce`
  return formatShortDate(d)
}

export function formatTimeAgo(input: Date | string | null | undefined) {
  if (!input) return '—'
  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return '—'
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'az önce'
  if (mins < 60) return `${mins} dk önce`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} saat önce`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} gün önce`
  return formatDate(d)
}

export function toIsoDate(date: Date | string | null | undefined) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatPhone(phone: string | null | undefined) {
  if (!phone) return '—'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('90') && cleaned.length === 12) {
    return `+90 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`
  }
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`
  }
  return phone
}

export function ageFromBirthDate(date: Date | string | null | undefined) {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Onay bekliyor',
  CONFIRMED: 'Onaylandı',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
  NO_SHOW: 'Gelinmedi',
}

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  COMPLETED: 'bg-sky-100 text-sky-800 border-sky-200',
  CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
  NO_SHOW: 'bg-slate-100 text-slate-700 border-slate-200',
}

export const APPOINTMENT_STATUS_DOT: Record<string, string> = {
  SCHEDULED: '#f59e0b',
  CONFIRMED: '#10b981',
  COMPLETED: '#0ea5e9',
  CANCELLED: '#ef4444',
  NO_SHOW: '#64748b',
}

export const TREATMENT_STATUS_LABELS: Record<string, string> = {
  PLANLANDI: 'Planlandı',
  DEVAM_EDIYOR: 'Devam ediyor',
  TAMAMLANDI: 'Tamamlandı',
  IPTAL: 'İptal',
}

export const FILE_CATEGORY_LABELS: Record<string, string> = {
  TAHLIL: 'Tahlil',
  GORUNTU: 'Görüntü',
  RECETE: 'Reçete',
  RAPOR: 'Rapor',
  KIMLIK: 'Kimlik',
  DIGER: 'Diğer',
}
