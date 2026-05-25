import { MarketingPageShell } from '@/components/marketing/page-shell'
import { ComplianceSection } from '@/components/marketing/sections/compliance-section'
import { CtaSection } from '@/components/marketing/sections/cta-section'
import { FaqSection } from '@/components/marketing/sections/faq-section'
import { FeatureShowcaseSection } from '@/components/marketing/sections/feature-showcase-section'
import { ForWhomSection } from '@/components/marketing/sections/for-whom-section'
import { HeroSection } from '@/components/marketing/sections/hero-section'
import { JourneySection } from '@/components/marketing/sections/journey-section'
import { PricingSection } from '@/components/marketing/sections/pricing-section'
import { SocialProofSection } from '@/components/marketing/sections/social-proof-section'
import { WorkflowSection } from '@/components/marketing/sections/workflow-section'

export function LandingPage() {
  return (
    <MarketingPageShell className="selection:bg-brand-blue/20">
      <HeroSection />
      <ForWhomSection />
      <WorkflowSection />
      <FeatureShowcaseSection />
      <JourneySection />
      <SocialProofSection />
      <PricingSection />
      <FaqSection />
      <ComplianceSection />
      <CtaSection />
    </MarketingPageShell>
  )
}
