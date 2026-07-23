# Asistan — Enterprise Due-Diligence Audit

**$10M Seed technical & product review · KKTC healthcare booking ecosystem**
_Date: July 2026 · Reviewers-in-character: Google Staff Eng · Meta Principal Eng · Stripe CTO · Apple UX · YC Partner_

> Companion interactive dashboard: `canvases/enterprise-audit.canvas.tsx`
> Prior baseline: [`AUDIT_REPORT.md`](../AUDIT_REPORT.md) (June 2026), [`enterprise-prb-audit.md`](./enterprise-prb-audit.md) (July 2026)

Risk legend: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low/Info

---

## Verdict at a glance

| | |
|---|---|
| **Overall engineering grade** | **6.6 / 10** — above-average solo/small-team build, below fundable-scale hardening |
| **Investment recommendation** | **Conditional YES on a party-round Seed**, NOT a lead-worthy $10M yet. Fund the team + wedge, not the current moat. |
| **Biggest strength** | Disciplined product scoping + honest claim governance + real multi-surface architecture (rare for this stage) |
| **Biggest risk** | Authorization is 100% application-layer (Prisma bypasses RLS); one missing `businessId` filter = cross-tenant PHI breach in a healthcare app |
| **Kill-shot question from YC** | "You've built a beautiful clinic OS, but you monetize no-shows via SMS/deposits that don't exist yet. What have you actually proven?" |

**Evidence base:** full static review of the repository — 44 Prisma models, 30 API route handlers, 19 server-action modules, proxy-based Supabase auth, Supabase RLS migrations, CI, product docs, and pricing. Structural facts referenced repeatedly: **58% of the React tree (133/228 components) is `'use client'`**, **27 unit specs + 4 e2e specs**, and security headers omit **CSP and X-Frame-Options**.

---

## EXTRA PHASE — "If we founded this today" (OpenAI × Google × Apple × Stripe)

Brutal truth first: **you have built a very good 2019 product in 2026.** It is a well-architected clinic SaaS + booking marketplace. That category is won. Jane, Cliniko, Doktortakvim, SimplyBook, and Fresha already do agenda + patients + reminders + payments better and cheaper. Rebuilding _their_ product 10% better in a 400k-population market is not a venture outcome.

**The 10x reframe: Asistan should not be "clinic software." It should be the AI front office + the patient health identity layer for a region that has none.**

### What we would DELETE (kill your darlings)

| Feature | Why kill it |
|---|---|
| The manual clinic messaging module (`/dashboard/mesajlar`, `Conversation`/`Message` models) | You are rebuilding WhatsApp/Slack badly. Patients and staff already live in WhatsApp. Integrate, don't rebuild. |
| Dual booking routes (`/randevu` + `/book`), triple auth path aliases (`/auth/*`, `/tr/*`, `/en/*`, `/[lang]/auth/*`) | Route sprawl = maintenance tax with zero user value. Collapse to one. |
| The Expo native app (`mobile/`) shipped in parallel with PWA | You already (correctly) decided PWA-first. The Expo app is dead weight and doubles your surface area. Freeze it. |
| Hand-built recharts analytics dashboard | Nobody switches clinics for prettier bar charts. |
| Legacy `public.users/providers/customers` tables coexisting with Prisma models | Dead schema in a live PHI database. Delete. |

### The missing KILLER features (what actually wins Northern Cyprus, then the world)

1. **AI Front Desk (voice + WhatsApp), Turkish-native.** The #1 clinic pain in KKTC is: phone rings, nobody free, patient goes elsewhere. An AI agent that answers WhatsApp/phone 24/7, books into the real availability engine you already built, handles rescheduling and reminders — _that_ is the wedge. You already have the slot engine (`lib/client-marketplace/availability.ts`) and Person identity. Bolt an LLM on top. **This is your OpenAI-team move.**
2. **One patient health passport across all clinics (your `Person`/GPI model, weaponized).** Nobody in the region owns cross-clinic patient identity. Turn `Person` from a dedupe utility into a _patient-owned_ health record + booking wallet. Network effect: every clinic that joins makes the passport more valuable. **This is your moat** — deeper than any booking widget.
3. **Payments as the product, not a feature (Stripe-team move).** Deposits and no-show fees are still _unbuilt_ (Sprint 4). This should be **week one**, because it's the only thing that (a) clinics pay for instantly and (b) generates take-rate revenue on top of SaaS. Local rail: iyzico + bank transfer + card. Deposit-on-booking is a 30% no-show killer and a monetization surface competitors underuse in TR/KKTC.
4. **Outcome/insurance-grade proof loop.** Structured post-visit review + de-identified outcome data → the first regional healthcare quality dataset. Later sellable to insurers/health ministry.

