# Masterbrand mimarisi (kilitli)

Kaynak kod: `lib/brand/masterbrand.ts`

Strateji: **KKTC önce → uluslararası**. Üç katman. Dördüncü ürün adı uydurma.

## Katmanlar

| Katman | İsim | Ne işe yarar | Ana yüzey |
|--------|------|--------------|-----------|
| Şirket | **Asistan** | Holding / ekosistem | Kurumsal iletişim, basın |
| Klinik B2B | **Asistan Health** | Randevu, hasta, ekip, abonelik | `/`, `/urun`, `/dashboard`, deneme, demo |
| Hasta | **Asistan Rezervasyon** | Keşif + randevu talebi | `/client`, PWA install, Opsiyonel mağaza e-postası |

## Kurallar

1. Klinik satış ve fiyatlama dili = **Asistan Health** (master ticari yüz).
2. Hasta uygulaması / PWA = **Asistan Rezervasyon** (alt ürün); native mağaza isteğe bağlı.
3. Yasal metinlerde şirket “Asistan”; ürün “Asistan Health” diye geçebilir (privacy/terms mevcut dil).
4. Yasak UI isimleri: `Asistan Client`, `Asistan Mobile`, `Asistan Health Ecosystem`, `Asistan App`.
5. “Asistan Rezervasyon yakında” yalnızca **mağaza yayını** için; web `/client` canlıysa “web’de kullanılabilir, mağaza bekleme listesi” de.
6. Uluslararası fazda da Health = master; Booking/Rezervasyon = alt ürün kalır.

## Örnek doğru kullanım

- Hero / fiyat: “Asistan Health klinik paneli”
- Mobil vitrin: “Asistan Rezervasyon”
- Footer ©: “Asistan Health”
- Hakkımızda şirket hikâyesi: “Asistan” + ürün olarak Health’e bağlı anlatım

## Yanlış

- Aynı paragrafta üç ismi eşit ağırlıkla pazarlamak
- Hastaya “Asistan Health indir” demek
- Kliniğe yalnız “Asistan Rezervasyon” satmak

## Bölgesel hub’lar

Canlı SEO = `kktc.asistan.online`. Apex / `tr.` / `cy.` için yol haritası: [`regional-hubs.md`](./regional-hubs.md).
