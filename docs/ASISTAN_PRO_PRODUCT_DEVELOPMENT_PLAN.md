# ASİSTAN — Profesyonel Ürün Geliştirme Planı

**Belge türü:** Cursor uygulama ve yürütme dökümanı  
**Ürün:** Asistan Rezervasyon — Hasta PWA / Mobil Deneyim  
**Canlı prototip:** https://kktc.asistan.online/client  
**Mevcut depo:** `Heyrook1/Asistan-webv2`  
**Belge tarihi:** 7 Ağustos 2026  
**Durum:** Uygulamaya hazır ana plan  

---

## 1. Bu Belgenin Amacı

Bu belge, çalışan Asistan prototipini güvenli, tutarlı, ölçülebilir ve gerçek kullanıcılarla pilot çalışmaya hazır profesyonel bir ürüne dönüştürmek için hazırlanmıştır.

Cursor bu belgeyi yalnızca öneri listesi olarak değil, ürün ve mühendislik sözleşmesi olarak kullanmalıdır. Her geliştirme görevi:

1. Mevcut kodun incelenmesi,
2. Etkilenen akışların belirlenmesi,
3. Küçük ve geri alınabilir değişikliklerin uygulanması,
4. Testlerin yazılması ve çalıştırılması,
5. Kabul kriterlerinin kanıtlanması,
6. Değişiklik özetinin hazırlanması

adımlarını izlemelidir.

Bu belge tamamlanana kadar ürünün ana önceliği yeni özellik eklemek değil, mevcut randevu deneyimini güvenilir hâle getirmektir.

---

## 2. Cursor'da Kullanım Şekli

Bu dosyayı repository kök dizinine koyun ve Cursor konuşmalarında şu şekilde referans verin:

```text
@ASISTAN_PRO_PRODUCT_DEVELOPMENT_PLAN.md dosyasını ürün sözleşmesi olarak kullan.
Önce mevcut kodu ve ilgili testleri incele. Belgedeki sırayı bozma.
Bu turda yalnızca belirtilen fazı uygula. İlgisiz refactor yapma.
Değişikliklerden sonra lint, typecheck, test ve build çalıştır.
Başarısız veya çalıştırılamayan kontrolleri açıkça raporla.
```

Cursor'a bütün projeyi tek seferde yeniden yazdırmayın. Her fazı ayrı branch, ayrı çalışma turu ve ayrı doğrulama ile ilerletin.

### 2.1 Cursor'ın İlk Görevi

İlk görev kod değiştirmeden keşif yapmaktır:

```text
Bu repository'yi kod değiştirmeden incele.

Özellikle şu yüzeyleri haritala:
- /client
- /client/clinics
- /client/bookings
- /client/profile
- /client/health
- /book/[slug]
- mobile/
- web-mobile/
- randevu, müsaitlik, auth ve bildirim API'leri

Çıktıda şunları ver:
1. Kullanılan gerçek dosya yolları,
2. Her akışın veri kaynağı,
3. PWA, mobile ve web-mobile arasındaki tekrarlar,
4. Randevu akışındaki JSON hatasının muhtemel kaynağı,
5. Güvenlik ve veri izolasyonu riskleri,
6. Bu belgede kod yapısıyla uyuşmayan varsayımlar,
7. Faz 0 ve Faz 1 için uygulanabilir dosya bazlı plan.

Henüz hiçbir dosyayı değiştirme.
```

---

## 3. Ürün Vizyonu

Asistan Rezervasyon, KKTC'deki hastaların güvenilir klinik ve uzmanları bulmasını, gerçek müsaitliği görmesini ve mümkün olan en az adımla randevu almasını sağlayan hasta ürünüdür.

Ürünün temel vaadi:

> Doğru kliniği bulun. Gerçek müsaitliği görün. Randevunuzu kolayca alın.

### 3.1 Birincil kullanıcılar

- Hesap açmadan klinik arayan ziyaretçi
- İlk kez randevu alan hasta
- Randevularını takip eden kayıtlı hasta
- Randevuyu onaylayan klinik çalışanı
- Klinik takvimini yöneten owner/sekreter

### 3.2 Kullanıcının tamamlaması gereken ana işler

- İhtiyacına uygun klinik veya uzmanı bulmak
- Klinik ve doktor hakkında güven bilgisi edinmek
- Gerçek müsait gün ve saati görmek
- Hizmet, doktor ve saat seçerek randevu almak
- Randevu durumunu takip etmek
- İptal veya yeniden planlama yapmak
- Randevu bildirimlerini almak

### 3.3 Ürün ilkeleri

1. **Randevu önce gelir:** Ana akış çalışmıyorsa yeni modül eklenmez.
2. **Hesapsız keşif mümkündür:** Arama ve klinik inceleme giriş istemez.
3. **Güven görünür olmalıdır:** Klinik, doktor, konum, hizmet ve fiyat bilgileri kaynağıyla tutarlı olmalıdır.
4. **Tek gerçek veri kaynağı vardır:** UI içinde sahte müsaitlik veya fiyat üretilmez.
5. **Teknik hata kullanıcıya gösterilmez:** Ham exception ve stack mesajları yalnızca güvenli loglara gider.
6. **Güvenlik varsayılan olarak kapalıdır:** Yetki doğrulanamazsa işlem reddedilir.
7. **Mobil kullanım önceliklidir:** Tüm kritik akışlar küçük ekran, dokunma ve safe-area koşullarında test edilir.
8. **Erişilebilirlik özellik değil kalite kriteridir.**

---

## 4. Kapsam ve Kapsam Dışı Alanlar

### 4.1 Profesyonel Beta kapsamı

- Mobil PWA ana sayfa
- Gerçek arama
- Klinik ve uzman listeleme
- Klinik/doktor detay sayfası
- Hizmet seçimi
- Gerçek müsaitlik
- Misafir randevu
- Güvenli giriş ve kayıt
- Randevularım
- İptal ve yeniden planlama
- E-posta/SMS/push bildirim altyapısının güvenilir en az bir kanalı
- PWA yükleme deneyimi
- Temel analitik, hata izleme ve audit log

