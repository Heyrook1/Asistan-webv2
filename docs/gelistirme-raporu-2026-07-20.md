# Geliştirme Raporu — 20.07.2026

**Proje:** Asistan ekosistemi (Asistan Health klinik paneli + Asistan Rezervasyon hasta uygulaması + Süper Admin)
**Kapsam:** 10M$ tohum yatırım due-diligence denetiminde önceliklendirilen bulguların (P0 güvenlik + P1) kod düzeyinde giderilmesi; aynı gün **S2 Prisma + RLS defense-in-depth** dilimleri (A/B/C) tamamlandı.
**Ortam:** Next.js 16 + Prisma 5 + Supabase, Windows / pnpm 11 / PowerShell.

---

## Yönetici özeti

- P0 güvenlik bulgularının **kısa PR’ları** (S1, S3, S4, S5, S6/S9) kod düzeyinde giderildi.
- **S2 (Prisma bypass RLS)** aynı gün üç dilimde uygulandı: PHI write scope (app-layer) + Person/bypass envanteri + `asistan_app` GUC/FORCE RLS migrasyonu. Diligence “tek katman authz” eleştirisi kapatıldı; prod’da `DATABASE_URL`’in `asistan_app` rolüne çevrilmesi **ops adımı** olarak kaldı.
- P1 bulguların tamamı ele alındı (S7, S8, Q1/D2, X5, X6); büyük ölçüde başarılı, birkaç madde bilinçli olarak **kısmen** işaretlendi (harici kimlik/entegrasyon gerektiren kısımlar).
- Şema değişiklikleri **eklemeli (additive)** yapıldı: `DemoBooking`, `NewsletterSubscriber`, `ProcessedWebhookEvent` modelleri + marketing/webhook migrasyonu + `20260720000200_prisma_guc_rls.sql` (roller/policy). Hiçbir yıkıcı (destructive) değişiklik yok.
- Doğrulama: **`pnpm test` → 43 dosya / 191 test PASS** (S2 sonrası). `pnpm check:action-validation` → OK. `pnpm lint` yalnızca **önceden var olan** hatalarla kırmızı (mobil/scripts/legacy).
- Ekosistem kuralına (`.cursor/rules/asistan-ecosystem.mdc`) uyuldu: hastane/e-reçete/telehealth/LIS şimdiki-zaman iddiası yok, yeni marka adı yok, guest booking akışı korundu.

---

## Özet tablo

