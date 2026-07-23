'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Activity, BriefcaseMedical, Sparkles, Stethoscope } from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { GlassCard } from '@/components/ui/glass-card'
import { revealSoft, staggerContainer, baseSpring, appleEase } from '@/lib/animations'
import { cn } from '@/lib/utils'

type SectorCard = {
  title: string
  subtitle: string
  description: string
  metadata: [string, string, string]
}

const BASE_SECTORS = [
  {
    image: '/images/industry-health.jpg',
    icon: Stethoscope,
    accent: 'from-sky-500/20 via-blue-600/5 to-transparent',
    gridClass: 'col-span-1',
  },
  {
    image: '/images/medical-team.jpg',
    icon: Activity,
    accent: 'from-sky-500/20 via-blue-600/5 to-transparent',
    gridClass: 'col-span-1',
  },
  {
    image: '/images/industry-beauty.jpg',
    icon: Sparkles,
    accent: 'from-rose-500/20 via-blue-600/5 to-transparent',
    gridClass: 'col-span-1',
  },
  {
    image: '/images/industry-pro.jpg',
    icon: BriefcaseMedical,
    accent: 'from-slate-800/80 via-slate-900/40 to-transparent',
    gridClass: 'col-span-1 md:col-span-2 xl:col-span-3 min-h-[340px]',
  },
] as const

const FOR_WHOM_COPY: Record<'tr' | 'en', { badge: string; title: string; cards: [SectorCard, SectorCard, SectorCard, SectorCard] }> = {
  tr: {
    badge: 'Kimler İçin',
    title: 'Farklı uzmanlıklar ve klinikler için tek premium standart',
    cards: [
      {
        title: 'Diş ve Ağız Sağlığı',
        subtitle: 'Diş Hekimliği',
        description: 'Periyodik kontrolleri, acil boşlukları ve hekim takvimlerini tek zaman çizelgesinde yönetin.',
        metadata: ['Takip Otomasyonu', 'Ekip Takvimleri', 'Slot Dengeleme'],
      },
      {
        title: 'Fizyoterapi Merkezleri',
        subtitle: 'Fizik Tedavi',
        description: 'Seans paketlerini, tekrarlı randevuları ve terapist doluluk oranlarını kolayca planlayın.',
        metadata: ['Paket Seans Takibi', 'Tekrarlayan Planlar', 'Hasta Hatırlatıcılar'],
      },
      {
        title: 'Estetik ve Güzellik',
        subtitle: 'Medikal Estetik',
        description: 'Danışmanlık süreçlerini mobil keşif kanalından gelen yüksek niyetli randevu talepleriyle birleştirin.',
        metadata: ['Keşfet ve Rezerve Et', 'Yorum Odaklı Güven', 'Görsel Tedavi Kartları'],
      },
      {
        title: 'Genel Klinik & Çok Şubeli Sağlık Grupları',
        subtitle: 'Genel Klinik Grubu',
        description: 'Birden fazla hekim, poliklinik ve hasta sırasını net bir görünümle koordine edin. Rol bazlı yetki ve işletme bazlı veri ayrımı ile erişimi sınırlandırın.',
        metadata: ['Çok şubeli yapı', 'İşletme bazlı veri ayrımı', 'Ortak randevu düzeni'],
      },
    ],
  },
  en: {
    badge: 'For Whom',
    title: 'Built for healthcare teams with different rhythms, one shared standard',
    cards: [
      {
        title: 'Dental and Oral Clinics',
        subtitle: 'Dental Clinic',
        description: 'Manage recurring controls, urgent slots, and staff scheduling from one timeline.',
        metadata: ['Follow-up Automation', 'Staff Calendars', 'Slot Balancing'],
      },
      {
        title: 'Physiotherapy Centers',
        subtitle: 'Physiotherapy',
        description: 'Track session packages and daily therapist occupancy with faster scheduling.',
        metadata: ['Package Tracking', 'Recurring Plans', 'Reminder Journeys'],
      },
      {
        title: 'Aesthetic & Beauty Clinics',
        subtitle: 'Aesthetics & Skin',
        description: 'Combine consultation flow with appointment demand coming from mobile discovery.',
        metadata: ['Consult to Book', 'Review-Led Trust', 'Ready-to-book patients'],
      },
      {
        title: 'General Practice & Multi-site Medical Groups',
        subtitle: 'Clinic Group',
        description: 'Coordinate multiple doctors, departments, and patient queues with clear visibility. Limit access with role permissions and business-level data separation.',
        metadata: ['Multi-site support', 'Business data separation', 'Shared scheduling'],
      },
    ],
  },
}

export function ForWhomSection() {
  const { locale } = useLandingLocale()
  const copy = FOR_WHOM_COPY[locale]

  return (
    <section id="for-whom" className="px-4 py-20 sm:px-6 lg:py-28 bg-[#FFFFFF]">
      <div className="mx-auto w-full max-w-[1220px]">
        
        {/* Section Header */}
        <motion.div
          variants={staggerContainer(0.08, 0.03)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-9% 0px -7% 0px' }}
          className="mb-14"
        >
          <motion.p variants={revealSoft} className="text-xs font-bold uppercase tracking-[0.18em] text-[#0071E3]">
            {copy.badge}
          </motion.p>
          <motion.h2 variants={revealSoft} className="mt-3 max-w-3xl text-balance font-display text-[clamp(1.8rem,4.1vw,3.05rem)] font-bold tracking-[-0.035em] text-[#1D1D1F] leading-[1.1]">
            {copy.title}
          </motion.h2>
        </motion.div>

        {/* Bento Grid: 3 columns layout (3+1) */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {BASE_SECTORS.map((sector, index) => {
            const card = copy.cards[index]
            const Icon = sector.icon

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: appleEase }}
                className={sector.gridClass}
              >
                <GlassCard
                  interactive
                  className="group relative min-h-[320px] h-full overflow-hidden p-0 flex flex-col justify-between border-black/5"
                >
                  {/* Clinic specific gradient accent overlay */}
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${sector.accent} opacity-70 transition-opacity duration-500 group-hover:opacity-100 z-10`} />
                  
                  {/* Background Image */}
                  <Image
                    src={sector.image}
                    alt={card.title}
                    fill
                    className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] brightness-[0.72] group-hover:brightness-[0.62]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 z-10" />

                  {/* Card Content */}
                  <div className="relative z-20 flex h-full flex-col justify-between p-6 sm:p-8">
                    
                    {/* Subtitle Badge */}
                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-[11px] font-bold tracking-tight text-[#1D1D1F] shadow-sm">
                      <Icon className="h-4 w-4 text-[#0071E3]" />
                      {card.subtitle}
                    </div>

                    {/* Title & Description with slide-up metadata */}
                    <div className="mt-16 space-y-3">
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{card.title}</h3>
                      <p className="max-w-2xl text-sm leading-relaxed text-white/80 font-medium">
                        {card.description}
                      </p>

                      {/* Sliding metadata tags */}
                      <div className="pt-2 overflow-hidden">
                        <div className="flex flex-wrap gap-2 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] translate-y-8 group-hover:translate-y-0">
                          {card.metadata.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