### 4.2 Beta sonrasına ertelenecekler

- Sağlık Pasaportu'nun klinikler arası paylaşım akışı
- E-reçete ve e-fatura
- AI Front Desk
- Sesli asistan
- Gelişmiş klinik analitiği
- FHIR/HL7 entegrasyonu
- Sigorta entegrasyonu
- Native Swift ve Kotlin uygulamaları
- Ayrı provider companion uygulaması
- Karmaşık ödeme ve çoklu ülke para birimi

Hazır olmayan ertelenmiş özellikler ana navigasyonda aktif ürün gibi gösterilmemelidir.

---

## 5. Mevcut Durum ve Canlı Prototip Bulguları

7 Ağustos 2026 tarihinde canlı `/client` deneyiminde aşağıdaki durum gözlemlenmiştir.

### 5.1 Güçlü mevcut temel

- Mobil uygulama hissi veren alt navigasyon mevcut.
- Ana görev olarak arama ve randevu görünür durumda.
- Klinik kartları okunabilir ve mobil uyumlu.
- Randevu akışı `Ne için? → Ne zaman? → İletişim` şeklinde yapılandırılmış.
- Misafir rezervasyonu düşünülmüş.
- Skeleton loading ve PWA yükleme yüzeyi mevcut.
- Temel semantik HTML ve erişilebilir navigasyon etiketleri bulunuyor.

### 5.2 P0 — Bloke edici canlı hata

Hizmet seçildikten sonra tarih/saat ekranında aşağıdaki hata görülmektedir:

```text
Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

Sonuç:

- Saatler yüklenmiyor.
- `Devam` butonu pasif kalıyor.
- Ana ürün vaadi tamamlanamıyor.
- Ham teknik hata kullanıcıya gösteriliyor.

Bu hata çözülmeden ürün beta veya pilot olarak kabul edilemez.

### 5.3 Güven ve veri tutarlılığı sorunları

- KKTC odaklı üründe İstanbul/Ataşehir demo konumları gösteriliyor.
- `Klinigi` ve `Istanbul` gibi karakter tutarsızlıkları bulunuyor.
- Birden fazla kartta aynı `Bugün · 10:00` değerinin gösterilmesi sahte/hardcoded müsaitlik algısı oluşturuyor.
- Yeni kliniklerin puan/yorum yerine güven sinyali zayıf.
- Klinik kartından doğrudan rezervasyona gidiliyor; detay ve karar yüzeyi yetersiz.

### 5.4 Kullanıcı deneyimi sorunları

- Klinik arama ekranında görünür gerçek bir metin arama alanı yok.
- `5 km içinde` filtresi bulunmasına rağmen konum kaynağı veya izin durumu görünmüyor.
- PWA yükleme kartı erken ve tekrarlı şekilde fazla alan kaplıyor.
- Sağlık Pasaportu hazır olmadığı hâlde ana navigasyonda birincil özellik olarak görünüyor.
- Sağlık ekranının üst başlığında `Ana Sayfa` yazması bağlam tutarsızlığı oluşturuyor.
- Profil ekranında şifre sıfırlama, şifre göster/gizle ve açık yasal onay akışları eksik.
- İlk içerik yüklenmesi canlı kontrolde yaklaşık altı saniye sürmüştür; gerçek cihazlarda ölçülmelidir.

---

## 6. Hedef Ürün Mimarisi

### 6.1 Yüzeyler

| Yüzey | Sorumluluk | Karar |
|---|---|---|
| `/client` | Hasta PWA ana deneyimi | Korunacak ve profesyonelleştirilecek |
| `/book/[slug]` | Misafir randevu akışı | Korunacak, API ve UX düzeltilecek |
| `/dashboard` | Klinik operasyon paneli | Web olarak korunacak |
| `web-mobile/` | Tekrarlayan mobil web yüzeyi | İnceleme sonrası dondurulacak veya kaldırılacak |
| `mobile/` | Expo/native deneyim | Beta sonrasına kadar aktif geliştirme yapılmayacak |
| Public clinic pages | SEO ve paylaşılan klinik profili | Klinik detay modeliyle birleştirilecek |

### 6.2 Temel mimari kural

UI doğrudan veri tabanına güvenmemelidir. Randevu, müsaitlik, hasta kimliği ve klinik yetkileri sunucu tarafında doğrulanan servis/API katmanından geçmelidir.

Önerilen istek akışı:

```text
Client/PWA
  → Versioned API veya güvenli server action
    → Auth + authorization
      → Zod input validation
        → Domain service
          → Prisma transaction
            → PostgreSQL/Supabase
```

### 6.3 API yanıt standardı

Başarılı yanıt:

```json
{
  "ok": true,
  "data": {},
  "requestId": "req_..."
}
```

Hata yanıtı:

```json
{
  "ok": false,
  "error": {
    "code": "AVAILABILITY_UNAVAILABLE",
    "message": "Uygun saatler şu anda alınamıyor. Lütfen tekrar deneyin."
  },
  "requestId": "req_..."
}
```

Kurallar:

- API her durumda doğru `Content-Type` ve geçerli JSON döndürmelidir.
- `204 No Content` dönen response üzerinde `.json()` çağrılmamalıdır.
- Client önce `response.ok` ve içerik türünü kontrol etmelidir.
- Ham hata mesajı, SQL mesajı veya stack trace kullanıcıya dönmemelidir.
- Her kritik isteğin korelasyon için `requestId` değeri olmalıdır.
- Public mesaj Türkçe ve anlaşılır; dahili hata güvenli logda ayrıntılı olmalıdır.

### 6.4 Randevu durum modeli

Önerilen temel yaşam döngüsü:

```text
REQUESTED → PENDING → CONFIRMED → COMPLETED → REVIEWED
                ↘ CANCELLED