### Breakthrough AI features competitors don't have

- **Ambient scribe → prescription draft** (you already have `Prescription` + printable drafts): doctor speaks, LLM drafts the note + Rx lines for one-tap confirm.
- **No-show prediction** per patient/slot (you have appointment history + `source`), auto-tuning deposit requirements.
- **Demand-shaping**: AI reschedules low-value gaps and fills them from a waitlist via WhatsApp automatically.
- **Multilingual patient concierge** (TR/EN/RU) — KKTC has heavy Russian/Turkish medical-tourism inflow you're ignoring.

### The one-line strategy

> Don't sell clinics a calendar. Sell them **an AI receptionist that never sleeps and a patient identity network they can't build alone.** Start in KKTC because you can hit 100% clinic density in a year; expand on the identity + payments rails.

---

## PHASE 1 — Repository Understanding

| # | Section | Score | Notes |
|---|---|---|---|
| 1.1 | Architecture | **8/10** | Clean modular monolith: Next.js 16 App Router, RSC + client islands, service layer in `lib/`, server actions for clinic mutations, REST for public/patient. Coherent. |
| 1.2 | Folder structure | **7/10** | Sensible (`app/`, `components/` ~166 files, `lib/` ~131 files, `contexts/`, `hooks/`). But `mobile/` + `web-mobile/` + PWA = three client surfaces; sprawl. |
| 1.3 | Tech stack | **8/10** | Modern & consistent: Next 16, React 19, TS 5.7 strict, Prisma 5, Supabase, TanStack Query, Tailwind 4, Zod, Sentry, Upstash. Bleeding edge (Next 16/React 19) = some risk. |
| 1.4 | Design patterns | **7/10** | `ActionResult<T>` discriminated unions, `import 'server-only'`, Prisma soft-delete middleware. Undermined by inconsistent REST conventions. |
| 1.5 | State management | **7/10** | React Query (staleTime 60s) + a single `LanguageContext`. Realtime is _polling_ (`/messages/since`, `/notifications/since`), not websockets — will not scale. |
| 1.6 | Authentication | **7/10** | Supabase Auth, `getUser()` (not `getSession()` — correct), `proxy.ts` session refresh. Solid foundation. |
| 1.7 | Authorization | **5/10** | RBAC in `lib/rbac.ts` (37 permissions) enforced per-page/per-action — but not in middleware, and **Prisma bypasses RLS entirely**. Single-layer defense. |
| 1.8 | Database | **7/10** | 44 models, 87 indexes, thoughtful multi-tenancy via `businessId`, ecosystem `Person` model. Migration governance weak. |
| 1.9 | API structure | **5/10** | Two parallel "APIs" (30 REST routes + 19 server-action modules), **no unified wrapper**; `apiSuccess/apiError` used in only 2/30 routes; no pagination; inconsistent envelopes. |
| 1.10 | Deployment | **7/10** | Vercel + Supabase + Upstash + Sentry, crons in `vercel.json`, `/api/health`, documented in `DEPLOYMENT.md`. Standard and fine. |
| 1.11 | CI/CD | **6/10** | One `ci.yml`: lint→test→build→e2e→production-readiness. No deploy gating on coverage, no security scan (SAST/dep-audit), pnpm version drift (CI 9 vs pkg 11). |
| 1.12 | Environment config | **7/10** | Zod-validated `lib/env.ts`, `server-only`, throws on boot. But no committed `.env.example`; verify `.env` in the working tree is never committed. |

**Phase 1 average: ~6.8/10** — architecturally mature, operationally under-hardened.

---

## PHASE 2 — Code Quality Audit

