/**
 * Pure CSV helpers for clinic patient onboarding import.
 * Matches dashboard export delimiter (`;` + BOM) and accepts common Excel headers.
 */

export const PATIENT_IMPORT_MAX_ROWS = 500

/** Canonical import columns (Turkish labels match / round-trip Asistan export). */
export const PATIENT_IMPORT_TEMPLATE_HEADERS = [
  'Ad Soyad',
  'Telefon',
  'E-posta',
  'Kimlik / pasaport no',
  'Dogum tarihi',
  'Cinsiyet',
  'Kan grubu',
  'Adres',
  'Sehir',
  'Acil kisi',
  'Acil telefon',
  'Meslek',
  'Sigorta',
  'Etiketler',
] as const

type CanonicalField =
  | 'fullName'
  | 'phone'
  | 'email'
  | 'identityNumber'
  | 'birthDate'
  | 'gender'
  | 'bloodType'
  | 'address'
  | 'city'
  | 'emergencyContactName'
  | 'emergencyContactPhone'
  | 'occupation'
  | 'insuranceProvider'
  | 'tags'

const HEADER_ALIASES: Record<string, CanonicalField | 'skip'> = {
  // Required / core
  adsoyad: 'fullName',
  ad: 'fullName',
  isim: 'fullName',
  'ad soyad': 'fullName',
  'adi soyadi': 'fullName',
  'hasta adi': 'fullName',
  fullname: 'fullName',
  name: 'fullName',
  telefon: 'phone',
  tel: 'phone',
  phone: 'phone',
  gsm: 'phone',
  cep: 'phone',
  'cep telefonu': 'phone',
  // Optional
  email: 'email',
  'e-posta': 'email',
  eposta: 'email',
  mail: 'email',
  kimlik: 'identityNumber',
  'kimlik no': 'identityNumber',
  'kimlik / pasaport no': 'identityNumber',
  'kimlik/pasaport no': 'identityNumber',
  'kimlik pasaport no': 'identityNumber',
  pasaport: 'identityNumber',
  'pasaport no': 'identityNumber',
  passport: 'identityNumber',
  identitynumber: 'identityNumber',
  'dogum tarihi': 'birthDate',
  'doğum tarihi': 'birthDate',
  dogumtarihi: 'birthDate',
  birthdate: 'birthDate',
  dogum: 'birthDate',
  cinsiyet: 'gender',
  gender: 'gender',
  'kan grubu': 'bloodType',
  kangrubu: 'bloodType',
  bloodtype: 'bloodType',
  adres: 'address',
  address: 'address',
  sehir: 'city',
  şehir: 'city',
  city: 'city',
  'acil kisi': 'emergencyContactName',
  'acil kişi': 'emergencyContactName',
  'acil iletisim': 'emergencyContactName',
  'acil iletişim': 'emergencyContactName',
  emergencycontact: 'emergencyContactName',
  'acil telefon': 'emergencyContactPhone',
  'acil tel': 'emergencyContactPhone',
  meslek: 'occupation',
  occupation: 'occupation',
  sigorta: 'insuranceProvider',
  insurance: 'insuranceProvider',
  etiketler: 'tags',
  etiket: 'tags',
  tags: 'tags',
  // Export-only / ignore
  'hasta no': 'skip',
  hastano: 'skip',
  yas: 'skip',
  yaş: 'skip',
  age: 'skip',
  'randevu sayisi': 'skip',
  'randevu sayısı': 'skip',
  'risk notu': 'skip',
  'kayit tarihi': 'skip',
  'kayıt tarihi': 'skip',
  createdat: 'skip',
}

export type PatientImportDraft = {
  fullName: string
  phone: string
  email?: string
  identityNumber?: string
  birthDate?: string
  gender?: string
  bloodType?: string
  address?: string
  city?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  occupation?: string
  insuranceProvider?: string
  tags: string[]
}

export type PatientImportRowResult =
  | { row: number; ok: true; draft: PatientImportDraft }
  | { row: number; ok: false; error: string; draft?: Partial<PatientImportDraft> }

