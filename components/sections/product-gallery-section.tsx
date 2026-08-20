'use client'

import { useRef } from 'react'
import {
  Bell,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LineChart,
  Smartphone,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeading } from '@/components/sections/section-heading'
import { GalleryScreenMock } from '@/components/sections/landing-device-mocks'
import { useLanguage } from '@/hooks/useLanguage'
import { revealSoft, staggerContainer } from '@/lib/animations'

const SCREENS = [
  {
    id: 'dashboard' as const,
    icon: LayoutDashboard,
    title: { tr: 'Genel bakış', en: 'Dashboard' },
    blurb: {
      tr: 'Günün KPI’ları ve ajanda tek bakışta.',
      en: 'Day KPIs and agenda at a glance.',
    },
  },
  {
    id: 'appointments' as const,
    icon: CalendarDays,
    title: { tr: 'Randevular', en: 'Appointments' },
    blurb: {
      tr: 'Durum etiketleriyle okunur gün listesi.',
      en: 'A readable day list with status tags.',
    },
  },
  {
    id: 'calendar' as const,
    icon: Calendar,
    title: { tr: 'Takvim', en: 'Calendar' },
    blurb: {
      tr: 'Doluluk ve boş slotlar görünür.',
      en: 'Occupancy and open slots, visible.',
    },
  },
  {
    id: 'reports' as const,
    icon: LineChart,
    title: { tr: 'Raporlar', en: 'Reports' },
    blurb: {
      tr: 'Ölçülen operasyon — tahmin değil.',
      en: 'Measured ops — not guesswork.',
    },
  },
  {
    id: 'mobile' as const,
    icon: Smartphone,
    title: { tr: 'Mobil uygulama', en: 'Mobile app' },
    blurb: {
      tr: 'Asistan Rezervasyon hasta kanalı.',
      en: 'Asistan Booking patient channel.',
    },
  },
  {
    id: 'notifications' as const,
    icon: Bell,
    title: { tr: 'Bildirimler', en: 'Notifications' },
    blurb: {
      tr: 'Hatırlatma ve talep akışı.',
      en: 'Reminders and request flow.',
    },
  },
]

export function ProductGallerySection() {
  const { t, language } = useLanguage()
  const scrollerRef = useRef<HTMLUListElement>(null)
  const reduceMotion = useReducedMotion()
  const lang = language === 'en' ? 'en' : 'tr'

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * 340, behavior: 'smooth' })
  }

  return (
    <section
      id="product"
      className="scroll-mt-28 overflow-hidden bg-white px-4 py-16 sm:px-6 lg:py-20"
      aria-labelledby="product-heading"
    >
      <div className="mx-auto max-w-[1100px]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            className="mx-0 max-w-xl text-left"
            titleId="product-heading"
            eyebrow={t({ tr: 'Ürün ekranları', en: 'Product screens' })}
            title={t({
              tr: 'Panel gerçekten böyle görünür.',
              en: 'This is what the panel actually looks like.',
            })}
            description={t({
              tr: 'Asistan Health ajandası ve Asistan Rezervasyon hasta yüzeyi — odaklanmış ürün kareleri.',
              en: 'Asistan Health agenda and Asistan Booking patient surface — focused product frames.',
            })}
          />
          <div className="flex gap-2 self-end">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="inline-flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#1D1D1F] transition hover:border-[#0071E3]/30 hover:text-[#0071E3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
              aria-label={t({ tr: 'Önceki ekranlar', en: 'Previous screens' })}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="inline-flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#1D1D1F] transition hover:border-[#0071E3]/30 hover:text-[#0071E3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
              aria-label={t({ tr: 'Sonraki ekranlar', en: 'Next screens' })}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <motion.ul
          ref={scrollerRef}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          variants={reduceMotion ? undefined : staggerContainer(0.05)}
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-8%' }}
        >
          {SCREENS.map((screen) => (
            <motion.li
              key={screen.id}
              variants={reduceMotion ? undefined : revealSoft}
              className="w-[min(340px,88vw)] shrink-0 snap-start overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-white shadow-[0_24px_48px_-28px_rgba(15,23,42,0.4)]"
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <screen.icon className="size-4 text-[#0071E3]" aria-hidden />
                  <h3 className="text-sm font-bold text-[#1D1D1F]">{screen.title[lang]}</h3>
                </div>
                <p className="mt-1 text-xs text-[#5D6068]">{screen.blurb[lang]}</p>
              </div>
              <GalleryScreenMock variant={screen.id} lang={lang} />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
