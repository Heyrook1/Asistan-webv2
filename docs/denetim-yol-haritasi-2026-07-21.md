# Denetim Yol Haritası & Takip Panosu — Asistan Health / Rezervasyon

> Kaynak: Tam yığın denetimi + rekabet istihbaratı (21.07.2026).
> Bu dosya **canlı takip panosudur**. Bir madde bittiğinde `[ ]` → `[x]` yap, **Durum** ve **Tarih** sütununu güncelle.
> Kapsam: Asistan Health / Rezervasyon (tek Next.js 16 uygulaması). Marketin24 hariç (repoda yok).

**Durum etiketleri:** `pending` · `in_progress` · `done` · `blocked` · `wontfix`

---

## 0. İlerleme Özeti


| Kategori              | Toplam | Tamamlanan |
| --------------------- | ------ | ---------- |
| 🔴 Acil (0–6 hafta)   | 5      | 5          |
| 🟡 Q3 (6–12 hafta)    | 4      | 4          |
| 🟢 Q4 (3–6 ay)        | 3      | 3          |
| 💡 2026 Vizyon        | 3      | 0          |
| 🔧 Paylaşılan Altyapı | 5      | 5          |
| **İlk 10 Aksiyon**    | 10     | 10         |


> Bir madde bitince yukarıdaki "Tamamlanan" sayısını da elle artır.

---

## 🔴 ACİL (0–6 hafta) — düzelt yoksa kullanıcı kaybet

Skor = Etki × (6 − Efor).


| ✔   | ID  | Madde                                                                                                                | Etki | Efor | Skor | Durum | Tarih      | Not                                                                                           |
| --- | --- | -------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ---- | ----- | ---------- | --------------------------------------------------------------------------------------------- |
| [x] | A1  | Canlı SMS/WhatsApp sağlayıcı bağla (adapter hazır; env + fail-visible UI)                                            | 5    | 2    | 20   | done  | 2026-07-21 | Fail-visible toast + Ayarlar paneli; canlı ≥80% ops (webhook env)                             |
| [x] | A2  | Prod'da `asistan_app` doğrula + cross-tenant entegrasyon testi (S2'yi bitir)                                         | 5    | 2    | 20   | done  | 2026-07-21 | `pnpm smoke:asistan-app-rls` + `pnpm smoke:cross-tenant` 9/9 PASS                             |
| [x] | A3  | Public pazaryeri okumalarına rate-limit (`client/search`, `clinics/[id]`, `doctors/[id]`, `availability`, `reviews`) | 3    | 1    | 15   | done  | 2026-07-21 | 5 uç `checkRateLimit` + 429; limit `RATE_LIMITS.api` (100/dk/IP)                              |
| [x] | A4  | CSP `unsafe-inline`'ı kaldır → nonce-tabanlı (`next.config.mjs`)                                                     | 4    | 3    | 12   | done  | 2026-07-21 | Nonce+strict-dynamic: /dashboard, /book, /intake (proxy.ts); statik marketing lax (dokümante) |
| [x] | A5  | API hata şeklini standartlaştır + client appointment route'larında `id` doğrula                                      | 3    | 2    | 12   | done  | 2026-07-21 | `apiError`/`apiValidationError` + `parsePathId`; 7 unit + build PASS                          |


### Detaylı kabul kriterleri

- **A1** — Book/approve akışında kanal denemesi loglanıyor + UI "gönderildi / yapılandırılmadı / hata" gösteriyor; delivery % ≥ 80 (`[patient-channel]` loglarından). Booking soft-fail korunur.
- **A2** — `pnpm smoke:asistan-app-rls` prod'da PASS; clinic A token'ı clinic B `Appointment` UUID'sine 0 satır; CI'da entegrasyon testi.
- **A3** — 5 public GET ucu `checkRateLimit` ile sarılı.
- **A4** — Prod’da script nonce + `strict-dynamic` (`unsafe-inline` script’ten kalktı); style `unsafe-inline` bilinçli (React `style=""` / Radix — nonce attribute’ları kapsamaz); `tests/unit/response-security.test.ts` bunu kilitleyor.
- **A5** — Tüm API route'ları tek hata sözleşmesi (`ok/err`); `[id]` path param Zod ile doğrulanır.

---

## 🟡 Q3 (6–12 hafta) — rekabet boşluklarını kapat


