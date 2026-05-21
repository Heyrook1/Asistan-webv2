import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { Footer } from '@/components/marketing/footer'
import { Navbar } from '@/components/marketing/navbar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Kullanım Koşulları',
  description: 'Asistan platformunun erken erişim ve kullanım koşulları hakkında genel bilgilendirme.',
}

const terms = [
  'Asistan, sağlık ve hizmet işletmeleri için randevu, hasta/müşteri takibi ve ekip yönetimi deneyimi sunar.',
  'Hesap ve panel erişimi işletme yetkilileri tarafından güvenli şekilde kullanılmalıdır.',
  'Erken erişim döneminde özellik kapsamı, işletme ihtiyacı ve ürün yol haritasına göre değişebilir.',
  'Platform, yanlış veya yetkisiz veri kullanımını önlemeye yönelik rol bazlı erişim prensipleriyle tasarlanır.',
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-[#F8FAFB] pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Badge className="mb-5 border-0 bg-[#0B7F6F]/10 text-[#0B7F6F] hover:bg-[#0B7F6F]/10">
            Kullanım Koşulları
          </Badge>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-[#06142A] md:text-5xl">
            Asistan kullanım koşulları.
          </h1>
          <p className="mt-6 text-base leading-8 text-gray-600 md:text-lg">
            Bu sayfa, Asistan platformunun erken erişim ve genel kullanım çerçevesini sade şekilde
            açıklar. Sözleşme kapsamı canlı kurulum öncesinde ayrıca paylaşılır.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="rounded-[2rem] border-gray-100 shadow-sm">
            <CardContent className="space-y-5 p-6 md:p-8">
              {terms.map((term) => (
                <div key={term} className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#0B7F6F]" aria-hidden="true" />
                  <p className="leading-7 text-gray-600">{term}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-[#0D1117] p-8 text-white md:p-10">
          <h2 className="text-2xl font-bold">Kurulum öncesi koşulları netleştirelim.</h2>
          <p className="mt-3 text-white/70">
            Asistan Health erken erişim sürecinde kapsam, veri ve kullanım koşullarını birlikte
            gözden geçiririz.
          </p>
          <Link href="/contact" className="mt-6 inline-flex items-center font-semibold text-[#12C8AD] hover:text-white">
            İletişime Geç
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
