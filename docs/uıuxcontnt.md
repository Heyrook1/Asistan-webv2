Canlı skor kartı ve aksiyon tabloları: [Master Audit canvas](C:\Users\ERSAN ALTUNcursor\projects\d-Asistan-webv2-main\canvases\master-audit-2026-07-22.canvas.tsx) (yan panelde açılabilir). Aşağıda komut formatının tam metni.

---

# MASTER AUDIT — Asistan Health / Rezervasyon — 22 Temmuz 2026

Kapsam: bu monorepo. **Marketin24 kodu yok** (önceki panoda da hariç). Simpratik için açık web ayak izi zayıf → TR proxy **DoktorTakvimi**.

---

## BÖLÜM 1 — GENEL SKOR KARTI

```
╔══════════════════════════════════════════════════════════╗
║  MASTER AUDIT SKOR KARTI — Asistan Health — 2026-07-22 ║
╠══════════════════════════════════════════════════════════╣
║  GENEL PUAN         :  64/100                            ║
╠══════════════════════════════════════════════════════════╣
║  Kod & Güvenlik     :  18/25   [███████░░░] 72%          ║
║  Bug Durumu         :  17/25   [███████░░░] 68%          ║
║  UI/UX Kalitesi     :  15/25   [██████░░░░] 60%          ║
║  İçerik & Marka     :  14/25   [█████░░░░░] 56%          ║
╠══════════════════════════════════════════════════════════╣
║  Bug                : 14 adet  (2 kritik, 5 major)       ║
║  UX Sorunu          : 16 adet  (3 blocker, 6 major)      ║
║  İçerik Sorunu      : 11 adet  (3 conversion kill)       ║
║  Rakip Avantajı     : 4 üstün / 5 geride (Health)        ║
╠══════════════════════════════════════════════════════════╣
║  GENEL DURUM: 🟡 Geliştirme                              ║
╚══════════════════════════════════════════════════════════╝
```

Yol haritasındaki A1–I5 “done” işaretleri altyapıyı yükseltti; **canlı copy ihlalleri + webhook/cron fail-open + hero conversion** skoru aşağı çekiyor.

---

## BÖLÜM 2 — KOD & GÜVENLİK

### 2.1 TypeScript


| Madde        | Bulgu                                                                |
| ------------ | -------------------------------------------------------------------- |
| Strict       | `strict: true` — iyi                                                 |
| Zayıflık     | `allowJs: true`, `skipLibCheck: true` — gürültüyü gizler             |
| `any`        | ~2 gerçek `as any` / `: any` (app+lib+components); sağlıklı          |
| Prisma akışı | Client → Zod/actions → Prisma → `apiSuccess` sözleşmesi (A5) tutarlı |


### 2.2 Güvenlik


| Kontrol               | Durum                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Korumasız / zayıf API | **WhatsApp** bearer, HMAC yok; **cron** fail-open (non-prod); `/api/health` public, RL yok                          |
| RLS bypass            | `asistan_identity` / tenant bypass bilinçli; smoke CI var — **iyi** ama service-role script’ler ops disiplini ister |
| NEXT_PUBLIC           | Anon + VAPID public — doğru; secret leak yok                                                                        |
| Zod                   | Public write’ların çoğu var; waitlist zayıf `includes('@')`                                                         |
| Multi-tenant          | tenant-guard + `businessId` / `clientUserId` — **güçlü**; ALS singleton hotfix sonrası marketplace spam azalmalı    |


**Korumasız / riskli route’lar (öncelik):**

1. `app/api/webhooks/whatsapp/route.ts`
2. `app/api/cron/appointment-reminders/route.ts`
3. `app/api/cron/google-calendar-sync/route.ts`
4. `app/api/health/route.ts`
5. Client mutation’lar (auth var, RL yok): bookings, cancel, reschedule, reviews POST

### 2.3 Performans

- Discovery slot tarama N+1 — dokümante açık borç
- ~161 `'use client'` / ~303 tsx-ts app+components — yüksek client yüzdesi; board split (I2) iyileştirdi
- Framer Motion landing’de bundle riski
- Route `loading.tsx` board’larda var; marketing Suspense seyrek

### 2.4 Teknik borç


| Borç                    | Dosya                    | Süre   | Görmezden gelme riski    |
| ----------------------- | ------------------------ | ------ | ------------------------ |
| WA HMAC + fail-open     | `webhooks/whatsapp`      | 0.5–1g | Booking abuse            |
| Cron fail-closed        | cron routes              | 2s     | Prod spam / maliyet      |
| E-reçete copy scrub     | prescriptions UI/actions | 2s     | Marka/regülasyon iddiası |
| Discovery N+1           | `discovery.ts`           | 1–2g   | Clinics latency          |
| Auth ASCII pages        | `app/auth/*`             | 2s     | Trust                    |
| Client mutation RL      | client API               | 0.5g   | Abuse                    |
| God-board residual      | calendar/team pieces     | 2–3g   | Bakım                    |
| Rate-limit waitlist Zod | `waitlist`               | 1s     | Lead spam                |


