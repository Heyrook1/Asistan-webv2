# Rezervasyon UI system (modern pass)

## Direction
Premium outpatient clinic feel · brand blue `#0071E3` · calm neutrals · phone-app density · center search FAB dock.

**Dock:** visible on **all** viewports (not `md:hidden`) — phone frame max ~480px.

## Home composition (first viewport)
One plane only: full-bleed clinic atmosphere photo + **Asistan Rezervasyon** as hero brand + one headline + one supporting line + CTA group (Book + search). No badges, pills, or pastel category rainbow in the hero.

## Surfaces
- `app/client/layout.tsx` — server-rendered shell frame (`data-rz-shell="v3"`)
- `web-mobile/home-hub.tsx` — atmospheric hero, quiet specialty chips, featured clinics
- `web-mobile/top-bar.tsx` — home: bell only (brand lives in hero) · other screens: brand + title
- `components/client/bottom-nav.tsx` — premium dock + center Ara FAB
- `components/client/clinic-card.tsx` — image thumb + full-width book CTA
- `.rezervasyon-shell` tokens + `rz-hero-image` motion in `app/globals.css`
- Hero asset: `public/images/rezervasyon-clinic-hero.jpg`

## Hydration / PWA
- Dev: SW unregisters + clears caches (`RegisterServiceWorker`)
- Prod SW (`asistan-shell-v3`) never caches `/_next/*` or `/client`

## Brand
Customer name remains **Asistan Rezervasyon** (not the prototype’s teal-only “Asistan”).
Do not imply AI via sparkles / “smart” chrome on the patient home.
