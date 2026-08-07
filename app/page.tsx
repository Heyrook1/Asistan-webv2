import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import { LandingLocaleProvider } from '@/components/sections/landing-locale'
import { PageTransition } from '@/components/sections/page-transition'
import { SectionSkeleton } from '@/components/sections/section-skeleton'
import { FloatingCTA } from '@/components/ui/FloatingCTA'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/', {
  title: {
    absolute: 'Asistan Health | KKTC klinik randevu ve operasyon paneli',
  },
  description:
    'Randevu, hasta ve ekibi tek panelde yönetin. Demo rezerve edin — kredi kartı gerekmez.',
})

/** Shell (framer-motion) split from the critical hero path. */
const SiteHeader = dynamic(
  () => import('@/components/sections/site-header').then((mod) => mod.SiteHeader),
  { loading: () => <div className="h-16 border-b border-black/5 bg-[#F6F7F9]" aria-hidden /> },
)

const SiteFooter = dynamic(
  () => import('@/components/sections/site-footer').then((mod) => mod.SiteFooter),
)

const HeroEcosystem = dynamic(
  () => import('@/components/sections/hero-ecosystem').then((mod) => mod.HeroEcosystem),
  { loading: () => <SectionSkeleton lines={5} className="min-h-[70vh]" /> },
)

const TrustedBySection = dynamic(
  () =>
    import('@/components/sections/trusted-by-section').then((mod) => mod.TrustedBySection),
  { loading: () => <SectionSkeleton lines={2} /> },
)

const WhyOutcomesSection = dynamic(
  () =>
    import('@/components/sections/why-outcomes-section').then((mod) => mod.WhyOutcomesSection),
  { loading: () => <SectionSkeleton lines={3} /> },
)

const ModulesBentoSection = dynamic(
  () =>
    import('@/components/sections/modules-bento-section').then((mod) => mod.ModulesBentoSection),
  { loading: () => <SectionSkeleton lines={4} /> },
)

const RoadmapTimelineSection = dynamic(
  () =>
    import('@/components/sections/roadmap-timeline-section').then(
      (mod) => mod.RoadmapTimelineSection,
    ),
  { loading: () => <SectionSkeleton lines={4} /> },
)

const ComparePanelsSection = dynamic(
  () =>
    import('@/components/sections/compare-panels-section').then(
      (mod) => mod.ComparePanelsSection,
    ),
  { loading: () => <SectionSkeleton lines={3} /> },
)

const PatientJourneySection = dynamic(
  () =>
    import('@/components/sections/patient-journey-section').then(
      (mod) => mod.PatientJourneySection,
    ),
  { loading: () => <SectionSkeleton lines={3} /> },
)

const ProductGallerySection = dynamic(
  () =>
    import('@/components/sections/product-gallery-section').then(
      (mod) => mod.ProductGallerySection,
    ),
  { loading: () => <SectionSkeleton lines={3} /> },
)

const DifferenceSection = dynamic(
  () =>
    import('@/components/sections/difference-section').then((mod) => mod.DifferenceSection),
  { loading: () => <SectionSkeleton lines={3} /> },
)

const SecurityGridSection = dynamic(
  () =>
    import('@/components/sections/security-grid-section').then(
      (mod) => mod.SecurityGridSection,
    ),
  { loading: () => <SectionSkeleton lines={3} /> },
)

const OutcomeCasesSection = dynamic(
  () =>
    import('@/components/sections/outcome-cases-section-server').then(
      (mod) => mod.OutcomeCasesSectionServer,
    ),
  { loading: () => <SectionSkeleton lines={4} /> },
)

const LandingFaqSection = dynamic(
  () =>
    import('@/components/sections/landing-faq-section').then((mod) => mod.LandingFaqSection),
  { loading: () => <SectionSkeleton lines={3} /> },
)

const FinalCtaBand = dynamic(
  () => import('@/components/sections/final-cta-band').then((mod) => mod.FinalCtaBand),
  { loading: () => <SectionSkeleton lines={2} /> },
)

export default function HomePage() {
  return (
    <PageTransition>
      <LandingLocaleProvider>
        <div className="min-h-screen bg-[#F6F7F9] text-[#1D1D1F] selection:bg-[#0071E3]/18">
          <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.18]" />
          <SiteHeader />
          <main id="main-content" tabIndex={-1}>
            <Suspense fallback={<SectionSkeleton lines={5} className="min-h-[70vh]" />}>
              <HeroEcosystem />
            </Suspense>
            <TrustedBySection />
            <WhyOutcomesSection />
            <ModulesBentoSection />
            <RoadmapTimelineSection />
            <ComparePanelsSection />
            <PatientJourneySection />
            <ProductGallerySection />
            <DifferenceSection />
            <SecurityGridSection />
            <OutcomeCasesSection />
            <LandingFaqSection />
            <FinalCtaBand />
          </main>
          <SiteFooter />
          <FloatingCTA />
        </div>
      </LandingLocaleProvider>
    </PageTransition>
  )
}