export type ParsedPatientCsv = {
  delimiter: ';' | ','
  headers: string[]
  mappedFields: Array<CanonicalField | null>
  rows: PatientImportRowResult[]
  validCount: number
  errorCount: number
}

function stripBom(text: string) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

function normalizeHeader(raw: string) {
  return raw
    .replace(/^\uFEFF/, '')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
}

function detectDelimiter(headerLine: string): ';' | ',' {
  const semis = (headerLine.match(/;/g) || []).length
  const commas = (headerLine.match(/,/g) || []).length
  return semis >= commas ? ';' : ','
}

/** RFC-style CSV line split with quote support. */
export function splitCsvLine(line: string, delimiter: ';' | ','): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === delimiter) {
      cells.push(current)
      current = ''
      continue
    }
    current += ch
  }
  cells.push(current)
  return cells.map((c) => c.trim())
}

export function parseImportDate(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined
  const value = raw.trim()
  if (!value || value === '—') return undefined

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  const tr = value.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/)
  if (tr) {
    const day = tr[1].padStart(2, '0')
    const month = tr[2].padStart(2, '0')
    const year = tr[3]
    return `${year}-${month}-${day}`
  }

  return undefined
}

export function normalizeImportGender(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined
  const v = raw.trim().toLocaleLowerCase('tr-TR')
  if (!v) return undefined
  if (['kadın', 'kadin', 'female', 'f', 'k'].includes(v)) return 'Kadın'
  if (['erkek', 'male', 'm', 'e'].includes(v)) return 'Erkek'
  if (['diğer', 'diger', 'other', 'belirtilmemiş', 'belirtilmemis'].includes(v)) return 'Diğer'
  return raw.trim().slice(0, 40)
}

function parseTags(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(/[,|]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20)
}

function resolveHeader(raw: string): CanonicalField | 'skip' | null {
  const key = normalizeHeader(raw)
  if (!key) return null
  return HEADER_ALIASES[key] ?? null
}

export function mapCsvRowToDraft(
  cells: string[],
  mappedFields: Array<CanonicalField | null>
): { draft: PatientImportDraft; error?: string } {
  const bag: Partial<Record<CanonicalField, string>> = {}
  for (let i = 0; i < mappedFields.length; i++) {
    const field = mappedFields[i]
    if (!field) continue
    const cell = cells[i]?.trim() ?? ''
    if (!cell || cell === '—') continue
    bag[field] = cell
  }

  const fullName = bag.fullName?.trim() ?? ''
  const phone = bag.phone?.trim() ?? ''
  if (fullName.length < 2) return { draft: { fullName, phone, tags: [] }, error: 'Ad soyad en az 2 karakter olmalı' }
  if (phone.length < 7) return { draft: { fullName, phone, tags: [] }, error: 'Telefon zorunlu (en az 7 karakter)' }

  let birthDate: string | undefined
  if (bag.birthDate) {
    birthDate = parseImportDate(bag.birthDate)
    if (!birthDate) {
      return {
        draft: { fullName, phone, tags: [] },
        error: `Doğum tarihi okunamadı: "${bag.birthDate}" (gg.aa.yyyy veya yyyy-mm-dd)`,
      }
    }
  }

  if (bag.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bag.email)) {
    return { draft: { fullName, phone, tags: [] }, error: `Geçersiz e-posta: ${bag.email}` }
  }

  const draft: PatientImportDraft = {
    fullName: fullName.slice(0, 120),
    phone: phone.slice(0, 40),
    email: bag.email?.slice(0, 200),
    identityNumber: bag.identityNumber?.slice(0, 40),
    birthDate,
    gender: normalizeImportGender(bag.gender),
    bloodType: bag.bloodType?.slice(0, 20),
    address: bag.address?.slice(0, 500),
    city: bag.city?.slice(0, 100),
    emergencyContactName: bag.emergencyContactName?.slice(0, 120),
    emergencyContactPhone: bag.emergencyContactPhone?.slice(0, 40),
    occupation: bag.occupation?.slice(0, 120),
    insuranceProvider: bag.insuranceProvider?.slice(0, 120),
    tags: parseTags(bag.tags),
  }
  return { draft }
}

