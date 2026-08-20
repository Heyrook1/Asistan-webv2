# CI perf + tenant gate (I4)

**Status:** Done 21 Temmuz 2026

## What CI enforces

| Check | When | Gate |
|-------|------|------|
| `pnpm check:bundle-budget` | After `pnpm build` | Hard — first-load JS vs `config/ci-budgets.json` |
| `pnpm check:lighthouse` | Job `lighthouse` on `/` + `/guven` | Hard floors: a11y ≥85, best-practices ≥70, SEO ≥80, script transfer ≤500KB; performance = warn only |
| `pnpm smoke:asistan-app-rls` + `smoke:cross-tenant` | Job `tenant-isolation` on **PR + push** | Hard when secrets present; soft-skip + warning if missing |

`ci-gate` (`CI passed`) now needs: lint, test, build, e2e, **tenant-isolation**, **lighthouse**.

## Secrets (cross-tenant)

| Secret | Role |
|--------|------|
| `DATABASE_URL_MIGRATE` | Owner connection (fixture setup) |
| `ASISTAN_APP_DATABASE_URL` | `asistan_app` runtime RLS role |

Without both, the tenant job succeeds with a warning — configure them in GitHub Actions for a real IDOR gate.

## Local

```bash
pnpm build
pnpm check:bundle-budget

pnpm start &
pnpm check:lighthouse   # needs Chrome/Chromium; optional LH_CHROME_PATH
```

Budgets live in `config/ci-budgets.json`. Raise ceilings only with a documented reason (regression vs intentional feature).

## Code

- `lib/ci/bundle-budget.ts` + `scripts/check-bundle-budget.ts`
- `scripts/run-lighthouse-ci.ts` (`lighthouse@12` for Node 20)
- Unit: `tests/unit/bundle-budget.test.ts`
