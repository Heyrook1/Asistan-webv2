# Sentry sample + PHI scrub (I3)

**Status:** Done 21 Temmuz 2026

## Caps

| Setting | Production | Cap |
|---------|------------|-----|
| `tracesSampleRate` | 0.1 default | ≤ **0.2** (`clampSentrySampleRate`) |
| `replaysSessionSampleRate` | 0 | — |
| `replaysOnErrorSampleRate` | 0.1 | ≤ 0.2 |

Override: `SENTRY_TRACES_SAMPLE_RATE` (still clamped).

## PHI scrub

`lib/security/sentry-scrub.ts` — strips query string, body, cookies, auth headers; user → `{ id }` only; drops PHI-like `extra` keys.

## Removed

- `@sentry/tracing@7` (unused; tracing lives inside `@sentry/nextjs` v10)
- Deprecated `lib/sentry.ts` duplicate init

## Code

- `lib/security/sentry-sample.ts`
- `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts`
- Tests: `tests/unit/sentry-sample.test.ts`, scrub coverage in `observability.test.ts`