CONFIRMED → RESCHEDULE_REQUESTED → CONFIRMED
```

Kurallar:

- Her durum değişikliği `appointment_status_history` kaydına yazılır.
- Durum geçişleri allow-list ile doğrulanır.
- Geçmiş kayıtları güncellenmez; yalnızca yeni event eklenir.
- Yalnızca tamamlanmış randevu yorumlanabilir.
- İptal ve yeniden planlama klinik politikasına göre sınırlandırılır.
- Bildirimler transaction sonrasındaki güvenilir event/outbox sürecinden üretilmelidir.

### 6.5 Double-booking önleme

- Uygunluk yalnızca UI kontrolüne bırakılamaz.
- Rezervasyon sunucu transaction'ı içinde tekrar doğrulanmalıdır.
- Doktor, başlangıç ve bitiş zamanını kapsayan veri tabanı constraint/lock stratejisi bulunmalıdır.
- Aynı isteğin tekrar gönderilmesine karşı `Idempotency-Key` kullanılmalıdır.
- Aynı key ve aynı payload aynı sonucu döndürmelidir.
- Aynı key ve farklı payload `409` üretmelidir.

---

## 7. Ana Kullanıcı Akışları ve Kabul Kriterleri

### 7.1 Ana sayfa

**Amaç:** Kullanıcı üç saniye içinde ne yapabileceğini anlamalıdır.

Gereksinimler:

- Gerçek bir arama alanı veya arama ekranına açık geçiş
- Konum seçici veya seçili bölge göstergesi
- Branşlar
- Önerilen klinikler
- Bugün/yarın uygun klinik sinyali
- Giriş yapmamış kullanıcı için gereksiz bildirim rozeti gösterilmemesi

Kabul kriterleri:

- İlk ana içerik iyi mobil bağlantıda iki saniye hedefiyle görünür.
- Hero görseli içerik render'ını bloke etmez.
- Ana CTA erişilebilir isim taşır.
- Kart verileri gerçek API kaynağından gelir.
- Boş durumda sahte klinik veya sahte saat oluşturulmaz.

Önerilen metin:

```text
Doğru kliniği bulun.
Randevunuzu kolayca alın.

