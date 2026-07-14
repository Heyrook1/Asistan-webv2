# Klinik dili sözlüğü (TR QA)

Kaynak: `lib/brand/clinic-copy.ts`

Muhatap: klinik sahibi, sekreter, hekim — mühendis değil.

## Tercih edilen karşılıklar

| Kaçın | Kullan | Neden |
|-------|--------|-------|
| Multi-Branch | Çok şubeli | EN jargon |
| RLS / Postgres RLS | İşletme bazlı veri ayrımı | Teknik kısaltma |
| Orkestrasyon | Randevu düzeni / takvim akışı | Soyut SaaS |
| webhook | Bildirim kurulumu | Dev dili |
| onboarding | Kurulum / ilk ayar | EN kalıntı |
| tenant | İşletme | SaaS jargonu |
| slot | Müsait saat | Hasta dili |
| enterprise-grade | Kurumsal seviye | EN kalıntı |

## Yazım (diyakritik)

Türkçe marketing metinlerinde ASCII kaçakları kullanma:

`Cozumler`, `Saglik`, `Guzellik`, `Simdi`, `Yakinda`, `odakli`, `guvenli`, `musteri`, `Baslangic`, `Fiyatlandirma`, `Kliniginiz`, `Urun`, `Isletme`, `Hatirlatma`, `Yillik`, `Aylik`…

Doğru: **Çözümler, Sağlık, Güzellik, Şimdi, Yakında, odaklı, güvenli, müşteri, Başlangıç, Fiyatlandırma, Kliniğiniz, Ürün, İşletme, Hatırlatma, Yıllık, Aylık**.

İngilizce: `tenant`, `RLS`, `slot`, `onboarding`, `ops` gibi jargonları klinik diline çevir (`business-level isolation`, `availability`, `setup`, `operations`).

## Claim

KVKK için `docs/claim-bank.md` — “KVKK Uyumlu” deme; “KVKK odaklı kontroller”.

## Kontrol

Yeni sayfa PR’ında `/cozumler` ve landing sektör kartlarını bu listeye karşı hızlı okuma yap.