| Step | Başlık | Durum | Yapılan değişiklik (dosyalar) | Not / Sebep |
|------|--------|-------|-------------------------------|-------------|
| 1 (S1) | Tenant sahibi SUPER_ADMIN atayabiliyor + `isSystemAdmin` fail-open | **Başarılı** | `lib/actions/team.ts`, `lib/session.ts` | SUPER_ADMIN artık hiçbir ekip aksiyonuyla atanamaz; prod'da allowlist boşsa `isSystemAdmin` false döner. |
| 2 (S3) | Dashboard edge auth env yokken fail-open | **Başarılı** | `proxy.ts` | Prod'da Supabase env yoksa `/dashboard` login'e yönlendirilir; dev davranışı korundu. |
| 3 (S6/S9) | Kimliksiz uçlarda `CREATE TABLE` (DDL) + XSS + rate limit | **Başarılı** | `app/api/demo-booking/route.ts`, `app/api/waitlist/route.ts`, `app/api/newsletter/route.ts`, `lib/html-escape.ts` (yeni), `prisma/schema.prisma`, `supabase/migrations/20260720000100_marketing_and_webhook_idempotency.sql` (yeni) | DDL kaldırıldı; Prisma modeli + eklemeli migrasyon; rate limit; e-posta HTML'inde kullanıcı girdisi escape edildi. |
| 4 (S4) | Person auto-link tek zayıf sinyalde birleşiyor (PHI merge riski) | **Başarılı** | `lib/identity/normalize.ts`, `tests/unit/identity-normalize.test.ts` | Yalnız telefon / yalnız e-posta artık auto-link yapmaz; kimlik hash'i **veya** çift güçlü sinyal gerekir. Yeni kişi için resolve-or-create korundu. |
| 5 (S5) | Booking idempotency TOCTOU çift-randevu | **Başarılı** | `lib/public-booking/idempotency.ts`, `lib/public-booking/create-guest-booking.ts`, `app/api/public/bookings/route.ts`, `tests/unit/booking-idempotency.test.ts` | Idempotency talebi artık booking transaction'ı **içinde** (unique-constrained) alınıyor; eşzamanlı aynı anahtar ikinci randevu oluşturamaz. Slot FOR UPDATE kilidi korundu. |
| 6 (S7) | Client auth e-posta doğrulaması + e-posta bazlı hesap ele geçirme | **Başarılı** | `lib/client-marketplace/auth.ts` | Onaylı kimlik (email/telefon confirm) zorunlu; e-posta ile eşleşen ClientUser yalnızca **sahipsiz** (authUserId null) satırlarda benimseniyor. |
| 7 (S8) | Rate limit Upstash yokken prod'da sessizce etkisiz | **Başarılı** | `lib/security/rate-limit.ts` | Prod'da Upstash env yoksa yapılandırma hatası fırlatılır (fail-closed); dev bellek fallback korundu. |
| 8 (Q1/D2) | Stripe webhook idempotency + `protocolNo` COUNT+1 yarışı | **Başarılı** | `app/api/webhooks/stripe/route.ts`, `lib/actions/prescriptions.ts`, `prisma/schema.prisma`, `supabase/migrations/20260720000100_...sql` | `ProcessedWebhookEvent` (unique provider+eventId) ile çift işleme engellendi; protokol no üretimi P2002'de yeniden deneniyor (unique kısıt zaten mevcut). |
| 9 (X5) | Donmuş özellikleri satan pazarlama metni + marka ihlali | **Başarılı** | `components/sections/HeroCoverFlow.tsx` | "ASİSTAN SAĞLIK EKOSİSTEMİ" eyebrow ve "Analiz ve Raporlar" / "Canlı Ekosistem" iddiaları claim-bank ile hizalandı. |
| 10 (X6) | CI pnpm sürüm kayması (9 vs 11) | **Başarılı** | `.github/workflows/ci.yml` | Tüm `pnpm/action-setup` adımları `version: 11`'e çekildi (package.json `packageManager` ile uyumlu). |
| 11 (S2) | Prisma RLS bypass + id-only PHI write (defense-in-depth) | **Başarılı** (ops: rol switch) | Dilim A/B/C — aşağıda | App tenant-guard enforce-uyumlu write; Person link scoped; `asistan_app` + GUC migrasyonu. Prod `DATABASE_URL` → `asistan_app` **ops**. |

> Kısaca:
> - 1–10 numaralı step’ler (sabah güvenlik + P1 pass) başarılı.
> - 11 numaralı step (S2 defense-in-depth) aynı gün tamamlandı; DB rolünün runtime’da bağlanması staging/ops checklist’inde.

---

## Pass 3 — Residual kapanış (aynı gün, gece)

| Madde | Durum | Çıktı |
|-------|-------|-------|
| S2 ops tooling | **Başarılı** (rol switch ops) | `scripts/smoke-asistan-app-rls.ts`, `pnpm smoke:asistan-app-rls`, `check:production` role checks |
| withTenantDb yayılım | **Başarılı** | `tenantTransaction` — patients/appointments/prescriptions/team/messages/intake/patient-import |
| S4 merge UI | **Başarılı** | `shouldSuggestPersonMatch` + queue + `/dashboard/kimlik-eslesmeleri` |
| D1 migrate authority | **Başarılı** | `docs/migration-authority.md`, `pnpm check:schema-drift` |
| D2 protocolNo | **Başarılı** | `pg_advisory_xact_lock` inside prescription tx |
| X6 e2e gate | **Başarılı** | `ci-gate needs: [lint, test, build, e2e]` |
| PR-12 funnel | **Başarılı** | `lib/observability/funnel.ts` → book / reminder / deposit_paid events |

---

## Detaylar

