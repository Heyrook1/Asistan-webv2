import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles, Brain, Calendar, Users, TrendingUp, Clock,
  MessageSquare, Zap, ChevronRight, ArrowRight, Star,
  Bell, BarChart3, Lightbulb,
} from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'AI Asistan' }

const aiFeatures = [
  {
    icon: Calendar,
    color: 'text-[#12C8AD]',
    bg: 'bg-[#12C8AD]/10',
    title: 'Akıllı Randevu Önerileri',
    description: 'Müşteri geçmişine ve tercihlerine göre en uygun randevu saatlerini önerir.',
    status: 'active',
  },
  {
    icon: Users,
    color: 'text-[#16A9E8]',
    bg: 'bg-[#16A9E8]/10',
    title: 'Müşteri Analizi',
    description: 'Müşteri davranışlarını analiz ederek kişiselleştirilmiş deneyim sunar.',
    status: 'active',
  },
  {
    icon: Bell,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    title: 'Otomatik Hatırlatmalar',
    description: 'Randevu öncesinde müşterilere ve size otomatik hatırlatma gönderir.',
    status: 'active',
  },
  {
    icon: TrendingUp,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    title: 'Performans Tahminleri',
    description: 'Geçmiş verilerinize göre gelecek ayın doluluk oranını tahmin eder.',
    status: 'soon',
  },
  {
    icon: MessageSquare,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    title: 'AI Mesaj Asistanı',
    description: 'Müşterilere gönderilecek mesajları otomatik olarak oluşturur ve önerir.',
    status: 'soon',
  },
  {
    icon: BarChart3,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    title: 'Gelir Optimizasyonu',
    description: 'Fiyatlandırma ve hizmet önerilerini veriye dayalı şekilde sunar.',
    status: 'soon',
  },
]

const insights = [
  {
    icon: Lightbulb,
    color: 'text-[#12C8AD]',
    bg: 'bg-[#12C8AD]/10',
    title: 'Çalışma saatlerinizi ekleyin',
    description: 'Müsaitlik saatlerinizi tanımlayarak AI randevu önerilerini aktif edin.',
    cta: 'Ayarla',
    href: '/dashboard/musaitlik',
  },
  {
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    title: 'Değerlendirme isteyin',
    description: 'Son tamamlanan randevularınız için müşterilerinizden değerlendirme isteyin.',
    cta: 'Görüntüle',
    href: '/dashboard/degerlendirmeler',
  },
  {
    icon: Clock,
    color: 'text-[#16A9E8]',
    bg: 'bg-[#16A9E8]/10',
    title: 'Yoğun saatlerinizi optimize edin',
    description: 'Haftalık en yoğun saatlerinize göre hizmet sürerinizi ayarlayın.',
    cta: 'İncele',
    href: '/dashboard/analitik',
  },
]

export default async function AIAsistanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold tracking-tight">AI Asistan</h1>
          <Badge variant="secondary" className="text-[9px] bg-[#12C8AD]/10 text-[#12C8AD] border-0 font-bold tracking-wider">
            AI destekli
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Yapay zeka destekli öneriler ve otomasyon araçlarıyla işletmenizi büyütün.
        </p>
      </div>

      {/* Hero Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="relative p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #06142A 0%, #0A2540 60%, #0D2D4A 100%)' }}>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#12C8AD] blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#16A9E8] blur-3xl" />
          </div>
          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl p-2.5 bg-[#12C8AD]/20">
                  <Brain className="h-6 w-6 text-[#12C8AD]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Asistan AI</h2>
                  <p className="text-xs text-white/50">İşletmeniz için akıllı asistan</p>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed max-w-lg">
                Randevularınızı otomatize edin, müşterilerinizi daha iyi tanıyın ve işletmenizi veriyle büyütün. Asistan AI, tüm süreçlerinizi analiz ederek size özel öneriler sunar.
              </p>
              <div className="flex gap-2 mt-4">
                <Button className="gap-2 bg-[#12C8AD] hover:bg-[#10B49C] text-[#06142A] font-bold text-sm">
                  <Zap className="h-4 w-4" />
                  AI&apos;ı Aktif Et
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white text-sm">
                  Nasıl çalışır?
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-2xl bg-[#12C8AD]/20 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-[#12C8AD]" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#12C8AD] opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#12C8AD]"></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      <div>
        <h2 className="text-base font-semibold mb-3">Kişiselleştirilmiş Öneriler</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((item, i) => (
            <Card key={i} className="border-border/60 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className={`rounded-xl p-2.5 shrink-0 ${item.bg}`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.description}</p>
                    <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs text-[#12C8AD] hover:text-[#10B49C] hover:bg-[#12C8AD]/10 -ml-2">
                      <Link href={item.href} className="gap-1">
                        {item.cta} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Features Grid */}
      <div>
        <h2 className="text-base font-semibold mb-3">AI Özellikleri</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {aiFeatures.map((feature, i) => (
            <Card
              key={i}
              className="border-border/60 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl p-2.5 shrink-0 ${feature.bg}`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold">{feature.title}</p>
                      <Badge
                        variant="secondary"
                        className={`text-[9px] font-bold border-0 ${
                          feature.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {feature.status === 'active' ? 'AKTİF' : 'YAKINDA'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-6">
          <div className="rounded-2xl p-3 bg-[#12C8AD]/10">
            <Sparkles className="h-8 w-8 text-[#12C8AD]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-semibold">Tüm AI özelliklerine erişin</p>
            <p className="text-sm text-muted-foreground">Pro plana geçerek sınırsız AI önerileri ve otomasyon araçlarını kullanın.</p>
          </div>
          <Button className="bg-gradient-to-r from-[#12C8AD] to-[#16A9E8] text-white font-bold hover:opacity-90 gap-2 shrink-0">
            <Zap className="h-4 w-4" />
            Pro'ya Yükselt
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
