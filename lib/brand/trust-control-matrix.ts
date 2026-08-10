/**
 * Trust Center control matrix — public claims must map to code + tests.
 * Posture rules:
 * - active: code + automated tests present; safe as present-tense control
 * - partial: code exists but coverage/ops gap — honest, non-absolute wording
 * - planned: missing proof gate — label as “planlanan kontrol”, never absolute
 */

export type TrustControlPosture = 'active' | 'partial' | 'planned'

export type TrustControlRow = {
  id: string
  /** Public claim shown on /guven */
  publicClaim: string
  /** Concrete code control */
  codeControl: string
  /** Automated test / smoke */
  automatedTest: string
  /** Last verification date (ISO calendar day, Europe/Nicosia ops) */
  lastVerified: string
  owner: 'Security' | 'Backend' | 'Platform' | 'Privacy'
  posture: TrustControlPosture
  /** Customer-facing detail under the claim */
  publicDetail: string
  /** Key implementation paths (internal) */
  codePaths: string[]
  testPaths: string[]
}

export const TRUST_CONTROL_POSTURE_LABEL: Record<
  TrustControlPosture,
  { tr: string; tone: 'emerald' | 'amber' | 'slate' }
> = {
  active: { tr: 'Aktif kontrol', tone: 'emerald' },
  partial: { tr: 'Kısmi kontrol', tone: 'amber' },
  planned: { tr: 'Planlanan kontrol', tone: 'slate' },
}

/**
 * Matrix last reviewed 2026-08-10 against tenant-guard, RBAC, proxy session,
 * audit writer, and governance erasure implementation.
 */
export const TRUST_CONTROL_MATRIX: TrustControlRow[] = [
  {
    id: 'tenant-isolation',
    publicClaim: 'İşletme bazlı veri ayrımı',
    codeControl: 'Tenant guard + Prisma GUC + FORCE RLS (asistan_app)',
    automatedTest: 'tenant-guard / tenant-write-scope / smoke:cross-tenant',
    lastVerified: '2026-08-10',
    owner: 'Security',
    posture: 'active',
    publicDetail:
      'Hasta ve klinik kayıtları işletme kapsamında ayrılır. Uygulama katmanı tenant guard; veritabanında RLS ile desteklenir.',
    codePaths: [
      'lib/security/tenant-guard.ts',
      'lib/security/assert-tenant.ts',
      'lib/security/tenant-db-context.ts',
    ],
    testPaths: [
      'tests/unit/tenant-guard.test.ts',
      'tests/unit/tenant-write-scope.test.ts',
      'tests/unit/rls-policy-inventory.test.ts',
    ],
  },
  {
    id: 'rbac',
    publicClaim: 'Rol bazlı erişim',
    codeControl: 'RBAC allow-list + requirePermission / page gates',
    automatedTest: 'rbac.test.ts; SUPER_ADMIN atama engeli (team actions)',
    lastVerified: '2026-08-10',
    owner: 'Backend',
    posture: 'active',
    publicDetail:
      'Hekim, sekreter ve sahip rolleri izin matrisine göre ayrılır. Dashboard sayfaları sunucu tarafı yetki kontrolü ister.',
    codePaths: ['lib/rbac.ts', 'lib/session.ts', 'lib/actions/team.ts'],
    testPaths: ['tests/unit/rbac.test.ts'],
  },
  {
    id: 'server-session',
    publicClaim: 'Server-side oturum koruması',
    codeControl: 'proxy.ts dashboard getUser + requireSession fail-closed (prod)',
    automatedTest: 'e2e auth-and-client; cron/webhook fail-open kapanmış',
    lastVerified: '2026-08-10',
    owner: 'Security',
    posture: 'active',
    publicDetail:
      'Kimlik doğrulama Supabase Auth üzerinden yürütülür. Dashboard erişimi sunucu tarafı oturum kontrolü ile korunur.',
    codePaths: ['proxy.ts', 'lib/session.ts'],
    testPaths: ['tests/e2e/auth-and-client.spec.ts', 'tests/unit/cron-auth.test.ts'],
  },
  {
    id: 'audit-log',
    publicClaim: 'Hassas işlemlerde denetim günlüğü',
    codeControl: 'writeAuditLog event writer (hassas aksiyon call-sites)',
    automatedTest: 'Kısmi — yazıcı için dedicated coverage henüz yok',
    lastVerified: '2026-08-10',
    owner: 'Platform',
    posture: 'partial',
    publicDetail:
      'Hassas aksiyonlar (hasta, randevu, yetki, ayar) ürün içi denetim günlüğüne yazılır. Kayıt dayanıklılığı için otomatik coverage genişletmesi planlanır.',
    codePaths: ['lib/audit.ts', 'app/dashboard/denetim/page.tsx'],
    testPaths: [],
  },
  {
    id: 'erasure',
    publicClaim: 'Silme taleplerinde anonimleştirme',
    codeControl: 'Governance DataDeletionRequest workflow',
    automatedTest: 'Eksik — erasure integration test yok',
    lastVerified: '2026-08-10',
    owner: 'Privacy',
    posture: 'planned',
    publicDetail:
      'KVKK silme talepleri yönetişim kuyruğunda alınır. Tam alan anonimleştirme ve otomatik test kapanışı tamamlanana kadar bu kontrol planlanan aşamadadır.',
    codePaths: ['lib/actions/governance.ts', 'app/dashboard/yonetisim/governance-board.tsx'],
    testPaths: [],
  },
]

export function listActiveTrustControls() {
  return TRUST_CONTROL_MATRIX.filter((row) => row.posture === 'active')
}

export function listPlannedTrustControls() {
  return TRUST_CONTROL_MATRIX.filter((row) => row.posture === 'planned')
}

/** Serialize public-safe view (no internal file paths) for UI. */
export function getPublicTrustControlMatrix() {
  return TRUST_CONTROL_MATRIX.map((row) => ({
    id: row.id,
    publicClaim: row.publicClaim,
    codeControl: row.codeControl,
    automatedTest: row.automatedTest,
    lastVerified: row.lastVerified,
    owner: row.owner,
    posture: row.posture,
    postureLabel: TRUST_CONTROL_POSTURE_LABEL[row.posture].tr,
    publicDetail: row.publicDetail,
  }))
}