---

## BÖLÜM 3 — BUG ENVANTERİ

┌─ BUG-001 · Kritik · Güvenlik  
│ Dosya: `webhooks/whatsapp` | Tetikleyici: bearer + clinic slug | Etki: sahte randevu  
│ Bearer-only → Meta `X-Hub-Signature-256` + slug↔token bağlama; fail-open kaldır  
└─ Test: imzasız POST 401; yanlış slug 403  

┌─ BUG-002 · Kritik · Güvenlik  
│ Dosya: cron reminders / gcal | Tetikleyici: `CRON_SECRET` boş (non-prod) | Etki: yan etki / sync  
│ Fail-open → her env’de secret zorunlu (Stripe gibi fail-closed)  
└─ Test: secretsiz 503  

┌─ BUG-003 · Major · UX/i18n  
│ Dosya: `forgot/setup/reset-password` | Tetikleyici: sayfa açılışı | Etki: “amator platform”  
│ `Sifre Sifirlama` → `Şifre Sıfırlama`  
└─ Test: TR karakter snapshot  

┌─ BUG-004 · Major · Mobile  
│ Dosya: `public-booking-widget` `<select className="… text-sm">` | iOS zoom  
│ `text-base md:text-sm`  
└─ Test: iPhone focus no-zoom  

┌─ BUG-005 · Major · Perf  
│ Dosya: `lib/client-marketplace/discovery.ts` | Clinics filtre | Yavaş liste  
│ Slot batch (fill-the-gap modeli)  
└─ Test: 50 doktor p95  

┌─ BUG-006 · Major · Mantık/marka  
│ Dosya: `prescription-form-drawer` + `prescriptions.ts` | “E-recete olusturuldu”  
│ Printable clinic Rx dili  
└─ Test: claim-bank forbidden scan UI  

┌─ BUG-007 · Yellow · A11y  
│ Dosya: `FloatingCTA` `h-10` | Thumb miss  
└─ `min-h-11`  

┌─ BUG-008 · Yellow · Form  
│ Dosya: Login/Register email `useEffect` her tuş | Rahatsız  
└─ Validate on blur  

*(Passport unique P2002 + ALS — hotfix uygulandı; prod’da* `/api/client/passport` *200 doğrulanmalı.)*

---

## BÖLÜM 4 — UI/UX

### 4.1 State tablosu (kritik)


| Component            | Default | Hover/Focus | Loading | Error            | Empty      | Puan |
| -------------------- | ------- | ----------- | ------- | ---------------- | ---------- | ---- |
| PublicBookingWidget  | ✅       | ✅           | ✅       | ✅ (inline+toast) | ❌ services | 4/5  |
| LoginForm            | ✅       | ✅           | ✅       | ✅                | —          | 4/5  |
| RegisterForm         | ✅       | ✅           | ✅       | ✅                | —          | 4/5  |
| HealthPanel/Passport | ✅       | ✅           | ❌ bare  | 🟡 toast         | ✅ visits   | 3/5  |
| Analytics board      | ✅       | ✅           | ✅       | ✅                | ❌ no CTA   | 3/5  |
| Role ops home        | ✅       | ✅           | ✅       | —                | ❌ no CTA   | 3/5  |
| HeroCoverFlow        | ✅       | ✅           | —       | —                | —          | 2/5* |
| FloatingCTA          | ✅       | ✅           | —       | —                | —          | 2/5  |


Hero “state” değil conversion/composition skoru.

### 4.2–4.4 A11y / form / mobile

- Klavye: Radix sheet/dialog genelde OK; FloatingCTA ikon-only label mobile’da zayıf  
- Password toggle `h-9` <44px  
- Book slot chips `py-2.5 text-sm` — hedef <44px + zoom riski  
- Auth input ≥16px — düzeltildi; booking select kaçırılmış

┌─ UX-001 · Blocker · Nielsen H1 (görünürlük/marka)  
│ Ekran: Landing hero | H1 sonuç/marka yok | Fix: Asistan + 1 KKTC sonucu  
└─  

┌─ UX-002 · Blocker · Nielsen H8 (estetik/minimal)  
│ 3 CTA first viewport | Tek primary + risk azaltıcı  
└─  

┌─ UX-003 · Blocker · Mobile  
│ Book slots/select | ≥44px + text-base  
└─  

┌─ UX-004 · Major · Empty  
│ Analytics / ops home | CTA ekle (Ajanda / paylaş link)  
└─  

---

## BÖLÜM 5 — İÇERİK & MARKA

### 5.1 Değer önerisi

