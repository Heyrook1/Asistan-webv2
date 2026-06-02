'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Activity, BriefcaseMedical, Sparkles, Stethoscope } from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { GlassCard } from '@/components/ui/glass-card'
import { revealSoft, staggerContainer } from '@/lib/animations'
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
    accent: 'from-[#0071E3]/18 via-cyan-300/10 to-transparent',
    size: 'wide',
  },
  {
    image: '/images/medical-team.jpg',
    icon: Activity,
    accent: 'from-emerald-300/16 via-[#0071E3]/8 to-transparent',
    size: 'normal',
  },
  {
    image: '/images/industry-beauty.jpg',
    icon: Sparkles,
    accent: 'from-pink-300/16 via-violet-300/10 to-transparent',
    size: 'normal',
  },
  {
    image: '/images/industry-pro.jpg',
    icon: BriefcaseMedical,
    accent: 'from-slate-300/20 via-[#0071E3]/10 to-transparent',
    size: 'tall',
  },
] as const

const FOR_WHOM_COPY: Record<'tr' | 'en', { badge: string; title: string; cards: [SectorCard, SectorCard, SectorCard, SectorCard] }> = {
  tr: {
    badge: 'Kimler İçin',
    title: 'Farklı tempoda çalışan sağlık ekipleri için tek premium operasyon standardı',
    cards: [
      {
        title: 'Diş ve ağız sağlığı klinikleri',
        subtitle: 'Diş',
        description: 'Periyodik kontrolleri, acil boşlukları ve ekip takvimini tek zaman çizelgesinde yönetin.',
        metadata: ['Takip otomasyonu', 'Ekip takvimi', 'Slot dengesi'],
      },
      {
        title: 'Fizyoterapi merkezleri',
        subtitle: 'Fizyoterapi',
        description: 'Seans paketlerini ve terapist doluluk oranlarını daha hızlı planlayın.',
        metadata: ['Paket takibi', 'Tekrarlayan planlar', 'Hatırlatma akışı'],
      },
      {
        title: 'Estetik ve güzellik klinikleri',
        subtitle: 'Estetik',
        description: 'Danışmanlık sürecini mobil keşif kanalından gelen randevu talebiyle birleştirin.',
        metadata: ['Danışmanlıktan randevuya', 'Yorum odaklı güven', 'Yüksek niyetli talep'],
      },
      {
        title: 'Genel klinik grupları',
        subtitle: 'Genel Klinik',
        description: 'Çoklu doktor, şube ve hasta kuyruğunu kurumsal netlikte koordine edin.',
        metadata: ['Multi-tenant uyumlu', 'RLS güvenli veri', 'Ekipler arası görünürlük'],
      },
    ],
  },
  en: {
    badge: 'For Whom',
    title: 'Built for healthcare teams with different rhythms, one shared standard',
    cards: [
      {
        title: 'Dental and oral clinics',
        subtitle: 'Dental',
        description: 'Manage recurring controls, urgent slots, and staff scheduling from one timeline.',
        metadata: ['Follow-up automation', 'Staff calendars', 'Slot balancing'],
      },
      {
        title: 'Physiotherapy centers',
        subtitle: 'Physiotherapy',
        description: 'Track session packages and daily therapist occupancy with faster scheduling.',
        metadata: ['Package tracking', 'Recurring plans', 'Reminder journeys'],
      },
      {
        title: 'Aesthetic and beauty clinics',
        subtitle: 'Aesthetics',
        description: 'Combine consultation flow with appointment demand coming from mobile discovery.',
        metadata: ['Consult to book flow', 'Review-led trust', 'High-intent leads'],
      },
      {
        title: 'General practice groups',
        subtitle: 'General Clinic',
        description: 'Coordinate multiple doctors, branches, and patient queues with enterprise-grade visibility.',
        metadata: ['Multi-tenant friendly', 'RLS-secured data', 'Cross-team visibility'],
      },
    ],
  },
}

export function ForWhomSection() {
  const { locale } = useLandingLocale()
  const copy = FOR_WHOM_COPY[locale]

  return (
    <section id="for-whom" className="px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto w-full max-w-[1220px]">
        <motion.div
          variants={staggerContainer(0.07, 0.03)}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: '-9% 0px -7% 0px' }}
          className="mb-8"
        >
          <motion.p variants={revealSoft} className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0071E3]">
            {copy.badge}
          </motion.p>
          <motion.h2 variants={revealSoft} className="mt-3 max-w-3xl text-balance font-display text-[clamp(1.8rem,4.1vw,3.05rem)] font-semibold tracking-[-0.02em] text-[#1D1D1F]">
            {copy.title}
          </motion.h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {BASE_SECTORS.map((sector, index) => {
            const card = copy.cards[index]
            const cardSpan =
              sector.size === 'wide'
                ? 'xl:col-span-2'
                : sector.size === 'tall'
                  ? 'md:row-span-2 xl:col-span-1'
                  : 'xl:col-span-1'

            return (
              <GlassCard
                key={card.title}
                interactive
                className={cn(
                  'group relative min-h-[290px] overflow-hidden p-0',
                  cardSpan,
                )}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${sector.accent}`} />
                <Image
                  src={sector.image}
                  alt={card.title}
                  fill
                  className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,17,20,0.78)_6%,rgba(17,17,20,0.2)_46%,rgba(17,17,20,0)_78%)]" />

                <div className="relative z-10 flex h-full flex-col justify-between p-5">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-[0.1em] text-[#1D1D1F]">
                    <sector.icon className="h-3.5 w-3.5 text-[#0071E3]" />
                    {card.subtitle}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.01em] text-white">{card.title}</h3>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-white/82">{card.description}</p>
                    <div className="mt-3 translate-y-3 opacity-0 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="flex flex-wrap gap-2">
                        {card.metadata.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-white/32 bg-white/16 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
