# Güven kontrol matrisi

Public `/guven` iddiaları code-level kanıt + otomatik test olmadan kesin dil kullanmaz.

Kaynak: [`lib/brand/trust-control-matrix.ts`](../lib/brand/trust-control-matrix.ts)  
Son gözden geçirme: **2026-08-10**

## Matris

| Public iddia | Kod kontrolü | Otomatik test | Son doğrulama | Owner | Posture |
|---|---|---|---|---|---|
| İşletme bazlı veri ayrımı | Tenant guard + Prisma GUC + FORCE RLS (`asistan_app`) | `tenant-guard` / `tenant-write-scope` / `smoke:cross-tenant` | 2026-08-10 | Security | **Aktif** |
| Rol bazlı erişim | RBAC allow-list + `requirePermission` | `rbac.test.ts` | 2026-08-10 | Backend | **Aktif** |
| Server-side oturum koruması | `proxy.ts` + `requireSession` fail-closed (prod) | e2e auth; cron fail-open kapanmış | 2026-08-10 | Security | **Aktif** |
| Hassas işlemlerde denetim günlüğü | `writeAuditLog` event writer | Dedicated coverage henüz yok | 2026-08-10 | Platform | **Kısmi** |
| Silme taleplerinde anonimleştirme | Governance `DataDeletionRequest` | Erasure integration test yok | 2026-08-10 | Privacy | **Planlanan** |

## Posture kuralları

- **Aktif:** kod + otomatik test var → şimdiki zaman kontrol dili OK.
- **Kısmi:** kod var, test/ops boşluğu var → abartısız dil; “garanti / kesintisiz” yok.
- **Planlanan:** kanıt kapısı kapalı → public’te **“Planlanan kontrol”** etiketi zorunlu; kesin “anonimleştirilir” yok.

## Bilinen residual riskler

| Risk (önceki denetim) | Durum |
|---|---|
| Prisma RLS bypass | Kodda tenant-guard + `asistan_app` GUC ile kapatıldı; prod `DATABASE_URL` rolü ops doğrulaması ister |
| owner → SUPER_ADMIN | `lib/actions/team.ts` `platformRoleAssignmentError`; `tests/unit/team-super-admin-gate.test.ts` |
| Auth fail-open | `proxy.ts` prod fail-closed; `isSystemAdmin` boş allowlist → false |
| Empty-slot double-book | `pg_advisory_xact_lock` + day-row `FOR UPDATE` in `create-slot-appointment.ts` |
| Paid-pilot gate | [`docs/p0.8-paid-pilot-security-gates.md`](./p0.8-paid-pilot-security-gates.md) · `pnpm verify:p0.8` |
| Audit write swallow | Bilinçli; marketing “kesintisiz kayıt” demez |
| Erasure incompleteness | `fullName` / notes / files tam scrub değil → planlanan |

## Promote to “Aktif”

1. Eksik testi ekle (audit coverage veya erasure integration).
2. `TRUST_CONTROL_MATRIX` satırında `posture` + `lastVerified` güncelle.
3. `/guven` otomatik etiketi güncellenir (UI matristen beslenir).
