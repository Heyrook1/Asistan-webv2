# Asistan Health

AI destekli klinik, randevu, hasta, ekip, tedavi, dosya ve iş akışı yönetim
platformu. Next.js 16 + TypeScript + Prisma + PostgreSQL (Supabase) +
Tailwind/shadcn üzerine kuruludur.

## Çalıştırma

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) adresinden açabilirsiniz.

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

Tek bir konsolide migrasyon dosyası vardır:

```
supabase/migrations/20260518_0000_asistan_health_core.sql
```

Supabase SQL Editor’dan veya `prisma db push` ile uygulanabilir:

```bash
# Tercih edilen: ilk kurulum / dev
pnpm prisma db push

# Alternatif: Supabase Dashboard → SQL Editor → migrasyon SQL'ini yapıştır → Run
```

Sonra Prisma client’ı üretin:

```bash
pnpm prisma generate
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
- `lib/storage.ts` — Dosya yükleme yardımcısı (Supabase Storage / S3 entegrasyonu için TODO içerir)
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

## Yapılacaklar (entegrasyon notları)

- **Supabase Storage / S3** — `lib/storage.ts` içinde TODO. Şu anda dosyalar base64 olarak `PatientFile.fileUrl` alanına yazılıyor; üretimde bunu `patient-files` bucket'ına yönlendirin.
- **RLS** — şu anda yetki kontrolü Server Action katmanında yapılıyor. Üretim için Postgres RLS politikaları eklemeniz önerilir.
- **E-posta / SMS gönderimi** — bildirim oluşturulduğunda dış servise gönderim eklemek için Supabase Edge Function ya da bir webhook ekleyin.
