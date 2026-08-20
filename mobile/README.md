# Asistan Rezervasyon — Mobile (Expo)

Bu klasor, Asistan Rezervasyon hasta mobil uygulamasidir (Expo).
Ayni backend ve `/api/client/*` API'lerini kullanir — Flutter yoktur.

## 1) Ortam Degiskenleri

`mobile/.env` dosyasi olusturun:

```bash
EXPO_PUBLIC_API_BASE_URL=https://kktc.asistan.online
EXPO_PUBLIC_API_BASE_URL_WEB=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

Yerel gelistirmede API icin `http://<WEB_SERVER_IP>:3000` kullanin.

Not:
- Web (Expo Web) testinde `EXPO_PUBLIC_API_BASE_URL_WEB` kullanin.
- Fiziksel telefonda testte `localhost` yerine bilgisayar IP adresini kullanin.
- Mobil uygulama `/api/client/*` endpointlerine gider; fake veri yoktur.
- PowerShell execution policy hatasi alirsaniz `npm` yerine `npm.cmd` kullanin.

## 2) Kurulum

```bash
cd mobile
npm install
```

## 3) Calistirma

```bash
npm run dev
```

Kok dizinden kisayol:

```bash
npm run mobile:dev
```

Web istemciyi backend ile birlikte tek komutta calistirmak icin (onerilen):

```bash
npm run web:full
```

Kok dizinden ayni komut:

```bash
npm run mobile:web:full
```

Bu komut hem `next dev` (http://localhost:3000) hem Expo Web sunucusunu
ayaga kaldirir; `ERR_CONNECTION_REFUSED` hatasini engeller.

## Rotalar

- `/client` → Keşfet (`search`)
- `/client/search`
- `/client/appointments` — randevu listesi / iptal / erteleme
- `/client/health` — Asistan pasaportu
- `/client/profile`
- `/client/notifications` (profil üzerinden)
- `/client/onboarding`
- `/client/clinics/[id]`
- `/client/doctors/[id]`
- `/client/book/[doctorId]` — ≤3 adım randevu
