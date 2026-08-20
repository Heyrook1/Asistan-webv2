# Asistan Ecosystem — Implementation Plan
**Date:** 15 Temmuz 2026 · Status: **ACTIVE**  
**North star:** docs/ecosystem-north-star.md · **Boundary:** docs/product-boundary.md

## 0. Rules of engagement

1. Challenge before coding — no hospital/LIS/e-reçete/telehealth present-tense claims.
2. One backend, one auth, one appointment truth, one notification bus.
3. Patient belongs to the **ecosystem** (Person), clinics get **membership** views.
4. Reservation UX ≤ **3 primary steps** for guest book.
5. Prefer PWA + existing Expo; **do not** add Flutter.
6. Every sprint ships production-ready slices with migrate + tests + claims hygiene.

**Will this work for 10M patients?** Architecture yes (Person + idempotent booking). Go-to-market now = **KKTC density**, not vertical sprawl.

---

## 1. Priority stack (do in order)

| Rank | Workstream | Why first | Outcome |
|------|------------|-----------|---------|
| **A** | Lock governance (this plan + rule) | Stops thrash | Agents/devs share one filter |
| **B** | Global Person Identity (GPI) | Dedup + marketplace trust | No clinic silo patients forever |
| **C** | Reservation 3-step + profile CTA | Conversion | Marketplace → book without cognitive load |
| **D** | Table-stakes ops (SMS/WA → deposit) | No-show + revenue | Category-win vs peers |
| **E** | Reputation + BI foundation | Moat | Ratings → later AI advisor |

Hospital / pharmacy / lab marketplace verticals = **after** A–D prove density.

**Also frozen:** staff in-app Mesajlar (`docs/team-messaging-deprecation.md`) — integrate WhatsApp/SMS patient channels, do not rebuild Slack.

---

## 2. Sprint map

### Sprint 0 — Governance (≤ 1 day) · **DONE**
- [x] `docs/ecosystem-implementation-plan.md` (this file)
- [x] `docs/ecosystem-north-star.md`
- [x] `.cursor/rules/asistan-ecosystem.mdc`
- [x] Cross-link `product-boundary.md` + PRB audit

**Exit:** Every agent session inherits north star + boundary.

---

### Sprint 1 — Global Patient Identity foundation (1–2 weeks) · **SHIPPED (foundation)**

**Docs:** [`global-person-identity.md`](./global-person-identity.md)

#### Data model (additive)

```
Person
  id              uuid PK          // internal forever
  gpiDisplay      string unique    // "GPI-…" opaque; NOT sequential if avoidable
  phoneE164       string?
  emailNorm       string?
  identityHash    string?          // HMAC(nationalId|passport) — never raw in logs
  birthDate       date?
  fullNameCanon   string
  createdAt / updatedAt / deletedAt

PersonIdentityMatch (audit of merges)
  id, leftPersonId, rightPersonId, score, method, decidedBy, decidedAt

Patient (existing clinic chart)
  + personId uuid? FK → Person   // backfill gradually
  // keep businessId + patientNumber for clinic ops UX
```

#### Dedupe engine (service)

`lib/identity/dedupe.ts`

| Signal | Weight |
|--------|--------|
| identityHash exact | 0.55 |
| phoneE164 exact | 0.25 |
| emailNorm exact | 0.15 |
| name+DOB fuzzy | 0.10–0.20 |

Thresholds: ≥0.85 auto-link suggestion; ≥0.95 auto-merge only with dual signal (ID+phone or ID+email). Else queue for staff review.

#### APIs

| Method | Path | Role |
|--------|------|------|
| `POST` | `/api/identity/resolve` | Internal/staff — resolve or create Person from attributes |
| `POST` | `/api/identity/merge` | Owner/admin — confirm merge |

Public book + intake: call resolve on create; link `Patient.personId`.

#### Security
- Raw national ID never stored plaintext long-term → hash with server pepper.
- Audit every merge/split.
- RLS/Prisma: Person readable only via membership path or super-admin.

#### Acceptance
- [x] Migration additive; old patients still load
- [x] Guest book creates/links Person
- [x] Duplicate phone+email across two clinics → same `personId` (resolve by phone/email)
- [x] Unit tests for score matrix
- [x] GPI display helper (not sequential enumerable)

#### Risks
- Dirty phone formats → normalize E.164 TR/CY first
- False merge → require dual-signal OR human confirm

---

### Sprint 2 — Reservation product cut (1–1.5 weeks) · **SHIPPED**

**Goal:** Marketplace → book in **3 primary steps**; premium clinic profile CTA.  
**Docs:** [`public-booking-3-step.md`](./public-booking-3-step.md)


#### UX (guest `/book/[slug]` + from `/client` cards)

