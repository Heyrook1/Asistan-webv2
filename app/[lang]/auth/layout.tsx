// app/[lang]/auth/layout.tsx
'use client'

import React from 'react'
import { LandingLocaleProvider } from '@/components/sections/landing-locale'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <LandingLocaleProvider>
      {children}
    </LandingLocaleProvider>
  )
}