| Principle | Score | Verdict |
|---|---|---|
| SOLID | 6/10 | Good separation in `lib/*`; server actions do validation+authz+persistence+revalidation in one function (SRP leak). |
| DRY | 6/10 | `ActionResult`, shared schemas good. Duplicated cron `authorize()`, duplicated demographics `Patient` vs `Person`, copy-paste auth checks. |
| KISS | 7/10 | Mostly pragmatic. Route/auth aliasing over-complicates. |
| Clean architecture | 7/10 | Clear layering (RSC → actions/handlers → services → prisma). |
| Separation of concerns | 6/10 | REST vs server-action split for the same domain (bookings) splits logic across two paradigms. |
| Naming | 8/10 | Clear, bilingual-aware; Turkish domain terms consistent. |
| Readability | 7/10 | Generally high; some 900-line action files (`patients.ts`). |
| Maintainability | 6/10 | Hurt by dual API surfaces, migration split, 3 client surfaces. |
| Code smells | 5/10 | Custom Stripe signature parser; raw SQL table creation in `demo-booking`; unescaped HTML email; polling instead of subscriptions. |
| Technical debt | 5/10 | Legacy dead schema, stale `TODO.md`, ~25% WCAG, 6 root-level status `.md` files (audit noise). |

### Top code-quality issues

| # | Issue | Difficulty | Impact |
|---|---|---|---|
| Q1 | Custom Stripe HMAC parser instead of `stripe.webhooks.constructEvent`; no replay idempotency | Low | 🟠 High — payment correctness |
| Q2 | Dual API paradigm (REST + server actions) for same domains | High | 🟡 Med — long-term velocity |
| Q3 | Legacy `public.*` tables live in PHI DB | Low | 🟡 Med — confusion/breach surface |
| Q4 | `apiSuccess/apiError` adopted in 2/30 routes; envelope drift | Med | 🟡 Med — client fragility |
| Q5 | Prescription `protocolNo` generated via `COUNT+1` with no lock | Low | 🟠 High — duplicate/racy legal doc IDs |
| Q6 | `requireSession()` **redirects** instead of 401 in API routes | Low | 🟡 Med — breaks programmatic clients |
| Q7 | 58% components `'use client'` | Med | 🟡 Med — bundle/hydration |

**Phase 2 average: ~6.3/10.**

---

## PHASE 3 — Security Audit

The single most important finding: **your database has two doors, and only one is locked.** Prisma connects with `DATABASE_URL` and **bypasses all Postgres RLS**; RLS only protects direct Supabase-client access. So 100% of tenant isolation depends on every developer remembering to add `where: { businessId }` and a permission check, forever. In a healthcare app, that is a material breach risk and a diligence red flag.

| Area | Score | Finding |
|---|---|---|
| Authentication | 7/10 | Solid Supabase + proxy; `getUser()` used correctly. |
| Authorization | 4/10 | App-layer only; gaps below. |
| JWT | 7/10 | Handled by Supabase; Bearer for client APIs via `admin.auth.getUser`. |
| Supabase security | 6/10 | Service-role isolated to `lib/supabase/admin.ts`. |
| RLS | 4/10 | Enabled on many tables but Prisma bypasses it + `Person`/`PersonIdentityMatch` created with no RLS + inventory drift. |
| Secrets | 6/10 | Zod-validated; weak `PERSON_IDENTITY_PEPPER` fallback derives national-ID hashes from predictable material. |
| API hardening | 5/10 | Rate limiting on 6/30 routes; unauth client read APIs. |
| Rate limiting | 5/10 | Upstash + in-memory fallback that is useless across serverless instances in prod. |
| Input validation | 6/10 | Zod on many routes; missing on waitlist, intake POST, client search, polling. |
| SQL injection | 8/10 | Parameterized raw SQL throughout; no unsafe interpolation found. |
| XSS | 6/10 | Unescaped user input in demo-booking HTML email; `dangerouslySetInnerHTML` is controlled. |
| CSRF | 7/10 | Same-origin server actions + Bearer client APIs; OK. |
| SSRF | 8/10 | Outbound fetches env-configured, not user-controlled. |
| File upload | 6/10 | Size limits + sanitized names; no server-side MIME allowlist (relies on bucket config). |
| Logging / PHI | 5/10 | `tracesSampleRate: 1` in Sentry can capture PHI in spans. |

### Vulnerability register (highest severity first)

