# Claim bank — Asistan

Kaynak kod: `lib/brand/claim-bank.ts`

**İlke:** Kanıt yoksa iddia etme (Güven Merkezi / Hakkımızda ile aynı).

## Onaylı kısa iddialar

| ID | TR | EN | Yüzeyler |
|----|----|----|----------|
| kvkk-controls | KVKK odaklı kontroller | KVKK-focused privacy controls | hero, badge, pricing, ads, social, auth |
| tenant-isolation | İşletme bazlı veri ayrımı | Business-level data isolation | hero, pricing, ads, social |
| rbac | Rol bazlı erişim | Role-based access | hero, badge, pricing, auth, social |
| audit-log | Denetim günlüğü | Audit log | pricing, ads, social |
| early-access | Erken erişim | Early access | hero, ads, social, store |
| kktc-first | KKTC kliniklerine odaklı | Built for Northern Cyprus clinics | hero, ads, social, store |

## Yasak (şimdiki zaman / sertifika dili)

- “KVKK Uyumlu / KVKK uyumu”
- GDPR compliant, ISO …, HIPAA
- “%99.9 uptime”
- “Yapay zeka / AI-powered” (ürün AI değil)
- AI klinik not / ambient scribe / gerçek zamanlı SOAP üretimi — şimdilik yalnızca yapılandırılmış SOAP şablonu ([`ai-clinical-notes-boundary.md`](./ai-clinical-notes-boundary.md))
- “Revenue Intelligence” / uydurma doluluk yüzdesi (“bu slot %78 dolar”) — kural tabanlı boş slot + dönen hasta listesi var ([`fill-the-gap-ops.md`](./fill-the-gap-ops.md)); dürüst operasyon raporu ölçülen sayıları gösterir ([`clinic-analytics-deprecation.md`](./clinic-analytics-deprecation.md))
- “Sertifikalı güvenlik” (belge yoksa)
- Resmi e-reçete entegrasyonu / LIS / telehealth / hastane HIS–EMR (ürün sınırı: [`product-boundary.md`](./product-boundary.md))
- Apple Health / HealthKit senkronu, FHIR pasaportu, “tıbbi pasaport / health passport” (şimdiki zaman) — **Asistan pasaportu** = ziyaret + klinik üyelik özeti ([`patient-passport.md`](./patient-passport.md)); chart PHI paylaşılmaz

## Derinlik (outpatient SMB)

Ürün odağı: poliklinik / muayenehane. Yazdırılabilir klinik reçete var; resmi e-reçete ağı yok. Hastane katmanı ertelenmiştir.

## Stage honesty (aspiration ≠ present tense)

Ürün aşaması: **erken erişim** (`STAGE_HONESTY.productStage`).

| Yasak (şimdi) | Doğru çerçeve |
|---------------|---------------|
| “KKTC’nin ilk tercih ettiği…” | Vizyon / **Hedefimiz:** … olmak |
| “Piyasa lideri / market leader” | Ölçülebilir sonuç gelene kadar yok |
| “En çok tercih edilen” | Case + NPS ile sonra |

Hakkımızda vizyon hedef dilinde kalır; hero/ads/sosyal şimdiki zaman liderlik iddiası yazmaz.

Yasal / satış metni için şüphede: `merhaba@asistan.online` + Güven Merkezi.