| ✔   | ID  | Madde                                                                        | Etki | Efor | Skor | Durum | Tarih      | Not                                                        |
| --- | --- | ---------------------------------------------------------------------------- | ---- | ---- | ---- | ----- | ---------- | ---------------------------------------------------------- |
| [x] | Q1  | Bekleme listesi otomatik doldurma (`lib/ops/fill-the-gap.ts` prod + N+1 fix) | 4    | 2    | 16   | done  | 2026-07-21 | Batch slot scan + iptalde `slot_offer` (dönen hasta proxy) |
| [x] | Q2  | Dürüst analitik dirilişi (dondurmayı kaldır, overview raporu ship et)        | 3    | 2    | 12   | done  | 2026-07-21 | `clinicAnalytics` on; advanced opt-in; dönem iptal oranı   |
| [x] | Q3  | Hasta depozito / no-show ücreti MVP (iyzico/Stripe; funnel hazır)            | 5    | 4    | 10   | done  | 2026-07-21 | Ayarlar + public book + Stripe/manual; iyzico yok          |
| [x] | Q4  | e-Fatura / e-SMM (KKTC-uygun)                                                | 4    | 4    | 8    | done  | 2026-07-21 | Taslak+yazdır; KKTC API opsiyonel; TR GİB e-SMM yok        |


---

## 🟢 Q4 (3–6 ay) — farklılaştırma / moat


| ✔   | ID  | Madde                                                           | Etki | Efor | Skor | Durum | Tarih      | Not                                                   |
| --- | --- | --------------------------------------------------------------- | ---- | ---- | ---- | ----- | ---------- | ----------------------------------------------------- |
| [x] | D1  | AI ön-büro ajanı (mevcut slot motoru üzerinde WhatsApp booking) | 5    | 5    | 5    | done  | 2026-07-21 | Kural tabanlı WA asistan + slot + guest book; LLM yok |
| [x] | D2  | Hasta pasaportu (Person/GPI) hasta-yüzü                         | 4    | 4    | 8    | done  | 2026-07-21 | ClientUser↔Person; /client/health GPI+üyelik+ziyaret  |
| [x] | D3  | KKTC medikal-turizm concierge (TR/EN/RU)                        | 4    | 4    | 8    | done  | 2026-07-21 | /visit-cyprus lead+book; vize/otel yok                |


---

## 💡 2026 Vizyonu — platform bahisleri


| ✔   | ID  | Madde                                                          | Durum   | Tarih | Not                    |
| --- | --- | -------------------------------------------------------------- | ------- | ----- | ---------------------- |
| [ ] | V1  | Public API / white-label (KKTC klinik + lab)                   | pending |       |                        |
| [ ] | V2  | TR-anakara genişlemesi (E-Nabız/USS/MBYS entegrasyonuna bağlı) | pending |       | Gate: gov entegrasyonu |
| [ ] | V3  | Anonim outcome veri seti (sigortacı/kalite katmanı)            | pending |       |                        |


---

## 🔧 Paylaşılan Altyapı Kazançları


| ✔   | ID  | Madde                                                                                | Durum   | Tarih      | Not                                                               |
| --- | --- | ------------------------------------------------------------------------------------ | ------- | ---------- | ----------------------------------------------------------------- |
| [x] | I1  | React Query'i benimse ya da sil (bugün ölü bağımlılık)                               | done    | 2026-07-21 | **Silindi** — RSC/actions + fetch; `docs/react-query-decision.md` |
| [x] | I2  | Tanrı-board'ları böl (`team-board` 1018, `calendar-board` 780, `mesajlar-board` 768) | done    | 2026-07-21 | Orchestrator ~300; loading.tsx; `docs/god-board-split.md`         |
| [x] | I3  | Sentry sample ≤0.2 + PHI scrub; `@sentry/tracing@7` kaldır                           | done    | 2026-07-21 | Cap ≤0.2 + scrub; `@sentry/tracing` kaldırıldı; `docs/sentry-observability.md` |
| [x] | I4  | CI: Lighthouse/bundle bütçesi + cross-tenant entegrasyon testi                       | done    | 2026-07-21 | Bundle+LH floors; tenant job PR+push → ci-gate; `docs/ci-perf-tenant-gate.md` |
| [x] | I5  | Booking/kimlik-çözümleme tekrarını gider (create-guest-booking ↔ bookings)           | done    | 2026-07-21 | Shared clinic-patient + slot tx; `docs/booking-identity-dedupe.md` |


---

## ⭐ İlk 10 Aksiyon (Sıralı — bununla başla)


