import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Lock, ShieldCheck, Users } from 'lucide-react'

import { Footer } from '@/components/marketing/footer'
import { Navbar } from '@/components/marketing/navbar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Gizlilik',
  description: 'Asistan platformunun gizlilik, rol bazlı erişim ve veri koruma yaklaşımı.',
}

const principles = [
  {
    icon: Lock,
    title: 'Veri minimizasyonu',
    description: 'Ürün deneyimi için gerekli olmayan kişisel verileri toplamamaya öncelik veririz.',
  },
  {
    icon: Users,
    title: 'Rol bazlı erişim',
    description: 'Doktor, sekreter ve yönetici rollerinin erişim ihtiyacı ayrı ele alınır.',
  },
  {
    icon: ShieldCheck,
    title: 'Güvenli süreç',
    description: 'Erken erişim kurulumlarında veri işleme ve yetki kapsamı ayrıca netleştirilir.',
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-[#F8FAFB] pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Badge className="mb-5 border-0 bg-[#0B7F6F]/10 text-[#0B7F6F] hover:bg-[#0B7F6F]/10">
            Gizlilik
          </Badge>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-[#06142A] md:text-5xl">
            Hasta ve işletme verileri için gizlilik odaklı yaklaşım.
          </h1>
          <p className="mt-6 text-base leading-8 text-gray-600 md:text-lg">
            Bu sayfa, Asistan'ın erken erişim ve ürün geliştirme dönemindeki genel gizlilik
            prensiplerini açıklar. Canlı kurulum kapsamı, işletme ihtiyacına göre ayrıca netleştirilir.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {principles.map((item) => (
            <Card key={item.title} className="rounded-3xl border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B7F6F]/10">
                  <item.icon className="h-6 w-6 text-[#0B7F6F]" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-[#06142A]">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-[#0D1117] p-8 text-white md:p-10">
          <h2 className="text-2xl font-bold">Sorularınız için bize yazın.</h2>
          <p className="mt-3 text-white/70">
            Gizlilik ve veri işleme kapsamı ile ilgili sorularınızı doğrudan ekibimize iletebilirsiniz.
          </p>
          <Link href="mailto:merhaba@asistan.online" className="mt-6 inline-flex items-center font-semibold text-[#12C8AD] hover:text-white">
            merhaba@asistan.online
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
