// Date and time formatting utilities for Turkish locale

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatTime(timeString: string): string {
  // Handle both "HH:MM:SS" and "HH:MM" formats
  const [hours, minutes] = timeString.split(':')
  return `${hours}:${minutes}`
}

export function formatDateTime(dateString: string, timeString: string): string {
  return `${formatDate(dateString)} ${formatTime(timeString)}`
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Reset time for comparison
  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  if (date.getTime() === today.getTime()) {
    return 'Bugün'
  }

  if (date.getTime() === tomorrow.getTime()) {
    return 'Yarın'
  }

  const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays > 0 && diffDays <= 7) {
    return `${diffDays} gün sonra`
  }

  return formatShortDate(dateString)
}

export function formatCurrency(amount: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} dk`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} saat`
  }

  return `${hours} saat ${remainingMinutes} dk`
}

export function formatPhone(phone: string): string {
  // Format Turkish phone numbers
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('90') && cleaned.length === 12) {
    return `+90 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`
  }
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`
  }

  return phone
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) {
    return 'Az önce'
  }

  if (diffMins < 60) {
    return `${diffMins} dakika önce`
  }

  if (diffHours < 24) {
    return `${diffHours} saat önce`
  }

  if (diffDays < 7) {
    return `${diffDays} gün önce`
  }

  return formatDate(dateString)
}
