# Asistan Health

AI destekli klinik, randevu, hasta, ekip, tedavi, dosya ve iş akışı yönetim
platformu. Next.js 16 + TypeScript + Prisma + PostgreSQL (Supabase) +
Tailwind v4 + shadcn (new-york) üzerine kuruludur.

## Çalıştırma

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) adresinden açabilirsiniz.

Mobil web istemciyi backend ile birlikte tek komutta acmak icin:

```bash
npm run mobile:web:full
```

## Ortam Değişkenleri

`.env` dosyasında:

```
DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://...:5432/postgres?sslmode=require"
```

`.env.local` dosyasında:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
SUPABASE_SERVICE_ROLE_KEY=<service-role>
```

## Veritabanı Kurulumu

Supabase SQL migrasyonları bu dizindedir:

```
supabase/migrations/*.sql
```

Tek bir eski SQL dosyasini tek basina calistirmayin; semanin tek kaynak kabul
edilen hali `prisma/schema.prisma` + sirali `supabase/migrations/*.sql`
zinciridir.

Gelistirme ortaminda hizli senkronizasyon icin Prisma schema push kullanilabilir:

```bash
pnpm db:push
pnpm db:generate
```

Production'da `prisma db push` kullanmayin. Prisma migration gecmisi kullanilan
ortamlarda deploy komutu:

```bash
pnpm db:migrate:deploy
pnpm db:generate
pnpm check:production
```

Bu projedeki RLS, Storage ve Realtime hardening SQL'leri `supabase/migrations`
altinda tutuldugu icin production Supabase veritabanina bu SQL dosyalari da
sira ile uygulanmalidir:

```bash
# Supabase Dashboard -> SQL Editor -> migrasyon SQL'lerini sirayla calistir
# veya Supabase CLI kullanan pipeline'inizla supabase/migrations dizinini deploy edin.
```

Sonra Prisma client’ı üretin:

```bash
pnpm db:generate
```

## Demo Verisi

```bash
pnpm db:seed
```

Bu komut:
- `demo@asistan.health` kullanıcısı
- "Asistan Demo Kliniği"
- 3 takım üyesi, 4 hizmet, 4 hasta
- Notlar, ilaç, alerji, tedavi, tahlil, dosya ve randevular
oluşturur.

İlk kez giriş yapan bir kullanıcı için sistem otomatik olarak yeni bir
`Business` oluşturur — yani gerçek bir Supabase Auth kullanıcısı ile de
sistem çalışır.

## Mimari

- `app/dashboard/*` — Next.js App Router sayfaları (sunucu bileşenleri)
- `components/dashboard/*` — yeniden kullanılabilir UI bileşenleri
- `lib/session.ts` — RBAC, oturum çözümleyici, yetki kontrolü
- `lib/actions/*` — `'use server'` ile işaretlenmiş Server Action’lar
- `lib/queries.ts` — Sunucu tarafı veri getirme yardımcıları
- `lib/storage.ts` — Supabase Storage yükleme yardımcısı (`patient-files` ve `message-media`)
- `prisma/schema.prisma` — tüm modeller (User, Business, Patient, Service, Appointment, vd.)
- `prisma/seed.ts` — demo veri seed scripti

## Roller

| Rol             | Varsayılan Yetkiler                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Super Admin     | tümü                                                                                                              |
| İşletme Sahibi  | tümü                                                                                                              |
| Doktor          | hasta görüntüle/düzenle, randevu yönet, dosya görüntüle, tıbbi not görüntüle, analitik görüntüle                    |
| Sekreter        | hasta görüntüle, randevu yönet, dosya görüntüle                                                                   |
| Personel        | hasta görüntüle                                                                                                   |

Sahip/ahmin kullanıcılar dışındakiler için yetkileri **Takım** sayfasından
açıp kapatabilirsiniz.

## Modüller

- **Genel Bakış** — bugünkü randevular, bekleyen onay, aktif hasta, aylık ciro, tamamlanan, iptal oranı
- **Hastalar** — listeleme, arama, etiket filtre, drawer ile detaylı kayıt
- **Hasta Detayı** — Genel Bilgi / Randevular / Notlar / İlaçlar / Alerjiler / Tedaviler / Tahliller / Dosyalar / Hasta Hikayesi sekmeleri
- **Randevular** — tüm durum filtreleri, onayla / tamamla / iptal / yeniden planla
- **Takvim** — günlük / haftalık / aylık görünüm, personel ve hizmet filtreleri, boş slota tıklayarak randevu oluşturma
- **Hizmetler** — CRUD, aktif/pasif toggle
- **Takım** — üye ekle, rol ata, izinleri toggle ile yönet
- **Bildirimler** — okundu işaretleme + toplu işaretleme
- **Analitik** — son 6 ay ciro grafiği, randevu adetleri, iptal oranı
- **Ayarlar** — işletme bilgileri, para birimi, marka rengi (sahip tarafından)

## Is Kurallari

- **Randevu yeniden planlama** - Onaylanmis bir randevu yeni tarih/saat araligina tasindiginda durum tekrar `SCHEDULED` olur. Yeni slot personel tarafindan tekrar onaylanmalidir ve ilgili kullanicilara `appointment_rescheduled` bildirimi gider.

## Uretim Guvenligi

- **Postgres RLS** - Supabase/Prisma tablolarinin RLS migrasyonlari `supabase/migrations` altindadir. Hasta, randevu, dosya, not, bildirim, mesajlasma, hatirlatma ve push aboneligi tablolari dogrudan Supabase client/API erisiminde de `auth.uid()` + isletme uyeligi/yetki politikalariyla korunur.
- **Private Storage** - `patient-files` ve `message-media` bucket'lari private olarak olusturulur; DB'de base64 payload yerine sadece `storage://...` referansi tutulur. Storage object politikalari isletme, hasta ve sohbet katilimciligini kontrol eder.
- **Production kontrolu** - canliya cikmadan once `pnpm check:production` calistirin; RLS, storage policy, realtime publication ve signed URL smoke testlerini denetler.

## Test

Birim ve bileşen testleri (Vitest + Testing Library):

```bash
pnpm test          # tek seferlik koşum (CI uyumlu)
pnpm test:watch    # geliştirme sırasında izleme modu
pnpm test:ui       # Vitest UI
```

Testler `tests/unit/**/*.{test,spec}.{ts,tsx}` altinda yasar. Setup
`vitest.setup.ts` icinden `@testing-library/jest-dom/vitest` matchers yukler.

Uctan uca testler (Playwright, Chromium):

```bash
pnpm e2e           # baslangic icin: testleri kos
pnpm e2e:ui        # Playwright UI mode
pnpm e2e:debug     # debug mode (inspector)
```

Playwright config (`playwright.config.ts`) `pnpm dev` server'ini otomatik
ayaga kaldirir (`reuseExistingServer` lokalde acik). Disardan calisan bir
server'a baglanmak icin: `E2E_BASE_URL=https://staging.example.com pnpm e2e`
ya da `E2E_SKIP_WEB_SERVER=1 pnpm e2e`.

Ilk kurulumdan sonra Chromium gerekli ise: `pnpm exec playwright install chromium`.

## Yapılacaklar (entegrasyon notları)
- **E-posta / SMS gönderimi** — bildirim oluşturulduğunda dış servise gönderim eklemek için Supabase Edge Function ya da bir webhook ekleyin.