Yakınınızdaki klinikleri ve gerçek müsaitliği karşılaştırın.
```

### 7.2 Arama ve filtreleme

**Amaç:** Kullanıcı doktor, klinik, branş veya hizmet adıyla arama yapabilmelidir.

Gereksinimler:

- Debounce uygulanan gerçek arama kutusu
- Branş filtresi
- Bölge/konum filtresi
- Bugün müsait filtresi
- Online/yüz yüze filtresi yalnızca veri destekliyorsa
- Fiyat filtresi yalnızca tutarlı fiyat verisi varsa
- Sıralama: önerilen, en yakın, en erken uygun, puan
- Filtreleri temizle
- Loading, empty ve error durumları

Kabul kriterleri:

- URL query parametreleri arama durumunu taşıyabilir.
- Geri tuşu filtre durumunu bozmaz.
- Sonuç yoksa kullanıcıya yeni arama önerisi sunulur.
- Desteklenmeyen filtre görünmez.
- Konum izni istenmeden önce neden gerektiği açıklanır.

### 7.3 Klinik/doktor detay ekranı

**Amaç:** Kullanıcı rezervasyondan önce güvenilir karar verebilmelidir.

Gereksinimler:

- Klinik adı ve doğrulama durumu
- Doktor adı, uzmanlık ve kısa tanıtım
- Klinik/doktor fotoğrafı; yoksa profesyonel placeholder
- Adres ve harita bağlantısı
- İletişim bilgisi görünürlük politikası
- Hizmetler, süre ve fiyat
- Bugün/yarın uygun slot özeti
- Klinik çalışma saatleri
- Yorumlar ve yalnız doğrulanmış randevu yorumu etiketi
- İptal politikası
- Sabit veya görünür `Randevu al` CTA'sı

Kabul kriterleri:

- Aynı klinikte birden fazla doktor doğru şekilde ayrıştırılır.
- Fiyat yoksa uydurma fiyat gösterilmez.
- Slot yoksa `Uygun saat bulunamadı` mesajı gösterilir.
- Klinik aktif değilse rezervasyon kapatılır.

### 7.4 Misafir randevu

Akış:

```text
Klinik/doktor → Hizmet → Gün/saat → İletişim → Onay → Başarı
```

Gereksinimler:

- Adım 1: Hizmet ve doktor
- Adım 2: Sunucudan alınan gerçek slot
- Adım 3: Ad, telefon/e-posta, açık rıza/onay
- Son kontrol özeti
- Tekrarlı gönderimi engelleme
- Başarı referans kodu
- Randevuyu hesaba bağlama seçeneği

Kabul kriterleri:

- Kullanıcı yalnızca aktif ve hâlâ müsait slotu rezerve edebilir.
- Slot başka kullanıcı tarafından alınırsa anlaşılır `409 SLOT_TAKEN` mesajı gösterilir.
- Gönder butonu işlem sırasında tekrar tıklanamaz.
- Sayfa yenilenmesi ikinci randevu oluşturmaz.
- Başarı gösterilmeden önce veri tabanı kaydı doğrulanır.
- Bildirim kanalı çalışmıyorsa randevu başarılı kabul edilebilir; bildirim retry kuyruğuna alınır ve hata izlenir.

### 7.5 Giriş ve kayıt

Profesyonel beta için tek güvenilir auth yöntemi seçilip tamamlanmalıdır. Yarım çalışan çoklu seçenek eklenmemelidir.

Minimum gereksinimler:

- Giriş
- Kayıt
- E-posta/telefon doğrulaması
- Şifremi unuttum veya güvenli magic-link/OTP alternatifi
- Şifre göster/gizle
- Rate limit
- Başarısız girişte hesap varlığını ifşa etmeyen mesaj
- Gizlilik ve kullanım koşulları bağlantıları
- Oturum sonlandırma

Kabul kriterleri:

- Başarılı giriş sonrası güvenli return URL uygulanır.
- Open redirect mümkün değildir.
- Session token localStorage içinde düz metin tutulmaz.
- Client içine service-role key veya gizli anahtar gönderilmez.
- Auth doğrulanamadığında korunan veri dönmez.

### 7.6 Randevularım

Gereksinimler:

- Yaklaşan ve geçmiş randevular
- Durum etiketi
- Klinik/doktor/hizmet/tarih bilgileri
- İptal
- Yeniden planlama
- Klinikle iletişim
- Takvime ekleme
- Tamamlanan randevu için yorum

Kabul kriterleri:

- Kullanıcı yalnızca kendisine ait randevuları görür.
- İptal/yeni planlama server-side sahiplik kontrolünden geçer.
- Optimistic UI başarısızlıkta geri alınır.
- Zamanlar kullanıcı timezone'una göre doğru gösterilir.

### 7.7 Sağlık Pasaportu

Profesyonel beta sırasında tam işlevsel değilse:

- Alt navigasyondan kaldırılmalıdır veya açıkça `Yakında` olarak pasif gösterilmelidir.
- Sağlık verisi varmış izlenimi verilmemelidir.
- Klinik notlarının paylaşılmadığı mesajı tek başına ürün işlevi sayılmamalıdır.

Sağlık Pasaportu ayrı tehdit modeli, açık rıza, veri minimizasyonu ve erişim geçmişi tamamlandıktan sonra açılacaktır.

### 7.8 PWA yükleme deneyimi

- İlk sayfa açılışında büyük yükleme kartı gösterilmemelidir.
- Kullanıcı en az iki anlamlı etkileşim yaptıktan veya ikinci ziyaretinde teklif edilebilir.
- `Şimdi değil` seçimi belirli süre saklanmalıdır.
- Kapatılan teklif her sayfada yeniden görünmemelidir.
- iOS ve Android için platforma uygun yönerge gösterilmelidir.
- Bottom navigation iOS safe-area ile çakışmamalıdır.

---

## 8. Tasarım Sistemi ve UI Kalitesi

### 8.1 Tasarım hedefi

Asistan; güven veren, sakin, erişilebilir ve modern görünmelidir. Aşırı glassmorphism, ağır gölge, gereksiz animasyon ve tıbbi korku oluşturan görseller kullanılmamalıdır.

### 8.2 Zorunlu tasarım tokenları

- Renkler: brand, neutral, success, warning, danger, info
- Tipografi ölçeği
- 4/8 tabanlı spacing sistemi
- Radius ölçeği
- Gölge seviyeleri
- Border renkleri
- Focus ring
- Touch target minimumları
- Safe-area değişkenleri

Tokenlar tek kaynakta tanımlanmalı; ekranlarda rastgele hex, radius ve spacing yazılmamalıdır.

### 8.3 Bileşen listesi

- Button: primary, secondary, ghost, destructive, loading
- Input, password input, search input
- Select/combobox
- Filter chip
- Clinic card
- Doctor card
- Service card
- Slot button
- Status badge
- Empty state
- Error state
- Skeleton
- Toast
- Confirmation dialog
- Bottom navigation
- App header
- Install prompt

### 8.4 Erişilebilirlik

- WCAG AA kontrast hedefi
- Klavye ile tam kullanılabilirlik
- Görünür focus state
- `aria-live` yalnız gerekli async mesajlarda
- Form hataları alanla programatik bağlı
- Renk tek durum göstergesi değil
- En az 44×44 px dokunma alanı
- `prefers-reduced-motion` desteği
- Anlamlı alt metin

---

## 9. Güvenlik Gereksinimleri

### 9.1 Tenant ve klinik izolasyonu

- Her klinik sorgusu server-side tenant/clinic scope taşır.
- Prisma'nın Supabase RLS'i otomatik uyguladığı varsayılmaz.
- Tenant gerektiren service fonksiyonları `clinicId` değerini doğrulanmış session/context üzerinden alır.
- Client'tan gelen `clinicId` tek başına yetki kaynağı değildir.
- Cross-tenant testleri zorunludur.

### 9.2 Rol ve yetki

- Owner hiçbir public veya clinic action üzerinden `SUPER_ADMIN` atayamaz.
- Rol geçişleri merkezi allow-list ile yönetilir.
- Sekreter ve çalışan yetkileri minimum privilege prensibine uyar.
- Kritik rol değişiklikleri audit log üretir.

### 9.3 Kimlik eşleştirme

- Person/hasta kaydı yalnız telefon veya e-posta metni eşleşti diye otomatik bağlanmaz.
- Kimlik resolve süreci doğrulanmış sahiplik sinyali ister.
- Belirsiz eşleşme manuel/ek doğrulama gerektirir.
- Hasta verisi başka kullanıcıya sızmamalıdır.

### 9.4 Input ve output güvenliği

- Tüm public input Zod veya eşdeğer schema ile doğrulanır.
- Serbest metin alanlarında boyut limitleri vardır.
- SQL string birleştirme yapılmaz.
- Kullanıcı HTML'i sanitize edilmeden render edilmez.
- API yalnız gerekli DTO alanlarını döndürür; Prisma modeli doğrudan serialize edilmez.

### 9.5 Rate limiting ve abuse

- Auth girişimleri
- Şifre sıfırlama/OTP
- Public availability
- Booking create
- Search
- Review create

endpointleri kullanıcı/IP/identifier bağlamında uygun limitlere sahip olmalıdır. Production'da rate-limit altyapısı yoksa sessizce devre dışı kalmamalıdır.

### 9.6 Web güvenlik başlıkları

- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Frame embedding için `frame-ancestors` veya eşdeğer koruma
- Secure, HttpOnly, SameSite cookie politikası

### 9.7 Log ve mahremiyet

- Loglarda parola, token, OTP, tam sağlık verisi veya gereksiz PII bulunmaz.
- Hata izleme örnekleme oranı production maliyet ve mahremiyetine göre ayarlanır.
- Kritik işlemler için audit kaydı bulunur.
- Kullanıcıya gösterilen hata ile dahili hata ayrılır.

---

## 10. Performans ve Güvenilirlik Hedefleri

### 10.1 Hedefler

- Ana içerik görünümü: iyi mobil ağda yaklaşık 2 saniye hedefi
- Arama tepkisi: cache veya debounce sonrası hissedilir gecikme oluşturmamalı
- Availability isteği: p95 izlenmeli
- Booking create: p95 izlenmeli
- Layout shift düşük tutulmalı
- Hero ve klinik görselleri optimize edilmeli
- Kullanılmayan JavaScript client'a gönderilmemeli

### 10.2 Uygulama prensipleri

- Mümkün olan public veri server-render/cache edilir.
- Kullanıcıya özel veri private/no-store politikası kullanır.
- Skeleton gerçek yerleşim boyutlarına yakın olmalıdır.
- Timeout, retry ve cancellation politikaları endpoint türüne göre belirlenir.
- Booking create otomatik ve kontrolsüz retry edilmez; idempotency ile korunur.
- Görsel optimizasyonu ve responsive `sizes` kullanılır.

### 10.3 Boş ve hata durumları

Her veri yüzeyinde en az şu durumlar bulunmalıdır:

- Loading
- Success
- Empty
- Recoverable error
- Permission/auth required
- Offline veya connection error

Ham teknik mesaj hiçbir durumda son kullanıcıya gösterilmez.

---

## 11. Gözlemlenebilirlik ve Analitik

### 11.1 Teknik gözlemlenebilirlik

- Request ID
- Structured logging
- Availability hata oranı
- Booking create başarı/hata oranı
- Auth hata oranı
- Notification delivery sonucu
- Web vitals
- Release/version etiketi

### 11.2 Ürün funnel'ı

Önerilen olaylar:

```text
client_home_viewed
search_started
search_result_viewed
clinic_profile_viewed
service_selected
slot_selected
booking_contact_started
booking_submitted
booking_succeeded
booking_failed
account_claim_started
account_claim_succeeded
appointment_cancelled
appointment_rescheduled
pwa_install_prompted
pwa_installed
```

Kurallar:

- Olaylara sağlık şikâyeti, serbest metin veya gereksiz PII eklenmez.
- Aynı event hem client hem server tarafından iki kez sayılmaz.
- Funnel eventleri sürümlenir ve dokümante edilir.

### 11.3 Pilot KPI'ları

- Aramadan klinik profiline geçiş oranı
- Klinik profilinden slot seçimine geçiş
- Slot seçiminden başarılı randevuya dönüşüm
- Booking hata oranı
- Randevu tamamlanma oranı
- İptal/no-show oranı
- PWA tekrar ziyaret oranı
- Kullanıcı başına destek talebi

---

## 12. Test Stratejisi

### 12.1 Unit test

- Appointment state transitions
- Availability hesaplama
- Timezone dönüşümü
- Input validation
- Role/permission kararları
- API error mapping
- Idempotency davranışı

### 12.2 Integration test

- Availability API geçerli JSON döndürür
- Slot doluyken booking reddedilir
- Aynı idempotency key ikinci kayıt oluşturmaz
- Cross-tenant erişim reddedilir
- Guest booking başarılı olur
- Booking kullanıcıya güvenli şekilde bağlanır
- Notification failure booking transaction'ını bozmadan retry üretir

### 12.3 E2E test

Minimum senaryolar:

1. Ziyaretçi klinik arar ve detayını açar.
2. Ziyaretçi hizmet ve slot seçerek misafir randevu alır.
3. Aynı slot iki ayrı oturumdan alınmaya çalışılır; biri güvenli şekilde reddedilir.
4. Kullanıcı giriş yapar ve yalnız kendi randevularını görür.
5. Kullanıcı izin verilen sürede randevuyu iptal eder.
6. Availability servisi hata verir; kullanıcı dostu hata ve tekrar dene gösterilir.
7. Sağlık Pasaportu beta kapsamında kapalı kalır.
8. PWA install prompt kapatıldıktan sonra hemen tekrar görünmez.

### 12.4 Cihaz matrisi

- iPhone Safari: küçük ve büyük ekran
- Android Chrome: küçük ve orta ekran
- Desktop Chrome
- Safari desktop temel kontrol
- Yavaş ağ ve offline durumu
- Klavye navigasyonu

---

## 13. Fazlara Ayrılmış Uygulama Planı

## Faz 0 — Güvenli Çalışma Zemini

**Amaç:** Kod yapısını doğrulamak ve sonraki değişiklikleri güvenli hâle getirmek.

Görevler:

- Repository ve package scriptlerini haritala.
- PWA, `mobile/` ve `web-mobile/` tekrarlarını raporla.
- Mevcut production davranışını testlerle sabitle.
- `.env.example` dosyasını güvenli değişken adlarıyla güncelle.
- Migration durumunu incele; production DB'ye manuel DDL ekleme.
- CI içinde lint, typecheck, unit test ve build zorunlu kontrollerini belirle.
- Repo kökünde kısa ve doğru `AGENTS.md` oluştur veya mevcut olanı iyileştir.

Faz kabul kapısı:

- Değişiklik kapsamı bilinmektedir.
- Test komutları belirlenmiştir.
- Production secret hiçbir dosyaya yazılmamıştır.
- Mobil yüzeylerden hangilerinin aktif olduğu belgelenmiştir.

## Faz 1 — P0 Randevu ve Veri Güvenilirliği

**Amaç:** Canlı randevu akışını uçtan uca çalıştırmak.

Görevler:

- Empty/invalid availability response kök nedenini bul.
- Endpoint'in her code path'te geçerli response döndürmesini sağla.
- Client response parsing'i güvenli hâle getir.
- Ham hata toast'unu kullanıcı dostu hata bileşeniyle değiştir.
- Retry davranışını sınırla.
- Availability ve booking integration testleri ekle.
- Booking create idempotency uygula.
- Double-booking için transaction/constraint stratejisi uygula.
- Demo İstanbul/Ataşehir verisini production görünümünden kaldır.
- Türkçe karakter ve lokasyon tutarlılığını düzelt.
- Sahte/hardcoded `Bugün 10:00` gösterimini kaldır.

Faz kabul kapısı:

- Gerçek bir test kliniğinde hizmet seçimi tamamlanır.
- Gün ve saatler yüklenir.
- Randevu yalnız bir kez oluşur.
- Kullanıcı başarı ekranı ve referans kodu görür.
- Availability hata verdiğinde ham exception görünmez.
- Faz testleri ve production build başarılıdır.

## Faz 2 — Keşif, Arama ve Güven

**Amaç:** Kullanıcının doğru kliniği güvenle seçebilmesini sağlamak.

Görevler:

- Gerçek arama inputu ekle.
- Search query state ve URL parametrelerini düzenle.
- Branş/bölge/müsaitlik filtrelerini veri desteğine göre uygula.
- Desteklenmeyen `5 km` filtresini konum sistemi tamamlanana kadar gizle.
- Klinik/doktor detay ekranı oluştur.
- Doğrulama, adres, hizmet, süre, fiyat ve müsaitlik bilgilerini göster.
- Profesyonel placeholder ve image fallback ekle.
- Empty/loading/error durumlarını tamamla.
- Klinik kartlarını gerçek DTO ile besle.

Faz kabul kapısı:

- Kullanıcı isim, klinik, branş ve hizmetle arama yapabilir.
- Sonuç filtreleri geri/ileri navigasyonda korunur.
- Klinik detayından seçili hizmetle booking'e geçilir.
- Eksik veri sahte bilgiyle doldurulmaz.

## Faz 3 — Auth, Profil ve Randevu Sahipliği

**Amaç:** Misafir ve kayıtlı hasta akışını güvenli biçimde birleştirmek.

Görevler:

- Tek güvenilir auth yöntemini tamamla.
- Kayıt, doğrulama, giriş, çıkış ve recovery akışını tamamla.
- Password visibility ve form validation ekle.
- Auth rate limiting uygula.
- Guest booking claim akışı tasarla.
- Person/identity otomatik eşleştirmesini doğrulama kapısına al.
- Kullanıcının yalnız kendi randevularını görmesini test et.
- Gizlilik ve koşul linklerini ekle.

Faz kabul kapısı:

- Auth başarısızlığında korunan veri dönmez.
- Kullanıcı başka hastanın randevusuna erişemez.
- Misafir randevusu doğrulanmış kullanıcıya güvenli şekilde bağlanabilir.
- Recovery akışı production benzeri ortamda test edilmiştir.

## Faz 4 — Randevu Yönetimi ve Bildirimler

**Amaç:** Randevu sonrası deneyimi tamamlamak.

Görevler:

- Yaklaşan/geçmiş randevular.
- Durum geçmişi.
- İptal politikası ve iptal akışı.
- Yeniden planlama.
- Takvime ekleme.
- En az bir gerçek bildirim kanalını uçtan uca çalıştırma.
- Notification outbox/retry.
- Delivery status gözlemlenebilirliği.
- Tamamlanan randevu için doğrulanmış yorum.

Faz kabul kapısı:

- Randevu durumu panel ve hasta yüzeyinde tutarlıdır.
- İptal ve yeniden planlama izinleri server-side uygulanır.
- Bildirim hatası izlenir ve tekrar denenir.

## Faz 5 — Tasarım, Erişilebilirlik ve Performans

**Amaç:** Çalışan ürünü profesyonel kalite seviyesine getirmek.

Görevler:

- Tasarım tokenlarını merkezileştir.
- Tekrarlanan bileşenleri standardize et.
- Header/breadcrumb tutarsızlıklarını gider.
- PWA install prompt zamanlamasını düzelt.
- Bottom nav safe-area ve içerik padding'ini doğrula.
- Hero image ve kritik render performansını iyileştir.
- Web vitals ölç.
- WCAG AA kontrolü yap.
- Klavye, screen reader ve reduced motion testleri yap.
- Tüm empty/error/loading durumlarını görsel olarak doğrula.

Faz kabul kapısı:

- Kritik ekranlarda mobil taşma ve navigasyon çakışması yoktur.
- Ham teknik hata görünmez.
- Accessibility smoke testleri geçer.
- Belirlenen performans bütçesini aşan regresyon yoktur.

## Faz 6 — Pilot ve Yayın Hazırlığı

**Amaç:** 2–3 gerçek klinikle kontrollü pilot başlatmak.

Görevler:

- Staging ve production environment ayrımını doğrula.
- Migration ve rollback planı hazırla.
- Seed/demo verisini production'dan ayır.
- Pilot klinik onboarding kontrol listesi hazırla.
- Klinik çalışma saatleri ve hizmetlerini doğrula.
- Gizlilik politikası ve kullanım koşullarını tamamla.
- Destek ve incident sürecini tanımla.
- Dashboard/alert kurallarını kur.
- Release checklist ve smoke test uygula.
- Pilot KPI dashboard'u oluştur.

Faz kabul kapısı:

- P0/P1 açık hata yoktur.
- Güvenlik kapıları geçmiştir.
- Testler ve production build başarılıdır.
- Rollback adımları yazılıdır.
- Pilot klinik verileri doğrulanmıştır.

---

## 14. Önceliklendirilmiş Backlog

| Öncelik | İş | Sonuç |
|---|---|---|
| P0 | Availability JSON hatasını düzelt | Randevu akışı açılır |
| P0 | Ham teknik hataları gizle ve logla | Profesyonel hata deneyimi |
| P0 | Double-booking ve idempotency | Veri güvenilirliği |
| P0 | Tenant ve rol izolasyonu | Klinik verisi güvenliği |
| P0 | Demo lokasyon/saat verisini temizle | Kullanıcı güveni |
| P1 | Gerçek arama inputu | Keşif kullanılabilirliği |
| P1 | Klinik/doktor detay ekranı | Karar ve güven |
| P1 | Auth ve identity resolve güvenliği | Hasta sahipliği |
| P1 | Randevularım/iptal/yeni planlama | Tam ürün döngüsü |
| P1 | En az bir canlı bildirim kanalı | Operasyon güvenilirliği |
| P2 | PWA install deneyimi | Retention |
| P2 | Tasarım sistemi standardizasyonu | UI tutarlılığı |
| P2 | Verified review | Güven döngüsü |
| P3 | Sağlık Pasaportu | Beta sonrası büyüme |
| P3 | Expo iOS/Android | Ürün doğrulaması sonrası mağaza |
| P3 | AI Front Desk | Operasyon verisi oluştuktan sonra |

---

## 15. Definition of Done

Bir görev yalnızca kod yazıldığında tamamlanmış sayılmaz. Aşağıdakilerin tümü sağlanmalıdır:

- İstenen davranış uygulanmıştır.
- İlgili unit/integration/E2E testi eklenmiş veya güncellenmiştir.
- Lint başarılıdır.
- Typecheck başarılıdır.
- İlgili testler başarılıdır.
- Production build başarılıdır.
- Güvenlik ve tenant etkisi değerlendirilmiştir.
- Loading, empty ve error durumları ele alınmıştır.
- Mobil görünüm kontrol edilmiştir.
- Erişilebilirlik temel kontrolü yapılmıştır.
- Migration varsa rollback/geri dönüş etkisi açıklanmıştır.
- Secret veya PII loglanmamıştır.
- Değiştirilen dosyalar ve nedenleri raporlanmıştır.
- Bilinen risk veya takip işi açıkça yazılmıştır.

Kontrol çalıştırılamadıysa görev `tamamlandı` olarak raporlanamaz; `uygulandı fakat doğrulanamadı` olarak işaretlenmelidir.

---

## 16. Yayın Kapıları

Production/pilot yayını öncesinde:

- [ ] Randevu akışı gerçek klinik verisiyle uçtan uca çalışıyor.
- [ ] Invalid JSON/empty response problemi kapalı.
- [ ] Aynı slot iki kez alınamıyor.
- [ ] Idempotency testi geçiyor.
- [ ] Cross-tenant testleri geçiyor.
- [ ] Owner → SUPER_ADMIN açığı kapalı.
- [ ] Auth fail-closed çalışıyor.
- [ ] Kimlik eşleştirme doğrulanmış sahiplik istiyor.
- [ ] Production'da demo İstanbul verisi yok.
- [ ] Ham teknik hata kullanıcıya gösterilmiyor.
- [ ] En az bir gerçek notification kanalı çalışıyor.
- [ ] Rate limit production'da aktif.
- [ ] Migration planı ve backup/rollback süreci hazır.
- [ ] Gizlilik ve kullanım koşulları erişilebilir.
- [ ] Mobil Safari ve Android Chrome smoke testleri geçiyor.
- [ ] Sentry/log örnekleme ve PII filtresi doğrulandı.
- [ ] Sağlık Pasaportu hazır değilse kapalı.
- [ ] P0 ve P1 seviyesinde açık hata yok.

---

## 17. Cursor Çalışma Protokolü

Cursor her görevde aşağıdaki sırayı izlemelidir.

### 17.1 Başlamadan önce

1. Bu belgeyi oku.
2. Repository'deki en yakın `AGENTS.md` ve yerel talimatları oku.
3. `package.json` scriptlerini ve package manager'ı doğrula.
4. İlgili dosyaları, testleri ve veri akışını bul.
5. Mevcut davranışı yeniden üret.
6. En küçük uygulanabilir değişiklik planını yaz.

### 17.2 Kodlama sırasında

- İlgisiz refactor yapma.
- Aynı turda yeni özellik ve geniş mimari değişikliği birleştirme.
- Production verisine veya migration geçmişine kör müdahale yapma.
- Gizli anahtar üretme veya dosyaya yazma.
- Testleri geçmek için güvenlik kontrolünü gevşetme.
- TypeScript hatalarını `any` veya `@ts-ignore` ile saklama.
- Ham exception'ı kullanıcıya gösterme.
- API contract değişirse tüm consumer ve testleri güncelle.

### 17.3 Doğrulama sırasında

Önce repository'nin gerçek scriptlerini kullan. Tipik kontroller:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm playwright test
```

