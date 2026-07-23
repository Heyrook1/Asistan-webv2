# Asistan Rezervasyon — web mobile product

Mobil-first hasta ürün yüzeyi. Native Expo (`mobile/`) ve klinik paneli (`/dashboard`) ayrı kalır.

## Ürün kararı

- **Marka:** Asistan Rezervasyon (forbidden: “Asistan Client / Mobile App”)
- **Canlı shell:** `/client` (+ PWA `start_url`)
- **Misafir klinik linki:** `/book/{slug}` (bio / embed)
- **Kısa giriş:** `/r` → `/client`
- **Kod evi:** bu klasör (`web-mobile/`) — Next App Router buradaki shell’i import eder

## Çalıştırma

Ana repoda (ayrı port yok — aynı Next + aynı API):

```bash
npm run rezervasyon:dev
# alias → next dev --turbopack; aç: http://localhost:3000/client
```

## Ne burada, ne değil

| Burada | Değil |
|--------|--------|
| App shell, home hub, top bar | Dashboard / klinik ops |
| Product tokens + docs | Expo native store binary |
| `/client` UX kaynağı | Marketing landing |

API: mevcut `/api/client/*` ve `/api/public/*`.
