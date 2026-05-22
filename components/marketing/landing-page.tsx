'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Landmark,
  LockKeyhole,
  MenuSquare,
  MessageSquareText,
  Scissors,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
} from 'lucide-react'

import { Footer } from '@/components/marketing/footer'
import { Navbar } from '@/components/marketing/navbar'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: 'none' | 'sm' | 'md'
}

function Reveal({ children, className, delay = 'none' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.unobserve(element)
        }
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.16 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'reveal-up',
        visible && 'is-visible',
        delay === 'sm' && 'reveal-delay-sm',
        delay === 'md' && 'reveal-delay-md',
        className,
      )}
    >
      {children}
    </div>
  )
}

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      setDisplayValue(value)
      return
    }

    let frame = 0
    const totalFrames = 42
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        const tick = () => {
          frame += 1
          const progress = Math.min(frame / totalFrames, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplayValue(Math.round(value * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
        observer.unobserve(element)
      },
      { threshold: 0.6 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  )
}

const trustBadges = [
  { icon: Stethoscope, text: 'Asistan Health aktif' },
  { icon: ShieldCheck, text: 'Rol bazlı erişim' },
  { icon: LockKeyhole, text: 'KVKK odaklı kurulum' },
  { icon: BadgeCheck, text: 'KKTC iş akışına göre' },
]

const stats = [
  { value: 3, suffix: ' adım', label: 'Kurulum görüşmesi' },
  { value: 2, suffix: ' saat', label: 'Günlük takip yükü hedefi' },
  { value: 1, suffix: ' panel', label: 'Randevu, hasta ve ekip' },
]

const painPoints = [
  {
    icon: MessageSquareText,
    title: 'Mesajlar farklı yerlerde kalır',
    description: 'Telefon, WhatsApp ve not defteri arasında randevu bilgisi kaybolur.',
  },
  {
    icon: Bell,
    title: 'Hatırlatma işi ekibe yük olur',
    description: 'Unutulan aramalar iptal, boş saat ve hasta memnuniyetsizliği yaratır.',
  },
  {
    icon: UsersRound,
    title: 'Yetki ve görevler karışır',
    description: 'Hekim, sekreter ve yönetici aynı bilgiye aynı güvenle ulaşamaz.',
  },
]

const featureCards = [
  {
    icon: CalendarDays,
    title: 'Randevu ve takvim',
    description: 'Günlük randevuları, boş saatleri ve bekleyen onayları tek görünümde takip edin.',
    wide: true,
  },
  {
    icon: FileText,
    title: 'Hasta kartı',
    description: 'Notlar, geçmiş randevular ve takip bilgileri düzenli kalsın.',
  },
  {
    icon: Sparkles,
    title: 'AI önerileri',
    description: 'Boş saatleri ve takip fırsatlarını ekip fark etmeden önce görün.',
  },
  {
    icon: UsersRound,
    title: 'Ekip rolleri',
    description: 'Sekreter, hekim ve yönetici için ayrı yetki alanları oluşturun.',
  },
  {
    icon: Bell,
    title: 'Hatırlatma akışı',
    description: 'Randevu öncesi ve sonrası iletişimi planlı yürütün.',
  },
]

const steps = [
  {
    title: 'Kliniğinizi tanıyalım',
    description: 'Randevu alma, hasta kabul ve takip düzeninizi 30 dakikada çıkarırız.',
  },
  {
    title: 'Panelinizi kuralım',
    description: 'Hizmetleri, ekip rollerini ve çalışma saatlerini birlikte netleştiririz.',
  },
  {
    title: 'Ekibinizle kullanın',
    description: 'Sekreter ve hekimler aynı panelden günlük akışı takip eder.',
  },
]

const healthUseCases = [
  'Doktor ve diş hekimi muayenehaneleri',
  'Psikolog, diyetisyen ve fizyoterapistler',
  'Klinik yöneticileri ve sekreter ekipleri',
  'Randevu ve takip notu tutan sağlık işletmeleri',
]

const industries = [
  { icon: Scissors, title: 'Asistan Beauty', description: 'Salon ve güzellik merkezlerinde randevu, paket ve müşteri takibi.', status: 'Yakında' },
  { icon: Landmark, title: 'Asistan Legal', description: 'Hukuk bürolarında görüşme, müvekkil ve dosya akışı.', status: 'Yakında' },
  { icon: BriefcaseBusiness, title: 'Asistan Emlak', description: 'Emlak ekiplerinde müşteri, portföy ve görüşme planlama.', status: 'Planlanıyor' },
]

const faqs = [
  {
    question: 'Asistan Health tam olarak ne yapar?',
    answer:
      'Randevu, hasta kartı, ekip rolleri, hatırlatma ve takip notlarını tek panelde toplar. Klinik ekibi aynı güncel bilgiyle çalışır.',
  },
  {
    question: 'KKTC dışındaki hastalar için uygun mu?',
    answer:
      'Evet. İlk odak KKTC klinikleri olsa da diaspora ve uzaktan takip senaryoları için de randevu iletişimini düzenli tutar.',
  },
  {
    question: 'Erken erişimde kredi kartı gerekir mi?',
    answer:
      'Hayır. Önce ihtiyaç görüşmesi yapılır. Kurulum kapsamı ve uygun plan netleşmeden ödeme adımı açılmaz.',
  },
  {
    question: 'Hasta verileri nasıl korunur?',
    answer:
      'Rol bazlı erişim, yetki ayrımı ve KVKK odaklı kullanım prensipleriyle tasarlanır. Canlı kullanım öncesinde veri kapsamı birlikte değerlendirilir.',
  },
]

const monthlyPrice = 149
const yearlyPrice = 119

function DashboardMockup() {
  const bars = ['h-10', 'h-16', 'h-12', 'h-24', 'h-14', 'h-20']

  return (
    <div className="relative mx-auto w-full max-w-2xl" aria-label="Asistan panel önizlemesi">
      <div className="absolute -inset-6 rounded-full bg-brand-teal/15 blur-3xl" aria-hidden="true" />
      <div className="animate-float-slow relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-3 shadow-2xl shadow-brand-blue/15 backdrop-blur">
        <div className="rounded-xl border border-slate-100 bg-brand-light p-4">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-teal to-brand-blue text-white">
                <MenuSquare className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-navy">Klinik Paneli</p>
                <p className="text-xs text-slate-500">Bugünün akışı</p>
              </div>
            </div>
            <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-bold text-brand-teal-dark">Canlı</span>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['12', 'Randevu'],
              ['3', 'Onay'],
              ['2', 'Boş saat'],
              ['AI', 'Öneri'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <p className="text-2xl font-extrabold text-brand-navy">{value}</p>
                <p className="text-xs font-medium text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-brand-navy">Randevu akışı</p>
                <Clock3 className="size-4 text-brand-blue" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                {[
                  ['09:30', 'Hasta kontrolü', 'Onaylandı'],
                  ['11:00', 'Klinik görüşme', 'Bekliyor'],
                  ['14:00', 'Takip randevusu', 'Onaylandı'],
                ].map(([time, name, status]) => (
                  <div key={`${time}-${name}`} className="flex items-center justify-between gap-3 rounded-xl bg-brand-light px-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-11 shrink-0 font-mono text-xs text-slate-500">{time}</span>
                      <span className="truncate text-sm font-semibold text-brand-navy">{name}</span>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-brand-teal-dark">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="size-4 text-brand-teal" aria-hidden="true" />
                <p className="text-sm font-bold text-brand-navy">AI önerisi</p>
              </div>
              <p className="text-sm leading-6 text-slate-600">Boş 15:30 saati bekleyen hastaya önerilebilir.</p>
              <div className="mt-4 flex h-28 items-end gap-2 rounded-xl bg-gradient-to-b from-brand-blue/10 to-white p-3">
                {bars.map((height, index) => (
                  <div key={`${height}-${index}`} className="flex flex-1 items-end">
                    <div className={cn('w-full rounded-t-md bg-gradient-to-t from-brand-blue to-brand-teal', height)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-float-card absolute -left-3 top-8 hidden rounded-xl border border-white/80 bg-white/95 p-3 shadow-xl md:block">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-brand-teal" aria-hidden="true" />
          <span className="text-xs font-bold text-brand-navy">Rol bazlı erişim</span>
        </div>
      </div>
    </div>
  )
}

function PricingPreview() {
  const [yearly, setYearly] = useState(true)
  const price = yearly ? yearlyPrice : monthlyPrice
  const label = yearly ? 'Yıllık planla aylık' : 'Aylık başlangıç'

  return (
    <section id="pricing-preview" className="bg-white px-4 py-16 sm:px-6 lg:px-8" aria-label="Erken erişim fiyat modeli">
      <Reveal className="mx-auto max-w-7xl rounded-2xl border border-brand-blue/15 bg-gradient-to-r from-brand-blue/5 via-white to-brand-teal/10 p-6 shadow-xl shadow-brand-blue/5 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <Badge className="mb-4 border-0 bg-white text-brand-blue shadow-sm hover:bg-white">Erken erişim modeli</Badge>
            <h2 className="max-w-3xl text-2xl font-extrabold tracking-tight text-brand-navy md:text-3xl">
              Önce ihtiyacı netleştirelim, sonra kliniğinize uygun planı açalım.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Kredi kartı gerekmez. Kurulum görüşmesi sonrası ekip büyüklüğü, roller ve hatırlatma kapsamına göre plan önerilir.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-5 grid grid-cols-2 rounded-xl bg-brand-light p-1" role="group" aria-label="Fiyat dönemi">
              <button
                type="button"
                className={cn('h-11 rounded-lg text-sm font-bold text-slate-600 transition-colors', !yearly && 'bg-white text-brand-navy shadow-sm')}
                onClick={() => setYearly(false)}
              >
                Aylık
              </button>
              <button
                type="button"
                className={cn('h-11 rounded-lg text-sm font-bold text-slate-600 transition-colors', yearly && 'bg-white text-brand-navy shadow-sm')}
                onClick={() => setYearly(true)}
              >
                Yıllık
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-4xl font-extrabold text-brand-navy">
              {price}€
              <span className="text-base font-semibold text-slate-500"> / kullanıcı</span>
            </p>
            <Button asChild className="mt-5 h-12 w-full rounded-xl bg-gradient-to-r from-brand-teal to-brand-blue font-bold text-white shadow-lg shadow-brand-blue/20">
              <Link href="/auth/sign-up">Başvuru oluştur</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export function LandingPage() {
  const repeatedTrust = useMemo(
    () => ['KKTC odaklı', 'Asistan Health aktif', 'Türkçe arayüz', 'Rol bazlı erişim', 'KVKK odaklı', 'Erken erişim'],
    [],
  )

  return (
    <div className="min-h-screen bg-white text-brand-navy">
      <Navbar />

      <main>
        <section id="hero" className="mesh-hero soft-grid overflow-hidden pb-12 pt-28 md:pb-20 md:pt-32" aria-label="Ana bölüm">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
            <Reveal>
              <Badge className="mb-5 border-0 bg-white/85 px-3 py-1.5 text-brand-blue shadow-sm ring-1 ring-brand-blue/10 hover:bg-white">
                KKTC klinikleri için erken erişim açık
              </Badge>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-brand-navy md:text-5xl lg:text-6xl">
                KKTC’de randevu, hasta takibi ve ekip yönetimi{' '}
                <span className="animated-gradient-text">tek panelde.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Asistan Health; hekim, sekreter ve klinik yöneticisinin günlük randevu akışını aynı ekranda toplar. Boş saatleri görün, hatırlatmaları planlayın, hasta notlarını düzenli tutun.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-13 w-full rounded-xl bg-gradient-to-r from-brand-teal to-brand-blue px-6 font-bold text-white shadow-xl shadow-brand-blue/20 transition-transform hover:-translate-y-0.5 sm:w-auto">
                  <Link href="/auth/sign-up" aria-label="Asistan Health erken erişim başvurusu yap">
                    Erken erişime katıl
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-13 w-full rounded-xl border-brand-blue/20 bg-white/75 px-6 font-bold text-brand-blue shadow-sm backdrop-blur hover:bg-white sm:w-auto">
                  <Link href="/cozumler/health" aria-label="Asistan Health çözümünü incele">
                    Health çözümünü gör
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                {trustBadges.map((badge) => (
                  <span key={badge.text} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/85 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
                    <badge.icon className="size-4 shrink-0 text-brand-teal" aria-hidden="true" />
                    {badge.text}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay="sm">
              <DashboardMockup />
            </Reveal>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-white py-4" aria-label="Güven şeridi">
          <div className="mx-auto max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8">
            <div className="marquee-track flex w-max gap-3">
              {[...repeatedTrust, ...repeatedTrust].map((item, index) => (
                <span key={`${item}-${index}`} className="inline-flex min-h-11 items-center rounded-full border border-brand-blue/10 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="stats" className="bg-brand-light py-12" aria-label="Ürün kanıtları">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            {stats.map((stat) => (
              <Reveal key={stat.label} className="rounded-2xl border border-white bg-white p-6 shadow-sm">
                <p className="text-4xl font-extrabold text-brand-navy">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-white py-20 md:py-24" aria-label="Nasıl çalışır">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">3 adımda kliniğinize göre kurulur.</h2>
              <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
                Ürünü gerçek çalışma düzeninize uydurmak için önce operasyonu anlarız.
              </p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => (
                <Reveal key={step.title} delay={index === 0 ? 'none' : index === 1 ? 'sm' : 'md'} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <span className="mb-5 flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-teal to-brand-blue text-sm font-extrabold text-white">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-extrabold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="problem" className="bg-brand-light py-20 md:py-24" aria-label="Dönüşüm engelleri">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Dağınık randevu takibi kliniğin ritmini bozar.</h2>
              <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
                Asistan, küçük ve orta ölçekli sağlık ekiplerinin günlük takip yükünü azaltmak için tasarlandı.
              </p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {painPoints.map((card) => (
                <Reveal key={card.title} className="group rounded-2xl border border-white bg-white p-6 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                    <card.icon className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-extrabold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-20 md:py-24" aria-label="Özellikler">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1fr] lg:items-end">
              <div>
                <Badge className="mb-4 border-0 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">Asistan Health</Badge>
                <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Randevu, hasta ve ekip aynı çalışma düzeninde.</h2>
              </div>
              <p className="text-base leading-8 text-slate-600 md:text-lg">
                Yeni bir teknoloji vitrini değil; kliniğinizde her gün yapılan işleri daha takip edilebilir hale getiren pratik bir iş aracıdır.
              </p>
            </Reveal>

            <div className="grid auto-rows-fr gap-5 md:grid-cols-4">
              {featureCards.map((card) => (
                <Reveal
                  key={card.title}
                  className={cn(
                    'rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1',
                    card.wide && 'md:col-span-2 md:row-span-2',
                    !card.wide && 'md:col-span-2 lg:col-span-1',
                  )}
                >
                  <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal-dark">
                    <card.icon className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-extrabold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                  {card.wide && (
                    <div className="mt-8 grid grid-cols-7 gap-2 rounded-2xl bg-brand-light p-4" aria-hidden="true">
                      {Array.from({ length: 14 }).map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            'h-10 rounded-lg bg-white shadow-sm',
                            [2, 5, 9].includes(index) && 'bg-gradient-to-br from-brand-teal to-brand-blue',
                            [4, 11].includes(index) && 'bg-brand-teal/20',
                          )}
                        />
                      ))}
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="health" className="relative overflow-hidden bg-brand-navy py-20 text-white md:py-24" aria-label="Asistan Health">
          <div className="absolute right-0 top-0 size-72 rounded-full bg-brand-teal/20 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 size-64 rounded-full bg-brand-blue/20 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
            <Reveal>
              <Badge className="mb-4 border-0 bg-white/10 text-white hover:bg-white/10">Öncelikli sektör</Badge>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">İlk odak sağlık ekipleri.</h2>
              <p className="mt-4 text-base leading-8 text-white/70 md:text-lg">
                Hasta randevusu, takip notu, sekreter yetkisi ve hatırlatma akışı aynı panelde toplanır. Her kullanıcı kendi rolüne göre çalışır.
              </p>
              <Button asChild className="mt-7 h-12 rounded-xl bg-white px-6 font-bold text-brand-navy hover:bg-white/90">
                <Link href="/cozumler/health">
                  Health çözümünü incele
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2">
              {healthUseCases.map((item) => (
                <Reveal key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-teal" aria-hidden="true" />
                  <span className="text-sm leading-6 text-white/85">{item}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="industries" className="bg-white py-20 md:py-24" aria-label="Sıradaki sektörler">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Health ile başlayan yapı diğer sektörlere açılıyor.</h2>
              <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
                Aynı randevu ve takip mantığı, KKTC’de randevuyla çalışan farklı hizmet işletmelerine uyarlanacak.
              </p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {industries.map((industry) => (
                <Reveal key={industry.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                      <industry.icon className="size-6" aria-hidden="true" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{industry.status}</span>
                  </div>
                  <h3 className="text-xl font-extrabold">{industry.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{industry.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <PricingPreview />

        <section id="faq" className="bg-white py-20 md:py-24" aria-label="Sık sorulan sorular">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
            <Reveal>
              <Badge className="mb-4 border-0 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">Sık sorulanlar</Badge>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Başlamadan önce bilmek isteyecekleriniz.</h2>
              <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
                Erken erişim, güvenlik ve fiyatlandırma ile ilgili en kritik sorular.
              </p>
            </Reveal>
            <Reveal className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`} className="border-slate-100">
                    <AccordionTrigger className="text-left text-base font-extrabold text-brand-navy hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-7 text-slate-600">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        <section id="cta" className="bg-brand-light px-4 py-20 sm:px-6 md:py-24 lg:px-8" aria-label="Erken erişim çağrısı">
          <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-brand-navy p-8 text-center text-white shadow-2xl shadow-brand-navy/20 md:p-12">
            <div className="absolute inset-x-16 -top-24 h-48 rounded-full bg-brand-teal/20 blur-3xl" aria-hidden="true" />
            <div className="absolute -right-16 bottom-0 size-52 rounded-full bg-brand-blue/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <Image
                src="/images/asistan-mark.svg"
                alt=""
                width={48}
                height={48}
                className="mx-auto mb-5"
                aria-hidden="true"
              />
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Kliniğiniz için erken erişim talep edin.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                Asistan Health’i ilk kullanan ekiplerden biri olun. İhtiyaç analizi ve kurulum planı için sizinle iletişime geçelim.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-xl bg-gradient-to-r from-brand-teal to-brand-blue px-6 font-bold text-white">
                  <Link href="/auth/sign-up">Başvuru oluştur</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-white/20 bg-white/5 px-6 text-white hover:bg-white/10">
                  <Link href="/fiyatlandirma">Paketleri gör</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-blue/10 bg-white/95 p-3 shadow-2xl backdrop-blur-xl sm:hidden">
        <Button asChild className="h-12 w-full rounded-xl bg-gradient-to-r from-brand-teal to-brand-blue font-bold text-white">
          <Link href="/auth/sign-up" aria-label="Mobil erken erişim başvurusu yap">
            Erken erişime katıl
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <Footer />
    </div>
  )
}