Script mevcut değilse isim uydurma; var olan scriptleri raporla ve gerekli eksik scripti ayrı değişiklik olarak öner.

### 17.4 Her görev sonu raporu

```text
Amaç:

Kök neden:

Yapılan değişiklikler:
- dosya yolu — değişiklik nedeni

Güvenlik/veri etkisi:

Çalıştırılan kontroller:
- komut — sonuç

Kabul kriterleri:
- kriter — geçti/kaldı

Kalan riskler:

Sonraki önerilen tek görev:
```

---

## 18. Faz Bazlı Cursor Komutları

### 18.1 Faz 1 başlangıç komutu

```text
@ASISTAN_PRO_PRODUCT_DEVELOPMENT_PLAN.md belgesindeki yalnızca Faz 1'i ele al.

Canlı davranışta hizmet seçildikten sonra tarih/saat ekranında
"Failed to execute 'json' on 'Response': Unexpected end of JSON input"
hatası görülüyor ve slotlar yüklenmiyor.

Önce hatayı repository içinde yeniden üret ve request zincirini izle.
Availability endpoint'inin tüm response yollarını, client parsing kodunu,
auth/tenant kontrollerini ve ilgili logları incele.

Önce kök neden ve dosya bazlı planı yaz. Ardından en küçük güvenli düzeltmeyi uygula.
Endpoint her durumda geçerli contract dönsün; ham hata kullanıcıya gösterilmesin.
Unit/integration test ekle. İlgisiz UI refactor yapma.

Sonunda lint, typecheck, ilgili testler ve production build çalıştır.
Değiştirilen dosyaları, test sonuçlarını ve kalan riskleri raporla.
```

