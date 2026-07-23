# Visual scrub — dual-hero + cyan residue

## Done (P2 UX debt)

### Orphans deleted
- `components/marketing/landing-page.tsx` (unused `LandingPage`)
- `components/marketing/sections/*` (only consumed by LandingPage)
- `components/marketing/footer.tsx` (unused)
- `components/sections/hero-section.tsx` (dead; live home uses `HeroCoverFlow`)
- `components/ui/animated-hero.tsx` (only used by dead hero)

Live home composition: `HeroCoverFlow` (first-viewport conversion: logo + H1 + support + `HomeCTA`; coverflow below fold).

### Blue-only first paint / avatars
- `HomeCTA` trial gradient: `#0071E3` → `#2563EB` (removed `#00b4d8`)
- Dashboard avatars (`header`, `mobile-topbar`, messages, patient initials): blue → blue-hover
- `FloatingCTA` icons: `brand-blue` / white (no cyan tint)
- Appointment status chips: blue family end-stop
- Tokens: `--teal` and `--brand-cyan` aliased into the blue family (`globals.css`)

### Intentionally deferred
- Widespread `brand-teal` / `brand-cyan` **className** renames (already resolve to blue tokens)
- Full marketing page decorative blurs still use `bg-brand-cyan/20` (= light blue `#60A5FA`)