### 1 (S1) — SUPER_ADMIN atama ve `isSystemAdmin`
- `lib/actions/team.ts` › `createTeamMember` ve `updateTeamMember`: `SUPER_ADMIN` artık **hiçbir** kullanıcı için ekip aksiyonuyla atanamaz (platform rolü). `ISLETME_SAHIBI` yalnızca işletme sahibi tarafından atanabilir kuralı korundu.
- `lib/session.ts` › `isSystemAdmin`: allowlist boşsa **production'da `false`** döner (SUPER_ADMIN rolüne güvenerek fail-open olmaz). Dev/test davranışı korundu.
- Test: mevcut `tests/unit/rbac.test.ts` geçiyor. Aksiyon katmanı için ayrı bir birim test **eklenmedi** (requirePermission/prisma/supabase ağır mock gerektiriyor); değişiklik saf reddetme mantığı olduğundan düşük riskli.

### 2 (S3) — Dashboard edge auth fail-closed
- `proxy.ts`: `NEXT_PUBLIC_SUPABASE_URL/KEY` eksikken, önceden `/dashboard` doğrulaması tamamen atlanıyordu (fail-open). Artık **production'da** env eksikse login'e yönlendirilir. Lokal geliştirmede (NODE_ENV != production) davranış eskisi gibi.

### 3 (S6/S9) — DDL kaldırma + rate limit + XSS
- Üç uçtaki `$executeRawUnsafe(CREATE TABLE ...)` çağrıları kaldırıldı.
- `DemoBooking` ve `NewsletterSubscriber` Prisma modelleri eklendi; `Waitlist` modeli zaten mevcuttu. Ekleme artık `prisma.<model>.create/upsert` ile yapılıyor.
- Eklemeli migrasyon: `supabase/migrations/20260720000100_marketing_and_webhook_idempotency.sql` (`CREATE TABLE IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS`).
- `demo-booking` ucuna public rate limit eklendi (`lib/rate-limit` + `RATE_LIMITS.public`).
- Yeni `lib/html-escape.ts` ile e-posta HTML gövdelerinde kullanıcı girdisi (isim, klinik, tarih, saat, e-posta) escape edildi; `mailto` bağlantısı `encodeURIComponent` ile üretiliyor.

### 4 (S4) — Kimlik auto-link sıkılaştırma
- `shouldAutoLinkPerson`: yalnız telefon veya yalnız e-posta gibi **tek zayıf sinyalde** sessiz birleştirme yapılmaz. Auto-link için `identityHash` eşleşmesi **veya** en az iki güçlü sinyal gerekir. Aksi halde yeni Person oluşturulur (resolve-or-create korunur; yanlış klinikler-arası PHI birleştirmesi engellenir).
- Test: `tests/unit/identity-normalize.test.ts` güncellendi (telefon-only ve e-posta-only artık auto-link **etmiyor**; identityHash-only ve telefon+e-posta auto-link **ediyor**).
- Not: Zayıf sinyalde "öneri/kuyruk" (suggest/queue) UI'si bu pass'te kapsam dışıdır; davranış güvenli tarafta (birleştirme yerine yeni kayıt) bırakıldı.

