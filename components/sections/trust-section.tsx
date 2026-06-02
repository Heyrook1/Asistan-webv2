'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { GlassCard } from '@/components/ui/glass-card'
import { revealSoft, staggerContainer } from '@/lib/animations'

const TRUST_COPY = {
  tr: {
    badge: 'Güven ve Sosyal Kanıt',
    title: 'Sağlık pazarının iki tarafında gerçek etki',
    patientReviews: [
      {
        name: 'Leyla Y.',
        clinic: 'Northcare Clinic',
        text: 'Dermatoloğu dakikalar içinde buldum ve aynı gün randevu oluşturdum. Hatırlatma tam zamanında geldi.',
        avatar: '/images/medical-team.jpg',
      },
      {
        name: 'Emir T.',
        clinic: 'Asistan Medical Center',
        text: 'Puanları ve uygun doktorları karşılaştırmak çok kolaydı. Telefonla aramaya hiç gerek kalmadı.',
        avatar: '/images/industry-health.jpg',
      },
      {
        name: 'Sude K.',
        clinic: 'Blueline Aesthetics',
        text: 'Yorumları ve fiyatları en baştan gördüm. Rezervasyon ve bildirim akışı gerçekten premium.',
        avatar: '/images/industry-beauty.jpg',
      },
    ],
    clinicTestimonials: [
      {
        title: 'Diş kliniği grubu, Lefkoşa',
        quote: 'Asistan, ön masa yükünü azalttı ve dolu saat oranını yükseltti. Uygulama kanalı düzenli yeni hasta getiriyor.',
      },
      {
        title: 'Rehabilitasyon merkezi, Mağusa',
        quote: 'Terapist kapasitesini artık çok daha az karmaşayla yönetiyoruz. Onay ve hatırlatma süreçleri otomatik işliyor.',
      },
    ],
  },
  en: {
    badge: 'Trust and social proof',
    title: 'Proof from both sides of the healthcare marketplace',
    patientReviews: [
      {
        name: 'Leyla Y.',
        clinic: 'Northcare Clinic',
        text: 'I found a dermatologist in minutes and booked for the same day. The reminder alert was spot on.',
        avatar: '/images/medical-team.jpg',
      },
      {
        name: 'Emir T.',
        clinic: 'Asistan Medical Center',
        text: 'The app made comparing ratings and available doctors incredibly easy. No phone calls needed.',
        avatar: '/images/industry-health.jpg',
      },
      {
        name: 'Sude K.',
        clinic: 'Blueline Aesthetics',
        text: 'I could see real reviews and prices upfront. Booking and follow-up notifications felt premium.',
        avatar: '/images/industry-beauty.jpg',
      },
    ],
    clinicTestimonials: [
      {
        title: 'Dental group, Nicosia',
        quote: 'Asistan reduced front-desk overload and increased filled slots. The app channel brought new patients we were missing.',
      },
      {
        title: 'Rehab center, Famagusta',
        quote: 'We now manage weekly therapist capacity with less chaos. Booking confirmations and reminders run automatically.',
      },
    ],
  },
} as const

export function TrustSection() {
  const { locale } = useLandingLocale()
  const copy = TRUST_COPY[locale]

  return (
    <section id="trust" className="px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto w-full max-w-[1220px]">
        <motion.div
          variants={staggerContainer(0.08, 0.02)}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -8% 0px' }}
          className="mb-8 text-center"
        >
          <motion.p variants={revealSoft} className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0071E3]">
            {copy.badge}
          </motion.p>
          <motion.h2 variants={revealSoft} className="mt-3 text-balance font-display text-[clamp(1.8rem,4.1vw,3rem)] font-semibold tracking-[-0.02em] text-[#1D1D1F]">
            {copy.title}
          </motion.h2>
        </motion.div>

        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="grid gap-3 md:grid-cols-3">
            {copy.patientReviews.map((review) => (
              <GlassCard key={review.name} interactive className="p-4">
                <div className="flex items-center gap-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-black/10">
                    <Image src={review.avatar} alt={review.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1D1D1F]">{review.name}</p>
                    <p className="text-xs text-[#5F6370]">{review.clinic}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#2E3138]">"{review.text}"</p>
                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`${review.name}-${index}`} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="space-y-3">
            {copy.clinicTestimonials.map((item) => (
              <GlassCard key={item.title} interactive className="p-5">
                <Quote className="h-5 w-5 text-[#0071E3]" />
                <p className="mt-3 text-sm font-semibold text-[#1D1D1F]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#2E3138]">{item.quote}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
