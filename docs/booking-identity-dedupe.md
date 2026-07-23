# Booking + identity dedupe (I5)

**Status:** Done 21 Temmuz 2026

## Problem

`createGuestPublicBooking` and `createClientBooking` each had a copy of:

1. Person resolve → clinic Patient upsert (`getOrCreatePatient*`)
2. Slot lock + availability match + appointment + timeline transaction

Bugs fixed in one path (e.g. phone format mismatch) did not land in the other.

## Shared core

| Module | Role |
|--------|------|
| `lib/identity/clinic-patient.ts` | `resolveOrCreateClinicPatient` — businessId-scoped Patient + Person link |
| `lib/identity/normalize.ts` | `phoneLookupVariants` — raw / E.164 / TR local forms for Patient.phone match |
| `lib/booking/create-slot-appointment.ts` | `createSlotAppointmentTx` / `runSlotAppointmentTransaction` — Serializable slot book |

## Channel-specific (kept separate)

| Guest public | Client app |
|--------------|------------|
| Idempotency claim in `onAfterAppointment` | `clientNotification` in `onAfterAppointment` |
| Intake invite, deposit, funnel | Auth `clientUserId` / `actorUserId` |
| Notes `[Genel link]…`; location optional | Raw notes; locationId must resolve if provided |
| Clinic notif copy/links for genel link | Dashboard randevular notif |

## Callers

- `lib/public-booking/create-guest-booking.ts`
- `lib/client-marketplace/bookings.ts`
- WhatsApp front-desk still uses `createGuestPublicBooking` (inherits shared core)

## Tests

- `tests/unit/clinic-patient.test.ts` — phone variant matrix
- Existing idempotency / booking schema tests unchanged
