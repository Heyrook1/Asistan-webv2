d# Client ↔ Vendor sync roadmap

**Status:** Locked · actively executing  
**Updated:** 16 Temmuz 2026  
**Surfaces:** **Asistan Rezervasyon** (patient) ↔ **Asistan Health** (clinic / “vendor”)  
**North star:** [`ecosystem-north-star.md`](./ecosystem-north-star.md) · **Boundary:** [`product-boundary.md`](./product-boundary.md) · **Highway:** [`ecosystem-roadmap.md`](./ecosystem-roadmap.md)

---

## Verdict

Sync is not “two apps talking.” It is **one appointment truth + one Person + one notification bus**. Client and vendor are different faces of the same engine.

| Principle | Meaning |
|-----------|---------|
| Single write path | All creates/mutates go through shared services |
| Server wins | Optimistic UI = spinner only; conflict → refetch |
| Channel best-effort | SMS/WA failure must not roll back approve/book |
| Brand lock | Patient chrome `#0071E3`; clinic color = avatar/badge only |
| Stack lock | PWA + Expo · **no Flutter** |

---

## Progress snapshot

| ID | Item | Status | Notes |
|----|------|--------|-------|
| A1 | GPI on book paths | **Done** | `resolveOrCreatePerson` on public book |
| A2 | Single `Appointment` + timeline | **Done** | Public + client create |
| A3 | Vendor deep link + pending UX | **Done** | Inbox banner · chip badge · nav → SCHEDULED · fetch-by-id |
| A4 | Shared cancel / reschedule | **Done** | Lifecycle APIs |
| A5 | Bell + client refresh | **Done** | Visibility + 30s soft poll on `/client/bookings` |
| A6 | Optional location | **Done** | Null-safe create |
| B1 | SMS/WA on approve/cancel | **Adapter** | Needs webhook — [`patient-outbound-channels.md`](./patient-outbound-channels.md) |
| B2 | T-24 / T-2h reminders | **Adapter** | Guests + WhatsApp attempt · cron live |
| B3 | Deposit | Todo | Sprint 4 |
| B4 | Shared status dictionary | **Done** | `SCHEDULED` = Onay bekliyor |
| B5 | Idempotency + slot conflict | **Done** | Header + conflict UX |
| C7 | Bottom dock all viewports | **Done** | No `md:hidden` |
| C8 | Patient health visit timeline | **Done** | `/client/health` + clinic longitudinal board — [`patient-health-timeline.md`](./patient-health-timeline.md) |
| C* | Expo parity / offline / stores | Todo | |

**Done ratio (A–B core):** ~70% foundation · outbound awaiting provider bind.

---

## 0. Architecture locks

| Layer | Decision |
|-------|----------|
| Names | Patient: **Asistan Rezervasyon** · Clinic: **Asistan Health** |
| Clients | `/client` + PWA first · Expo `mobile/` · **no Flutter** |
| Vendor | `/dashboard` — same API, same RLS |
| Identity | `Person` (ecosystem) + `Patient` (clinic chart) |
| Booking | One `Appointment` · `Idempotency-Key` on public create |
| Shell | Phone frame ~480px · dock always visible |
| Offline | Client soft-read later · Vendor online-first |
| Realtime | Bell + refresh · WebSocket **not** required for KKTC |

**Anti-patterns:** client calendar fork · vendor shadow DB · Flutter · fourth brand name · “AI sync” · present-tense e-reçete/telehealth/HIS.

---

## 1. Sync topology

```text
[Hasta PWA / Expo /client]          [Klinik /dashboard]
           │                                 │
           ▼                                 ▼
    /api/public/* · /api/client/*     server actions · /api
           └──────────────┬──────────────────┘
                          ▼
                 Appointment engine
                 + GPI (Person resolve)
                 + Notification bus
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
      Clinic bell    SMS / WA /     Client bookings
      + ajanda       email webhook  (+ PWA push later)
```

### Consistency SLAs

| Level | Mechanism | Target |
|-------|-----------|--------|
| Strong | Serializable txn + idempotency | Immediate |
| Near-RT | `createNotification` + UI refresh | 5–15s |
| Eventual | SMS/WA/email webhooks | &lt; 60s attempt |

### Lifecycle (canonical)

```text
SCHEDULED ──approve──► CONFIRMED ──complete──► COMPLETED
    │                      │
    │                      ├──cancel──► CANCELLED
    │                      └──no-show─► NO_SHOW
    └──cancel──► CANCELLED
```