| ID | Risk | Vulnerability | Location |
|---|---|---|---|
| V1 | 🔴 | RLS-bypassing Prisma = authorization is single-layer app code; one missed filter → cross-tenant PHI | `lib/prisma.ts`, parity migration comment |
| V2 | 🔴 | `Person`/`PersonIdentityMatch` (phone, email, hashed national ID) created with no RLS | `supabase/migrations/20260715000100_global_person_identity.sql` |
| V3 | 🟠 | `/api/identity/resolve` gated by `requireSession()` only — any staff role can resolve/create global identities from a national ID | `app/api/identity/resolve/route.ts` |
| V4 | 🟠 | Weak identity pepper fallback → predictable national-ID hashes if env unset | `lib/identity/resolve.ts` |
| V5 | 🟠 | Unauthenticated client read APIs (search, clinic/doctor detail incl. reviewer full names, availability) with no rate limit | `app/api/client/{search,clinics,doctors,availability,reviews}` |
| V6 | 🟠 | Rate-limit in-memory fallback ineffective on Vercel serverless if Upstash misconfigured | `lib/security/rate-limit.ts` |
| V7 | 🟠 | Custom Stripe signature parser + no webhook idempotency | `app/api/webhooks/stripe/route.ts` |
| V8 | 🟡 | Clinic owner can self-assign `SUPER_ADMIN` to team members | `lib/actions/team.ts` |
| V9 | 🟡 | `searchPatients` / `createManualNotification` lack granular permission checks | `lib/actions/patients.ts`, `notifications.ts` |
| V10 | 🟡 | Missing security headers: no CSP, no X-Frame-Options (clickjacking) | **Remediated** — `next.config.mjs` + `proxy.ts` / `lib/security/response-headers.ts` |
| V11 | 🟡 | Sentry `tracesSampleRate: 1` may capture PHI | `sentry.server.config.ts` |
| V12 | 🟢 | `/api/health` unauth infra fingerprinting; weak waitlist email validation | `app/api/health`, `waitlist` |

**OWASP Top-10 posture:** A01 (Broken Access Control) = weak (V1–V3, V8); A02 (Crypto) = weak (V4); A05 (Misconfig) = weak (V6, V10, V11); A03/A07/A08/A10 = acceptable.

**Phase 3 average: ~5.8/10.** For a general SaaS, tolerable. For healthcare PHI raising money, the RLS-bypass posture (V1/V2) must be remediated before passing a serious buyer's or insurer's diligence.

---

## PHASE 4 — Performance Audit

| Area | Score | Finding |
|---|---|---|
| React rendering | 6/10 | 133/228 components (58%) are `'use client'` — heavy client graph for App Router. |
| Server components usage | 5/10 | Under-leveraged; many islands could be RSC. |
| Client components | 6/10 | Booking widget uses local `useState` not RHF; fine but re-render heavy. |
| Caching | 6/10 | React Query staleTime 60s; RSC `cache()`; no explicit `revalidate`/ISR strategy documented for marketing. |
| Memoization | 6/10 | `optimizePackageImports` for lucide/framer/recharts/date-fns. App-level memo unaudited. |
| Database queries | 6/10 | Indexed tenant paths; `next_patient_number` MAX-scan is O(n) per insert; N+1 risk in clinic detail aggregation. |
| Indexes | 7/10 | 87 indexes; several FKs unindexed (Phase 6). |
| Bundle size | 5/10 | recharts + framer-motion + embla + lenis + 59 UI primitives on a marketing/booking path is heavy; no analyzer in CI. |
| Lazy loading | 5/10 | Little evidence of `next/dynamic` for heavy widgets (charts, calendar). |
| Image optimization | 8/10 | Next Image WebP/AVIF, device sizes configured. Good. |
| Network / realtime | 4/10 | Polling for messages/notifications = O(users × interval) request storms at scale. |
| Hydration | 5/10 | Large client tree → higher TTI on low-end mobile (your patient PWA target). |
| LCP / Core Web Vitals | 6/10 | Self-hosted fonts + image opt help; heavy JS + lenis smooth-scroll can hurt INP/LCP. Not measured in CI. |

Biggest bottlenecks: (1) polling realtime, (2) client-component ratio + bundle, (3) patient-number MAX scan.

