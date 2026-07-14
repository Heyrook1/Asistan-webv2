# Asistan — Brand Command Report
**CBO Audit · 14 Temmuz 2026 (yenilendi)**  
Strateji: önce KKTC liderliği, sonra uluslararası genişleme.

Executive canvas: sohbet yanında açılabilir denetim özeti (bu sprint + açık backlog).

## Verdict

**Marka sağlığı: ~78/100**

KKTC’te satılabilir klinik SaaS; premium global değil. Sistem kimliği artık yönetilebilir — mesafe kapanır.

- **Güç:** erken erişim dürüstlüğü, ENTRY_CTA hunileri, claim/stage/hub guardrails, palette + Manrope, dashboard chrome
- **Zayıf:** FloatingCTA login bias; ölçülen inovasyon kanıtı; cyan gradyan; ölü dual-hero

**Marka vaadi (kilitli):**  
> “KKTC kliniklerinin günlük operasyonunu sakinleştiren dijital sağlık paneli.”

Trust = kanıtlı kontrol · Innovation = ölçülen operasyon sonucu · Professionalism = tek sistem, abartısız iddia.

---

## Pillar skorları (0–100)

| Pillar | Skor |
|--------|------|
| Trust (güven iletişimi) | 78 |
| Professionalism | 72 |
| Innovation (kanıtlı yenilik) | 58 |
| Visual / system consistency | 76 |
| Copy & content quality (TR) | 78 |
| SEO & owned digital | 74 |
| Journey & conversion clarity | 72 |
| KKTC-first → intl readiness | 62 |

---

## Masterbrand mimarisi

Kaynak: [`masterbrand.md`](./masterbrand.md) · `lib/brand/masterbrand.ts`

| Katman | Rol |
|--------|-----|
| **Asistan** | Şirket / holding markası |
| **Asistan Health** | Klinik B2B ürünü (dashboard + abonelik) — ana ticari yüz |
| **Asistan Rezervasyon** | Hasta keşif/randevu (/client + mobil) |

Üç isim aynı anda pazarlanmamalı. Uluslararası fazda Health = master, Rezervasyon = alt ürün.

---

## Tamamlanan backlog

| Sev | Alan | Sonuç |
|-----|------|-------|
| P0 | Identity | Mobil + web `#0071E3` |
| P0 | Trust claims | “KVKK odaklı kontroller” + claim-bank |
| P0 | Masterbrand | Health / Rezervasyon kilitli |
| P1 | Social / ads | IG `@asistan.kktc`; OG 1200×630 |
| P1 | Copy TR | `/cozumler` + klinik dil sözlüğü |
| P1 | Product UI | Demo→trial brand chrome |
| P1 | Typography | Manrope = doctrine |
| P2 | International | [`regional-hubs.md`](./regional-hubs.md); gate kapalı |
| P2 | Stage honesty | Vizyon = Hedefimiz; stage yasakları |

---

## Açık öncelikler (yenilenen audit)

| Sev | Alan | Sorun | Aksiyon |
|-----|------|-------|---------|
| P2 | Conversion | FloatingCTA login-only; hero trial-first | Floater = trial (login secondary); demo ayrı rol |
| P2 | Visual residue | HomeCTA cyan uç `#00b4d8`; `brand-teal` adı borcu | İlk ekran gradyan → mavi aile |
| P2 | Copy debt | ~~`/fiyatlandirma` + orphan ASCII; hero “tenant”~~ **DONE** | Dil QA: `/urun` `/fiyatlandirma` diyakritik; home/EN jargon scrub (tenant/RLS/slot); claim EN |
| P2 | Code hygiene | Dual hero (CoverFlow canlı; marketing Hero ölü) | Sil veya archive |
| P1 | Innovation proof | Ölçülen outcome yok | 2–3 KKTC case (no-show / tek ajanda) |
| P1 | Social depth | LinkedIn yok; repo’da ads kit yok | LI: yayınla veya bilinçli yok; 1 paid kit |

---

## CTA rol matrisi

| Rol | Sahip | Durum |
|-----|-------|-------|
| Trial | Hero primary + header | Sağlıklı |
| Login | Header + **FloatingCTA** | Floater aşırı ağır |
| Demo / sales | Pricing / contact | Home’da zayıf |
| Patient book | HomeCTA outline | Net (`/client`) |

---

## 90 günlük odak

1. FloatingCTA → trial-first  
2. Cyan residue scrub (HomeCTA + avatar)  
3. ASCII scrub (`/fiyatlandirma`, orphan marketing)  
4. Dead hero / LandingPage cleanup  
5. 2–3 ölçülebilir KKTC proof  
6. LinkedIn kararı + opsiyonel paid creative  

---

## KKTC → International gate

Kaynak: [`regional-hubs.md`](./regional-hubs.md) · `openInternationalGate()`

| Kontrol | Durum |
|---------|-------|
| Palette + masterbrand | ✅ |
| Claim bank + legal posture | ✅ |
| 10+ doğrulanmış klinik case | ❌ |
| EN marketing yüzeyi | ❌ |
| Non-KKTC faturalama hikâyesi | ❌ |
| Apex duplicate SEO yok | ✅ (kural) |

**Şimdi:** Canlı host = `kktc.asistan.online`. “İlk tercih” yalnızca vizyon/hedef. `tr.` / `cy.` gate kapalıyken açılmaz.

---

## Sosyal & OG

| Kanal | URL |
|-------|-----|
| Instagram | https://www.instagram.com/asistan.kktc/ (`@asistan.kktc`) |
| LinkedIn | *Henüz yok* — generic linkedin.com kullanılmaz |
| Open Graph | `/opengraph-image` · 1200×630 |

---

## Brand system kancaları

| Doktrin | Kaynak |
|---------|--------|
| Masterbrand | `lib/brand/masterbrand.ts` |
| Claims / stage | `lib/brand/claim-bank.ts` · [`claim-bank.md`](./claim-bank.md) |
| Klinik dili | `lib/brand/clinic-copy.ts` |
| Tipografi | `lib/brand/typography.ts` · [`typography.md`](./typography.md) |
| Hubs | `lib/brand/regional-hubs.ts` · [`regional-hubs.md`](./regional-hubs.md) |

---

## CBO hükmü

Northern Cyprus’ta “ciddi klinik ops yazılımı” konumuna kimlik olarak hazırsınız. Bundan sonra markayı sloganla değil; no-show düşüşü / tek ajanda / operasyon NPS ile satın. Uluslararası = ödül; KKTC density = iş.