### 18.2 Faz 2 başlangıç komutu

```text
@ASISTAN_PRO_PRODUCT_DEVELOPMENT_PLAN.md belgesindeki Faz 2'yi uygula.
Faz 1 kabul kapısının geçtiğini önce doğrula; geçmediyse kodlama yapmadan raporla.

Gerçek arama inputu, desteklenen filtreler ve klinik/doktor detay ekranı oluştur.
Mevcut tasarım dilini koru fakat rastgele stil ekleme; mevcut token ve componentleri kullan.
Desteklenmeyen konum/fiyat filtresini çalışıyormuş gibi gösterme.
UI sahte müsaitlik, puan veya fiyat üretmesin.

Önce mevcut route, API ve veri modelini analiz et. Sonra küçük adımlarla uygula.
Search, empty, loading ve error testlerini ekle. Mobil ve klavye kullanımını doğrula.
```

### 18.3 Faz 3 başlangıç komutu

```text
@ASISTAN_PRO_PRODUCT_DEVELOPMENT_PLAN.md belgesindeki Faz 3'ü uygula.
Önce mevcut Supabase/Auth session, Person/GPI resolve ve booking ownership akışını haritala.

Owner/clinic/user kimliklerini karıştırma. Telefon veya e-posta metni eşleşmesiyle
otomatik hasta bağlama yapma. Doğrulanmış sahiplik kapısı tasarla.

Giriş, kayıt, doğrulama, recovery, çıkış ve guest-booking claim akışını tamamla.
Auth fail-closed olmalı. Cross-user ve cross-tenant integration testleri ekle.
Kullanıcıya hesap varlığını ifşa eden hata mesajı döndürme.
```