**Phase 4 average: ~5.7/10.**

---

## PHASE 5 — Scalability

| Users | Survive? | Why |
|---|---|---|
| 10 | ✅ | Trivially. |
| 100 | ✅ | Comfortable on Vercel + Supabase. |
| 1,000 | ✅ | Fine if Upstash is correctly configured (else rate-limit + polling degrade). |
| 10,000 | ⚠️ | Polling request volume + Supabase pooling become real; patient-number lock contention per busy clinic; need PgBouncer tuning, ISR/edge caching. |
| 100,000 | ❌ (as-is) | Polling melts function budget; single Postgres hot; no read replicas; per-tenant hot rows (`Conversation.lastMessageAt`, `VendorAccount.balance`). |
| 1,000,000 | ❌ | Needs event-driven realtime, read replicas / regional sharding, queue-based notifications, payments at scale. Architecture is _shaped_ for it (UUIDs, `Person`, `businessId`) but not _built_ for it. |

**Reality check:** KKTC TAM is hundreds of clinics / low-hundred-thousand patients. The system comfortably survives the actual near-term market. The million-user question is a future architecture problem; identity + tenancy modeling won't need a rewrite.

**Phase 5 score: 6/10 (today).**

---

## PHASE 6 — Database Review

| Area | Score | Finding |
|---|---|---|
| Schema design | 7/10 | 44 models, clear domains, ecosystem `Person` + clinic `Patient` split is forward-thinking. |
| Relationships | 7/10 | 92 explicit `onDelete`; sensible cascade/setNull/restrict. Deep Business-cascade needs soft-delete discipline. |
| Indexes | 6/10 | 87 present; missing on `Appointment.serviceId`, `Patient.assignedDoctorId`, `Prescription.appointmentId`, `Review.patientId`, `Notification.actorUserId`, `DataDeletionRequest.*`. |
| Normalization | 6/10 | Intentional snapshot denorm (prescriptions/notes) correct; `Patient` vs `Person` demographic duplication is transitional debt (`personId` still optional). |
| Scalability | 6/10 | Good UUID PKs + tenant indexing; hot rows + single DB limit ceiling. |
| Migration quality | 4/10 | No `prisma/migrations/` — evolution via 26 Supabase SQL files + manual SQL + `db push`. Schema drift proven (soft-delete indexes in DB, not in schema → `db push` could drop them). Legacy `public.*` tables never removed. |
| Deadlocks / hot rows | 5/10 | `protocolNo` COUNT+1 race; `pg_advisory_xact_lock` serializes patient creation per clinic; `Conversation.lastMessageAt`/`VendorAccount.balance` hot. |
| Sequential IDs | 6/10 | `patientNumber` (HST-n) and `protocolNo` (RX-year-n) are enumerable — OK as display refs, not secrets. GPI is opaque (good). |

**Top DB actions:** adopt a single migration authority (Prisma Migrate), drop legacy `public.*`, add missing FK indexes, lock `protocolNo` generation, complete `Person.personId` backfill.

**Phase 6 average: ~5.9/10.**

---

## PHASE 7 — UX Review (Senior UX Director lens)

| Page / flow | Score | Notes |
|---|---|---|
| Marketing landing `/` | 7/10 | Apple-style, Manrope, `#0071E3`; polished but heavy (lenis, framer, coverflow). |
| Public booking `/book/[slug]` | 7/10 | Clean 3-step. Gaps: no KVKK consent checkbox on step 3, empty logo `alt`, step buttons lack `aria-current`, no progress persistence on refresh, no RHF field-level errors. |
| Clinic dashboard `/dashboard` | 7/10 | Rich modules (agenda, patients, services, team, analytics, audit). TR-only (intentional). |
| Patient PWA `/client` | 6/10 | Phone-framed shell, bottom nav; skip-link `#main-content` missing on `/client` and `/book`. |
| Auth flows | 6/10 | Works, but 4 aliasing systems confuse; forms use manual `useState`. |
| Intake `/intake/[token]` | 6/10 | Functional; loose answer validation. |
| Super/System admin | 6/10 | Present and gated; owner→SUPER_ADMIN escalation risk (V8). |

