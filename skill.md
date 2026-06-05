# Skills Matrix – Asistan-webv2 (Production Ready)

> **Proje:** KKTC Klinik Yönetim Sistemi + Asistan Rezervasyon Mobil Uygulaması  
> **Teknoloji Stack:** Next.js 16 / Supabase / TypeScript (Web) + React Native (Mobil)  
> **Hedef:** Production-ready, ölçeklenebilir, güvenli SaaS platformu + mobil client

---

## 1. Temel Teknik Yetkinlikler (Zorunlu – Web)

| Alan | Teknolojiler / Yetkinlikler | Seviye |
|------|-----------------------------|--------|
| **Frontend** | Next.js 16 (App Router), React Server Components, TypeScript, Tailwind CSS, shadcn/ui, Zustand / React Query | İleri |
| **Backend** | Next.js API Routes, Server Actions, Prisma ORM, Supabase (Auth, RLS, Realtime, Storage) | İleri |
| **Database** | PostgreSQL (Supabase), migration stratejileri, indeksleme, sorgu optimizasyonu | İleri |
| **Testing** | Playwright (E2E), Vitest (unit), React Testing Library, MSW | Orta / İleri |
| **DevOps** | Vercel / AWS deployment, GitHub Actions, environment management, monitoring (Sentry, Logtail) | Orta / İleri |
| **Security** | OWASP Top 10, KVKK / GDPR uyumu, Supabase RLS, rate limiting, JWT, CORS | Orta / İleri |

---

## 2. Mobil Uygulama Yetkinlikleri (Asistan Rezervasyon Client)

| Alan | Teknolojiler / Yetkinlikler | Seviye |
|------|-----------------------------|--------|
| **Mobil Framework** | React Native (Expo veya Bare) | İleri |
| **Alternatif** | Flutter (opsiyonel, tercih React Native) | Orta / İleri |
| **Platform Bilgisi** | iOS (Swift/Obj-C) ve Android (Kotlin/Java) temelleri | Orta |
| **Backend Entegrasyonu** | RESTful API, WebSocket (Supabase Realtime), GraphQL (opsiyonel) | İleri |
| **State Yönetimi** | Redux Toolkit, Zustand, Context API veya Bloc/Cubit (Flutter) | İleri |
| **UI/UX** | Native modül entegrasyonu, pixel-perfect UI, animasyonlar, gesture handling | Orta / İleri |
| **Test** | Jest, React Native Testing Library, Detox (E2E), Maestro | Orta |
| **Dağıtım** | App Store Connect (iOS), Google Play Console (Android), TestFlight, Internal/Open beta | Orta |
| **Push Notifications** | Firebase Cloud Messaging (FCM), APNS | Orta |
| **Offline First** | AsyncStorage, SQLite, Redux Persist | Orta |
| **Güvenlik** | JWT storage (SecureStore/Keychain), SSL pinning, code obfuscation | Orta |
| **Domain (Sektör)** | Sağlık sektörü, randevu sistemleri, hasta verisi yönetimi | Tercihen |

---

## 3. Rol Bazlı Yetkinlik Matrisi

### 3.1. Senior Frontend Developer (Web)
- Next.js 15+ App Router, parallel & intercepting routes
- React Server Components, Client Components optimizasyonu
- TypeScript (strict mode, generics, utility types)
- Tailwind CSS + shadcn/ui özelleştirme, tema desteği (dark/light)
- State yönetimi: React Query (server state), Zustand (client state)
- WebSocket / Realtime (Supabase Realtime ile bildirimler)
- PWA, offline support, performans optimizasyonu (Lighthouse >90)
- Responsive tasarım, mobil-first, erişilebilirlik (WCAG 2.1 AA)

### 3.2. Senior Backend / Fullstack Developer
- Next.js API routes, middleware, Server Actions
- Prisma ORM (schema design, migrations, indexes)
- Supabase entegrasyonu: Auth, RLS politikaları, Storage, Edge Functions
- Veritabanı tasarımı (normalizasyon, performans, sharding stratejileri)
- RESTful API tasarımı, versioning, dokümantasyon (OpenAPI)
- Queue sistemleri (BullMQ / Upstash) – e-posta/SMS gönderimi için
- Hata yönetimi, logging (Sentry, Pino)

### 3.3. Senior Mobile Developer (React Native – Tercih Edilen)
- React Native (Expo veya Bare) ile sıfırdan uygulama geliştirme
- TypeScript ile tip güvenli mobil kod
- Supabase Realtime ile gerçek zamanlı randevu senkronizasyonu
- Push notification (FCM + APNS) entegrasyonu
- Offline-first yaklaşım (AsyncStorage, Redux Persist)
- Mobil cihaz özellikleri (kamera, konum, takvim) entegrasyonu
- App Store & Google Play yayınlama süreçleri
- Test stratejileri (unit, integration, E2E)

