/**
 * Turkish rules-based intent parsing for WhatsApp front desk.
 * Deterministic — not an LLM; do not market as “AI-powered”.
 */

export type FrontDeskIntent =
  | { type: 'greet' }
  | { type: 'help' }
  | { type: 'restart' }
  | { type: 'confirm' }
  | { type: 'pick_number'; index: number }
  | { type: 'date'; date: string }
  | { type: 'time'; startTime: string }
  | { type: 'name'; fullName: string }
  | { type: 'service_query'; query: string }
  | { type: 'unknown'; raw: string }

const GREET_RE = /^(merhaba|selam|hey|hi|hello|günaydın|iyi\s*akşamlar|randevu(\s*almak)?(\s*istiyorum)?)\b/i
const HELP_RE = /^(yard[ıi]m|help|men[üu]|ne\s*yapabilir)\b/i
const RESTART_RE = /^(iptal|ba[sş]tan|vazge[cç]|reset|iptal\s*et)\b/i
const CONFIRM_RE = /^(evet|onayla|tamam|ok|olur|book|rezerve)\b/i

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** Local calendar yyyy-mm-dd in Europe/Istanbul-ish (UTC+3 fixed for KKTC). */
export function localDateString(base = new Date(), offsetDays = 0): string {
  const d = new Date(base.getTime() + offsetDays * 86_400_000)
  // Use UTC+3 wall clock approximation for deterministic tests
  const utc = d.getTime() + d.getTimezoneOffset() * 60_000
  const tr = new Date(utc + 3 * 60 * 60_000)
  return `${tr.getUTCFullYear()}-${pad2(tr.getUTCMonth() + 1)}-${pad2(tr.getUTCDate())}`
}

export function parseRelativeDate(
  text: string,
  now = new Date()
): string | null {
  const t = text.trim().toLowerCase()
  if (/^bug[üu]n\b/.test(t) || t === 'bugun') return localDateString(now, 0)
  if (/^yar[ıi]n\b/.test(t)) return localDateString(now, 1)

  const iso = t.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  const dmy = t.match(/\b(\d{1,2})[./](\d{1,2})(?:[./](20\d{2}))?\b/)
  if (dmy) {
    const day = pad2(Number(dmy[1]))
    const month = pad2(Number(dmy[2]))
    const year = dmy[3] ?? String(localDateString(now).slice(0, 4))
    return `${year}-${month}-${day}`
  }

  return null
}

export function parseTimeToken(text: string): string | null {
  const t = text.trim().toLowerCase()
  const m = t.match(/\b(?:saat\s*)?(\d{1,2})[:.](\d{2})\b/)
  if (m) {
    const h = Number(m[1])
    const min = Number(m[2])
    if (h >= 0 && h <= 23 && min >= 0 && min <= 59) return `${pad2(h)}:${pad2(min)}`
  }
  const hOnly = t.match(/\b(?:saat\s*)?(\d{1,2})\b/)
  if (hOnly && /saat/.test(t)) {
    const h = Number(hOnly[1])
    if (h >= 0 && h <= 23) return `${pad2(h)}:00`
  }
  return null
}

export function normalizeTr(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim()
}

export function matchServiceByQuery<T extends { id: string; name: string }>(
  services: T[],
  query: string
): T | null {
  const q = normalizeTr(query)
  if (!q) return null
  const exact = services.find((s) => normalizeTr(s.name) === q)
  if (exact) return exact
  const includes = services.filter((s) => normalizeTr(s.name).includes(q) || q.includes(normalizeTr(s.name)))
  if (includes.length === 1) return includes[0]
  return null
}

export function parseFrontDeskIntent(raw: string, now = new Date()): FrontDeskIntent {
  const text = raw.trim().replace(/\s+/g, ' ')
  if (!text) return { type: 'unknown', raw: '' }

  const num = text.match(/^(\d{1,2})$/)
  if (num) return { type: 'pick_number', index: Number(num[1]) }

  if (HELP_RE.test(text)) return { type: 'help' }
  if (RESTART_RE.test(text)) return { type: 'restart' }
  if (CONFIRM_RE.test(text)) return { type: 'confirm' }
  if (GREET_RE.test(text)) return { type: 'greet' }

  const date = parseRelativeDate(text, now)
  if (date && !parseTimeToken(text)) return { type: 'date', date }

  const time = parseTimeToken(text)
  if (time) return { type: 'time', startTime: time }

  const nameMatch = text.match(/^(?:ad[ıi]m|ismim|ben)\s+(.+)$/i)
  if (nameMatch) return { type: 'name', fullName: nameMatch[1].trim() }

  // Short free text that looks like a person name (2+ tokens, letters)
  if (/^[A-Za-zÇĞİÖŞÜçğıöşü][A-Za-zÇĞİÖŞÜçğıöşü\s'.-]{2,80}$/.test(text) && text.includes(' ')) {
    return { type: 'name', fullName: text }
  }

  return { type: 'service_query', query: text }
}
