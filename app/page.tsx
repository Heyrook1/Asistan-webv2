'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Globe2,
  HeartPulse,
  LockKeyhole,
  Mail,
  Menu,
  MessageSquareText,
  Play,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
  X,
} from 'lucide-react'

type CounterProps = {
  value: number
  prefix?: string
  suffix?: string
}

type Plan = {
  name: string
  monthly: number
  yearly: number
  description: string
  features: string[]
  popular?: boolean
}

const navLinks = [
  { href: '#hero', label: 'Ana Sayfa' },
  { href: '#features', label: 'Özellikler' },
  { href: '#how-it-works', label: 'Nasıl Çalışır?' },
  { href: '#pricing', label: 'Fiyatlandırma' },
  { href: '#contact', label: 'İletişim' },
]

const trustItems = [
  { icon: HeartPulse, title: 'KKTC odağıyla', text: 'Yerel ihtiyaçlara uygun' },
  { icon: ShieldCheck, title: 'Rol bazlı erişim', text: 'Hekim ve sekreter yetkileri' },
  { icon: Sparkles, title: 'AI önerileri', text: 'Boş saatleri daha erken görün' },
]

const stats = [
  { icon: CalendarDays, value: 12, suffix: '+', label: 'Günlük randevu görünümü' },
  { icon: UsersRound, value: 3, suffix: ' rol', label: 'Hekim, sekreter, yönetici' },
  { icon: Bell, value: 5, suffix: '+', label: 'Aktif hatırlatma akışı' },
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

const problems = [
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

const patientBenefits = [
  {
    icon: CalendarDays,
    title: 'Daha net randevu iletişimi',
    description: 'Hastalar randevu saatini ve takip adımlarını daha düzenli görür.',
  },
  {
    icon: Bell,
    title: 'Düzenli hatırlatma deneyimi',
    description: 'Randevu öncesi ve sonrası iletişim akışı planlı ilerler.',
  },
  {
    icon: LockKeyhole,
    title: 'Bilgi güveni',
    description: 'Hasta notları ve takip bilgileri rol bazlı erişimle korunur.',
  },
]

const professionalBenefits = [
  {
    icon: Clock3,
    title: 'Günlük takip yükü azalır',
    description: 'Boş saatleri, bekleyen onayları ve takip notlarını tek ekranda görün.',
  },
  {
    icon: UsersRound,
    title: 'Ekip aynı bilgiyle çalışır',
    description: 'Hekim, sekreter ve yönetici kendi rolüne göre aynı akışı takip eder.',
  },
  {
    icon: BarChart3,
    title: 'Kararlar veriye dayanır',
    description: 'Randevu, hasta ve ekip performansını daha görünür hale getirin.',
  },
]

const healthUseCases = [
  'Doktor ve diş hekimi muayenehaneleri',
  'Psikolog, diyetisyen ve fizyoterapistler',
  'Klinik yöneticileri ve sekreter ekipleri',
  'Randevu ve takip notu tutan sağlık işletmeleri',
]

const upcoming = ['Beauty Yakında', 'Hukuk Yakında', 'Emlak Planlanıyor']

const securityItems = [
  { icon: ShieldCheck, title: 'KVKK odaklı', text: 'Veri kapsamı kurulumda netleşir' },
  { icon: LockKeyhole, title: 'SSL ile şifreleme', text: 'Uçtan uca güvenli erişim' },
  { icon: Globe2, title: 'GDPR uyumlu yaklaşım', text: 'Diaspora senaryolarına hazır' },
  { icon: Settings, title: 'Düzenli yedekleme', text: 'Operasyon sürekliliği için' },
]

const plans: Plan[] = [
  {
    name: 'Başlangıç',
    monthly: 149,
    yearly: 119,
    description: 'Küçük klinikler ve tek hekimli ekipler için.',
    features: ['1 kullanıcı', 'Temel randevu', 'Hasta kartı', 'Hatırlatma akışı'],
  },
  {
    name: 'Profesyonel',
    monthly: 249,
    yearly: 199,
    description: 'Büyüyen klinikler için en uygun seçenek.',
    features: ['5 kullanıcı', 'Tüm randevu özellikleri', 'AI önerileri', 'Ekip rolleri', 'Öncelikli destek'],
    popular: true,
  },
  {
    name: 'Kurumsal',
    monthly: 499,
    yearly: 399,
    description: 'Birden fazla ekip ve özel süreçler için.',
    features: ['Sınırsız kullanıcı', 'Tüm profesyonel özellikler', 'Özel entegrasyonlar', 'Kurulum danışmanlığı'],
  },
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
  {
    question: 'Ekibimiz ne kadar sürede başlar?',
    answer:
      'İlk görüşmede iş akışı çıkarılır. Hizmetler, roller ve çalışma saatleri netleştiğinde panel kısa sürede kullanıma hazırlanır.',
  },
]

function Counter({ value, prefix = '', suffix = '' }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setCount(value)
      return
    }

    let frame = 0
    const totalFrames = 44
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        const animate = () => {
          frame += 1
          const progress = Math.min(frame / totalFrames, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.round(value * eased))
          if (progress < 1) requestAnimationFrame(animate)
        }

        requestAnimationFrame(animate)
        observer.unobserve(node)
      },
      { threshold: 0.5 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}

function Logo() {
  return (
    <Link href="#hero" className="flex items-center gap-2" aria-label="Asistan ana sayfa">
      <Image src="/images/asistan-mark.svg" alt="" width={38} height={38} priority aria-hidden="true" />
      <span className="text-2xl font-extrabold tracking-tight text-[#0F172A]">asistan</span>
    </Link>
  )
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      <div className="absolute -right-4 top-7 z-20 hidden rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-xl md:block">
        <p className="text-xs font-semibold text-slate-500">Onay oranı</p>
        <p className="text-lg font-extrabold text-[#0F172A]">%94</p>
      </div>
      <div className="absolute -bottom-3 -left-4 z-20 hidden rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-xl md:block">
        <p className="text-xs font-semibold text-slate-500">Aktif hatırlatma</p>
        <p className="text-lg font-extrabold text-[#0F172A]">5 akış</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-2xl shadow-blue-500/15">
        <div className="flex items-center justify-between bg-[#0F172A] px-5 py-4 text-white">
          <Logo />
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">Klinik Paneli</span>
        </div>
        <div className="grid gap-4 bg-[#F8FAFB] p-4 lg:grid-cols-[160px_1fr]">
          <aside className="hidden rounded-2xl bg-white p-3 shadow-sm lg:block">
            {['Ana Sayfa', 'Randevular', 'Hastalar', 'Takvim', 'Hatırlatmalar'].map((item, index) => (
              <div
                key={item}
                className={`mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
                  index === 0 ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-500'
                }`}
              >
                <CalendarDays className="size-4" aria-hidden="true" />
                {item}
              </div>
            ))}
          </aside>

          <div>
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ['24', 'Bugünkü Randevu'],
                ['156', 'Bu Hasta'],
                ['1.248', 'Toplam Hasta'],
                ['8', 'Bekleyen'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-2xl font-extrabold text-[#0F172A]">{value}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#0F172A]">Bugünkü Randevular</h3>
                  <span className="text-xs font-bold text-[#2563EB]">Tümünü gör</span>
                </div>
                {[
                  ['09:00', 'Ayşe Yılmaz', 'Beklemede'],
                  ['10:30', 'Mehmet Demir', 'Onaylandı'],
                  ['11:30', 'Zeynep Kaya', 'Onaylandı'],
                  ['14:00', 'Ali Eren', 'Beklemede'],
                ].map(([time, name, status]) => (
                  <div key={`${time}-${name}`} className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-400">{time}</p>
                      <p className="truncate text-sm font-bold text-[#0F172A]">{name}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${
                        status === 'Onaylandı' ? 'bg-teal-50 text-[#0F766E]' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-[#12C8AD]" aria-hidden="true" />
                  <h3 className="text-sm font-extrabold text-[#0F172A]">AI önerisi</h3>
                </div>
                <p className="text-sm leading-6 text-slate-600">Boş 15:30 saati bekleyen hastaya önerilebilir.</p>
                <div className="mt-4 flex h-24 items-end gap-2 rounded-2xl bg-gradient-to-b from-blue-50 to-white p-3" aria-hidden="true">
                  {['h-8', 'h-14', 'h-10', 'h-20', 'h-16', 'h-12'].map((height, index) => (
                    <div key={`${height}-${index}`} className="flex flex-1 items-end">
                      <div className={`${height} w-full rounded-t-lg bg-gradient-to-t from-[#2563EB] to-[#12C8AD]`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [yearly, setYearly] = useState(true)
  const [openFaq, setOpenFaq] = useState(0)
  const priceSuffix = yearly ? '/aylık, yıllık' : '/aylık'

  const translatedPlans = useMemo(
    () =>
      plans.map((plan) => ({
        ...plan,
        price: yearly ? plan.yearly : plan.monthly,
      })),
    [yearly],
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="min-h-screen bg-white text-[#0F172A]">
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-200 ${
          scrolled ? 'border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl' : 'border-transparent bg-white'
        }`}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Ana menü">
          <Logo />

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm font-extrabold transition-all duration-200 hover:text-[#2563EB] ${
                  index === 0 ? 'text-[#2563EB]' : 'text-[#0F172A]'
                }`}
              >
                {item.label}
                {index === 0 && <span className="absolute -bottom-7 left-0 h-0.5 w-full rounded-full bg-[#2563EB]" />}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button type="button" className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold transition-all duration-200 hover:border-[#2563EB]/40">
              <Globe2 className="size-4 text-[#2563EB]" aria-hidden="true" />
              KKTC
              <ChevronDown className="size-4 text-slate-400" aria-hidden="true" />
            </button>
            <Link href="/auth/login" className="flex h-11 items-center rounded-xl border border-slate-200 px-5 text-sm font-extrabold transition-all duration-200 hover:border-[#2563EB]/40">
              Giriş Yap
            </Link>
            <Link href="/auth/sign-up" className="flex h-11 items-center rounded-xl bg-gradient-to-r from-[#12C8AD] to-[#2563EB] px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5">
              Randevu Oluştur
            </Link>
          </div>

          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-xl lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <Link href="/auth/sign-up" className="mt-2 rounded-xl bg-gradient-to-r from-[#12C8AD] to-[#2563EB] px-4 py-3 text-center text-sm font-extrabold text-white">
                Randevu Oluştur
              </Link>
            </div>
          </div>
        )}
      </header>

      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 pb-12 pt-28 md:pb-20 md:pt-32">
        <div className="absolute -right-32 top-28 size-96 rounded-full bg-[#2563EB]/15 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-28 -left-28 size-96 rounded-full bg-[#12C8AD]/18 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
              <ShieldCheck className="size-4 text-[#12C8AD]" aria-hidden="true" />
              KKTC odağıyla Asistan Health aktif
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight text-[#0F172A] md:text-6xl lg:text-7xl">
              KKTC’de randevu, hasta takibi ve ekip yönetimi{' '}
              <span className="bg-gradient-to-r from-[#12C8AD] to-[#2563EB] bg-clip-text text-transparent">tek panelde.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#475569] md:text-lg">
              Asistan Health; hekim, sekreter ve klinik yöneticisinin günlük randevu akışını aynı ekranda toplar. Boş saatleri görün, hatırlatmaları planlayın, hasta notlarını düzenli tutun.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/sign-up" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#12C8AD] to-[#2563EB] px-7 text-sm font-extrabold text-white shadow-xl shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5">
                Randevu Oluştur
                <CalendarDays className="size-4" aria-hidden="true" />
              </Link>
              <Link href="#pricing" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-[#2563EB]/30 bg-white px-7 text-sm font-extrabold text-[#2563EB] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2563EB]">
                <Play className="size-4" aria-hidden="true" />
                Paketleri Gör
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {trustItems.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                    <item.icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[#0F172A]">{item.title}</p>
                    <p className="text-xs leading-5 text-[#475569]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DashboardMockup />
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-xl shadow-blue-500/5">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#12C8AD] to-[#2563EB] text-white">
                <stat.icon className="size-7" aria-hidden="true" />
              </div>
              <p className="text-4xl font-black text-[#0F172A]">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm font-bold text-[#475569]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-16">
        <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-br from-blue-50 to-teal-50 px-4 py-12 sm:px-8 lg:px-12">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">3 adımda kliniğinize göre kurulur.</h2>
            <p className="mt-4 text-[#475569]">Ürünü gerçek çalışma düzeninize uydurmak için önce operasyonu anlarız.</p>
          </div>
          <div className="relative grid gap-6 md:grid-cols-3">
            <div className="absolute left-[18%] right-[18%] top-10 hidden h-0.5 bg-gradient-to-r from-[#12C8AD] via-[#2563EB] to-[#12C8AD] md:block" aria-hidden="true" />
            {steps.map((step, index) => (
              <article key={step.title} className="relative rounded-3xl bg-white p-7 shadow-xl shadow-blue-500/5">
                <div className="absolute -top-5 left-1/2 flex size-11 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#12C8AD] to-[#2563EB] text-sm font-black text-white shadow-lg">
                  {index + 1}
                </div>
                <div className="mt-6 flex items-start gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-[#0F766E]">
                    <CalendarDays className="size-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#475569]">{step.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFB] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">Dağınık randevu takibi kliniğin ritmini bozar.</h2>
            <p className="mt-4 text-[#475569]">Asistan, küçük ve orta ölçekli sağlık ekiplerinin günlük takip yükünü azaltmak için tasarlandı.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {problems.map((item) => (
              <article key={item.title} className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#12C8AD]/15 to-[#2563EB]/15 text-[#2563EB]">
                  <item.icon className="size-7" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#475569]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">Asistan ile herkes kazanır.</h2>
          </div>
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_320px_1fr]">
            <div className="space-y-4">
              <p className="text-lg font-black text-[#0F766E]">Hastalar için</p>
              {patientBenefits.map((item) => (
                <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E]">
                    <item.icon className="size-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-black">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#475569]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mx-auto flex size-72 items-center justify-center rounded-full bg-gradient-to-br from-[#12C8AD]/25 to-[#2563EB]/25 p-5">
              <div className="flex size-48 items-center justify-center rounded-full bg-gradient-to-br from-[#12C8AD] to-[#2563EB] text-white shadow-2xl shadow-blue-500/20">
                <Stethoscope className="size-20" aria-hidden="true" />
              </div>
              {[CalendarDays, Bell, ShieldCheck, BarChart3].map((Icon, index) => (
                <div
                  key={index}
                  className={`absolute flex size-14 items-center justify-center rounded-2xl bg-white text-[#2563EB] shadow-xl ${
                    index === 0 ? 'left-2 top-16' : index === 1 ? 'bottom-16 left-2' : index === 2 ? 'right-2 top-16' : 'bottom-16 right-2'
                  }`}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-lg font-black text-[#2563EB]">Sağlık profesyonelleri için</p>
              {professionalBenefits.map((item) => (
                <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                    <item.icon className="size-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-black">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#475569]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-6xl gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-xl shadow-blue-500/5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black">Randevu, takip ve ekip yönetimi aynı panelde.</h2>
            <p className="mt-3 text-sm leading-6 text-[#475569]">Yeni bir teknoloji vitrini değil; kliniğinizde her gün yapılan işleri daha takip edilebilir hale getiren pratik bir iş aracıdır.</p>
            <Link href="/cozumler/health" className="mt-5 inline-flex rounded-xl border border-[#2563EB]/30 px-4 py-2 text-sm font-black text-[#2563EB]">
              Health çözümünü incele
            </Link>
          </div>
          {[
            ['12', 'Bugünkü randevu'],
            ['156', 'Aktif hasta'],
            ['%94', 'Onay oranı'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-[#F8FAFB] p-5">
              <p className="text-3xl font-black">{value}</p>
              <p className="mt-2 text-sm font-bold text-[#475569]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1e3a5f] p-8 text-white shadow-2xl shadow-slate-900/20 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:p-12">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white">Öncelikli sektör</span>
            <h2 className="mt-6 text-3xl font-black tracking-tight md:text-4xl">İlk odak sağlık ekipleri.</h2>
            <p className="mt-4 text-base leading-8 text-white/70">
              Hasta randevusu, takip notu, sekreter yetkisi ve hatırlatma akışı aynı panelde toplanır. Her kullanıcı kendi rolüne göre çalışır.
            </p>
            <Link href="/cozumler/health" className="mt-7 inline-flex h-12 items-center rounded-xl bg-white px-6 text-sm font-black text-[#0F172A] transition-all duration-200 hover:-translate-y-0.5">
              Health çözümünü incele
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
          </div>
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {healthUseCases.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#12C8AD]" aria-hidden="true" />
                  <p className="text-sm leading-6 text-white/85">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {upcoming.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black text-white/80">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0F172A] py-10 text-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {securityItems.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <item.icon className="size-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="font-black">{item.title}</h3>
              <p className="mt-1 text-xs leading-5 text-white/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">Kliniğinize uygun planı seçin.</h2>
            <p className="mt-4 text-[#475569]">Kredi kartı gerekmez. Kurulum kapsamı netleşmeden ödeme adımı açılmaz.</p>
            <div className="mt-6 inline-grid grid-cols-2 rounded-full bg-[#F8FAFB] p-1">
              <button
                type="button"
                className={`rounded-full px-6 py-2 text-sm font-black transition-all duration-200 ${!yearly ? 'bg-[#2563EB] text-white shadow-lg' : 'text-[#475569]'}`}
                onClick={() => setYearly(false)}
              >
                Aylık
              </button>
              <button
                type="button"
                className={`rounded-full px-6 py-2 text-sm font-black transition-all duration-200 ${yearly ? 'bg-[#2563EB] text-white shadow-lg' : 'text-[#475569]'}`}
                onClick={() => setYearly(true)}
              >
                Yıllık
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {translatedPlans.map((plan) => (
              <article
                key={plan.name}
                className={`relative rounded-3xl border p-7 shadow-xl shadow-blue-500/5 transition-all duration-200 hover:-translate-y-1 ${
                  plan.popular
                    ? 'scale-[1.02] border-[#2563EB] bg-gradient-to-br from-[#0F172A] to-[#1e3a5f] text-white'
                    : 'border-slate-100 bg-white text-[#0F172A]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-[#12C8AD] to-[#2563EB] px-3 py-1 text-xs font-black text-white">
                    En Popüler
                  </span>
                )}
                <h3 className="text-2xl font-black">{plan.name}</h3>
                <p className={`mt-2 text-sm leading-6 ${plan.popular ? 'text-white/65' : 'text-[#475569]'}`}>{plan.description}</p>
                <p className="mt-6 text-5xl font-black">
                  €{plan.price}
                  <span className={`text-sm font-bold ${plan.popular ? 'text-white/60' : 'text-[#475569]'}`}> {priceSuffix}</span>
                </p>
                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm font-bold">
                      <Check className="size-4 text-[#12C8AD]" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === 'Kurumsal' ? '#contact' : '/auth/sign-up'}
                  className={`mt-8 flex h-12 items-center justify-center rounded-xl text-sm font-black transition-all duration-200 ${
                    plan.popular ? 'bg-gradient-to-r from-[#12C8AD] to-[#2563EB] text-white' : 'border border-slate-200 text-[#0F172A] hover:border-[#2563EB]/40'
                  }`}
                >
                  {plan.name === 'Kurumsal' ? 'İletişime Geç' : 'Hemen Başla'}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFB] py-12">
        <div className="mx-auto grid max-w-6xl gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-blue-500/5 md:grid-cols-[1fr_1.2fr]">
          <div className="flex items-center gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#12C8AD] to-[#2563EB] text-white">
              <Stethoscope className="size-10" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-black text-[#2563EB]">Asistan Health erken erişim</p>
              <p className="mt-2 text-sm leading-6 text-[#475569]">
                İlk kullanan ekiplerden biri olun. Kurulum ve ihtiyaç analizi için sizinle iletişime geçelim.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Lefkoşa klinikleri', 'Girne sağlık ekipleri', 'Mağusa hizmet işletmeleri', 'KKTC genelinde kullanım'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#F8FAFB] p-4">
                <CircleDollarSign className="size-5 text-[#2563EB]" aria-hidden="true" />
                <p className="text-sm font-bold text-[#475569]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">Başlamadan önce bilmek isteyecekleriniz.</h2>
            <p className="mt-4 max-w-md leading-8 text-[#475569]">
              Erken erişim, güvenlik ve fiyatlandırma ile ilgili en kritik sorular.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-black transition-all duration-200 hover:text-[#2563EB]"
                  onClick={() => setOpenFaq((current) => (current === index ? -1 : index))}
                  aria-expanded={openFaq === index}
                >
                  {faq.question}
                  <ChevronDown className={`size-4 shrink-0 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {openFaq === index && <p className="px-5 pb-5 text-sm leading-7 text-[#475569]">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1e3a5f] p-8 text-center text-white shadow-2xl shadow-slate-900/25 md:p-14">
          <div className="absolute left-1/2 top-0 size-72 -translate-x-1/2 rounded-full bg-[#12C8AD]/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/10">
              <Image src="/images/asistan-mark.svg" alt="" width={42} height={42} aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">Kliniğiniz için erken erişim talep edin.</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-8 text-white/70">
              Asistan Health’i ilk kullanan ekiplerden biri olun. İhtiyaç analizi ve kurulum planı için sizinle iletişime geçelim.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/auth/sign-up" className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#12C8AD] to-[#2563EB] px-7 text-sm font-black text-white">
                Başvuru oluştur
              </Link>
              <Link href="#pricing" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-7 text-sm font-black text-white">
                Paketleri gör
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0a0f1e] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-6 lg:px-8">
          <div className="lg:col-span-2">
            <div className="mb-5 inline-flex">
              <Logo />
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/60">
              KKTC’den başlayan, sağlık ve hizmet işletmeleri için AI destekli randevu ve iş yönetim platformu.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['KVKK odaklı', 'Gizlilik öncelikli', 'Rol bazlı erişim'].map((item) => (
                <span key={item} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/70">
                  {item}
                </span>
              ))}
            </div>
            <a href="mailto:merhaba@asistan.online" className="mt-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
              <Mail className="size-4" aria-hidden="true" />
              merhaba@asistan.online
            </a>
          </div>

          {[
            ['Ürün', 'Özellikler', 'Fiyatlandırma', 'Kaynaklar'],
            ['Çözümler', 'Asistan Health', 'Beauty Yakında', 'Hukuk Yakında'],
            ['Şirket', 'Hakkımızda', 'İletişim', 'Erken Erişim'],
            ['Yasal', 'Gizlilik', 'Kullanım Koşulları', 'KVKK'],
          ].map(([title, ...links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-black">{title}</h3>
              <ul className="space-y-3">
                {links.map((item) => (
                  <li key={item}>
                    <Link href="#hero" className="text-sm text-white/55 transition-all duration-200 hover:text-white">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-white/45 sm:px-6 md:flex-row lg:px-8">
            <p>© 2026 Asistan. Tüm hakları saklıdır.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/terms" className="hover:text-white">
                Kullanım Şartları
              </Link>
              <Link href="/privacy" className="hover:text-white">
                Gizlilik Politikası
              </Link>
              <Link href="/privacy" className="hover:text-white">
                KVKK Aydınlatma Metni
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
