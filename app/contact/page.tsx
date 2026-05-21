import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mail, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react'

import { Footer } from '@/components/marketing/footer'
import { Navbar } from '@/components/marketing/navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'Asistan Health erken erişim ve demo görüşmesi için Asistan ekibiyle iletişime geçin.',
}

const contactOptions = [
  {
    icon: Mail,
    title: 'E-posta',
    description: 'Demo, kurulum ve erken erişim soruları için yazın.',
    action: 'merhaba@asistan.online',
    href: 'mailto:merhaba@asistan.online',
  },
  {
    icon: Sparkles,
    title: 'Erken erişim',
    description: 'Kliniğinizin ihtiyacını paylaşın; uygun başlangıcı birlikte planlayalım.',
    action: 'Başvuru Yap',
    href: '/auth/sign-up',
  },
  {
    icon: ShieldCheck,
    title: 'Panel erişimi',
    description: 'Mevcut hesabınız varsa güvenli giriş ekranına geçin.',
    action: 'Giriş Yap',
    href: '/auth/login',
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="mesh-hero pt-32 pb-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <Badge className="mb-5 border-0 bg-[#0B7F6F]/10 text-[#0B7F6F] hover:bg-[#0B7F6F]/10">
              İletişim
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-[#06142A] md:text-5xl lg:text-6xl">
              Kliniğiniz için Asistan'ı birlikte planlayalım.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
              Randevu, hasta takibi, sekreter rolleri ve hatırlatma akışınızı kısa bir görüşmede
              anlayıp en doğru başlangıcı önerelim.
            </p>
          </div>

          <Card className="rounded-[2rem] border-gray-100 bg-white/85 shadow-2xl shadow-slate-200/70 backdrop-blur-xl">
            <CardContent className="p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B7F6F]/10">
                  <MessageSquare className="h-5 w-5 text-[#0B7F6F]" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#06142A]">Demo talebi</h2>
                  <p className="text-sm text-gray-500">Bu form görsel başvuru alanıdır; doğrudan e-posta da gönderebilirsiniz.</p>
                </div>
              </div>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input placeholder="Ad soyad" aria-label="Ad soyad" className="h-12 rounded-xl" />
                  <Input type="email" placeholder="E-posta" aria-label="E-posta" className="h-12 rounded-xl" />
                </div>
                <Input placeholder="Klinik veya işletme adı" aria-label="Klinik veya işletme adı" className="h-12 rounded-xl" />
                <Textarea placeholder="Kısaca ihtiyacınızı yazın" aria-label="Kısaca ihtiyacınızı yazın" className="min-h-28 rounded-xl" />
                <Button asChild className="h-12 w-full rounded-xl bg-[#0B7F6F] font-semibold text-white hover:bg-[#09685C]">
                  <a href="mailto:merhaba@asistan.online?subject=Asistan%20Demo%20Talebi">
                    E-posta ile Gönder
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 md:py-28" aria-label="İletişim seçenekleri">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {contactOptions.map((option) => (
            <Card key={option.title} className="rounded-3xl border-gray-100 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B7F6F]/10">
                  <option.icon className="h-6 w-6 text-[#0B7F6F]" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-[#06142A]">{option.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">{option.description}</p>
                <Link href={option.href} className="mt-5 inline-flex items-center text-sm font-semibold text-[#0B7F6F] hover:underline">
                  {option.action}
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
