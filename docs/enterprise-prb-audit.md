# Asistan Health — Enterprise Product Review Board Audit
**14 Temmuz 2026** · Early access · KKTC-first

Executive canvas (sohbet yanında açın): Cursor Canvas → `asistan-enterprise-prb-audit`

## Verdict

**Overall readiness: ~67/100**

KKTC outpatient klinik ops + hasta keşif/randevu temeli satılabilir. Jane / Cliniko / DoktorTakvimi sınıfı ticari parite yok. Önce yoğunluk + hatırlatma kanalı + public book link + ölçülen sonuç.

| Pillar | Skor |
|--------|------|
| Product / ops depth | 72 |
| UX / journey | 68 |
| UI / design system | 74 |
| Trust / security | 71 |
| Commercial readiness | 52 |
| Competitive parity | 48 |
| Performance / reliability | 60 |
| Data / compliance ops | 70 |

## Ne güçlü?

- Klinik panel: ajanda, hastalar, hizmetler, takım, mesajlar (ekip), analitik
- İnce RBAC + denetim / yönetişim
- `/client` marketplace + Expo API’ler + PWA install
- Trial / demo üyelik + abonelik urgency ops
- Marka dürüstlüğü (claim / stage / hub kilitleri)

## Zayıflıklar (özet)

| Sev | Alan | Zayıflık | Neden önemli | Etki | Üretim çözümü |
|-----|------|----------|--------------|------|----------------|
| P0 | Commercial | Online ödeme / depozito yok | Peer’ler no-show’u monetize eder | ARR tavanı | iyzico/Stripe deposit + fatura |
| P0 | Ops | SMS / WhatsApp yok (cron/e-posta) | No-show vaadi kanal ister | Satış vaadi kırılır | 1 SMS + WA template |
| P0 | Conversion | ~~FloatingCTA = login~~ **DONE** | Trial hunisiyle çatışırdı | Düşük deneme | Floater → trial + login chip |
| P1 | Product | ~~Public `/book/[slug]` yok~~ **DONE** | Bio→randevu yolu yok | Büyüme tavanı | Klinik slug + embed |
| P1 | Product | ~~Calendar sync yok~~ **DONE (Google busy)** | Hekim Google’da yaşar | Adaptasyon sürtünmesi | Busy-block OAuth (Outlook sonra) |
| P1 | Product | ~~Intake form yok~~ **DONE** | Ön büro hâlâ telefon | Ops yükü | Form → hasta kartı |
| P1 | Commercial | ~~Abonelik elden~~ **DONE (self-serve intent)** | Sales ops bottleneck | Ölçeklenmez | Self-serve upgrade + payment intent (manual/Stripe) |
| P1 | Proof | ~~Case / NPS yok~~ **DONE (process pilots)** | İnovasyon algısı düşük | Uzun satış | 3 KKTC outcome card + `/sonuclar`; signed %/NPS draft |
| P2 | UX | ~~Dual hero / cyan~~ **DONE** | Bakım + hissiyat | Hız / premium | Orphans deleted; HomeCTA/avatars blue-only |
| P2 | SecOps | ~~Dual rate-limit; RLS isim drift~~ **DONE** | Yük / şema güven | Abuse / false safety | Unified Upstash limiter; RLS inventory + parity migration |
| P2 | Platform | ~~Store waitlist primary~~ **DONE (PWA-first)** | Hasta beklentisi = yüklenebilir | Perception lag | Lean PWA install; native stores optional email |
| P2 | Depth | ~~Hospital-depth gap~~ **POSTPONED (by design)** | Enterprise/hospital beklentisi | Ceiling on groups | Stay outpatient SMB · [`product-boundary.md`](./product-boundary.md) |

## Rekabet

Asistan: RBAC/audit ve KVKK dürüstlüğünde avantaj; Google busy-block + public book + intake + self-serve membership intent MVP var. Hasta deposit ödemesi ve SMS/WA hâlâ geride; native store publish bilinçli ertelendi (PWA-first); Outlook/write-back henüz yok.

## 90 günlük görevler

1. ~~FloatingCTA trial-first~~ **DONE**  
2. SMS veya WhatsApp randevu onay/hatırlatma  
3. ~~Klinik public booking link MVP~~ **DONE** (`/book/[slug]` + embed)  
4. ~~Ödeme pilotu (deposit veya abonelik kart)~~ **DONE** (self-serve membership intent; deposit later)  
5. ~~2–3 ölçülebilir KKTC case~~ **DONE** (anonim süreç pilotları; signed % sonra)  
6. Activation funnel metrikleri (trial → ilk randevu)  
7. ~~Dead hero cleanup + cyan scrub~~ **DONE** (`docs/visual-scrub.md`)  
8. ~~Rate-limit birleştir + RLS prod verify~~ **DONE** (`docs/security-ops.md`)  
9. ~~Google Calendar busy-block OAuth~~ **DONE** (Outlook write-back sonra)  
10. ~~Patient installable app~~ **DONE** (PWA-first; native store optional — `docs/pwa-patient.md`)  
11. ~~Product depth / hospital integrations~~ **POSTPONED** (`docs/product-boundary.md` — outpatient SMB lock)  

## Söyle / söyleme

**Söyle:** Erken erişim; KKTC klinik ops paneli; tek ajanda; rol bazlı erişim; KVKK odaklı kontroller; kanıt geldikçe outcome.

**Söyleme:** AI-powered; KVKK uyumlu; Türkiye lideri; tam EMR; ödemeler hazır; App Store’da uygulama (henüz yok — PWA var) — gate kapalıysa.

## CPO kapanış

Önce yerel kategoriyi kazanacak ticari “table-stakes”: ulaşım (SMS/WA), rezerv edilebilirlik (public link), para (ödeme), kanıt (case). EMR / telehealth / intl = ödül, KKTC density = iş.

## Execution plan (15 Temmuz 2026)

Active roadmap: [`ecosystem-implementation-plan.md`](./ecosystem-implementation-plan.md) · North star: [`ecosystem-north-star.md`](./ecosystem-north-star.md)

Order: **GPI/Person → 3-step book → SMS/WA → deposit → reputation/BI**. Hospital verticals stay postponed.
