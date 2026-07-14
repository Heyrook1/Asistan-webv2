/**
 * Locked typography doctrine: brand fonts = what we ship, not aspiration.
 *
 * Web loads Manrope (+ JetBrains Mono for code) via @fontsource in app/layout.tsx.
 * Do not list SF Pro / Inter ahead of Manrope — that creates Mac vs Win visual split
 * and a false "Apple SF Pro brand" promise.
 */

export const BRAND_TYPOGRAPHY = {
  /** Primary UI + marketing face — self-hosted */
  primary: 'Manrope',
  /** Monospace — self-hosted */
  mono: 'JetBrains Mono',
  /** Loading path (keep in sync with app/layout.tsx) */
  delivery: '@fontsource/manrope' as const,
  /** CSS stacks — mirror app/globals.css @theme and tailwind.config.ts */
  stacks: {
    sans: ['Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    heading: ['Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    mono: [
      'JetBrains Mono',
      'ui-monospace',
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
  },
  /** Names that must not lead CSS stacks (aspiration / OS-local only) */
  forbiddenLead: ['SF Pro Text', 'SF Pro Display', 'Inter'] as const,
} as const

export function cssFontStack(kind: keyof typeof BRAND_TYPOGRAPHY.stacks): string {
  return BRAND_TYPOGRAPHY.stacks[kind].map((family) => (family.includes(' ') ? `'${family}'` : family)).join(', ')
}