### 18.4 Faz 5 kalite komutu

```text
@ASISTAN_PRO_PRODUCT_DEVELOPMENT_PLAN.md belgesindeki Faz 5 için kalite denetimi yap.
Önce kod değiştirmeden ana sayfa, klinik listesi, klinik detayı, booking, bookings,
profile ve PWA install yüzeylerini denetle.

Mobil taşma, safe-area, bottom-nav örtüşmesi, focus state, contrast, loading,
empty/error state, image performance ve gereksiz client JavaScript sorunlarını listele.
Sorunları P0/P1/P2 olarak sırala. Ardından yalnız onaylanan P0/P1 düzeltmeleri uygula.
Her değişiklik için görsel/işlevsel kabul kriteri ve test ekle.
```

---

## 19. Ana Master Prompt

Aşağıdaki komut, yeni bir Cursor çalışma oturumunda bu planı başlatmak için kullanılabilir:

```text
Sen Asistan ürününün principal engineer, ürün odaklı teknik lider ve güvenlik sorumlususun.

@ASISTAN_PRO_PRODUCT_DEVELOPMENT_PLAN.md bu repository için bağlayıcı ürün ve mühendislik planıdır.
Mevcut çalışan davranışı, repository kodu ve test sonuçları tahminden üstündür.

Kurallar:
1. Önce repository'yi ve ilgili talimat dosyalarını incele.
2. Kod değiştirmeden önce mevcut davranışı ve kök nedeni doğrula.
3. Belgedeki faz sırasını koru.
4. Her turda yalnızca tek fazın sınırlı bölümünü uygula.
5. İlgisiz refactor veya teknoloji değişimi yapma.
6. Güvenlik kontrolünü test geçmesi için gevşetme.
7. Sahte klinik, fiyat, puan veya müsaitlik üretme.
8. Ham exception ve PII kullanıcıya/loglara sızdırma.
9. Her değişikliği test et; lint, typecheck, test ve build sonuçlarını raporla.
10. Kanıtlanmamış işi tamamlanmış olarak işaretleme.

İlk görev:
Kod değiştirmeden Faz 0 keşfini tamamla. /client ve /book/[slug] akışlarını,
availability/booking API zincirini, auth/tenant sınırlarını, mobile/web-mobile tekrarlarını
ve test altyapısını haritala.

Ardından şu formatta rapor ver:
- Mevcut mimari
- Canlı hatanın kök neden adayları
- Güvenlik riskleri
- Korunacak/dondurulacak yüzeyler
- Faz 1 için dosya bazlı uygulama planı
- Çalıştırılacak doğrulama komutları

Bu ilk görevde hiçbir dosyayı değiştirme.
```