| ✔   | #   | Aksiyon                                                                  | İlgili ID | Durum   | Tarih      |
| --- | --- | ------------------------------------------------------------------------ | --------- | ------- | ---------- |
| [x] | 1   | Canlı SMS/WhatsApp sağlayıcı bağla (fail-visible teslim durumu)          | A1        | done    | 2026-07-21 |
| [x] | 2   | `asistan_app` prod runtime doğrula + cross-tenant IDOR entegrasyon testi | A2        | done    | 2026-07-21 |
| [x] | 3   | Tüm public pazaryeri okuma uçlarına rate-limit                           | A3        | done    | 2026-07-21 |
| [x] | 4   | CSP `unsafe-inline` kaldır (nonce)                                       | A4        | done    | 2026-07-21 |
| [x] | 5   | Hasta depozito / no-show ücreti MVP                                      | Q3        | done    | 2026-07-21 |
| [x] | 6   | Bekleme listesi otomatik doldurma + N+1 fix                              | Q1        | done    | 2026-07-21 |
| [x] | 7   | React Query: benimse ya da sil (A5 API hata şekli done)                  | I1 / A5   | done    | 2026-07-21 |
| [x] | 8   | Tanrı-board'ları böl + route-seviyesi loading/error                      | I2        | done    | 2026-07-21 |
| [x] | 9   | Analitiği dürüstçe dirilt + Sentry ayarı                                 | Q2 / I3   | done    | 2026-07-21 |
| [x] | 10  | WhatsApp AI ön-büro ajanı prototipi                                      | D1        | done    | 2026-07-21 |


---

## 📋 Denetim Bulguları (referans — takip için özet)

### Güçlü yönler (koru)

- Backend disiplini üst dilimde: strict TS, ~2 gerçek `any`, ~2 TODO, tutarlı `lib/`.
- 49 model, `businessId`-öncelikli indeksleme, tek migration otoritesi (Supabase SQL).
- Çok-kiracılılık defense-in-depth: tenant-guard + `asistan_app` GUC `FORCE RLS`.
- Person/GPI klinikler-arası kimlik = gerçek moat tohumu.
- 43 birim + 4 e2e test, CI'da gate'li.

### Zayıf yönler (yol haritası bunları hedefler)


| Alan               | Bulgu                                                                                        | İlgili ID |
| ------------------ | -------------------------------------------------------------------------------------------- | --------- |
| Bildirimler        | ~~SMS/WA yalnızca adapter, soft no-op~~ → A1 fail-visible UI done; canlı % ops               | A1        |
| Güvenlik           | ~~CSP `unsafe-inline`; public okumalar rate-limit'siz~~ → A3/A4 done                         | A4, A3    |
| API                | ~~Hata şekli parçalı; bazı `id`'ler şemasız~~ → A5 done                                      | A5        |
| Frontend           | %61 client, ~~700–1000 satır board~~ → I2 split (~300 orchestrator); ince loading eklendi    | I2 done   |
| DB                 | ~~Discovery/fill-the-gap/reminders N+1~~ → fill-the-gap + **discovery batch** (`docs/discovery-perf.md`); reminders cron still multi-tenant fan-out | Q1, discovery-perf |
| Monetizasyon       | ~~Depozito/no-show ücreti yapılmamış~~ → Q3 MVP (Stripe/manual)                              | Q3        |
| Fatura             | ~~e-Fatura yok~~ → Q4 KKTC taslak + opsiyonel API; TR GİB e-SMM yok                          | Q4        |
| Gözlemlenebilirlik | ~~Sentry PHI + `@sentry/tracing@7`~~ → I3 sample ≤0.2 + scrub; tracing dep kaldırıldı        | I3 done   |


### Rakip kıyas notları (Temmuz 2026)

- **DoktorTakvimi** ₺4.799–6.399/ay: 7/24 booking, çağrı merkezi, e-Fatura, Noa AI notları, waitlist auto-fill.
- **Doktorsitesi**: WhatsApp, 0850 çağrı hattı, USBS, e-Fatura, sanal POS.
- **Medicasimple / Self Klinik**: E-Nabız/USS/MBYS + e-Reçete (TR devlet entegrasyonu).
- **Jane App** $54–99/pratisyen: online booking + sigorta + AI Scribe (UX altın standardı).
- **Cliniko** $45–395: sınırsız lokasyon; zayıf raporlama.
- **TR temel gereksinim**: canlı SMS/WA, e-Fatura, gov entegrasyonu, AI notları (pazar buraya kaydı).
- **KKTC fırsatı**: TR devleri yerel raylara hizmet etmiyor; Excel+WhatsApp yerleşik.

---

## Değişiklik Günlüğü