| Step | Screen | Action |
|------|--------|--------|
| 1 | Service (+ doctor if >1) | Pick what’s needed |
| 2 | Date + time | Live slots |
| 3 | Identity + confirm | Name/phone (+ optional email); submit |

Auto-defaults: first service, first bookable doctor, soonest day with slots.

#### Client marketplace
- Clinic card → `/book/{slug}` (done) + optional `?serviceId=&doctorId=` deep link
- Home hub (`web-mobile`) keeps Discover / Bookings / Profile
- Profile page: login CTA + bookings shortcut (no dead English stub)

#### APIs (reuse + tighten)
- Keep `GET /api/public/clinics/[slug]`, `GET /api/client/availability`, `POST /api/public/bookings`
- Add idempotency key header `Idempotency-Key` on POST book
- Optional query preselect on slug page

#### Acceptance
- [x] Guest book is visually three steps (progress chips)
- [x] Deep link with serviceId works
- [x] Idempotent double-submit doesn’t double-book
- [x] Mobile one-thumb CTA; skeleton while slots load

#### Out of scope this sprint
Dark mode, hospital profiles, maps SDK (keep distance label if present).

---

### Sprint 3 — Notification & retention table-stakes (1–2 weeks) · **IN PROGRESS**

**Goal:** Appointment request → realtime clinic → approval → patient channel.

| Order | Deliverable | Status |
|-------|-------------|--------|
| 1 | WhatsApp **or** SMS template: confirm + reminder T-24h / T-2h | Webhook adapter + approve/cancel/reminder hooks · provider env required |
| 2 | Dashboard toast/realtime — public-book triggers staff notif | Shipped · ajanda deep links hardened |
| 3 | Patient PWA push optional (existing SW) for logged-in `/client` | Deferred (SW cache fix done earlier) |

**Acceptance:** KKTC pilot clinic can run a day without phone-only reminders — pending live provider webhook.

**Env:** `SMS_PROVIDER_WEBHOOK_URL` · `WHATSAPP_PROVIDER_WEBHOOK_URL` · `NOTIFICATION_PROVIDER_TOKEN`

---

### Sprint 4 — Money (deposit / no-show) (1–2 weeks)

- Appointment deposit intent (iyzico or Stripe) optional per clinic setting
- Membership payment already partially present — keep separate from patient deposit
- **Acceptance:** Clinic can require ₺X deposit on public book OR mark no-show fee policy (even if collection later)

---

### Sprint 5 — Reputation + BI foundation (2 weeks)

- Clinic reply to reviews; report abuse flag
- Metrics: bookings, cancel rate, approval latency, profile completeness score
- Rule-based “advisor” tips (not ML marketing): “respond to reviews”, “add gallery”
- Claim-bank: no “AI-powered” until gated

---

### Later (parked — boundary)

| Item | When to reopen |
|------|----------------|
| Hospitals / labs / pharmacies vertical | ≥ density + provider_type enum + compliance |
| Official e-reçete / LIS / telehealth / wards | Explicit boundary unlock |
| Flutter client | Never unless Expo+PWA abandoned |
| FHIR/HL7 | Phase-3 intl / hospital deals |
| Interactive maps / ETA | After location permission product-market fit |

---

## 3. Architecture constraints (always)

```
[ Asistan Rezervasyon PWA /web-mobile + Expo ]
                │
         Next API + Prisma
                │
    ┌───────────┼───────────┐
 Person     Appointment    Notification
 Identity      Engine           Bus
    │           │               │
 Patient◄───────┘          Supabase Realtime
 (clinic chart)              + SMS/WA adapters
```

- **Asistan Health** = Vendor/clinic OS (dashboard) — do not rename customer-facing to “Vendor Online”.
- **Super Admin** = tenant + trust ops only.

---

## 4. Definition of done (every PR)

1. Boundary + claim-bank respected  
2. Migration reversible / additive when touching identity  
3. Tests for dedupe or booking edge cases  
4. No new product name aliases  
5. Perf: booking confirm < 2s p95 local warm; list pages skeleton  

---

## 5. Immediate next execution (after Sprint 0)

**Start Sprint 3:** SMS veya WhatsApp onay/hatırlatma kanalı.

**Client ↔ vendor sync plan (locked):** [`client-vendor-sync-roadmap.md`](./client-vendor-sync-roadmap.md)

---

## 6. Success metrics (90 days)

| Metric | Target |
|--------|--------|
| Public book → confirmed appointment | Baseline → +30% relative |
| Duplicate Patient creates across clinics | Measurable drop after Person link |
| Reminder reach (Sprint 3) | ≥80% booked patients get ≥1 channel |
| Claim violations in UI | 0 new postponed-capability claims |