| Status | TR label | Primary actor |
|--------|----------|---------------|
| `SCHEDULED` | **Onay bekliyor** | Clinic |
| `CONFIRMED` | Onaylandı | Clinic / patient (policy) |
| `COMPLETED` | Tamamlandı | Clinic |
| `CANCELLED` | İptal | Either |
| `NO_SHOW` | Gelinmedi | Clinic |

**Label SoT:** `lib/format.ts` → `APPOINTMENT_STATUS_LABELS`. Client/Expo must import or mirror exactly — no “Planlandı” drift.

Transitions: only `canTransitionAppointmentStatus` (`lib/appointment-transitions.ts`).

---

## 2. Happy-path sequences

### 2.1 Guest book → clinic sees

```text
Patient                API                     DB              Clinic
  │  POST /public/bookings + Idempotency-Key
  │─────────────────────►│
  │                      │ resolve Person
  │                      │ create Patient (personId)
  │                      │ lock slots / create Appointment
  │                      │ timeline + notifyClinic
  │◄──── 200 ok ─────────│                       │
  │                      │  createNotification ──►│ bell + ajanda link
```

### 2.2 Approve → patient channel

```text
Clinic                 setAppointmentStatus           Patient channel
  │  CONFIRMED ───────►│
  │                    │ update + timeline
  │                    │ createNotification (staff)
  │                    │ createClientNotification (if app user)
  │                    │ notifyPatientChannels(kind=confirm)
  │◄── ok ─────────────│────── webhook SMS/WA/email ─► (if env set)
```

### 2.3 Reminder (cron)

```text
Cron hourly → processAppointmentReminders
  → due in T-24h / T-2h windows (±skew)
  → skip if already reminded (ClientNotification or audit)
  → in-app if clientUserId
  → SMS/WA (phone) · email if no phone
  → audit appointment.remind.{24h|2h}
```

---

## 3. Event catalog

### Clinic notifications (`Notification.subtype`)

| Subtype | When | Link pattern |
|---------|------|--------------|
| `appointment_pending_approval` | Public/client book needs approve | `/dashboard/ajanda?mode=liste&id=&status=SCHEDULED` |
| `appointment_assigned` | Auto-confirmed book | `…&id=` |
| `appointment_approved` | Staff confirmed | `…&status=CONFIRMED` |
| `appointment_cancelled` | Cancel / no-show | `…&status=` |

### Patient outbound (`payload.kind`)

| Kind | Trigger |
|------|---------|
| `confirm` | Status → CONFIRMED |
| `cancel` | Status → CANCELLED / NO_SHOW |
| `reminder_24h` | Cron window |
| `reminder_2h` | Cron window |

### Client in-app (`ClientNotificationType`)

| Type | When |
|------|------|
| `BOOKING_CONFIRMATION` / pending | On create (logged-in) |
| `BOOKING_APPROVED` | Clinic approve |
| `BOOKING_CANCELLED` | Cancel |
| `APPOINTMENT_REMINDER` | Cron (logged-in only) |
| `REVIEW_REQUEST` | Completed |

---

## 4. Deep-link map

| From | To | Purpose |
|------|-----|---------|
| Book success | `/client/bookings` or clinic CTA | Next step |
| Clinic notif pending | `/dashboard/ajanda?mode=liste&id={id}&status=SCHEDULED` | Ops focus |
| Clinic notif approved | `…&status=CONFIRMED` | Confirm focus |
| Patient reminder | `/client/bookings?id={id}` | Own row |
| Clinic card | `/book/{slug}?doctorId=&serviceId=` | Prefill 3-step |

**Invariant:** `?id=` must not be hidden by saved status filter (board auto-aligns chip).

---

## 5. Phased roadmap

### Phase A — Foundation · mostly shipped

| # | Work | Status | Remaining |
|---|------|--------|-----------|
| A1 | GPI on book | Done | — |
| A2 | Appointment + timeline | Done | — |
| A3 | Deep link + pending UX | Done | Inbox + badge + fetch-by-id · calendar `?id=` later |
| A4 | Cancel / reschedule lifecycle | Done | — |
| A5 | Bell + client refresh | Done | Soft poll 30s when focused |
| A6 | Optional location | Done | Optional: seed “Ana şube” wizard |

**Exit (happy path):** Met.

### Phase B — Table-stakes · in progress (Sprint 3–4)

