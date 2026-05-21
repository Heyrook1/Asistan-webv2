import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Briefcase, CalendarCheck, HeartPulse, Landmark, Scissors, Shield, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'

export const metadata: Metadata = {
  title: 'Çözümler | Asistan Health ve Sektör Yol Haritası',
  description:
    'Asistan ilk olarak sağlık profesyonelleri için geliştirildi. Güzellik, hukuk ve emlak çözümleri sıradaki sektörlerdir.',
}

const sectors = [
  {
    icon: HeartPulse,
    title: 'Asistan Health',
    subtitle: 'Aktif / İlk odak sektör',
    description: 'Doktorlar, klinikler, diş hekimleri, psikologlar ve sağlık ekipleri için randevu ve hasta takibi.',
    image: '/images/industry-health.jpg',
    href: '/cozumler/health',
    active: true,
  },
  {
    icon: Scissors,
    title: 'Asistan Beauty',
    subtitle: 'Yakında',
    description: 'Güzellik merkezleri, kuaförler ve wellness ekipleri için müşteri ve randevu düzeni.',
    image: '/images/industry-beauty.jpg',
    href: '/cozumler',
    active: false,
  },
  {
    icon: Landmark,
    title: 'Asistan Legal',
    subtitle: 'Yakında',
    description: 'Hukuk büroları için görüşme, müvekkil ve dosya takibini sadeleştiren yapı.',
    image: '/images/industry-legal.jpg',
    href: '/cozumler',
    active: false,
  },
  {
    icon: Briefcase,
    title: 'Asistan Emlak',
    subtitle: 'Planlanıyor',
    description: 'Emlak ofisleri için müşteri görüşmesi, portföy ve ekip takibi.',
    image: '/images/industry-pro.jpg',
    href: '/cozumler',
    active: false,
  },
]

const sharedBenefits = [
  { icon: CalendarCheck, title: 'Randevu düzeni', description: 'Takvim, onay ve takip akışı tek panelde toplanır.' },
  { icon: Users, title: 'Ekip görünürlüğü', description: 'Sekreter, uzman ve yönetici aynı bilgiyi görür.' },
  { icon: Shield, title: 'Gizlilik odağı', description: 'Erişim rolleri ve veri düzeni kontrollü ilerler.' },
]

const roadmap = [
  ['Şimdi', 'Asistan Health', 'Sağlık profesyonelleri için randevu ve hasta takibi.'],
  ['Sırada', 'Asistan Beauty', 'Salon ve güzellik merkezi operasyonları.'],
  ['Planlanıyor', 'Hukuk ve Emlak', 'Müvekkil, müşteri ve görüşme takibi.'],
]

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="bg-gradient-to-b from-[#F4FBFA] to-white pb-16 pt-28 lg:pb-24 lg:pt-32">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.95fr_1fr] lg:px-8">
            <div>
              <Badge className="mb-5 border-0 bg-white text-[#0B7F6F]">Çözümler</Badge>
              <h1 className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight text-[#06142A] md:text-5xl lg:text-6xl">
                İlk olarak sağlık profesyonelleri için geliştirildi.
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-8 text-gray-600">
                Asistan Health aktif. Güzellik, hukuk ve emlak çözümleri aynı iş yönetimi yaklaşımıyla sıradaki sektörlerdir.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/cozumler/health">
                  <Button size="lg" className="h-12 rounded-xl bg-[#0B7F6F] px-6 font-semibold text-white hover:bg-[#09685C]">
                    Health’i İncele
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="lg" variant="outline" className="h-12 rounded-xl border-[#0B7F6F]/30 px-6 text-[#0B7F6F] hover:bg-[#0B7F6F]/5">
                    Erken Erişim Talep Et
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xl">
              <div className="relative h-72 overflow-hidden rounded-2xl">
                <Image src="/images/industry-health.jpg" alt="Klinik randevu yönetimi" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06142A]/80 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <Badge className="mb-3 border-0 bg-white text-[#0B7F6F]">Öncelikli sektör</Badge>
                  <h2 className="text-2xl font-bold text-white">Sağlıkta randevu ve hasta takibi</h2>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-[#06142A] md:text-4xl">Sektörünüze uygun Asistan.</h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Gerçek olmayan kullanıcı sayıları yerine, hangi sektörün hangi ihtiyacına odaklandığımızı açık söylüyoruz.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {sectors.map((sector) => (
                <Card key={sector.title} className={`overflow-hidden rounded-2xl border-gray-100 shadow-sm ${sector.active ? 'ring-2 ring-[#0B7F6F]/20' : ''}`}>
                  <div className="relative h-40">
                    <Image src={sector.image} alt={sector.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#06142A]">
                      {sector.subtitle}
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <sector.icon className="mb-4 h-7 w-7 text-[#0B7F6F]" />
                    <h3 className="mb-2 text-lg font-bold text-[#06142A]">{sector.title}</h3>
                    <p className="mb-4 text-sm leading-6 text-gray-600">{sector.description}</p>
                    <Link href={sector.href} className="inline-flex items-center text-sm font-semibold text-[#0B7F6F] hover:underline">
                      {sector.active ? 'Detayları incele' : 'Yol haritasında gör'}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFC] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <h2 className="text-3xl font-bold text-[#06142A] md:text-4xl">Her sektörde aynı temel düzen.</h2>
                <p className="mt-4 text-lg leading-8 text-gray-600">
                  Sektöre göre ekranlar değişir; ana hedef aynı kalır: randevu, müşteri/hasta ve ekip takibini sadeleştirmek.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {sharedBenefits.map((benefit) => (
                  <Card key={benefit.title} className="rounded-2xl border-gray-100 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <benefit.icon className="mb-4 h-7 w-7 text-[#0B7F6F]" />
                      <h3 className="mb-2 font-bold text-[#06142A]">{benefit.title}</h3>
                      <p className="text-sm leading-6 text-gray-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-[#06142A] md:text-4xl">Yol haritası</h2>
              <p className="mt-4 text-lg text-gray-600">Önce sağlık, sonra yakın sektörler.</p>
            </div>
            <div className="space-y-4">
              {roadmap.map(([phase, title, description]) => (
                <div key={title} className="grid gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-[140px_1fr]">
                  <span className="rounded-full bg-[#0B7F6F]/10 px-3 py-1 text-sm font-semibold text-[#0B7F6F] md:w-fit">{phase}</span>
                  <div>
                    <h3 className="font-bold text-[#06142A]">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
