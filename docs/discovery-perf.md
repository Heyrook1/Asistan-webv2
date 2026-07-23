# Marketplace discovery performance (BUG-005)

## Problem

`searchMarketplace` called `getAvailableSlots` per doctor × day × service (up to ~120 × 14 × 3) → N+1 / N×M latency on `/client/clinics`.

## Fix (fill-the-gap model)

| Piece | Role |
|-------|------|
| `discovery-next-available-core.ts` | Pure in-memory resolve over preloaded maps |
| `discovery-next-available.ts` | **4** Prisma queries (services / rules / appts / blocks), then core |
| `discovery.ts` | Filter drafts first, then one `batchFindNextAvailable` |

Query budget constant: `DISCOVERY_NEXT_AVAILABLE_QUERY_BUDGET = 4` (not O(doctors)).

## Test

`tests/unit/discovery-next-available.test.ts` — **50 doctors p95** in-memory batch + query-budget guard.

## Landing bundle (related)

| Change | Why |
|--------|-----|
| `PageTransition` CSS-only | Drop framer from LCP wrapper |
| Dynamic `HeroCoverFlow` + `FloatingCTA` | Framer in deferred chunks |
| `app/loading.tsx`, `app/client/loading.tsx` | Marketing / client Suspense shells |

## Still open (lower)

- Site header still imports `AnimatePresence` (framer) on critical path — optional follow-up: CSS menu transition.
