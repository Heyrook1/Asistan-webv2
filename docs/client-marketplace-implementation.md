# Asistan Client Marketplace - Uygulama Notlari

Bu implementasyon, hasta-facing mobil uygulamayi mevcut Asistan Health
veritabaniyla ortak calisacak sekilde kurar.

## Backend

- Yeni Prisma modelleri:
  - `ClientUser`
  - `ServiceStaff`
  - `TeamMemberAvailability`
  - `TeamMemberUnavailableBlock`
  - `Review`
  - `ClientNotification`
- `Appointment` genisletmesi:
  - `clientUserId`
  - `source` (`DASHBOARD` | `CLIENT_APP`)
- `TeamMember` genisletmesi:
  - `specialty`, `bio`, `isBookable`
- `Business` genisletmesi:
  - `locationLat`, `locationLng`
  - `autoConfirmClientAppointments`

## Kritik Kural

Slotlar sadece sunucudan hesaplanir:

- `lib/client-marketplace/availability.ts`
  - `getAvailableSlots({ doctorId, serviceId, date, businessId, locationId })`
  - Sadece aktif doktor + aktif hizmet + aktif availability kurallarindan slot uretir.
  - `Appointment` ve `TeamMemberUnavailableBlock` cakismalarini dislar.
  - Hizmet suresine gore slotu dogrular.
  - Gecmis saatleri dislar.

## Booking Akisi

- Endpoint: `POST /api/client/bookings`
- Sunucu tarafinda:
  1. transaction (`Serializable`) acilir
  2. ayni doktor/tarih aktif randevular `FOR UPDATE` ile kilitlenir
  3. `getAvailableSlotsTx` ile slot tekrar hesaplanir
  4. slot doluysa:
     - `Bu saat az önce doldu. Lütfen başka bir saat seçin.`
  5. `Patient` bulunur/olusturulur
  6. `Appointment` olusturulur (`source=CLIENT_APP`)
  7. Dashboard ve client bildirimleri olusturulur

## API Yuzeyi

- `GET/PUT /api/client/profile`
- `GET /api/client/search`
- `GET /api/client/clinics/[id]`
- `GET /api/client/doctors/[id]`
- `GET /api/client/availability`
- `POST /api/client/bookings`
- `GET /api/client/appointments`
- `GET/PATCH /api/client/notifications`
- `GET/POST /api/client/reviews`

## Mobil Uygulama (Expo Router)

`mobile/app/client` altinda:

- `/client`
- `/client/onboarding`
- `/client/search`
- `/client/clinics/[id]`
- `/client/doctors/[id]`
- `/client/book/[doctorId]`
- `/client/appointments`
- `/client/notifications`
- `/client/profile`

Auth:

- `/(auth)/login`
- `/(auth)/sign-up`

## Uygulama Sonrasi Yapilacaklar

1. Migration calistir:
   - `npx prisma migrate deploy` veya Supabase SQL migration akisi
2. Prisma client generate:
   - `node scripts/prisma-generate.mjs`
3. Doktor availability kurallari gir:
   - `TeamMemberAvailability`
4. Gerekirse hizmet-doktor eslestirmeleri:
   - `ServiceStaff`

