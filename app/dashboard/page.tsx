import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuickActionButtons } from '@/components/dashboard/quick-action-buttons'
import { MiniCalendar } from '@/components/dashboard/mini-calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar, Clock, Star, Wallet, Stethoscope,
  Sparkles, ArrowUpRight, CheckCircle2, ChevronRight,
  UserPlus, HeartPulse, Send, FileBarChart, MoreHorizontal,
  CalendarPlus, Activity,
} from 'lucide-react'

export const metadata = { title: 'Genel Bakış' }

/* ─── DEMO DATA (Klinik / Sağlık) ─── */
const stats = [
  { title: 'Bugünkü Randevular', value: '12',      trend: '%20 dünden fazla', icon: Calendar,    bg: 'bg-[#12C8AD]/12', fg: 'text-[#12C8AD]' },
  { title: 'Bekleyen Onay',      value: '4',       trend: '%33 dünden fazla', icon: Clock,       bg: 'bg-orange-100',   fg: 'text-orange-500' },
  { title: 'Aktif Hasta',        value: '248',     trend: '%12 bu ay',         icon: HeartPulse,  bg: 'bg-[#16A9E8]/12', fg: 'text-[#16A9E8]' },
  { title: 'Ortalama Puan',      value: '4.8',     trend: 'STARS',             icon: Star,        bg: 'bg-amber-100',    fg: 'text-amber-500' },
  { title: 'Aylık Ciro',         value: '₺42.500', trend: '%18 bu ay',         icon: Wallet,      bg: 'bg-emerald-100',  fg: 'text-emerald-600' },
]

const onboardingSteps = [
  { label: 'Klinik bilgilerinizi ekleyin',          done: true,    href: '/dashboard/ayarlar' },
  { label: 'Hekim ve hizmetlerinizi tanımlayın',    done: true,    href: '/dashboard/hizmetler' },
  { label: 'Muayene saatlerinizi belirleyin',       done: true,    href: '/dashboard/musaitlik' },
  { label: 'Online randevu sistemini aktif edin',   done: false,   active: true, href: '/dashboard/takvim' },
  { label: 'Hasta SMS bildirimlerini ayarlayın',    done: false,   href: '/dashboard/ayarlar' },
]

const aiSuggestions = [
  {
    icon: CalendarPlus,
    bg: 'bg-[#12C8AD]/10',
    fg: 'text-[#12C8AD]',
    title: 'Bugün 2 boş muayene saatiniz var',
    desc: '14:00 ve 16:30 arasında müsaitlik mevcut.',
  },
  {
    icon: Clock,
    bg: 'bg-orange-100',
    fg: 'text-orange-500',
    title: '3 hasta onay bekliyor',
    desc: 'Onay bekleyen randevuları inceleyin.',
  },
  {
    icon: Activity,
    bg: 'bg-purple-100',
    fg: 'text-purple-500',
    title: 'Kontrol randevusu hatırlatması',
    desc: 'Geçen ay tedavi olan 5 hastaya kontrol önerisi gönderebilirsiniz.',
  },
]

const upcomingAppointments = [
  { time: '09:30', initials: 'AY', avatarColor: 'bg-[#12C8AD]',  patient: 'Ayşe Yılmaz',   phone: '0555 123 45 67', service: 'Genel Muayene',     duration: '30 dk', doctor: 'Dr. Mehmet Yıldız',  doctorColor: 'bg-[#16A9E8]', doctorInitials: 'MY', status: 'confirmed' },
  { time: '11:00', initials: 'MK', avatarColor: 'bg-[#16A9E8]',  patient: 'Mehmet Kaya',   phone: '0532 987 65 43', service: 'Kontrol Muayenesi', duration: '20 dk', doctor: 'Dr. Mehmet Yıldız',  doctorColor: 'bg-[#16A9E8]', doctorInitials: 'MY', status: 'pending'   },
  { time: '14:30', initials: 'SB', avatarColor: 'bg-purple-500', patient: 'Sibel Batmaz',  phone: '0541 234 56 78', service: 'Kan Tahlili',        duration: '15 dk', doctor: 'Hmş. Ayşe Demir',    doctorColor: 'bg-rose-400',  doctorInitials: 'AD', status: 'confirmed' },
  { time: '16:00', initials: 'AH', avatarColor: 'bg-amber-500',  patient: 'Ahmet Demir',   phone: '0530 111 22 33', service: 'Diş Muayenesi',      duration: '45 dk', doctor: 'Dr. Merve Kaya',     doctorColor: 'bg-purple-500', doctorInitials: 'MK', status: 'confirmed' },
]