export function parsePatientCsv(text: string): ParsedPatientCsv | { error: string } {
  const cleaned = stripBom(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  if (!cleaned) return { error: 'CSV boş' }

  const lines = cleaned.split('\n').filter((line) => line.trim().length > 0)
  if (lines.length < 2) return { error: 'CSV en az bir başlık ve bir veri satırı içermeli' }

  const delimiter = detectDelimiter(lines[0])
  const headers = splitCsvLine(lines[0], delimiter)
  const mappedFields = headers.map((h) => {
    const resolved = resolveHeader(h)
    if (resolved === 'skip') return null
    return resolved
  })

  if (!mappedFields.includes('fullName') || !mappedFields.includes('phone')) {
    return {
      error:
        'CSV başlıklarında "Ad Soyad" ve "Telefon" (veya eşdeğerleri) zorunlu. Şablon indirip Excel’den yapıştırabilirsiniz.',
    }
  }

  const dataLines = lines.slice(1)
  if (dataLines.length > PATIENT_IMPORT_MAX_ROWS) {
    return { error: `En fazla ${PATIENT_IMPORT_MAX_ROWS} satır içe aktarılabilir (gelen: ${dataLines.length})` }
  }

  const rows: PatientImportRowResult[] = []
  let validCount = 0
  let errorCount = 0

  for (let i = 0; i < dataLines.length; i++) {
    const rowNum = i + 2 // 1-based file line (header = 1)
    const cells = splitCsvLine(dataLines[i], delimiter)
    if (cells.every((c) => !c.trim())) continue

    const { draft, error } = mapCsvRowToDraft(cells, mappedFields)
    if (error) {
      errorCount++
      rows.push({ row: rowNum, ok: false, error, draft })
    } else {
      validCount++
      rows.push({ row: rowNum, ok: true, draft })
    }
  }

  if (rows.length === 0) return { error: 'İçe aktarılacak veri satırı bulunamadı' }

  return { delimiter, headers, mappedFields, rows, validCount, errorCount }
}

/** Mark later CSV rows that repeat an earlier phone (clinic will also skip DB duplicates). */
export function flagDuplicatePhonesInCsv(rows: PatientImportRowResult[]): PatientImportRowResult[] {
  const seen = new Map<string, number>()
  return rows.map((row) => {
    if (!row.ok) return row
    const key = row.draft.phone.replace(/\D/g, '')
    if (!key) return row
    const first = seen.get(key)
    if (first != null) {
      return {
        row: row.row,
        ok: false,
        error: `Aynı telefona sahip önceki satır (satır ${first}) — atlandı`,
        draft: row.draft,
      }
    }
    seen.set(key, row.row)
    return row
  })
}

export function buildPatientImportTemplateCsv(): string {
  const header = PATIENT_IMPORT_TEMPLATE_HEADERS.join(';')
  const example = [
    'Ayşe Yılmaz',
    '05551234567',
    'ayse@ornek.com',
    '',
    '15.03.1988',
    'Kadın',
    'A+',
    '',
    'İstanbul',
    '',
    '',
    '',
    '',
    'VIP, kronik',
  ].join(';')
  return `\uFEFF${header}\n${example}\n`
}

/** Common local spellings of the same TR mobile for exact `phone in (...)` lookup. */
export function phoneMatchCandidates(phone: string): string[] {
  const trimmed = phone.trim()
  const digits = trimmed.replace(/\D/g, '')
  const set = new Set<string>()
  if (trimmed) set.add(trimmed)
  if (digits) set.add(digits)
  if (digits.length >= 10) {
    const last10 = digits.slice(-10)
    set.add(last10)
    set.add(`0${last10}`)
    set.add(`90${last10}`)
    set.add(`+90${last10}`)
  }
  // Prefer E.164 when digits look like TR mobile
  if (digits.length === 10 && digits.startsWith('5')) set.add(`+90${digits}`)
  if (digits.length === 11 && digits.startsWith('05')) set.add(`+90${digits.slice(1)}`)
  if (digits.length === 12 && digits.startsWith('905')) set.add(`+${digits}`)
  return [...set]
}
