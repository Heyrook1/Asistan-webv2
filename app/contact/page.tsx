import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mail, MessageSquare, ShieldCheck } from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'Iletisim',
  description: 'Asistan Health demo ve kurulum sureci icin bizimle iletisime gecin.',
}

const contactOptions = [
  {
    icon: Mail,
    title: 'E-posta',
    description: 'Demo, kurulum ve fiyatlandirma sorulariniz icin bize yazin.',
    action: 'merhaba@asistan.online',
    href: 'mailto:merhaba@asistan.online',
  },
  {
    icon: MessageSquare,
    title: 'Canli Akis',
    description: 'Hizli bir gorusmede klinik yapiniza uygun kurulum akisini cikaralim.',
    action: 'Demo Planla',
    href: '/auth/sign-up',
  },
  {
    icon: ShieldCheck,
    title: 'Panel Erisimi',
    description: 'Hesabiniz varsa dogrudan guvenli giris ekranina gecin.',
    action: 'Giris Yap',
    href: '/auth/login',
  },
]

export default function ContactPage() {
  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden pb-16 pt-28 md:pt-32">
        <div className="marketing-hero-bg absolute inset-0" />
        <div className="soft-grid absolute inset-0 opacity-60" />
        <div className="marketing-container relative z-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <FadeUp>
            <Badge className="marketing-chip mb-5 border-0">Iletisim</Badge>
            <h1 className="max-w-xl font-heading text-4xl font-black leading-[1.08] text-brand-navy md:text-5xl">
              Kliniginiz icin Asistan'i birlikte planlayalim.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
              Randevu, hasta takibi ve ekip akisiniz icin en dogru kurulumu kisa bir gorusmede netlestirelim.
            </p>
          </FadeUp>

          <ScaleIn>
            <Card className="marketing-surface rounded-2xl border-brand-blue/10 bg-white/95 shadow-xl">
              <CardContent className="p-6 md:p-7">
                <h2 className="text-xl font-bold text-brand-navy">Bize Ulasin / Demo Talep Edin</h2>
                <p className="mt-2 text-sm text-slate-500">Ekibimiz size en kisa surede donus yapar.</p>
                <form className="mt-5 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-name">Ad Soyad</Label>
                      <Input id="contact-name" name="name" placeholder="Ad Soyad" autoComplete="name" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-email">E-posta</Label>
                      <Input id="contact-email" name="email" type="email" placeholder="E-posta" autoComplete="email" required />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-phone">Telefon</Label>
                      <Input id="contact-phone" name="phone" type="tel" placeholder="+90 5XX XXX XX XX" autoComplete="tel" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-company">Klinik / Kurum Adi</Label>
                      <Input id="contact-company" name="company" placeholder="Klinik / Kurum Adi" autoComplete="organization" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Hizmet Turu</Label>
                    <Select name="service_type">
                      <SelectTrigger className="h-11 rounded-lg">
                        <SelectValue placeholder="Seciniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient-booking">Randevu ve hasta yonetimi</SelectItem>
                        <SelectItem value="provider-onboarding">Saglayici onboarding</SelectItem>
                        <SelectItem value="clinic-admin">Klinik yonetim paneli</SelectItem>
                        <SelectItem value="custom-integration">Ozel entegrasyon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-message">Mesajiniz</Label>
                    <Textarea id="contact-message" name="message" placeholder="Mesajiniz" rows={4} required />
                  </div>
                  <Button className="h-10 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
                    Gonder
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ScaleIn>
        </div>
      </section>

      <section className="bg-white pb-20 pt-8">
        <div className="marketing-container grid gap-4 md:grid-cols-3">
          {contactOptions.map((option, index) => (
            <FadeUp key={option.title} delay={0.05 * index}>
              <article className="marketing-surface marketing-card-hover rounded-2xl p-5">
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-blue">
                  <option.icon className="size-5" />
                </div>
                <h3 className="text-lg font-extrabold text-brand-navy">{option.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{option.description}</p>
                <Link href={option.href} className="mt-4 inline-flex items-center text-sm font-semibold text-brand-blue hover:text-brand-teal">
                  {option.action}
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </article>
            </FadeUp>
          ))}
        </div>
      </section>
    </MarketingPageShell>
  )
}