### 5 (S5) — Booking idempotency TOCTOU
- Önceden: idempotency satırı randevu **oluşturulduktan sonra** yazılıyordu → eşzamanlı iki istek iki randevu oluşturabiliyordu.
- Şimdi: `claimIdempotentBookingResponseTx` transaction'ın **son adımı** olarak unique `keyHash` satırını yazar; kaybeden istek P2002 alır, tüm transaction (randevu dahil) geri alınır ve kazananın yanıtı replay edilir. Slot `FOR UPDATE` kilidi korundu.
- Test: `tests/unit/booking-idempotency.test.ts` genişletildi (claim'in hash yazması, P2002 → `IdempotencyConflictError`, diğer hataların aynen fırlatılması).

### 6 (S7) — Client auth doğrulaması
- `requireClientAuth`: onaylı kimlik (`email_confirmed_at` ya da `phone_confirmed_at`) yoksa oturum reddedilir (klinik personeli kuralıyla uyumlu).
- E-posta bazlı ele geçirme: e-posta ile eşleşen `ClientUser` yalnızca `authUserId = null` (sahipsiz) satırlarda benimsenir; başka bir auth kullanıcısına bağlı satır asla yeniden yönlendirilmez.

### 7 (S8) — Rate limit fail-closed
- `consumeRateLimit`: production'da Upstash yapılandırılmamışsa etkisiz bellek limiter'ına düşmek yerine açık bir yapılandırma hatası fırlatır. Dev fallback korundu.

### 8 (Q1/D2) — Webhook idempotency + protocolNo yarışı
- `ProcessedWebhookEvent` modeli (unique `[provider, eventId]`) eklendi. Stripe webhook, iş yapmadan önce event id'yi "claim" eder; kopya teslimatlarda `{ received:true, duplicate:true }` döner. İşleme hatasında claim geri alınır (Stripe retry çalışabilsin).
- `createPrescription`: `protocolNo` COUNT+1 türetildiği için eşzamanlı üretim `@@unique([businessId, protocolNo])` kısıtında çakışabiliyordu. Artık P2002'de taze numarayla yeniden denenir (en çok 5 deneme). Unique kısıt şemada zaten mevcut.

### 9 (X5) — Pazarlama metni temizliği
- `components/sections/HeroCoverFlow.tsx`:
  - Eyebrow "ASİSTAN SAĞLIK EKOSİSTEMİ / ASISTAN HEALTH ECOSYSTEM" → "KLİNİK PANELİ + HASTA RANDEVUSU" (masterbrand'de `Asistan Health Ecosystem` yasaklı alias).
  - "Analiz ve Raporlar" kartı → "Genel Bakış Özeti" (donmuş analitik yerine `clinic-analytics-deprecation.md` ile uyumlu, gerçekten shipping olan genel bakış sayıları).
  - "Canlı Ekosistem" rozeti → "Mobil ve Web" (erken-erişim dürüstlüğü).
- Marka/claim testleri (`masterbrand.test.ts`, `claim-bank.test.ts`) geçmeye devam ediyor.

### 10 (X6) — CI pnpm sürümü
- `.github/workflows/ci.yml` içindeki tüm `pnpm/action-setup` adımları `version: 9` → `version: 11` (package.json `packageManager: pnpm@11.x` ile hizalı).
- Not: e2e'nin `ci-gate needs`'e eklenmesi (opsiyonel) **yapılmadı** — CI'yı kırılgan hale getirmemek için bilinçli tercih.

### 11 (S2) — Prisma + RLS defense-in-depth

Prisma `DATABASE_URL` ile privileged role kullandığı için Postgres RLS’i **bypass** ederdi; app kapısı (`applyTenantGuard`) vardı ama birçok PHI mutation check-then **id-only** `update`/`findUnique` yapıyordu (guard `enforce` ile uyumsuz).

#### Dilim A — PHI write scope
- Pattern: `update({ where: { id } })` → `updateMany({ where: { id, businessId } })` (+ `count === 0` → not-found); fan-out `findFirst` scoped.
- Dosyalar: `lib/actions/appointments.ts`, `lib/actions/patients.ts`, `lib/client-marketplace/appointment-lifecycle.ts` (`clientUserId` alternate scope), `lib/public-booking/create-guest-booking.ts`, `lib/client-marketplace/bookings.ts`, `lib/actions/prescriptions.ts`.
- Yeni: `lib/security/assert-tenant.ts` (`assertSameTenant` / `isSameTenant`).
- Test: `tests/unit/assert-tenant.test.ts`, `tests/unit/tenant-write-scope.test.ts` (id-only reddi + cross-tenant where sözleşmesi).

#### Dilim B — Person + bypass envanteri
- `linkPatientToPerson(tx, patientId, personId, businessId)` → tenant-scoped `updateMany`.
- `resolveOrCreatePerson` → `runWithTenantBypassAsync('identity:resolve', …)`.
- Super-admin / sistem-admin platform metrikleri → `runWithTenantBypassAsync('super-admin:platform-metrics', …)`.
- Bypass call-site tablosu: `docs/security-ops.md` (calendar, reminders, discovery, identity, super-admin).

#### Dilim C — DB ikinci kapı
- Migrasyon: `supabase/migrations/20260720000200_prisma_guc_rls.sql`
  - Roller: `asistan_app` (NOBYPASSRLS, klinik runtime), `asistan_identity` (Person/GPI).
  - PHI tablolarda `FORCE ROW LEVEL SECURITY` + `"businessId" = current_setting('app.business_id')` policy.
  - Person / PersonIdentityMatch / BookingIdempotency: `asistan_app` deny; `asistan_identity` allow.
- `lib/security/tenant-db-context.ts`: `withTenantDb` / `setTenantBusinessId` / `clearTenantBusinessId`.
- Appointment status/reschedule + patient update tx’lerinde `setTenantBusinessId` bağlandı (referans pattern).
- Env: `DATABASE_URL_MIGRATE` → `env.databaseUrlMigrate` (`lib/env.ts`).
- Dokümantasyon + staging smoke SQL: `docs/security-ops.md`.

#### S2 ops (kod dışı, checklist)
1. Migrasyonu staging’e uygula; `ALTER ROLE asistan_app PASSWORD …` / `asistan_identity`.
2. Runtime `DATABASE_URL` → `asistan_app`; migrate/identity → owner veya `DATABASE_URL_MIGRATE`.
3. Smoke: GUC yokken PHI `count = 0`; yanlış `businessId` → 0 satır.
4. Rollback: `DATABASE_URL` tekrar owner.

---

## Analiz-ağırlıklı denetim maddeleri (kod dışı)

Aşağıdaki maddeler kod uygulaması değil, denetim raporunun strateji/analiz çıktılarıdır ve bu geliştirme pass'inde kod değişikliği içermez:

| Step | Başlık | Durum |
|------|--------|-------|
| 12 | Rakip analizi (competitor research) | analiz tamamlandı (rapor teslim edildi) |
| 13 | Marka / masterbrand konumlandırma | analiz tamamlandı (rapor teslim edildi) |
| 14 | Pazar boşluğu (market gap) | analiz tamamlandı (rapor teslim edildi) |
| 15 | Yol haritası (roadmap) | analiz tamamlandı (rapor teslim edildi) |
| 16 | Acı gerçekler (brutal truth) | analiz tamamlandı (rapor teslim edildi) |
| 17 | "İmkânsız ürün" tartışması | analiz tamamlandı (rapor teslim edildi) |
| 21–24 | Ek strateji/analiz maddeleri | analiz tamamlandı (rapor teslim edildi) |

> Not: Bu satırlar kullanıcının talebi doğrultusunda denetimin analiz çıktıları olarak işaretlenmiştir; bu pass'te bunlara ilişkin **kod** değişikliği yapılmamıştır.

---

## Bilinçli olarak kapsam dışı / kısmi bırakılanlar (dürüstlük notu)

- **Canlı SMS / WhatsApp sağlayıcısı:** adapter hazır; provider credentials + env bağlama hâlâ **ops/ürün** (bu residual pass’te yok).
- **Hasta depozito MVP (uçtan uca PaymentIntent):** funnel event’leri eklendi (`deposit_paid` membership webhook’ta); public book deposit akışı ayrı sprint.
- **S2 runtime `DATABASE_URL` → `asistan_app`:** **uygulandı** (`.env.local` / `.env`). Smoke: `pnpm smoke:asistan-app-rls` PASS. Owner migrate: `DATABASE_URL_MIGRATE` / `DIRECT_URL`. Bridge: `20260721000100` + `SET LOCAL ROLE asistan_identity` Person path.
- ~~S4 merge öneri UI~~ → **tamamlandı** (`/dashboard/kimlik-eslesmeleri`).
- ~~withTenantDb yayılım~~ → **tamamlandı** (`tenantTransaction` clinic action tx’lerde).
- ~~D1 migration authority~~ → **tamamlandı** (`docs/migration-authority.md` + `pnpm check:schema-drift`).
- ~~D2 protocolNo~~ → **tamamlandı** (`pg_advisory_xact_lock` tx içinde).
- ~~X6 e2e ci-gate~~ → **tamamlandı**.
- ~~PR-12 funnel~~ → **tamamlandı** (`trackFunnelEvent` / AuditLog `funnel.*`).

---

## Kontrol / Doğrulama

| Komut | Sonuç |
|-------|-------|
| `pnpm db:generate` | ✅ Başarılı — Prisma Client v5.22.0 (sabah pass modelleri dahil). |
| `pnpm test` (vitest) | ✅ **43 dosya / 191 test PASS**, 0 fail (S2 unit testleri dahil). |
| `pnpm check:action-validation` | ✅ OK — 20 server action dosyası doğrulandı. |
| `pnpm lint` (ESLint) | ⚠️ Önceden var olan hatalar (mobile/, scripts/, legacy). Bu çalışmada **yeni hata eklenmedi**. |
| `ReadLints` (düzenlenen dosyalar) | ✅ Düzenlenen dosyalarda lint/type hatası yok. |

**Lint dürüstlük notu:** `pnpm lint` bu çalışmadan **önce de** kırmızıydı (çoğunlukla `mobile/` ve `scripts/`). Odaklı/minimal değişiklik ilkesiyle kapsam dışı bırakıldı.

---

## Değiştirilen / eklenen dosyalar

### Pass 1 — P0/P1 güvenlik (sabah)

**Kod:**
- `lib/actions/team.ts`
- `lib/session.ts`
- `proxy.ts`
- `app/api/demo-booking/route.ts`
- `app/api/waitlist/route.ts`
- `app/api/newsletter/route.ts`
- `lib/html-escape.ts` *(yeni)*
- `lib/identity/normalize.ts`
- `lib/public-booking/idempotency.ts`
- `lib/public-booking/create-guest-booking.ts`
- `app/api/public/bookings/route.ts`
- `lib/client-marketplace/auth.ts`
- `lib/security/rate-limit.ts`
- `app/api/webhooks/stripe/route.ts`
- `lib/actions/prescriptions.ts`
- `components/sections/HeroCoverFlow.tsx`
- `.github/workflows/ci.yml`

**Şema / migrasyon:**
- `prisma/schema.prisma` (`DemoBooking`, `NewsletterSubscriber`, `ProcessedWebhookEvent`)
- `supabase/migrations/20260720000100_marketing_and_webhook_idempotency.sql` *(yeni)*

**Test:**
- `tests/unit/identity-normalize.test.ts`
- `tests/unit/booking-idempotency.test.ts`

### Pass 2 — S2 defense-in-depth (akşam)

**Kod:**
- `lib/actions/appointments.ts`
- `lib/actions/patients.ts`
- `lib/actions/prescriptions.ts`
- `lib/client-marketplace/appointment-lifecycle.ts`
- `lib/client-marketplace/bookings.ts`
- `lib/public-booking/create-guest-booking.ts`
- `lib/identity/resolve.ts`
- `lib/security/assert-tenant.ts` *(yeni)*
- `lib/security/tenant-db-context.ts` *(yeni)*
- `lib/security/rls-inventory.ts`
- `lib/env.ts`
- `app/dashboard/super-admin/page.tsx`
- `app/dashboard/sistem-admin/page.tsx`
- `docs/security-ops.md`

**Migrasyon:**
- `supabase/migrations/20260720000200_prisma_guc_rls.sql` *(yeni)*

**Test:**
- `tests/unit/assert-tenant.test.ts` *(yeni)*
- `tests/unit/tenant-write-scope.test.ts` *(yeni)*
- `tests/unit/tenant-db-context.test.ts` *(yeni)*

### Pass 3 — Residual kapanış

**Kod / scripts / CI / docs:**
- `lib/security/tenant-db-context.ts` (`tenantTransaction`)
- `lib/actions/{patients,appointments,prescriptions,team,messages,intake-forms,patient-import}.ts`
- `lib/identity/normalize.ts`, `lib/identity/resolve.ts`, `lib/actions/identity-matches.ts`
- `app/dashboard/kimlik-eslesmeleri/*`
- `components/dashboard/sidebar.tsx`, `mobile-shell.tsx`
- `lib/observability/funnel.ts`, `lib/notifications/patient-channels.ts`, `lib/public-booking/create-guest-booking.ts`, `app/api/webhooks/stripe/route.ts`
- `scripts/smoke-asistan-app-rls.ts`, `scripts/check-schema-drift.ts`, `scripts/verify-production-readiness.ts`
- `docs/migration-authority.md`, `docs/security-ops.md`
- `.github/workflows/ci.yml`, `package.json`