| Tarih      | Kim | Değişiklik                                                                                                                                                                                                                                                              |
| ---------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-21 | —   | Pano oluşturuldu (ilk denetimden)                                                                                                                                                                                                                                       |
| 2026-07-21 | —   | A2 tamamlandı: `smoke:cross-tenant` script'i eklendi (2 kiracılı fixture, 9 IDOR probu), `smoke:asistan-app-rls` owner bağlantı düzeltmesi, tüm kontroller PASS                                                                                                         |
| 2026-07-21 | —   | A3 tamamlandı: 5 public okuma ucuna IP-bazlı rate-limit (100/dk, 429); CI'a secret-gated "Tenant isolation (S2 smoke)" job'ı eklendi                                                                                                                                    |
| 2026-07-21 | —   | A4 tamamlandı: /dashboard, /book, /intake prod'da nonce + strict-dynamic CSP (script unsafe-inline kalktı); style-src istisnası dokümante; build + 10 header testi PASS. Yan düzeltmeler: audit-action-validation `.ts` import, `@types/pg`                             |
| 2026-07-21 | —   | A5 tamamlandı: `apiError`/`apiValidationError` + `parsePathId` (1–64); client `[id]` cancel/reschedule/ics/clinics/doctors; ~24 route ad-hoc `{ error }` → sözleşme; `tests/unit/api-response.test.ts` 7/7 + `pnpm build` PASS                                          |
| 2026-07-21 | —   | A1 tamamlandı: kanal `status` (sent/not_configured/error); approve/cancel toast + Bildirim Merkezi; Ayarlar→Entegrasyonlar paneli; auto-confirm book fanout; soft-fail korunur; delivery % helper + `[patient-channel]` log. Canlı ≥80% webhook bağlandıktan sonra ops. |
| 2026-07-21 | —   | Q1 tamamlandı: `getOpenSlotClusters` batch (rules/appts/blocks + `availability-compute`); iptal/no-show → max 3 dönen hastaya `slot_offer` soft-fail; flag `ASISTAN_FLAG_FILL_THE_GAP`; unit testler PASS.                                                              |
| 2026-07-21 | —   | Q2 tamamlandı: `clinicAnalytics` default on (Operasyon raporu); `advancedAnalytics` opt-in; seçilen dönem iptal oranı; CSV/PDF; deprecation doc → revival.                                                                                                              |
| 2026-07-21 | —   | Q3 tamamlandı: `AppointmentDeposit` + Business depozito/no-show politikası; public book soft-fail intent; Stripe webhook `kind=appointment_deposit`; funnel deposit_*; `docs/appointment-deposit.md`. iyzico yok.                                                       |
| 2026-07-21 | —   | Q4 tamamlandı: `ClinicInvoice` + vergi profili; randevudan taslak; Faturalar yazdır/READY; opsiyonel `KKTC_EFATURA_*` Maliye POST; TR GİB e-SMM claim yasak; `docs/kktc-efatura.md`.                                                                                    |
| 2026-07-21 | —   | D1 tamamlandı: kural tabanlı WhatsApp ön-büro (`lib/front-desk` + `/api/webhooks/whatsapp`); gerçek `getAvailableSlots` + `createGuestPublicBooking`; klinik toggle; LLM/ses yok — “yapay zeka” claim yasak; `docs/whatsapp-front-desk.md`.                             |
| 2026-07-21 | —   | D2 tamamlandı: `ClientUser.personId` + GPI hasta yüzü (`/client/health` Asistan pasaportu); `GET /api/client/passport`; `app.person_id` RLS; FHIR/tıbbi pasaport claim yasak; `docs/patient-passport.md`.                                                               |
| 2026-07-21 | —   | D3 tamamlandı: `/visit-cyprus` TR/EN/RU concierge (lead `TourismLead` + book handoff); seyahat acentesi/vize/otel yok; `docs/medical-tourism-concierge.md`.                                                                                                             |
| 2026-07-21 | —   | I1 tamamlandı: React Query **silindi** (ölü provider + kullanılmayan hook’lar; hedef API yok); veri yolu RSC/actions + fetch; `docs/react-query-decision.md`.                                                                                                           |
| 2026-07-21 | —   | I2 tamamlandı: team/calendar/mesajlar board split (orchestrator ~300); route `loading.tsx`; `docs/god-board-split.md`.                                                                                                                                                  |
| 2026-07-22 | —   | Randevu UX cila: sticky CTA, 14 gün chip, slot empty/retry, başarı özeti, telefon blur/hint; deposit `client_secret` sızıntısı kalktı. SMS/WA: prod bind checklist + DEPLOYMENT env + panel ACK dürüstlüğü; §6.1 Geride güncellendi.                              |
| 2026-07-22 | —   | Matris Mobil+Onboarding: `#uygulama` + post-book InstallPrompt; kayıt → force QuickStartTour (localStorage handoff); video yoksa 3 adım metin; §6.1 güncellendi.                                                                                                      |
| 2026-07-22 | —   | Matris sprint: Why Asistan + € teaser + pasaport/Visit Cyprus; `/book/deposit`; PatientChannelAttempt + Ayarlar 24s delivery %; §6.1 matris güncellendi.                                                                                                            |
| 2026-07-22 | —   | RoleOpsHome Empty ✅: emptyActionHref (Ajanda/Takvim) — share/quick-start kapalıyken CTA’sız boşluk giderildi → 5/5.                                                                                                                                                  |
| 2026-07-22 | —   | AnalyticsBoard Empty ✅: dashed empty + Ajanda/Randevu/Hizmet/Takım CTA’ları (no-CTA → 5/5).                                                                                                                                                                            |
| 2026-07-22 | —   | HealthPanel/Passport: skeleton loading + inline error/retry (toast-only kaldırıldı); clinics empty CTA → state ~5/5. RegisterForm Empty zaten ✅.                                                                                                                      |
| 2026-07-22 | —   | RegisterForm Empty ✅: zorunlu * + inline boş alan/şart hataları; silent password return kaldırıldı → 5/5.                                                                                                                                                             |
| 2026-07-22 | —   | LoginForm Empty ✅: zorunlu * + inline boş alan hataları (submit/blur); focus ring güçlendirildi → state 5/5.                                                                                                                                                        |
| 2026-07-22 | —   | PublicBookingWidget empty services: dashed card + tel CTA (state table Empty ✅ → 5/5).                                                                                                                                                                               |
| 2026-07-22 | —   | Passport hotfix doğrulama notu: P2002 savepoint + ALS singleton; prod `GET /api/client/passport` Bearer → 200 checklist (`docs/patient-passport.md`). FloatingCTA `ssr:false` RSC hatası kaldırıldı (lokal smoke). |
| 2026-07-22 | —   | BUG-008: Login/Register e-posta doğrulama tuş tuş → onBlur (+ submit).                                                                                                                                                                                                |
| 2026-07-22 | —   | BUG-007: FloatingCTA thumb target `h-10` → `min-h-11` (≥44px).                                                                                                                                                                                                         |
| 2026-07-22 | —   | BUG-006: printable klinik Rx (`prescriptionUiCopy`); claim-bank + UI forbidden scan (E-reçete oluşturuldu yasak).                                                                                                                                                     |
| 2026-07-22 | —   | BUG-005: discovery slot batch (fill-the-gap) + pure core; 50 doktor p95 test; query budget = 4.                                                                                                                                                                         |
| 2026-07-22 | —   | BUG-004: public-booking-widget location `<select>` → `text-base md:text-sm` (iOS focus no-zoom); unit test.                                                                                                                                                            |
| 2026-07-22 | —   | BUG-003: auth şifre sayfaları TR diacritics (`Şifre sıfırlama`) + `passwordFlowCopy` snapshot testi.                                                                                                                                                                   |
| 2026-07-22 | —   | BUG-002: cron reminders/gcal fail-closed — her env’de `CRON_SECRET`; secretsiz 503 (Stripe ile aynı duruş); unit test.                                                                                                                                              |
| 2026-07-22 | —   | BUG-001: WA webhook slug↔token bağlama; raw bearer yetmez; imzasız 401 / yanlış slug 403; `lib/security/whatsapp-webhook-auth.ts`.                                                                                                                                    |
| 2026-07-22 | —   | God-board residual kapatıldı: calendar toolbar/filters/share + team dialogs/banner/deactivate split; `docs/god-board-split.md` + tech-debt board.                                                                                                                     |
| 2026-07-21 | —   | I3 tamamlandı: traces/replay hard-cap ≤0.2 (default 0.1); PHI scrub güçlendirildi; `@sentry/tracing` kaldırıldı; `docs/sentry-observability.md`. İlk 10 #9 kapandı.                                                                                                    |
| 2026-07-21 | —   | I4 tamamlandı: `check:bundle-budget` + Lighthouse floors (`/` `/guven`); cross-tenant smoke PR+push ve `ci-gate`'e eklendi; `docs/ci-perf-tenant-gate.md`.                                                                                                              |
| 2026-07-21 | —   | I5 tamamlandı: guest/client book → `resolveOrCreateClinicPatient` + `createSlotAppointmentTx`; telefon varyant eşlemesi; kanal-özel idempotency/deposit/clientNotification korundu; `docs/booking-identity-dedupe.md`.                                              |