| # | Work | Status | Blocker |
|---|------|--------|---------|
| B1 | SMS/WA confirm | Adapter | Provider URL |
| B2 | Reminders T-24 / T-2h | Adapter | Provider URL |
| B3 | Deposit | Todo | Sprint 4 |
| B4 | Status dictionary | Done | — |
| B5 | Idempotency | Done | — |

Env: [`patient-outbound-channels.md`](./patient-outbound-channels.md)

### Phase C — Mobile product sync

| # | Work | Status |
|---|------|--------|
| C1 | PWA metrics · SW no `/_next` cache | Partial |
| C2 | Expo ↔ web parity matrix | Todo |
| C3 | Shared tokens `#0071E3` | Partial |
| C4 | Deep links E2E | Partial |
| C5 | Offline read cache (writes online) | Todo |
| C6 | Store publish gate | Todo |
| C7 | Dock all viewports | Done |

### Phase D — Ops depth (quarter)

D1 Google write-back · D2 light check-in · D3 reputation loop · D4 Super Admin sync health.

**Parked:** Flutter · map ETA · telehealth · e-reçete · HIS · pharmacy/lab UI.

---

## 6. Failure modes & recovery

| Failure | User impact | Recovery |
|---------|-------------|----------|
| Slot taken mid-submit | 400 conflict | Pick another slot |
| Double-click create | Same appointment | `Idempotency-Key` replay |
| No Location rows | Was 500 | Now `locationId=null` OK |
| SMS webhook down | Approve still OK | Soft fail · retry via cron/ops |
| Reminder duplicate | Spam risk | Audit + ClientNotification dedupe |
| Deep link filtered out | Scroll miss | Auto-set status chip |
| Legacy hex serviceId | Was 400 uuid | Text id schema (max 64) |
| Turbopack context split | `useLanguage` crash | Client `LanguageProvider` + soft fallback |

---

## 7. API contract

| Action | Path | Notes |
|--------|------|-------|
| Create guest | `POST /api/public/bookings` | `Idempotency-Key` |
| Create logged-in | `POST /api/client/bookings` | Same schema family |
| Slots | `GET /api/client/availability` | Text IDs |
| Cancel / reschedule | `/api/client/appointments/[id]/*` | Server authority |
| Approve / status | `setAppointmentStatus` | Triggers channels |
| Reminders | Cron → `processAppointmentReminders` | Guests + logged-in |
| Identity | `resolveOrCreatePerson` | Before chart create |

---

## 8. Expo ↔ web parity matrix (Phase C target)

| Screen | Web | Expo | Sync requirement |
|--------|-----|------|------------------|
| Home / discover | `/client` | `mobile/.../client` | Same discovery API |
| Search / clinics | `/client/clinics` | search | Same filters |
| Book | `/book/[slug]` | book flow | Same public/client book |
| Bookings | `/client/bookings` | appointments | Same lifecycle |
| Profile | `/client/profile` | profile | Same auth + profile API |
| Status chips | `APPOINTMENT_STATUS_LABELS` | must match TR strings | B4 |
| Outbound | N/A (server) | N/A | Server-only |

Do not fork booking business rules into Expo.

---

## 9. File ownership

| Concern | Paths |
|---------|--------|
| Public book + clinic notif | `lib/public-booking/create-guest-booking.ts` |
| Client book | `lib/client-marketplace/bookings.ts` |
| Approve / cancel + outbound | `lib/actions/appointments.ts` |
| Channel fanout | `lib/notifications/patient-channels.ts` · `channels.ts` |
| Reminders | `lib/client-marketplace/reminders.ts` · `app/api/cron/appointment-reminders` |
| Status labels | `lib/format.ts` |
| Vendor list / deep link | `app/dashboard/randevular/appointments-board.tsx` |
| Patient bookings | `components/client/bookings-panel.tsx` |
| Shell / dock | `app/client/layout.tsx` · `components/client/bottom-nav.tsx` |
| GPI | `lib/identity/*` |
| Transitions | `lib/appointment-transitions.ts` |

---

## 10. 90-day plan & next 14 days

```text
Hafta 1–2   A3–A5  deep-link + parity + refresh     ← largely done
Hafta 3–4   B1–B2  bind live provider + measure
Hafta 5–6   B3     deposit (Sprint 4)
Hafta 7–8   C1–C3  PWA metrics + Expo parity
Hafta 9–12  C4–C5  deep links + offline read
```

### Next 14 days (ordered)

