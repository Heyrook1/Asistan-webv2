'use client'

import { Footer } from '@/components/marketing/footer'
import { Navbar } from '@/components/marketing/navbar'
import { SmoothScroll } from '@/components/marketing/motion-wrappers'
import { HeroSection } from '@/components/marketing/sections/hero-section'
import { WorkflowSection } from '@/components/marketing/sections/workflow-section'
import { PricingSection } from '@/components/marketing/sections/pricing-section'

export function LandingPage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white text-[#0B1020] font-sans selection:bg-[#2563EB]/20">
        <Navbar />
        
        <main>
          {/* 1. Hero / Dashboard Mockup Section */}
          <HeroSection />
          
          {/* 2. Interactive Workflow / Timeline Section */}
          <WorkflowSection />
          
          {/* 3. Glowing Enterprise Pricing Section */}
          <PricingSection />
        </main>
        
        <Footer />
      </div>
    </SmoothScroll>
  )
}
