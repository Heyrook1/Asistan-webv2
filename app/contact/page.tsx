// app/contact/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, MessageSquare, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath, getRegisterPath } from '@/lib/auth-routes'
import { ENTRY_CTA } from '@/lib/entry-routes'
import { submitContactForm } from '@/app/contact/actions'

export default function ContactPage() {
  const { t, language } = useLanguage()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [serviceType, setServiceType] = useState('patient-booking')
  const [message, setMessage] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const contactOptions = [
    {
      icon: Mail,
      title: t({ tr: 'E-posta', en: 'Email' }),
      description: t({
        tr: 'Demo, kurulum ve fiyatlandırma sorularınız için bize yazın.',
        en: 'Write to us for demo, setup, and pricing questions.',
      }),
      action: 'merhaba@asistan.online',
      href: 'mailto:merhaba@asistan.online',
    },
    {
      icon: MessageSquare,
      title: t(ENTRY_CTA.clinicTrial.short),
      description: t({
        tr: 'Hesap oluşturup paneli kendi kliniğiniz için hemen deneyin.',
        en: 'Create an account and try the clinic panel for your practice right away.',
      }),
      action: t(ENTRY_CTA.clinicTrial),
      href: getRegisterPath(language),
    },
    {
      icon: ShieldCheck,
      title: t(ENTRY_CTA.clinicLogin),
      description: t({
        tr: 'Hesabınız varsa doğrudan güvenli giriş ekranına geçin.',
        en: 'If you already have an account, proceed to secure login.',
      }),
      action: t(ENTRY_CTA.clinicLogin),
      href: getLoginPath(language),
    },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await submitContactForm({
        name,
        email,
        phone,
        company,
        service_type: serviceType,
        message,
      })

      if (response.success) {
        setSuccess(true)
        toast.success(t({ 
          tr: 'Mesajınız Gönderildi!', 
          en: 'Message Sent Successfully!' 
        }))
        // Reset fields
        setName('')
        setEmail('')
        setPhone('')
        setCompany('')
        setMessage('')
      } else {
        const errorDesc = response.errors 
          ? Object.values(response.errors).flat().join(', ')
          : response.error || 'Failed'
        toast.error(t({ tr: 'Gönderim Başarısız', en: 'Submission Failed' }), {
          description: errorDesc
        })
      }
    } catch {
      toast.error(t({ tr: 'Beklenmeyen Hata', en: 'Unexpected Error' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden pb-16 pt-10 md:pt-12">
        <div className="marketing-hero-bg absolute inset-0" />
        <div className="soft-grid absolute inset-0 opacity-60" />
        <div className="marketing-container relative z-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <FadeUp>
            <Badge className="marketing-chip mb-5 border-0">
              {t({ tr: 'İletişim', en: 'Contact' })}
            </Badge>
            <h1 className="max-w-xl font-heading text-4xl font-black leading-[1.08] text-brand-navy md:text-5xl">
              {t({
                tr: "Kliniğiniz için Asistan'ı birlikte planlayalım.",
                en: "Let's plan Asistan for your clinic together.",
              })}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
              {t({
                tr: 'Randevu, hasta takibi ve ekip akışınız için en doğru kurulumu kısa bir görüşmede netleştirelim.',
                en: "Let's find the correct setup for your appointments, patient records, and workflow in a short session.",
              })}
            </p>
          </FadeUp>

          <ScaleIn>
            <Card className="marketing-surface rounded-2xl border-brand-blue/10 bg-white/95 shadow-xl">
              <CardContent className="p-6 md:p-7">
                {success ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <CheckCircle2 className="size-16 text-emerald-600 stroke-[1.5]" />
                    <h2 className="text-2xl font-bold text-brand-navy">
                      {t({ tr: 'Teşekkür Ederiz!', en: 'Thank You!' })}
                    </h2>
                    <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
                      {t({
                        tr: "Mesajınız iletildi. En kısa sürede sizinle iletişime geçeceğiz.",
                        en: "Your message has been sent. We'll get back to you soon.",
                      })}
                    </p>
                    <Button 
                      type="button" 
                      onClick={() => setSuccess(false)}
                      className="mt-4 rounded-xl bg-brand-blue text-white hover:bg-brand-blue/90"
                    >
                      {t({ tr: 'Yeni Mesaj Gönder', en: 'Send Another Message' })}
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-brand-navy">
                      {t({ tr: 'Bize Ulaşın / Demo talep et', en: 'Contact us / Request a demo' })}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {t({ tr: 'Ekibimiz size en kısa sürede dönüş yapar.', en: 'Our team will get back to you shortly.' })}
                    </p>
                    
                    <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-name">{t({ tr: 'Ad Soyad', en: 'Full Name' })}</Label>
                          <Input 
                            id="contact-name" 
                            name="name" 
                            placeholder={t({ tr: 'Ad Soyad', en: 'Full Name' })} 
                            autoComplete="name" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-email">{t({ tr: 'E-posta', en: 'Email' })}</Label>
                          <Input 
                            id="contact-email" 
                            name="email" 
                            type="email" 
                            placeholder={t({ tr: 'E-posta', en: 'Email' })} 
                            autoComplete="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-phone">{t({ tr: 'Telefon', en: 'Phone' })}</Label>
                          <Input 
                            id="contact-phone" 
                            name="phone" 
                            type="tel" 
                            placeholder="+90 5XX XXX XX XX" 
                            autoComplete="tel" 
                            required 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-company">{t({ tr: 'Klinik / Kurum Adı', en: 'Clinic / Organization' })}</Label>
                          <Input 
                            id="contact-company" 
                            name="company" 
                            placeholder={t({ tr: 'Klinik / Kurum Adı', en: 'Clinic / Organization' })} 
                            autoComplete="organization" 
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t({ tr: 'Hizmet Türü', en: 'Service Type' })}</Label>
                        <Select 
                          name="service_type" 
                          value={serviceType}
                          onValueChange={(val) => setServiceType(val)}
                          disabled={loading}
                        >
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder={t({ tr: 'Seçiniz', en: 'Select' })} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient-booking">
                              {t({ tr: 'Randevu ve hasta yönetimi', en: 'Appointment and patient management' })}
                            </SelectItem>
                            <SelectItem value="provider-onboarding">
                              {t({ tr: 'Sağlayıcı kurulum süreci', en: 'Provider setup' })}
                            </SelectItem>
                            <SelectItem value="clinic-admin">
                              {t({ tr: 'Klinik yönetim paneli', en: 'Clinic administration dashboard' })}
                            </SelectItem>
                            <SelectItem value="custom-integration">
                              {t({ tr: 'Özel entegrasyon', en: 'Custom integration' })}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-message">{t({ tr: 'Mesajınız', en: 'Your Message' })}</Label>
                        <Textarea 
                          id="contact-message" 
                          name="message" 
                          placeholder={t({ tr: 'Mesajınız', en: 'Your Message' })} 
                          rows={4} 
                          required 
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <Button 
                        type="submit"
                        disabled={loading}
                        className="h-10 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-1.5 size-4 animate-spin text-white" />
                            {t({ tr: 'Gönderiliyor...', en: 'Submitting...' })}
                          </>
                        ) : (
                          <>
                            {t({ tr: 'Gönder', en: 'Submit' })}
                            <ArrowRight className="ml-1.5 size-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}
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
