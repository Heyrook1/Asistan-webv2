/**
 * Human-review merge gates for PersonIdentityMatch queue.
 * Auto-link remains dual-strong only; this guards the manual “Birleştir” path.
 */

export const IDENTITY_MERGE_MIN_SCORE = 0.5
/** Below this: review / reject only — never offer merge as a primary action. */
export const IDENTITY_MERGE_REVIEW_ONLY_MAX = 0.49
/** At/above this with compatible names: owner/four-eyes confirm still required. */
export const IDENTITY_MERGE_HIGH_CONFIDENCE = 0.7

export const IDENTITY_MERGE_CONFIRM_PHRASE = 'BIRLESTIR'

export type IdentityPersonSnapshot = {
  id: string
  gpiDisplay: string
  fullNameCanon: string
  phoneE164: string | null
  emailNorm: string | null
}

export type IdentityFieldDiffRow = {
  field: 'fullName' | 'phone' | 'email' | 'gpi'
  label: string
  left: string
  right: string
  status: 'match' | 'mismatch' | 'left_only' | 'right_only' | 'both_empty'
}

export type MergeRiskLevel = 'block' | 'review_only' | 'confirm_required'

export type MergeEligibility = {
  risk: MergeRiskLevel
  canMerge: boolean
  nameCompatible: boolean
  scoreOk: boolean
  blockers: string[]
  warnings: string[]
  /** Primary CTA label for UI */
  primaryAction: 'reject' | 'review' | 'merge'
}

export function namesCompatible(leftCanon: string, rightCanon: string): boolean {
  const a = foldName(leftCanon)
  const b = foldName(rightCanon)
  if (!a || !b) return false
  if (a === b) return true
  // Shared given+family token overlap (at least 2 tokens in common) — still not enough alone to merge.
  const ta = new Set(a.split(/\s+/).filter((t) => t.length >= 2))
  const tb = new Set(b.split(/\s+/).filter((t) => t.length >= 2))
  let shared = 0
  for (const t of ta) if (tb.has(t)) shared += 1
  return shared >= 2 && shared >= Math.min(ta.size, tb.size)
}

/** Lowercase + strip Turkish diacritics so "Yılmaz" ↔ "yilmaz" compare equal. */
function foldName(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
}

export function buildIdentityFieldDiff(
  left: IdentityPersonSnapshot,
  right: IdentityPersonSnapshot,
): IdentityFieldDiffRow[] {
  const rows: Array<{
    field: IdentityFieldDiffRow['field']
    label: string
    leftRaw: string | null
    rightRaw: string | null
  }> = [
    { field: 'fullName', label: 'Ad soyad', leftRaw: left.fullNameCanon, rightRaw: right.fullNameCanon },
    { field: 'phone', label: 'Telefon', leftRaw: left.phoneE164, rightRaw: right.phoneE164 },
    { field: 'email', label: 'E-posta', leftRaw: left.emailNorm, rightRaw: right.emailNorm },
    { field: 'gpi', label: 'GPI', leftRaw: left.gpiDisplay, rightRaw: right.gpiDisplay },
  ]

  return rows.map((row) => {
    const leftVal = row.leftRaw?.trim() || ''
    const rightVal = row.rightRaw?.trim() || ''
    let status: IdentityFieldDiffRow['status']
    if (!leftVal && !rightVal) status = 'both_empty'
    else if (!leftVal) status = 'right_only'
    else if (!rightVal) status = 'left_only'
    else if (leftVal === rightVal) status = 'match'
    else status = 'mismatch'
    return {
      field: row.field,
      label: row.label,
      left: leftVal || '—',
      right: rightVal || '—',
      status,
    }
  })
}

export function evaluateMergeEligibility(input: {
  score: number
  leftNameCanon: string
  rightNameCanon: string
}): MergeEligibility {
  const blockers: string[] = []
  const warnings: string[] = []
  const nameCompatible = namesCompatible(input.leftNameCanon, input.rightNameCanon)
  const scoreOk = input.score >= IDENTITY_MERGE_MIN_SCORE

  if (!nameCompatible) {
    blockers.push('İsimler uyuşmuyor — birleştirme engellendi. Önce kayıtları inceleyin veya reddedin.')
  }
  if (input.score <= IDENTITY_MERGE_REVIEW_ONLY_MAX) {
    blockers.push(
      `Skor çok düşük (%${Math.round(input.score * 100)}). Yalnızca inceleme / ret yapılabilir; birleştirme kapalı.`,
    )
  } else if (!scoreOk) {
    blockers.push(`Skor birleştirme eşiğinin altında (%${Math.round(input.score * 100)} < %50).`)
  }

  if (input.score < IDENTITY_MERGE_HIGH_CONFIDENCE && scoreOk && nameCompatible) {
    warnings.push('Orta güven: birleştirme için işletme sahibi onayı ve onay ifadesi gerekir.')
  }

  if (blockers.length > 0) {
    const reviewOnly = input.score <= IDENTITY_MERGE_REVIEW_ONLY_MAX || !nameCompatible
    return {
      risk: reviewOnly ? 'review_only' : 'block',
      canMerge: false,
      nameCompatible,
      scoreOk,
      blockers,
      warnings,
      primaryAction: 'reject',
    }
  }

  return {
    risk: 'confirm_required',
    canMerge: true,
    nameCompatible,
    scoreOk,
    blockers,
    warnings,
    primaryAction: 'merge',
  }
}

export function buildMergeResultSummary(input: {
  left: IdentityPersonSnapshot
  right: IdentityPersonSnapshot
  score: number
  clinicPatientMoves: number
}): string {
  return [
    `Sol (kalacak): ${input.left.fullNameCanon || '—'} (${input.left.gpiDisplay})`,
    `Sağ (bu klinikte sola bağlanacak): ${input.right.fullNameCanon || '—'} (${input.right.gpiDisplay})`,
    `Skor: %${Math.round(input.score * 100)}`,
    `Bu klinikte taşınacak hasta kartı: ${input.clinicPatientMoves}`,
    'Diğer kliniklerdeki sağ Person bağlantıları korunur; soft-delete yalnızca başka klinik referansı yoksa yapılır.',
  ].join('\n')
}
