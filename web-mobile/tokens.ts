/**
 * Asistan patient web (PWA) design tokens.
 *
 * Single documented source of truth for the patient web surface, intentionally
 * mirrored 1:1 with the Expo native theme (`mobile/lib/theme.ts`) so both patient
 * surfaces stay in visual parity: same primary, semantic colors, type scale,
 * spacing, radius, motion and elevation intent.
 *
 * Web consumes these as CSS variables/utilities scoped to `.rezervasyon-shell`
 * (see `app/globals.css`). Prefer the `rz-*` utility classes and Tailwind tokens
 * over hardcoded values in patient components.
 */

/** Chrome wordmark + legal long-form names (masterbrand lock). */
export const REZERVASYON_TOKENS = {
  /** Day-to-day chrome wordmark */
  productName: 'Asistan',
  /** About / onboarding / legal long-form */
  productFullName: 'Asistan Rezervasyon',
  primary: '#0071E3',
  primarySoft: 'rgba(0, 113, 227, 0.08)',
  ink: '#0F172A',
  muted: '#64748B',
  canvas: '#F4F7FB',
  surface: '#FFFFFF',
  radiusSheet: '1.25rem',
  shadowSoft: '0 8px 28px rgba(15, 23, 42, 0.06)',
} as const

/**
 * Semantic color palette — kept in lockstep with `mobile/lib/theme.ts` lightColors.
 * Status hues are the canonical set used across appointment/health states.
 */
export const PATIENT_COLORS = {
  primary: '#0071E3',
  primaryHover: '#0063C8',
  primarySoft: '#EEF6FF',
  ink: '#0F172A',
  muted: '#5D6068',
  canvas: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceSoft: '#F8FBFF',
  border: '#DCE5F2',
  borderStrong: '#C4D3EA',
  /** Status — success/confirmed, warning/pending, danger/cancelled, info/neutral. */
  success: '#0EA472',
  successSoft: '#E8F8F1',
  warning: '#D88A1D',
  warningSoft: '#FCF3E4',
  danger: '#D62839',
  dangerSoft: '#FBE9EB',
  info: '#0071E3',
  infoSoft: '#EEF6FF',
} as const

/**
 * Typographic scale (rem). Communicates one clear hierarchy on mobile:
 * display > title > section > card > body > secondary > caption > metadata.
 * Values mirror the Expo `typography` scale (px→rem at 16px base).
 */
export const PATIENT_TYPE = {
  display: { size: '2rem', line: '2.375rem', weight: 800, tracking: '-0.022em' },
  title: { size: '1.5rem', line: '1.85rem', weight: 800, tracking: '-0.02em' },
  section: { size: '1.15rem', line: '1.5rem', weight: 700, tracking: '-0.015em' },
  card: { size: '1rem', line: '1.4rem', weight: 700, tracking: '-0.011em' },
  body: { size: '0.9375rem', line: '1.4rem', weight: 400, tracking: '-0.006em' },
  secondary: { size: '0.875rem', line: '1.25rem', weight: 500, tracking: '0' },
  caption: { size: '0.8125rem', line: '1.1rem', weight: 500, tracking: '0' },
  metadata: { size: '0.6875rem', line: '0.9rem', weight: 600, tracking: '0.02em' },
} as const

/** Spacing scale (rem) — mirrors Expo `spacing` (px). */
export const PATIENT_SPACING = {
  xxs: '0.25rem',
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
  xxl: '2rem',
  xxxl: '2.5rem',
} as const

/** Radius scale (rem) — mirrors Expo `radii` (px). */
export const PATIENT_RADIUS = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.75rem',
  xxl: '2.25rem',
  pill: '999px',
} as const

/** Elevation — soft/raised/floating shadows for cards, sheets and docks. */
export const PATIENT_ELEVATION = {
  soft: '0 8px 28px rgba(15, 23, 42, 0.06)',
  card: '0 12px 30px -22px rgba(15, 23, 42, 0.3)',
  raised: '0 18px 38px -26px rgba(15, 23, 42, 0.34)',
  floating: '0 18px 50px -18px rgba(15, 23, 42, 0.34)',
} as const

/**
 * Motion — durations (ms) and Apple-style easing. Interaction motion stays in the
 * 150–320ms band and must respect `prefers-reduced-motion` (handled in globals.css).
 */
export const PATIENT_MOTION = {
  fast: 140,
  normal: 220,
  slow: 320,
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const

/** Minimum accessible touch target (px) — Apple/Google guidance. */
export const TOUCH_TARGET_MIN = 44
