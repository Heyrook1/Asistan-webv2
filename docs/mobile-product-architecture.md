# Patient Mobile Product Architecture

This document describes the patient-facing mobile experience delivered across two
surfaces that ship at feature parity:

- **Web PWA** — Next.js App Router routes under `app/client/*`, rendered inside the
  `rezervasyon-shell` mobile chrome.
- **Expo native app** — React Native screens under `mobile/app/client/*`.

Both surfaces share one design language (tokens), one information architecture, and
the same backend (`/api/client/*` for authenticated patients, `/api/public/*` for
guest booking).

## Design system (single source of truth)

Design tokens are mirrored between the two surfaces so a change stays consistent:

- Web tokens: `web-mobile/tokens.ts` (TS constants) + CSS custom properties in
  `app/globals.css` under `.rezervasyon-shell` (`--rz-*`).
- Expo tokens: `mobile/lib/theme.ts`.

Token groups: semantic colors, typographic scale, spacing, radius, elevation, motion.
On web, typography is applied through utility classes (`.rz-display`, `.rz-title`,
`.rz-section-title`, `.rz-card-title`, `.rz-body`, `.rz-secondary`, `.rz-caption`,
`.rz-metadata`). Motion respects `prefers-reduced-motion`.

### Web UI primitives

Reusable primitives live in `components/client/ui/` (barrel: `index.ts`):

- `PatientCard` — base surface (radius, border, elevation, optional `interactive`).
- `SectionHeader` — section title + optional trailing action.
- `StatusBadge` — appointment status with color-coded dot + i18n label.
- `EmptyState` / `ErrorState` — first-class guiding empty & actionable error views.
- `PageContainer` — mobile-first max-width container that clears the bottom dock.
- `SkeletonBlock` / `CardSkeleton` / `ListSkeleton` — loading placeholders.

## Information architecture (5 primary destinations)

Identical order and labels on both surfaces:

| Destination  | Web route             | Expo screen                  |
| ------------ | --------------------- | ---------------------------- |
| Home         | `/client`             | `mobile/app/client/index.tsx`      |
| Discover     | `/client/clinics`     | `mobile/app/client/search.tsx`     |
| Appointments | `/client/bookings`    | `mobile/app/client/appointments.tsx` |
| Health       | `/client/health`      | `mobile/app/client/health.tsx`     |
| Profile      | `/client/profile`     | `mobile/app/client/profile.tsx`    |

Web nav: `components/client/bottom-nav.tsx` + `web-mobile/top-bar.tsx`.
Expo nav: `mobile/app/client/_layout.tsx` (Expo Router tabs).

## Home

Personalized dashboard: time-based greeting, nearest upcoming appointment, quick
actions, and privacy hint.

- Web: `web-mobile/home-hub.tsx` + `components/client/home/upcoming-appointment-card.tsx`.
- Expo: `mobile/app/client/index.tsx`.

## Discover

Clinic + doctor discovery with real filters (no fabricated ratings). Empty state
uses the `EmptyState` primitive; result count is announced via `aria-live`.

- Web: `app/client/clinics/*`.

## Doctor & clinic profiles

Trust-first profiles surface verification status, real reviews, next available slots,
services, and bio.

- Web doctor profile: `app/client/doctors/[id]/page.tsx` →
  `components/client/doctor-profile-panel.tsx` (fetches `/api/client/doctors/[id]`).
- Clinic detail doctor cards link to the doctor profile route
  (`components/client/clinic-detail-panel.tsx`).

## Booking flow (resilient)

Guest booking widget (`components/book/public-booking-widget.tsx`):

- Idempotency key per attempt (rotated after any failure).
- Status-aware, localized error mapping: slot-gone (409 / availability message) →
  clears the selected time and refreshes live slots; `400` → validation guidance;
  `>=500` → try-again messaging; network error → connectivity guidance.
- Success view distinguishes `CONFIRMED` vs `SCHEDULED` (awaiting clinic approval).

Backend note: `Person` identity is resolved and committed **before** the
`Serializable` booking transaction (`resolveOrCreatePersonStandalone`) so an
owner-connection `Person` is visible to the booking snapshot and does not fail the
`Patient.personId` foreign key. See `lib/booking/create-slot-appointment.ts`.

## Appointments

Segmented into **Upcoming**, **Past**, and **Cancelled**.

- Web: `components/client/bookings-panel.tsx` (types + pure helpers extracted to
  `components/client/bookings/appointment-model.ts`).

## Health (scaffold)

The existing cross-clinic **passport** (`components/client/health-panel.tsx`) is
unchanged. Above it, a Health records IA grid
(`components/client/health/health-modules.tsx`) links to module shells:

- `/client/health/medications`, `/client/health/allergies`, `/client/health/documents`.

Each renders `components/client/health/health-module-shell.tsx` — an honest,
privacy-forward empty state. **No fabricated medical data**; patient read APIs and
the consent model for these modules are deferred to a later phase.

## Shared client data access

`lib/client-marketplace/client-fetch.ts` centralizes authenticated browser fetches
(`getAccessToken` + `clientFetch`), attaching the Supabase Bearer token and providing
consistent error handling for all patient components.

## Route-level states

Every patient route segment has first-class states:

- `app/client/error.tsx`, `app/client/not-found.tsx` (patient-tailored).
- `loading.tsx` for `bookings`, `clinics`, `clinics/[id]`, `doctors/[id]`, `health`.