- ~~H1: *“Klinik operasyonlarında modern…”~~* → **COPY-002 / UX-001:** «Asistan ile KKTC kliniğinde randevuyu tek takvimde tutun»
- ~~Sub: özellik listesi~~ → fayda + differentiator: Person kimlik bağı, KKTC poliklinik, dürüst sınır (HIS / e-reçete / telehealth yok)
- Differentiator hero’da: **Person + KKTC + boundary** (`HeroCoverFlow`)

### 5.2 CTA skoru


| CTA Metni                                        | Fiil? | Sonuç?             | Risk azaltıcı?                  | Puan    |
| ------------------------------------------------ | ----- | ------------------ | ------------------------------- | ------- |
| 14 gün ücretsiz klinik dene                      | ✅     | ✅ (14 gün / panel) | ✅ (kredi kartı gerekmez satırı) | **3/3** |
| 3 adımda randevu talep et                        | ✅     | ✅                  | —                               | **3/3** |
| Klinik paneline gir                              | ✅     | ✅ (panel)          | —                               | **2/3** |
| ~~Kayıt Ol~~ → trial CTA                         | ✅     | ✅                  | ✅                               | **3/3** |
| ~~E-reçeteyi oluştur~~ → Klinik reçeteyi oluştur | ✅     | ✅ (yazdırılabilir) | dürüst sınır                    | **3/3** |


### 5.3–5.4 Mikrokopya / ton

- Claim-bank + passport disclaimer **iyi disiplin** — korundu
- ~~Auth ASCII / «Geçersiz e-posta formatı» / John Doe / «No-show:»~~ → **done**
  - `authFormCopy`: eylem yönelimli e-posta hatası + `Ayşe Yılmaz` / `ornek@klinik.com`
  - Public book + analytics + ayarlar: **Gelinmedi** (TR)
  - `passwordFlowCopy` + team action şifre mesajları: diacritics
- Siz/sen: genel “siz” — OK

┌─ COPY-001 · Conversion/Trust kill · Forbidden claim  
│ ~~E-receteyi olustur~~ → **done** (`prescriptionUiCopy` + «Klinik reçete profili»)  
└─  

┌─ COPY-002 · Conversion kill · Hero  
│ ~~Mevcut: "Klinik operasyonlarında modern…"~~ → **done**  
│ Canlı: "Asistan ile KKTC kliniğinde randevuyu tek takvimde tutun" + Person/KKTC/sınır sub  
└─  

┌─ COPY-003 · Trust · Auth  
│ ~~Sifre Sifirlama~~ → **done** (`passwordFlowCopy` + snapshot)  
└─  

┌─ COPY-004 · Trust · Placeholder  
│ ~~John Doe~~ → **Ayşe Yılmaz** / `ornek@klinik.com` (`authFormCopy`)  
└─  

---

## BÖLÜM 6 — REKABET

### 6.1 Asistan Health matrisi


| Alan          | Asistan                                      | Simpratik* | Jane                 | Cliniko         | Üstün              |
| ------------- | -------------------------------------------- | ---------- | -------------------- | --------------- | ------------------ |
| Randevu UX    | 3 adım + sticky CTA + day chips + başarı kartı + deposit | n/d | Online booking altın | Temiz takvim | Beraber / Asistan |

| Multi-klinik  | Person/GPI ekosistem                         | n/d        | Klinik odaklı        | Unlimited loc   | **Asistan**        |
| Hasta portalı | Client + passport (landing’de anlatılır)     | n/d        | Jane Clients         | Online booking  | Beraber            |
| SMS/WA        | Adapter + WA desk + 24s % + prod bind checklist | n/d     | SMS                  | SMS 10¢         | Beraber / ops      |