const quickActions = [
  { label: 'Randevu Oluştur',    icon: CalendarPlus, href: null,                       action: 'appointment'  },
  { label: 'Hasta Ekle',          icon: UserPlus,     href: null,                       action: 'customer'     },
  { label: 'Hizmet Ekle',         icon: Stethoscope,  href: null,                       action: 'service'      },
  { label: 'Müsaitlik Düzenle',   icon: Clock,        href: '/dashboard/musaitlik',     action: null            },
  { label: 'Toplu SMS Gönder',    icon: Send,         href: null,                       action: 'notification' },
  { label: 'Rapor Oluştur',       icon: FileBarChart, href: '/dashboard/analitik',      action: null            },
]

/* ─── PAGE ─── */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: provider } = await supabase.from('providers').select('id').eq('user_id', user.id).single()

  const completedCount = onboardingSteps.filter((s) => s.done).length
  const progressPct = (completedCount / onboardingSteps.length) * 100
  const circumference = 2 * Math.PI * 22

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-[#0C1D36]">Genel Bakış</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Kliniğinizin bugünkü durumunu ve yaklaşan hasta randevularını tek ekrandan takip edin.
          </p>
        </div>
        <QuickActionButtons providerId={provider?.id} />
      </div>

      {/* ── Stats (5 cards) ── */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s, i) => (
          <Card
            key={s.title}
            className="border-border/40 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-6px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className={`rounded-xl p-2.5 ${s.bg}`}>
                  <s.icon className={`h-[18px] w-[18px] ${s.fg}`} />
                </div>
              </div>
              <p className="text-[12px] font-medium text-muted-foreground mb-1">{s.title}</p>
              <p className="text-[28px] font-bold tracking-tight text-[#0C1D36] leading-none">
                {s.value}
              </p>
              {s.trend === 'STARS' ? (
                <div className="flex items-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3 w-3 ${n <= 4 ? 'fill-amber-400 text-amber-400' : n === 5 ? 'fill-amber-400/40 text-amber-400/40' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                  <span className="text-[11px] font-medium text-emerald-600">{s.trend}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Middle Row: Onboarding + Calendar + AI ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Onboarding */}
        <Card className="border-border/40 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-[#0C1D36]">Kurulumu tamamlayın</h3>
                <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed max-w-[200px]">
                  Asistan&apos;dan en iyi şekilde yararlanmak için adımları tamamlayın.
                </p>
              </div>
              {/* Progress ring */}
              <div className="relative h-14 w-14 shrink-0">
                <svg className="-rotate-90 h-14 w-14" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="22" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                  <circle
                    cx="25"
                    cy="25"
                    r="22"
                    fill="none"
                    stroke="#12C8AD"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (progressPct / 100) * circumference}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[12px] font-bold text-[#0C1D36]">
                    {completedCount}/{onboardingSteps.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Linear progress */}
            <div className="h-1 w-full rounded-full bg-secondary/80 overflow-hidden mb-4">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #12C8AD, #16A9E8)',
                }}
              />
            </div>

            <div className="space-y-2">
              {onboardingSteps.map((step, i) => {
                const isActive = step.active
                return (
                  <Link
                    key={i}
                    href={step.href}
                    className="flex items-center gap-2.5 group"
                  >
                    {step.done ? (
                      <CheckCircle2 className="h-[18px] w-[18px] text-[#12C8AD] shrink-0" />
                    ) : (
                      <div className={`h-[18px] w-[18px] rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold border-2 ${
                        isActive
                          ? 'bg-[#12C8AD] text-white border-[#12C8AD]'
                          : 'bg-secondary/80 text-muted-foreground border-secondary'
                      }`}>
                        {i + 1}
                      </div>
                    )}
                    <span className={`text-[13px] flex-1 ${
                      step.done
                        ? 'text-muted-foreground'
                        : isActive
                          ? 'font-semibold text-[#0C1D36]'
                          : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#12C8AD] transition-colors" />
                    )}
                  </Link>
                )
              })}
            </div>

            <Button
              variant="outline"
              className="w-full mt-5 rounded-xl border-border/60 gap-2 text-[13px] font-medium"
              asChild
            >
              <Link href="/dashboard/ayarlar">
                <Sparkles className="h-3.5 w-3.5 text-[#12C8AD]" />
                Asistan Pro'nun tüm avantajlarını keşfedin
                <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Calendar */}
        <MiniCalendar />

        {/* AI Önerileri */}
        <Card className="border-border/40 shadow-[0_1px_3px_rgba(15,23,42,0.04)] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#12C8AD]" />
                <h3 className="text-[15px] font-bold text-[#0C1D36]">Asistan AI Önerileri</h3>
              </div>
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#12C8AD]/12 text-[#0b7f6f]">
                AI
              </span>
            </div>

            <div className="space-y-2.5">
              {aiSuggestions.map((s, i) => (
                <button
                  key={i}
                  className="flex items-start gap-3 w-full rounded-xl border border-border/40 p-3 hover:border-[#12C8AD]/30 hover:bg-secondary/30 transition-all duration-200 group animate-in fade-in slide-in-from-right-2"
                  style={{ animationDelay: `${i * 100 + 200}ms` }}
                >
                  <div className={`rounded-lg p-2 shrink-0 ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.fg}`} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[12.5px] font-semibold text-[#0C1D36] truncate">{s.title}</p>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">{s.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-[#12C8AD] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            <Link
              href="/dashboard/ai-asistan"
              className="flex items-center justify-between mt-3 px-3 py-2.5 text-[12.5px] font-medium text-muted-foreground hover:text-[#12C8AD] transition-colors"
            >
              Tüm önerileri görüntüleyin
              <ChevronRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row: Appointments table + Hızlı İşlemler ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Yaklaşan Randevular Table */}
        <Card className="lg:col-span-2 border-border/40 shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <h3 className="text-[15px] font-bold text-[#0C1D36]">Yaklaşan Randevular</h3>
              <Link
                href="/dashboard/randevular"
                className="flex items-center gap-1 text-[12.5px] font-medium text-[#12C8AD] hover:text-[#10B49C] transition-colors"
              >
                Tümünü Görüntüle <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[11.5px] font-medium text-muted-foreground bg-secondary/30">
                    <th className="px-5 py-2.5">Saat</th>
                    <th className="px-2 py-2.5">Hasta</th>
                    <th className="px-2 py-2.5">İşlem</th>
                    <th className="px-2 py-2.5">Hekim</th>
                    <th className="px-2 py-2.5">Durum</th>
                    <th className="px-2 py-2.5 text-right pr-5">Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((apt, i) => (
                    <tr
                      key={i}
                      className="border-t border-border/30 hover:bg-secondary/30 transition-colors group"
                    >
                      <td className="px-5 py-3 font-semibold text-[#0C1D36]">{apt.time}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-7 w-7 rounded-full ${apt.avatarColor} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                            {apt.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#0C1D36] truncate">{apt.patient}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{apt.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <p className="font-medium text-[#0C1D36]">{apt.service}</p>
                        <p className="text-[11px] text-muted-foreground">{apt.duration}</p>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-full ${apt.doctorColor} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                            {apt.doctorInitials}
                          </div>
                          <span className="text-[12px] text-[#0C1D36]">{apt.doctor}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          apt.status === 'confirmed'
                            ? 'bg-[#12C8AD]/12 text-[#0b7f6f]'
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {apt.status === 'confirmed' ? 'Onaylandı' : 'Onay Bekliyor'}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right pr-5">
                        <button className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/80 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Hızlı İşlemler */}
        <Card className="border-border/40 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="p-5">
            <h3 className="text-[15px] font-bold text-[#0C1D36] mb-4">Hızlı İşlemler</h3>
            <QuickActionsGrid actions={quickActions} providerId={provider?.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ─── Helper sub-components ─── */

function QuickActionsGrid({
  actions,
  providerId,
}: {
  actions: typeof quickActions
  providerId?: string
}) {
  void providerId
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {actions.map((a, i) => {
        const inner = (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-white hover:bg-secondary/30 hover:border-[#12C8AD]/30 hover:-translate-y-0.5 transition-all duration-200 p-3 aspect-square group">
            <div className="h-9 w-9 rounded-lg bg-secondary/60 group-hover:bg-[#12C8AD]/10 flex items-center justify-center transition-colors">
              <a.icon className="h-4 w-4 text-muted-foreground group-hover:text-[#12C8AD] transition-colors" />
            </div>
            <span className="text-[11px] font-medium text-[#0C1D36] text-center leading-tight">
              {a.label}
            </span>
          </div>
        )
        return a.href ? (
          <Link key={i} href={a.href}>{inner}</Link>
        ) : (
          <button key={i} className="text-left">{inner}</button>
        )
      })}
    </div>
  )
}