**Dimension scores:** Navigation 7 · Accessibility 4 (~25% WCAG) · Consistency 6 · Visual hierarchy 7 · Spacing 7 · Animations 6 (INP risk) · Responsiveness 6 (dashboard tables don't stack <768px) · Empty states 7 · Loading states 5 (only dashboard has `loading.tsx`) · Error states 5 (no custom 404) · Forms 5 (RHF scaffold unused) · Search 6 · Booking flow 7 · Trust 7 · Conversion 5.

**Standout gaps:** no `not-found.tsx`, sparse route-level loading/error boundaries on patient+booking flows, accessibility incomplete (focus trap not wired into modals), no explicit consent on booking. **Phase 7 average: ~6.0/10.**

---

## PHASE 8 — Product Audit (Airbnb × Stripe × Notion lens)

| Lever | Score | Verdict |
|---|---|---|
| Activation | 5/10 | Trial + demo seed good; time-to-value depends on SMS/WA + payments that aren't live. |
| Retention | 5/10 | Clinic ops create stickiness _if_ daily-used; no proof of DAU. |
| Engagement | 5/10 | Polling realtime, messaging module competes with WhatsApp. |
| Referral | 3/10 | No referral/virality loop built. GPI _could_ be one; isn't yet. |
| Monetization | 4/10 | SaaS tiers exist; patient deposits/no-show fees (the differentiated revenue) unbuilt. Pricing inconsistency (EUR catalog in code vs TL on marketing page). |
| User journey | 6/10 | Coherent guest→book→client→clinic loop. |
| Conversion | 5/10 | FloatingCTA fixed to trial (good); booking→confirm lacks the reminder channel that makes it reliable. |
| Friction | 6/10 | Booking low-friction; onboarding lacks self-serve payment close. |
| Time-to-value | 5/10 | Blocked on Sprint 3/4. |

**Would users use it?** Clinics: yes, _if_ it answers the phone and takes deposits — i.e., the parts not yet shipped. Patients: only via clinic push; no standalone pull. **Phase 8 average: ~4.9/10** — the product's promised value is largely in the un-built sprints.

---

## PHASE 9 — Business Review (YC Partner lens)

**Would I invest $10M Seed? No. Would I write a $500k–$1.5M party-round check? Yes — on the team, the wedge, and the identity moat.**

| Dimension | Assessment |
|---|---|
| **Moat** | 🟡 Weak today (booking commoditized) → 🟢 Strong _potential_ via cross-clinic `Person` identity + AI front desk + payments rail. Build the moat, don't ship the commodity. |
| **Competition** | Fierce & funded: Fresha, Doktortakvim/Doctolib, Cliniko, Jane, SimplyBook. Edge is hyperlocal density + KVKK honesty, not features. |
| **Differentiation** | Current: honest scoping + ecosystem architecture. Not enough for a lead. Needs AI receptionist + payments. |
| **Expansion** | KKTC → Türkiye → medical-tourism corridors (RU/UK/DE inbound to Cyprus). Identity + payments rails travel; regulatory (e-reçete, KVKK/GDPR) is the gate. |
| **MRR potential** | KKTC realistic: ~300–800 target clinics × €149–499 ≈ **€45k–€400k MRR ceiling in-region** — a great seed business, a small venture TAM until expansion + payment take-rate. |
| **Weaknesses** | Single-region TAM, unbuilt monetization, single-layer authz in a PHI product, solo-scale ops maturity, three client surfaces. |
| **Strengths** | Unusual product discipline, real working software, defensible identity concept, disciplined claims (de-risks regulatory/marketing). |

**YC one-liner:** _"Come back when a KKTC clinic runs a full day on Asistan without touching the phone, takes a deposit through you, and you can show me the no-show rate dropped. Then this is fundable."_

**Phase 9 investability: 6/10 (angel/pre-seed) · 4/10 (as a $10M lead).**

---

## PHASE 10 — Roadmap (prioritized)

**P0 (must, blocks trust/revenue) · P1 (high) · P2 (medium) · P3 (later)**

### 30 days — stop the bleeding + close revenue loop

| P | Item |
|---|---|
| P0 | Add second authz layer: enable RLS on `Person`/`PersonIdentityMatch`; fix inventory drift; OR adopt a Prisma tenant-guard middleware that hard-fails queries missing `businessId`. (V1, V2) |
| P0 | Gate `/api/identity/resolve` behind a specific permission + rate limit; enforce strong `PERSON_IDENTITY_PEPPER` (fail boot if weak in prod). (V3, V4) |
| P0 | Ship payments/deposits MVP (iyzico + card + bank) — revenue and the differentiator. Use Stripe SDK `constructEvent` + webhook idempotency. (Q1, V7) |
| P0 | Ship WhatsApp confirm/reminder (Sprint 3) — the promise that makes booking real. |
| P1 | Add CSP + X-Frame-Options; drop Sentry trace sampling to ≤0.2 with PHI scrubbing. (V10, V11) |
| P1 | Rate-limit all public/client read APIs; enforce Upstash-required in prod. (V5, V6) |

### 90 days — product proof

| P | Item |
|---|---|
| P0 | 2–3 KKTC pilot clinics running phone-free days; instrument activation funnel (trial→first booking→first deposit) + no-show rate. |
| P1 | AI Front Desk v1 (WhatsApp booking agent on existing slot engine). |
| P1 | Adopt Prisma Migrate as single migration authority; drop legacy `public.*`; add missing FK indexes; lock `protocolNo`. |
| P1 | ~~Reconcile pricing (one source of truth)~~ → `lib/pricing/public-catalog.ts` + vendor-membership; custom 404 + route loading/error boundaries; wire focus-trap into modals; add booking consent checkbox. |
| P2 | Add SAST + `pnpm audit` + bundle analyzer to CI; raise unit coverage from smoke-level toward 50% on identity/booking/payments. |

### 6 months — moat + scale prep

| P | Item |
|---|---|
| P1 | Patient-owned health passport on `Person` (cross-clinic history + booking wallet) = referral/virality loop. |
| P1 | Replace polling with Supabase Realtime/WS. |
| P2 | Ambient scribe → prescription draft; no-show prediction → dynamic deposits. |
| P2 | Freeze Expo app; consolidate to PWA; kill route aliasing. |
| P3 | Read replicas + PgBouncer tuning; regional data-residency plan. |

### 12 months — expansion

| P | Item |
|---|---|
| P1 | Türkiye entry (regulatory + iyzico at scale); medical-tourism inbound (RU/EN/DE concierge). |
| P2 | Insurer/quality outcome dataset productization. |
| P3 | FHIR/HL7, official e-reçete gateway (only after boundary unlock + density). |

---

## Consolidated risk register (top 10)

| ID | Risk | Sev | Effort | Impact |
|---|---|---|---|---|
| V1 | Prisma bypasses RLS → single-layer PHI authz | 🔴 | High | Breach / diligence-fail |
| V2 | `Person` PII table without RLS | 🔴 | Low | Breach |
| — | Monetization (deposits/SMS) unbuilt = unproven value | 🔴 | High | No revenue proof / fund-fail |
| V3 | Identity resolve under-gated | 🟠 | Low | PII exposure |
| V7 | Stripe custom parser + no idempotency | 🟠 | Low | Payment errors |
| V5/V6 | Unauth client APIs + rate-limit fallback | 🟠 | Med | Scraping/abuse |
| Q5 | `protocolNo` race | 🟠 | Low | Duplicate legal docs |
| Mig | No Prisma migration authority + drift + legacy tables | 🟠 | Med | Data incidents |
| Perf | Polling realtime | 🟡 | Med | Scale ceiling |
| V10 | No CSP/X-Frame-Options | 🟡 | Low | Clickjacking/XSS blast radius |

---

## Bottom line

You are a genuinely talented builder who has shipped a coherent, disciplined product — the scoping governance and ecosystem identity model are better than most Series-A codebases. But you've spent your craft rebuilding a **commoditized category** in a **tiny market**, while the two things that would make this a _venture_ company — **AI front desk** and **payments/deposits** — are still on the roadmap, and the one thing a healthcare investor cannot ignore — **tenant isolation that doesn't depend on a human never forgetting a `where` clause** — is not yet in place.

Fix authorization (defense in depth), ship deposits + WhatsApp to prove the value, then pivot the narrative from "clinic software" to "AI front office + regional patient identity network." Do that, and the next audit reads very differently.