| Mobil         | PWA install (#uygulama + post-book + /client); Expo yol haritası | n/d        | Native               | Web güçlü       | Beraber / Jane     |
| e-Fatura      | KKTC taslak                                  | n/d        | Invoice/pay          | Invoice         | **TR rakipler**    |
| Raporlama     | Operasyon raporu (Q2)                        | n/d        | Reporting            | Zayıf rapor     | Beraber            |
| Onboarding    | Kayıt → force QuickStartTour (3 adım) + trial CTA | n/d   | Demo/sign-up         | 30g trial       | Beraber            |
| Fiyat         | Self-serve + hero € teaser                   | n/d        | $54–99               | $45–395         | **Asistan**        |
| Landing       | Hero OK; Neden Asistan + pasaport + Visit CY | n/d        | Çok güçlü            | Net fiyat       | Beraber / Asistan  |
| Marka güveni  | Dürüst sınırlar (hero + `/guven`)            | n/d        | HIPAA/PIPEDA dili    | Charity+support | **Asistan**        |
| KKTC fit      | Odak + `/visit-cyprus` body/footer           | —          | —                    | —               | **Asistan**        |


Simpratik: yeterli açık kaynak yok; TR gerçek rakip barı **DoktorTakvimi ₺4.799–6.399** (SMS, çağrı, e-Fatura, Sağlık.net paketleri).

### 6.2 Marketin24 matrisi


| Sonuç                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **N/A — bu repoda Marketin24 yok.** Ticimax: B2B bayi/fiyat/pazaryeri güçlü; IdeasSoft: ERP + giriş fiyatı; CS-Cart: self-host multi-vendor. Ayrı audit gerekir. |


### 6.3 Avantaj / dezavantaj

**Üstün:**

1. Person/GPI + klinik Patient ayrımı — moat tohumu; “pasaport honesty” ile anlat
2. KKTC outpatient SMB + claim-bank disiplini — regülasyon yalanı yok (e-reçete UI hariç)
3. Public book ≤3 adım + fill-the-gap + deposit MVP — ops derinlik
4. Tenant defense-in-depth + CI smoke — enterprise satışta kanıt

**Geride:**

1. Randevu UX — sticky CTA + day chips + başarı kartı + telefon hint kapatıldı; Jane native calendar hâlâ önde (bilinçli)
2. Canlı SMS/WA — kod + Ayarlar % + prod bind checklist hazır; **köprü URL + cron ops şart** (Twilio/Netgsm SDK yok)
3. TR e-Fatura/GİB — bilinçli sınır; KKTC API oranını yükselt
4. Native mobil / telehealth — product-boundary; PWA’yı “yeterli” sat


**Boşluklar:**

1. KKTC’de Excel+WhatsApp → tek link + hatırlatma + depozito (MVP hazır)
2. Medikal turizm TR/EN/RU (`/visit-cyprus`) — landing’de CTA eklendi
3. Dürüst “yazdırılabilir reçete / taslak fatura” — rakiplerin abartısına karşı güven

---

## BÖLÜM 7 — UNIFIED AKSİYON

Öncelik = Etki × (6 − Efor)

### 7.1 2 hafta — blocker


| #   | Aksiyon                             | Tür   | Efor | Etki | Puan   |
| --- | ----------------------------------- | ----- | ---- | ---- | ------ |
| 1   | E-reçete → klinik reçete scrub      | Marka | 1    | 5    | **25** |
| 2   | Cron/WA fail-open + Meta HMAC       | Güv.  | 2    | 5    | **20** |
| 3   | Hero H1 + tek CTA + “kart gerekmez” | Marka | 2    | 5    | **20** |
| 4   | Auth ASCII UTF-8                    | UX    | 1    | 4    | **20** |
| 5   | Book text-base + ≥44px hedefler     | UX    | 1    | 4    | **20** |


### 7.2 Sprint 2–4 hafta


| #   | Aksiyon                               | Puan |
| --- | ------------------------------------- | ---- |
| 1   | `/health` + poll + client mutation RL | 16   |
| 2   | Discovery N+1 batch                   | 16   |
| 3   | Empty-state CTA’lar                   | 15   |
| 4   | SMS/WA delivery % ölçümü              | 15   |
| 5   | Passport hasta dili (GPI jargon ↓)    | 12   |


### 7.3 1–2 ay

KKTC e-fatura canlı oranı · deposit funnel metrik · fill-the-gap ROI case · visit-cyprus dönüşüm

### 7.4 3–6 ay

Person match queue olgunlaştırma · anonim outcome (V3) · white-label API (V1) · TR ancak gov rayı ile

---

## BÖLÜM 8 — DANIŞMAN GÖRÜŞÜ

Solo founder bağlamında gerçekten iyi olan taraf: çoğu klinik SaaS’ın çöktüğü yerde (strict TS, tenant-guard + RLS, claim-bank, Person/GPI, CI smoke) disiplin var; yol haritası da “done” yığını üretmiş — bu bir feature çöplüğü değil, sistem.

En büyük teknik risk: WhatsApp bearer-only + cron fail-open. Altyapı “sağlam” görünürken production-benzeri ortamda tek yanlış env ile booking/reminder abuse.

En büyük rekabetçi risk: DoktorTakvimi/Self Klinik SMS+e-fatura+gov paketini satarken, Jane da booking UX’i standardı belirliyor; Asistan’ın moatı (KKTC + GPI + dürüst sınır) landing’de görünmüyor.

KKTC’de kazanmak için tek en önemli şey: bir polikliniği **aynı gün** public link + güvenilir hatırlatma + no-show/depozito ile “WhatsApp defteri”nden koparmak — regülasyon masalı değil, operasyon güvenilirliği.

**Rakip istismarı:** “E-reçete” butonunu screenshot’layıp sahte uyumluluk iddiası; imzasız WA/cron ile spam randevu; hero’yu generic gösterip “Calendly klonu” demek.

---

END OF MASTER AUDIT