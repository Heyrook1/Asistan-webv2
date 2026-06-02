import dynamic from 'next/dynamic'

import { HeroSection } from '@/components/sections/hero-section'
import { LandingLocaleProvider } from '@/components/sections/landing-locale'
import { PageTransition } from '@/components/sections/page-transition'
import { SectionSkeleton } from '@/components/sections/section-skeleton'
import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'

const MobileAppShowcaseSection = dynamic(
  () =>
    import('@/components/sections/mobile-app-showcase-section').then(
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
    import('@/components/sections/trust-section').then(
      (mod) => mod.TrustSection,
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
          <main>
            <HeroSection />
            <MobileAppShowcaseSection />
            <EcosystemFlowSection />
            <ForWhomSection />
            <FeaturesSection />
            <PricingSection />
            <TrustSection />
          </main>
          <SiteFooter />
        </div>
      </LandingLocaleProvider>
    </PageTransition>
  )
}