1. Bind one KKTC SMS **or** WhatsApp webhook · track delivery % via `[patient-channel]` logs  
2. ~~Vendor Onay bekleyenler inbox + badge~~ **done**  
3. ~~Fetch-by-id outside take:200~~ **done**  
4. ~~30s soft poll `/client/bookings`~~ **done**  
5. ~~TR template sheet~~ **done** — [`patient-outbound-channels.md`](./patient-outbound-channels.md)  
6. ~~Log channel ok/fail without PII~~ **done**  
7. Calendar mode `?id=` focus (optional polish)  
8. Deposit slice when Sprint 4 opens  

---

## 11. Observability (minimal)

| Signal | Where |
|--------|-------|
| Book create latency / errors | API logs + Sentry |
| Approve → channel attempt | `notifyPatientChannels` results (provider, ok) |
| Reminder sent / skipped / errors | Cron response `{ sent, skipped, errors }` |
| Double-book attempts | Idempotent replay flag |
| Pending queue depth | Count `SCHEDULED` per business (inbox) |

Never log raw national IDs or full webhook bodies with secrets.

---

## 12. Definition of Done (sync PR)

1. Boundary + claim-bank respected  
2. No new product alias  
3. Status labels from `APPOINTMENT_STATUS_LABELS` or identical copy  
4. Mutations server-side only  
5. Channel failures do not fail the primary action  
6. Manual acceptance rows updated below  
7. Docs touched if contract/env changes  

---

## 13. Acceptance checklist

| # | Scenario | Pass |
|---|----------|------|
| 1 | Guest 3-step book → dashboard same row | ☐ |
| 2 | Notif → ajanda focuses row despite wrong saved filter | ☐ |
| 3 | Approve → webhook `kind=confirm` (if env) | ☐ |
| 4 | Cancel → both UIs İptal + `kind=cancel` | ☐ |
| 5 | Double submit → one appointment | ☐ |
| 6 | No Location → book succeeds | ☐ |
| 7 | Wide desktop → `/client` dock visible | ☐ |
| 8 | Reminder cron dry-run returns counts without crash | ☐ |
| 9 | Legacy hex `serviceId` availability + book OK | ☐ |
| 10 | Pending badge → ajanda SCHEDULED inbox | ☐ |
| 11 | Deep link `?id=` outside list window still focuses | ☐ |
| 12 | `/client/bookings` soft-updates within ~30s while focused | ☐ |

---

## 14. Success metrics (KKTC)

| Metric | Target |
|--------|--------|
| Book → dashboard visible | &lt; 5s |
| Approve → channel attempt | &lt; 60s |
| Double-book rate | ~0 |
| Reminder coverage (has phone) | ≥ 80% attempted |
| No-show after reminders | Drop vs baseline |
| PWA re-open / 7d | Trend ↑ |

---

## 15. Claims hygiene

| Say | Do not say |
|-----|------------|
| SMS/WhatsApp webhook ile bağlanabilir | Netgsm/Twilio hazır (unless piloted) |
| PWA ile yükleyin | App Store’da uygulama (until published) |
| Onay bekliyor / gerçek müsaitlik | AI-powered sync · e-reçete · telehealth |

---

## 16. Decision log

| Date | Decision |
|------|----------|
| 2026-07-15 | GPI + 3-step book locked on highway |
| 2026-07-16 | Sync roadmap locked; location optional; brand blue on book chrome |
| 2026-07-16 | Sprint 3 adapters: patient channels + guest reminders |
| 2026-07-16 | Patient dock visible on all viewports |
| 2026-07-16 | Status parity: SCHEDULED = Onay bekliyor |
| 2026-07-16 | A3/A5: pending inbox, fetch-by-id, soft poll, channel logs + TR templates |

---

## Related

- [`ecosystem-implementation-plan.md`](./ecosystem-implementation-plan.md) · [`ecosystem-roadmap.md`](./ecosystem-roadmap.md)
- [`patient-outbound-channels.md`](./patient-outbound-channels.md)
- [`global-person-identity.md`](./global-person-identity.md) · [`public-booking-3-step.md`](./public-booking-3-step.md)
- [`hasta-rezervasyon-ux.md`](./hasta-rezervasyon-ux.md) · [`rezervasyon-ui-system.md`](./rezervasyon-ui-system.md)
- [`pwa-patient.md`](./pwa-patient.md) · [`web-mobile-rezervasyon.md`](./web-mobile-rezervasyon.md)
