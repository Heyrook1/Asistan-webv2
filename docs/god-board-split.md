# God-board split (I2 + residual)

**Status:** Done 22 Temmuz 2026 (residual closed)

Large dashboard client boards were split into colocated modules. Public entry exports unchanged.

## I2 (21 Temmuz)

| Board | Orchestrator | Was | After I2 |
|-------|--------------|-----|----------|
| Team | `app/dashboard/takim/team-board.tsx` | ~1018 | ~311 |
| Calendar | `app/dashboard/takvim/calendar-board.tsx` | ~780 | ~316 |
| Mesajlar | `app/dashboard/mesajlar/mesajlar-board.tsx` | ~768 | ~296 |

## Residual (22 Temmuz) — calendar/team pieces

| Board | Extracted |
|-------|-----------|
| Calendar | `calendar-toolbar`, `calendar-filters`, `calendar-share-dialog` → orchestrator ~204 |
| Team | dialogs → `team-add-user-dialog`, `team-permission-drawer`, `team-reset-password-dialog`; + `team-membership-banner`, `team-deactivate-dialog`; barrel `team-board-dialogs.ts` → orchestrator ~276 |

## Also

Route-level `loading.tsx` skeletons: `takim`, `ajanda`, `takvim`, `mesajlar`.

## Out of scope (separate debt)

Larger boards still monolithic (not I2): `appointments-board` (~747), `notifications-board` (~720), `super-admin-board`, `governance-board`. Track separately if needed.

## Note

`MesajlarBoard` only mounts when `ASISTAN_FLAG_TEAM_MESSAGING` is on; default path remains `MesajlarDeprecatedPanel`.