---

## 20. Ürünün Profesyonel Beta Olarak Kabul Edilmesi

Asistan aşağıdaki durum gerçekleştiğinde profesyonel beta sayılabilir:

1. Kullanıcı gerçek klinik arayabilir.
2. Klinik ve doktor hakkında karar vermeye yetecek güven bilgisi görebilir.
3. Gerçek müsaitliği görüntüleyebilir.
4. Hesap açmadan veya güvenli hesapla yalnız bir randevu oluşturabilir.
5. Randevu durumu klinik paneli ve hasta yüzeyinde tutarlı kalır.
6. Kullanıcı yalnız kendi verisini görür.
7. Ham teknik hata, demo veri ve sahte ürün sinyali production'da görünmez.
8. Kritik güvenlik ve yayın kapıları geçer.
9. 2–3 gerçek klinik kontrollü pilotta ürünü kullanabilir.
10. Ürün funnel'ı ve teknik hata oranları ölçülebilir.

Bu seviyeye ulaştıktan sonra Expo ile iOS/Android mağaza uygulaması ayrı bir ürün fazı olarak başlatılabilir. Expo uygulaması mevcut güvenli API contractlarını ve tasarım tokenlarını kullanmalı; web PWA'nın iş mantığını kopyalayan ikinci bir bağımsız backend oluşturmamalıdır.

---

## Son Karar

Asistan'ın profesyonelleşmesindeki ilk hedef yeni ekran eklemek değildir. İlk hedef:

> Gerçek klinik verisiyle, güvenli ve kesintisiz çalışan bir randevu döngüsü oluşturmaktır.

Bu döngü güvenilir olduktan sonra arama, klinik profili, kullanıcı hesabı, bildirimler, Sağlık Pasaportu ve native mobil uygulama kontrollü biçimde büyütülecektir.
