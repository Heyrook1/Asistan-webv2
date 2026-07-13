'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Database, LockKeyhole, ShieldCheck, Star, Trash2 } from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { revealSoft, staggerContainer, appleEase } from '@/lib/animations'
import type { PublicTrustStats } from '@/lib/trust/public'

type PublicReview = {
  id: string
  rating: number
  comment: string
  clinicName: string
  city: string | null
  doctorName: string | null
  authorName: string
  createdAt: string
}

const COPY = {
  tr: {
    badge: 'Güven mimarisi',
    title: 'Kanıtlanabilir kontroller, abartısız sonuçlar',
    description:
      'Aşağıdaki sayılar canlı sistemden gelir. Yorumlar yalnızca tamamlanmış randevuya bağlı gerçek kayıtlardır. Sahte testimonial kullanmıyoruz.',
    controlsTitle: 'Nasıl güvence altına alıyoruz?',
    reviewsTitle: 'Doğrulanmış hasta yorumları',
    emptyReviews:
      'Henüz herkese açık doğrulanmış yorum yok. İlk tamamlanan randevu yorumları burada otomatik listelenir.',
    trustCenter: 'Güven Merkezini İncele',
    verifiedBooking: 'Tamamlanmış randevu sonrası',
    controls: [
      {
        icon: ShieldCheck,
        title: 'KVKK + tenant ayrımı',
        detail: 'Klinik verisi işletme bazında izole edilir; rol bazlı izinler erişimi sınırlar.',
      },
      {
        icon: LockKeyhole,
        title: 'Sunucu tarafı oturum',
        detail: 'Dashboard erişimi sunucuda doğrulanır; hassas aksiyonlar denetim günlüğüne yazılır.',
      },
      {
        icon: Database,
        title: 'Hekim profil doğrulama',
        detail: 'Ruhsat/diploma/kimlik alanları doldukça profil “doğrulandı” durumuna geçer.',
      },
      {
        icon: Trash2,
        title: 'Silme hakkı iş akışı',
        detail: 'KVKK silme talepleri yönetişim kuyruğunda izlenir ve tamamlanınca PII anonimleşir.',
      },
    ],
    stats: {
      clinics: 'Aktif klinik',
      doctors: 'Kimlik kaydı olan hekim',
      appointments: 'Tamamlanan randevu',
      reviews: 'Doğrulanmış yorum',
    },
  },
  en: {
    badge: 'Trust architecture',
    title: 'Verifiable controls, no inflated claims',
    description:
      'Stats below come from the live system. Reviews are only shown when tied to a completed appointment. We do not publish fake testimonials.',
    controlsTitle: 'How we protect trust',
    reviewsTitle: 'Verified patient reviews',
    emptyReviews:
      'No public verified reviews yet. Completed-appointment reviews will appear here automatically.',
    trustCenter: 'Open Trust Center',
    verifiedBooking: 'After completed booking',
    controls: [
      {
        icon: ShieldCheck,
        title: 'KVKK + tenant isolation',
        detail: 'Clinic data is isolated per business with role-based access limits.',
      },
      {
        icon: LockKeyhole,
        title: 'Server-side sessions',
        detail: 'Dashboard access is validated on the server; sensitive actions write audit logs.',
      },
      {
        icon: Database,
        title: 'Doctor profile verification',
        detail: 'License/diploma/ID fields raise the profile to a verified state.',
      },
      {
        icon: Trash2,
        title: 'Deletion workflow',
        detail: 'KVKK deletion requests are tracked and PII is anonymized on completion.',
      },
    ],
    stats: {
      clinics: 'Active clinics',
      doctors: 'Doctors with ID records',
      appointments: 'Completed appointments',
      reviews: 'Verified reviews',
    },
  },
} as const

export function TrustSection({
  stats,
  reviews,
}: {
  stats: PublicTrustStats
  reviews: PublicReview[]
}) {
  const { locale } = useLandingLocale()
  const copy = COPY[locale]

  const statItems = [
    { label: copy.stats.clinics, value: stats.activeClinics },
    { label: copy.stats.doctors, value: stats.verifiedDoctors },
    { label: copy.stats.appointments, value: stats.completedAppointments },
    {
      label: copy.stats.reviews,
      value: stats.reviewCount,
      hint: stats.averageRating ? `${stats.averageRating}/5` : null,
    },
  ]

  return (
    <section id="trust" className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:py-28">
      <div className="pointer-events-none absolute left-[-8%] top-[18%] h-[320px] w-[320px] rounded-full bg-[#0071E3]/4 blur-[100px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1220px]">
        <motion.div
          variants={staggerContainer(0.08, 0.02)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -8% 0px' }}
          className="mb-12 max-w-3xl"
        >
          <motion.p variants={revealSoft} className="text-xs font-bold uppercase tracking-[0.18em] text-[#0071E3]">
            {copy.badge}
          </motion.p>
          <motion.h2
            variants={revealSoft}
            className="mt-3 text-balance font-display text-[clamp(1.8rem,4.1vw,3rem)] font-bold leading-[1.1] tracking-[-0.035em] text-[#1D1D1F]"
          >
            {copy.title}
          </motion.h2>
          <motion.p variants={revealSoft} className="mt-4 text-base leading-7 text-[#5D6068]">
            {copy.description}
          </motion.p>
          <motion.div variants={revealSoft} className="mt-6">
            <Button asChild className="rounded-xl bg-[#0071E3] text-white hover:bg-[#0063C8]">
              <Link href="/guven">
                {copy.trustCenter}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.05, ease: appleEase }}
              className="rounded-2xl border border-black/5 bg-[#F7FAFC] p-4"
            >
              <p className="text-2xl font-black tracking-tight text-[#1D1D1F]">
                {item.value}
                {item.hint ? <span className="ml-2 text-sm font-semibold text-[#5D6068]">{item.hint}</span> : null}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#86868B]">{item.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h3 className="border-b border-black/5 pb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
              {copy.controlsTitle}
            </h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {copy.controls.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.06, ease: appleEase }}
                >
                  <GlassCard className="h-full border-white/50 bg-white/40 p-4 shadow-md">
                    <div className="mb-3 inline-flex size-9 items-center justify-center rounded-xl bg-[#0071E3]/10 text-[#0071E3]">
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-bold text-[#1D1D1F]">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-6 text-[#4B4C52]">{item.detail}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="border-b border-black/5 pb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
              {copy.reviewsTitle}
            </h3>
            {reviews.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-black/10 bg-[#F7FAFC] p-6 text-sm leading-7 text-[#5D6068]">
                {copy.emptyReviews}
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {reviews.slice(0, 4).map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: idx * 0.06, ease: appleEase }}
                  >
                    <GlassCard className="flex h-full flex-col justify-between border-white/50 bg-white/40 p-5 shadow-md">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-[#1D1D1F]">{review.authorName}</p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                            <BadgeCheck className="h-2.5 w-2.5" aria-hidden="true" />
                            {copy.verifiedBooking}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#5D6068]">
                          {review.clinicName}
                          {review.city ? ` · ${review.city}` : ''}
                          {review.doctorName ? ` · ${review.doctorName}` : ''}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-[#2E3138]">&ldquo;{review.comment}&rdquo;</p>
                      </div>
                      <div className="mt-4 flex items-center gap-0.5 border-t border-slate-100 pt-3">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={`${review.id}-${index}`} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
