'use client'

import dynamic from 'next/dynamic'

export const GlobalCommandPaletteLazy = dynamic(
  () =>
    import('@/components/dashboard/global-command-palette').then(
      (mod) => mod.GlobalCommandPalette,
    ),
  { ssr: false },
)
