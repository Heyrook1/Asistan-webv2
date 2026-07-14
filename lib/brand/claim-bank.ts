/**
 * Brand claim bank — only use approved copy in marketing, ads, social, store listings.
 * Forbidden claims must never appear as present-tense certifications.
 *
 * Principle (Güven / Hakkımızda): kanıt yoksa iddia etme.
 */

export type BrandClaim = {
  id: string
  tr: string
  en: string
  /** Where this wording is safe to reuse */
  surfaces: Array<'hero' | 'badge' | 'pricing' | 'ads' | 'social' | 'store' | 'auth'>
}

/** Approved short labels / badges */
export const APPROVED_CLAIMS: BrandClaim[] = [
  {
    id: 'kvkk-controls',
    tr: 'KVKK odaklı kontroller',
    en: 'KVKK-focused privacy controls',
    surfaces: ['hero', 'badge', 'pricing', 'ads', 'social', 'auth'],
  },
  {
    id: 'tenant-isolation',
    tr: 'İşletme bazlı veri ayrımı',
    en: 'Business-level data isolation',
    surfaces: ['hero', 'pricing', 'ads', 'social'],
  },
  {
    id: 'rbac',
    tr: 'Rol bazlı erişim',
    en: 'Role-based access',
    surfaces: ['hero', 'badge', 'pricing', 'auth', 'social'],
  },
  {
    id: 'audit-log',
    tr: 'Denetim günlüğü',
    en: 'Audit log',
    surfaces: ['pricing', 'ads', 'social'],
  },
  {
    id: 'early-access',
    tr: 'Erken erişim',
    en: 'Early access',
    surfaces: ['hero', 'ads', 'social', 'store'],
  },
  {
    id: 'kktc-first',
    tr: 'KKTC kliniklerine odaklı',
    en: 'Built for Northern Cyprus clinics',
    surfaces: ['hero', 'ads', 'social', 'store'],
  },
  {
    id: 'no-fake-certs',
    tr: 'Kanıtsız sertifika iddiası yok',
    en: 'No unverified certificate claims',
    surfaces: ['social'],
  },
]

/** Never use these as present-tense product claims without legal/proof review */
export const FORBIDDEN_CLAIM_PATTERNS = [
  /KVKK\s*uyumlu/i,
  /KVKK\s*uyumu/i,
  /GDPR\s*compliant/i,
  /ISO\s*\d+/i,
  /HIPAA/i,
  /%99\.9\s*uptime/i,
  /yapay\s*zeka/i,
  /\bAI[- ]?(powered|driven)\b/i,
  /sertifikalı\s*güvenlik/i,
  /certified\s*secure/i,
  /** Stage honesty — aspiration ≠ present tense market position */
  /ilk\s+tercih\s+ettiğ/i,
  /en\s+çok\s+tercih\s+edilen/i,
  /piyasa\s+lideri/i,
  /market\s+leader/i,
  /KKTC['']?(nin|de)\s+(en\s+iyi|#\s?1)/i,
  /leading\s+clinic\s+(saas|platform|software)/i,
] as const

/**
 * Aspiration may appear only when framed as target/goal (e.g. Hakkımızda vizyon).
 * Present-tense leadership claims are forbidden until proof exists.
 */
export const STAGE_HONESTY = {
  productStage: 'early-access' as const,
  approvedPresent: ['Erken erişim', 'KKTC kliniklerine odaklı', 'Kanıt yoksa iddia etme'],
  aspirationOkWhen: 'Hedefimiz / vizyon / yol haritası — never as current ranking',
} as const

export function getClaim(id: string, lang: 'tr' | 'en' = 'tr'): string {
  const claim = APPROVED_CLAIMS.find((c) => c.id === id)
  if (!claim) throw new Error(`Unknown brand claim: ${id}`)
  return claim[lang]
}

/** Returns true if copy looks like a forbidden overclaim */
export function looksLikeForbiddenClaim(text: string): boolean {
  return FORBIDDEN_CLAIM_PATTERNS.some((re) => re.test(text))
}

/** True when “ilk tercih” style language is used as present achievement */
export function looksLikeStageOverclaim(text: string): boolean {
  if (/hedefimiz|vizyon\s*\(|yol\s*haritası|olmak\s+istiyoruz/i.test(text) && /tercih/i.test(text)) {
    // Soft-allow aspiration framing that still mentions preference as a goal
    if (!/ilk\s+tercih\s+ettiğ/i.test(text) && !/piyasa\s+lideri/i.test(text)) {
      return false
    }
  }
  return (
    /ilk\s+tercih\s+ettiğ/i.test(text) ||
    /en\s+çok\s+tercih\s+edilen/i.test(text) ||
    /piyasa\s+lideri/i.test(text) ||
    /market\s+leader/i.test(text)
  )
}
