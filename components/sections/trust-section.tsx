'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Quote, Star, Check } from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { GlassCard } from '@/components/ui/glass-card'
import { revealSoft, staggerContainer, appleEase } from '@/lib/animations'

const TRUST_COPY = {
  tr: {
    badge: 'Güven ve Doğrulanmış Değerlendirmeler',
    title: 'Sağlık pazarının her iki tarafında kanıtlanmış başarı',
    verified: 'Doğrulanmış Rezervasyon',
    patientTitle: 'Mobil Uygulama Hasta Yorumları',
    clinicTitle: 'Klinik & Poliklinik Testimonial’ları',
    patientReviews: [
      {
        name: 'Leyla Yıldız',
        clinic: 'Northcare Clinic Lefkoşa',
        text: 'Dermatoloğumu dakikalar içinde buldum ve aynı gün için randevu oluşturdum. SMS ve bildirim hatırlatması tam zamanında geldi. Çok pratik.',
        avatar: '/images/medical-team.jpg',
        rating: 5,
      },
      {
        name: 'Emir Tandoğan',
        clinic: 'Asistan Medical Center',
        text: 'Doktorların uygun saatlerini ve uzmanlık alanlarını mobil uygulamadan karşılaştırmak çok kolaydı. Telefonla arayıp sıra beklemeye son!',
        avatar: '/images/industry-health.jpg',
        rating: 5,
      },
      {
        name: 'Sude Karahan',
        clinic: 'Blueline Aesthetics',
        text: 'Klinik yorumlarını ve hekim puanlarını en baştan şeffaf olarak gördüm. Rezervasyon onay akışı ve bildirimler gerçekten çok premium.',
        avatar: '/images/industry-beauty.jpg',
        rating: 5,
      },
    ],
    clinicTestimonials: [
      {
        title: 'Özel Diş Kliniği Grubu, Lefkoşa',
        quote: 'Asistan Health paneli ön masadaki telefon trafiğimizi %40 azalttı. Mobil rezervasyon kanalı sayesinde her hafta yeni hastalar kazanıyoruz.',
        author: 'Dr. Caner Demir, Kurucu Hekim',
      },
      {
        title: 'Fizik Tedavi & Rehabilitasyon, Mağusa',
        quote: 'Terapistlerimizin günlük seans doluluk oranlarını artık tek bir ekrandan yönetiyoruz. Randevu onayları ve iptal süreçleri otomatik işliyor.',
        author: 'Psk. Melis Şener, Operasyon Müdürü',
      },
    ],
  },
  en: {
    badge: 'Trust & Verified Reviews',
    title: 'Proven success on both sides of the healthcare marketplace',
    verified: 'Verified Booking',
    patientTitle: 'Patient Reviews on Mobile App',
    clinicTitle: 'Clinic Operations Testimonials',
    patientReviews: [
      {
        name: 'Leyla Yildiz',
        clinic: 'Northcare Clinic Nicosia',
        text: 'I found a verified dermatologist in minutes and booked for the same day. The smart push notification was spot on. Highly recommended.',
        avatar: '/images/medical-team.jpg',
        rating: 5,
      },
      {
        name: 'Emir Tandogan',
        clinic: 'Asistan Medical Center',
        text: 'Comparing doctor availability and reviews upfront was incredibly easy. No phone calls needed, no queue waiting.',
        avatar: '/images/industry-health.jpg',
        rating: 5,
      },
      {
        name: 'Sude Karahan',
        clinic: 'Blueline Aesthetics',
        text: 'I loved reading honest doctor ratings before reserving. The booking confirmation and follow-up alerts felt premium.',
        avatar: '/images/industry-beauty.jpg',
        rating: 5,
      },
    ],
    clinicTestimonials: [
      {
        title: 'Private Dental Group, Nicosia',
        quote: 'Asistan Health dashboard reduced front-desk call load by 40%. The mobile app integration keeps bringing new patients we missed.',
        author: 'Dr. Caner Demir, Chief Medical Officer',
      },
      {
        title: 'Rehabilitation & Physio Center, Famagusta',
        quote: 'We now coordinate weekly therapist schedules with zero friction. Automated check-in reminders and queue updates run themselves.',
        author: 'Melis Sener, Operations Lead',
      },
    ],
  },
} as const

export function TrustSection() {
  const { locale } = useLandingLocale()
  const copy = TRUST_COPY[locale]

  return (
    <section id="trust" className="px-4 py-20 sm:px-6 lg:py-28 bg-[#FFFFFF] relative overflow-hidden">
      
      {/* Background light glow */}
      <div className="absolute top-[20%] left-[-10%] h-[350px] w-[350px] rounded-full bg-[#0071E3]/4 blur-[100px] pointer-events-none" />

      <div className="mx-auto w-full max-w-[1220px] relative z-10">
        
        {/* Section Header */}
        <motion.div
          variants={staggerContainer(0.08, 0.02)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -8% 0px' }}
          className="mb-14 text-center"
        >
          <motion.p variants={revealSoft} className="text-xs font-bold uppercase tracking-[0.18em] text-[#0071E3]">
            {copy.badge}
          </motion.p>
          <motion.h2 variants={revealSoft} className="mt-3 text-balance font-display text-[clamp(1.8rem,4.1vw,3rem)] font-bold tracking-[-0.035em] text-[#1D1D1F] leading-[1.1]">
            {copy.title}
          </motion.h2>
        </motion.div>

        {/* Two Columns Grid */}
        <div className="grid gap-8 xl:grid-cols-[1.32fr_0.68fr]">
          
          {/* Patient Reviews Column */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-black/5 pb-3">
              {copy.patientTitle}
            </h3>
            
            <div className="grid gap-5 md:grid-cols-3">
              {copy.patientReviews.map((review, idx) => (
                <motion.div
                  key={review.name}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: appleEase }}
                >
                  <GlassCard
                    interactive
                    className="p-5 h-full flex flex-col justify-between bg-white/40 border-white/50 shadow-md transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 overflow-hidden rounded-full border border-black/10 shadow-inner">
                          <Image src={review.avatar} alt={review.name} fill className="object-cover" sizes="44px" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1D1D1F] tracking-tight">{review.name}</p>
                          <p className="text-xs text-[#5D6068] font-medium leading-none mt-0.5">{review.clinic}</p>
                        </div>
                      </div>

                      {/* Verified Badge */}
                      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                        {copy.verified}
                      </div>

                      <p className="mt-3.5 text-sm leading-relaxed text-[#2E3138] font-medium">
                        "{review.text}"
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={`${review.name}-${index}`} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Clinic Testimonials Column */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-black/5 pb-3">
              {copy.clinicTitle}
            </h3>

            <div className="space-y-4">
              {copy.clinicTestimonials.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12, ease: appleEase }}
                >
                  <GlassCard
                    interactive
                    className="p-6 bg-white/40 border-white/50 shadow-md relative transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Quote className="h-5 w-5 text-[#0071E3] opacity-60" />
                    <h4 className="mt-3 text-sm font-bold text-[#1D1D1F] tracking-tight">{item.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-[#4B4C52] font-medium">
                      "{item.quote}"
                    </p>
                    <p className="mt-4 text-xs font-bold text-[#0071E3]">{item.author}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
