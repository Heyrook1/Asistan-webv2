# Regional hub roadmap (KKTC-first)

Kaynak: `lib/brand/regional-hubs.ts` · canlı SEO: `lib/seo.ts` (`SITE_URL`)

**İlke:** `kktc.asistan.online` bilinçli SEO kilidi. İkinci bir içerik/canonical kümesi **gate açılmadan** yayınlanmaz.

## Bugün (live)

| Hub | Host | Rol |
|-----|------|-----|
| **kktc** | `kktc.asistan.online` | Tek production canonical · sitemap · `metadataBase` · OG |

KKTC yoğunluğu, trust proof ve operasyon NPS öncelik; “global clinic SaaS” dili kullanılmaz.

## Apex (reserve)

| Hub | Host | Rol |
|-----|------|-----|
| **apex** | `asistan.online` | Şirket / yönlendirme — ayrı marketing cluster değil |

Apex’i aynı TR-KKTC sayfalarının ikinci kopyası yapma (duplicate SEO). İleride: hub seçici veya `kktc` → 302, ya da thin company page.

## Planlanan bölgesel hub’lar

| Hub | Host | Varsayılan dil | Market | Ne zaman |
|-----|------|----------------|--------|----------|
| **tr** | `tr.asistan.online` | tr | Türkiye anakara | Gate + ürün/fatura hazır |
| **cy** | `cy.asistan.online` | en | Kıbrıs Cumhuriyeti / EN–EL | Gate + lokal uyum |

Hosts kodda `status: 'planned'` — DNS/content/hreflang **şimdi açılmaz**.

## Uluslararası gate

Kod: `INTERNATIONAL_GATE` / `openInternationalGate()`.

Minimum (hepsi doğru olmalı):

1. Palette + masterbrand kılavuzu — **yes**
2. Claim bankası + legal review — **yes**
3. 10+ doğrulanmış klinik referans / case — **no**
4. Ayrı EN marketing yüzeyi (auth dil switch yetmez) — **no**
5. Yeni pazar için net faturalama / paket hikâyesi — **no**
6. Apex’te duplicate cluster yok — **yes** (kural)

`openInternationalGate() === false` → `tr.` / `cy.` / ikinci sitemap yasağı.

## Açılış sırası (öneri)

1. **KKTC density** — referanslar, case, NPS
2. **EN marketing** — `/en` veya dedicated hub copy; hreflang planı
3. **Apex routing** — company page + regional picker (thin)
4. **İlk ek hub** — muhtemelen `tr.` (TR dil yakınlığı) veya `cy.` (ada genişliği); biri, ikisi birden değil
5. **hreflang + canonical** — her hub kendi hostunda; çapraz `rel=alternate`

## Yasak

- `metadataBase` / sitemap’i `asistan.online` veya `tr.`’ye soft-cut
- Aynı path’i iki hostta indexlemek
- Gate kapalıyken ads’te “Türkiye geneli / Europe-ready”
- Sosyal bio’da apex + kktc’yi eşdeğer “ana site” göstermek (şimdi ana site = kktc)

## Kod kancaları

- `getLiveHub()` / `liveSiteOrigin()` → `SITE_URL`
- `plannedHubs()` / `reservedSeoHosts()` → ileride robots/hreflang guard
- `MASTERBRAND.regionalHost` live hub ile hizalı
