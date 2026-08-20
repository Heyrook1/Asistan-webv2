# Client data fetching decision (I1)

**Decision (21 Temmuz 2026): remove React Query.**

## Why not adopt

- `@tanstack/react-query` was wired (`QueryProvider` in root layout) but **no production UI imported** the query hooks.
- Dead hooks (`use-patients-query`, `use-appointments-query`, `use-team-members-query`) called non-existent `/api/patients` style routes.
- Clinic dashboard data path is **RSC + server actions + `router.refresh()`**.
- Patient PWA (`/client/health`, bookings) uses **Bearer `fetch` + local state** — same pattern as passport/timeline.
- Adding RQ “because it exists” would force a second client cache parallel to Next cache without a clear owner.

## What we keep

| Surface | Pattern |
|---------|---------|
| Dashboard boards | Server Components + server actions |
| Client PWA | `fetch` + `useState` / `useTransition` |
| Near-realtime | Existing poll hooks (`use-message-stream`, `use-notification-stream`) |

## Revisit when

Adopt React Query (or similar) only if we introduce a **dedicated client API layer** with shared invalidation across many interactive boards — not as a soft dependency.

## Removed

- `lib/query-provider.tsx`
- `hooks/use-*-query.ts`
- `@tanstack/react-query`, `@tanstack/react-query-devtools`
