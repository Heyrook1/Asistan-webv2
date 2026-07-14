import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

import { HeroCoverFlow } from '@/components/sections/HeroCoverFlow'
import { LandingLocaleProvider } from '@/components/sections/landing-locale'
import { PageTransition } from '@/components/sections/page-transition'
import { SectionSkeleton } from '@/components/sections/section-skeleton'
import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'
import { FloatingCTA } from '@/components/ui/FloatingCTA'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/', {
  title: {
    absolute: 'KKTC Randevu Sistemi | Asistan Health',
  },
  description: 'KKTC klinikleri için randevu, hasta takibi ve ekip yönetimi platformu.',
})

const MobileAppShowcaseSection = dynamic(
  () =>
    import('@/components/sections/MobileAppShowcase').then(
      (mod) => mod.MobileAppShowcaseSection,
    ),
  {
    loading: () => <SectionSkeleton lines={4} />,
  },
)

const EcosystemFlowSection = dynamic(
  () =>
    import('@/components/sections/ecosystem-flow-section').then(
      (mod) => mod.EcosystemFlowSection,
    ),
  {
    loading: () => <SectionSkeleton lines={3} />,
  },
)

const ForWhomSection = dynamic(
  () =>
    import('@/components/sections/for-whom-section').then(
      (mod) => mod.ForWhomSection,
    ),
  {
    loading: () => <SectionSkeleton lines={3} />,
  },
)

const FeaturesSection = dynamic(
  () =>
    import('@/components/sections/features-section').then(
      (mod) => mod.FeaturesSection,
    ),
  {
    loading: () => <SectionSkeleton lines={3} />,
  },
)

const PricingSection = dynamic(
  () =>
    import('@/components/sections/pricing-section').then(
      (mod) => mod.PricingSection,
    ),
  {
    loading: () => <SectionSkeleton lines={4} />,
  },
)

const TrustSection = dynamic(
  () =>
    import('@/components/sections/trust-section-server').then(
      (mod) => mod.TrustSectionServer,
    ),
  {
    loading: () => <SectionSkeleton lines={3} />,
  },
)

export default function HomePage() {
  return (
    <PageTransition>
      <LandingLocaleProvider>
        <div className="min-h-screen bg-[#F6F7F9] text-[#1D1D1F] selection:bg-[#0071E3]/18">
          <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.18]" />
          <SiteHeader />
          <main id="main-content" tabIndex={-1}>
            <HeroCoverFlow />
            <MobileAppShowcaseSection />
            <EcosystemFlowSection />
            <PricingSection />
            <ForWhomSection />
            <FeaturesSection />
            <TrustSection />
          </main>
          <SiteFooter />
          <FloatingCTA />
        </div>
      </LandingLocaleProvider>
    </PageTransition>
  )
}