### 3.4. DevOps / Cloud Engineer
- Vercel proje yönetimi (preview/production deployment)
- GitHub Actions CI/CD (test, lint, build, deploy)
- Docker + Docker Compose (yerel geliştirme, staging)
- Monitoring: Sentry (errors), Logtail (logs), Supabase Logs
- Backup stratejileri (Supabase point-in-time recovery)
- Performans izleme (Vercel Analytics, Core Web Vitals)
- **Mobil CI/CD** – Fastlane, Bitrise veya GitHub Actions ile otomatik build & beta dağıtımı

### 3.5. QA & Test Otomasyon Mühendisi
- Playwright (E2E web test)
- Vitest + React Testing Library (birim test)
- API test (Supertest, Postman koleksiyonları)
- **Mobil test:** Detox / Maestro (E2E), Jest (unit)
- Test senaryoları yazma (Gherkin / Cucumber opsiyonel)
- CI/CD entegrasyonu, test raporlaması
- Manual test planları, regresyon test süreçleri

### 3.6. UI/UX Tasarımcı
- Figma (design system, component library, prototyping)
- Sağlık sektörü UX ihtiyaçları (randevu akışları, hasta profili)
- WCAG 2.1 AA erişilebilirlik standartları
- Kullanıcı araştırması, journey mapping, A/B test hazırlığı
- Responsive web + mobil uyumlu tasarım (iOS Human Interface, Material Design)

### 3.7. AI/ML Mühendisi (Gelecek Faz)
- OpenAI / Anthropic API entegrasyonu (AI randevu asistanı)
- Prompt engineering, agent orchestration
- Veri analizi (randevu no-show tahmini, yoğunluk öngörüsü)
- Doğal dil işleme (chatbot hasta triyajı)

---

## 4. Proje Yönetimi ve Süreç Yetkinlikleri

- **Agile / Scrum** – Sprint planlama, daily, retrospective
- **Jira / Linear / Trello** – Görev takibi, backlog yönetimi
- **Git Flow** – branch stratejisi, pull request review süreci
- **Code Review** – Kod kalitesi standartları, güvenlik kontrolleri
- **Dokümantasyon** – Teknik doküman, API dokümanı, kullanıcı kılavuzları
- **Change Management** – Deployment öncesi onay süreçleri, rollback planları

---

## 5. Domain (Sektörel) Yetkinlikler

- **Sağlık sektörü iş akışları** – Hasta randevu, klinik yönetimi, e-reçete (opsiyonel)
- **KVKK / GDPR** – Kişisel sağlık verilerinin işlenmesi, saklanması
- **Veri güvenliği** – Uçtan uca şifreleme, denetim kayıtları (audit logs)
- **Ödeme entegrasyonları** – İyzico / Stripe (abonelik ödemeleri)

---

## 6. Araçlar ve Altyapı (Toolchain)

| Kategori | Araçlar |
|----------|---------|
| Kod editörü | VS Code + Blackbox AI (Chairman LLM) |
| Versiyon kontrol | GitHub (Git Flow) |
| CI/CD | GitHub Actions, Vercel Deploy, Fastlane (mobil) |
| Proje yönetimi | Linear / Jira |
| Test (Web) | Playwright, Vitest, Storybook |
| Test (Mobil) | Detox, Maestro, Jest |
| Monitoring | Sentry, Logtail, Vercel Analytics |
| Database | Supabase (PostgreSQL) |
| Tasarım | Figma |
| İletişim | Slack / Discord |

---

## 7. Soft Skills (Kişisel Yetkinlikler)

- Proaktif iletişim, ekip içi iş birliği
- Problem çözme ve analitik düşünme
- Zaman yönetimi, önceliklendirme
- Öğrenmeye açıklık (yeni teknolojileri hızla benimseme)
- Müşteri / kullanıcı odaklı düşünme
- **Mobil için:** Detay odaklılık, platform farklılıklarına hakimiyet

---

## 8. Seviye Tanımları

| Seviye | Açıklama |
|--------|-----------|
| **Temel** | Konuyu bilir, basit görevleri bağımsız yapabilir, yardımla karmaşık görevleri çözer. |
| **Orta** | Bağımsız çalışır, karmaşık görevleri çözebilir, takım arkadaşlarına yardım eder. |
| **İleri** | Çok karmaşık görevleri çözer, liderlik eder, stratejik kararlar alır, sistem tasarlar. |

---

**Hazırlayan:** Asistan-webv2 Proje Ekibi  
**Versiyon:** 2.0 (Mobil Yetkinlikler Eklendi)  
**Tarih:** Haziran 2026