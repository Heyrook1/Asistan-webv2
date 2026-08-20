// app/contact/page.tsx
'use client'

import { useEffect, useState } from 'react'
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

const contactFieldFocusOrder = [
  { errorKey: 'name', elementId: 'contact-name' },
  { errorKey: 'email', elementId: 'contact-email' },
  { errorKey: 'phone', elementId: 'contact-phone' },
  { errorKey: 'company', elementId: 'contact-company' },
  { errorKey: 'service_type', elementId: 'contact-service-type' },
  { errorKey: 'message', elementId: 'contact-message' },
  { errorKey: 'privacyAccepted', elementId: 'contact-privacy' },
] as const

export default function ContactPage() {
  const { t, language } = useLanguage()
  const requiredLabel = t({ tr: 'Zorunlu', en: 'Required' })
  const fieldCorrectionHint = t({
    tr: 'Lütfen bu alanı kontrol edip tekrar deneyin.',
    en: 'Please check this field and try again.',
  })
  const optionalLabel = t({ tr: 'İsteğe bağlı', en: 'Optional' })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [serviceType, setServiceType] = useState('patient-booking')
  const [message, setMessage] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [website, setWebsite] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formErrorMessage, setFormErrorMessage] = useState('')
  const [fieldToFocus, setFieldToFocus] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!fieldToFocus || loading) return

    document.getElementById(fieldToFocus)?.focus()
    setFieldToFocus(null)
  }, [fieldToFocus, loading])

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

  function resetForm() {
    setName('')
    setEmail('')
    setPhone('')
    setCompany('')
    setServiceType('patient-booking')
    setMessage('')
    setPrivacyAccepted(false)
    setWebsite('')
    setFieldErrors({})
    setFormErrorMessage('')
    setFieldToFocus(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})
    setFormErrorMessage('')
    setFieldToFocus(null)

    try {
      const response = await submitContactForm({
        name,
        email,
        phone,
        company,
        service_type: serviceType,
        message,
        privacyAccepted,
        website,
      })

      if (response.success) {
        setSuccess(true)
        toast.success(
          t({
            tr: 'Mesajınız alındı',
            en: 'Message received',
          }),
        )
        resetForm()
      } else {
        if (response.errors) {
          setFieldErrors(response.errors)

          const correctionMessage = t({
            tr: 'Lütfen işaretli alanları düzeltin',
            en: 'Please correct the highlighted fields',
          })
          setFormErrorMessage(correctionMessage)

          const firstInvalidField = contactFieldFocusOrder.find(
            ({ errorKey }) => response.errors?.[errorKey]?.length,
          )
          setFieldToFocus(firstInvalidField?.elementId ?? null)

          toast.error(
            correctionMessage,
            { description: Object.values(response.errors).flat().join(', ') },
          )
          return
        }
        const errorDesc =
          response.error ||
          t({ tr: 'Gönderim başarısız', en: 'Submission failed' })
        toast.error(t({ tr: 'Gönderim başarısız', en: 'Submission failed' }), {
          description: errorDesc,
        })
      }
    } catch {
      toast.error(
        t({
          tr: 'Bağlantı hatası — lütfen tekrar deneyin veya merhaba@asistan.online yazın',
          en: 'Connection error — please try again or email merhaba@asistan.online',
        }),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden pb-16 pt-10 md:pt-12">
        <div className="marketing-hero-bg absolute inset-0" />
        <div className="soft-grid absolute inset-0 opacity-60" />
        <div className="marketing-container relative z-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <FadeUp className="min-w-0">
            <Badge className="marketing-chip mb-5 border-0">
              {t({ tr: 'İletişim', en: 'Contact' })}
            </Badge>
            <h1 className="max-w-xl font-heading text-4xl font-black leading-[1.16] tracking-tight text-brand-navy md:text-5xl">
              {t({
                tr: "Kliniğiniz için Asistan'ı birlikte planlayalım.",
                en: "Let's plan Asistan for your clinic together.",
              })}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#6B7280] md:text-lg">
              {t({
                tr: 'Bu form bir talep formudur — canlı toplantı takvimi yoktur. Uygun bir görüşme saati için ekibimiz dönüş yapar.',
                en: 'This is a request form — there is no live meeting calendar. Our team replies with a suitable time.',
              })}
            </p>
          </FadeUp>

          <ScaleIn className="min-w-0">
            <Card className="marketing-surface rounded-2xl border-brand-blue/10 bg-white/95 shadow-xl">
              <CardContent className="p-6 md:p-7">
                {success ? (
                  <div
                    className="flex flex-col items-center justify-center space-y-4 py-10 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    <CheckCircle2 className="size-16 stroke-[1.5] text-emerald-600" />
                    <h2 className="text-2xl font-bold text-brand-navy">
                      {t({ tr: 'Talebiniz alındı', en: 'Request received' })}
                    </h2>
                    <p className="max-w-sm text-sm leading-relaxed text-slate-600">
                      {t({
                        tr: 'Hedef yanıt süresi: 1 iş günü içinde. Bu bir taahhütlü SLA değil; yoğunlukta gecikebilir. Acil ise merhaba@asistan.online yazın.',
                        en: 'Target reply: within 1 business day. This is not a contractual SLA and may slip when busy. For urgency, email merhaba@asistan.online.',
                      })}
                    </p>
                    <Button
                      type="button"
                      onClick={() => setSuccess(false)}
                      variant="ctaSecondary"
                      className="mt-4 rounded-xl"
                    >
                      {t({ tr: 'Yeni mesaj gönder', en: 'Send another message' })}
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-brand-navy">
                      {t({
                        tr: 'Bize ulaşın / Demo talep et',
                        en: 'Contact us / Request a demo',
                      })}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {t({
                        tr: 'Hedef yanıt: 1 iş günü (taahhütlü SLA değil). Canlı takvim seçimi yok.',
                        en: 'Target reply: 1 business day (not a contractual SLA). No live calendar picker.',
                      })}
                    </p>

                    <form onSubmit={handleSubmit} className="relative mt-5 space-y-3" noValidate>
                      {/* Honeypot — kept out of visual, keyboard, and assistive-technology flows. */}
                      <div hidden aria-hidden="true">
                        <label htmlFor="contact-website">Website</label>
                        <input
                          id="contact-website"
                          name="website"
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>

                      {formErrorMessage ? (
                        <div
                          role="alert"
                          data-testid="contact-validation-summary"
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                        >
                          {formErrorMessage}
                        </div>
                      ) : null}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-name" className="flex items-baseline justify-between gap-2">
                            <span>{t({ tr: 'Ad Soyad', en: 'Full Name' })}</span>
                            <span className="text-xs font-semibold text-red-500">{requiredLabel}</span>
                          </Label>
                          <Input
                            id="contact-name"
                            name="name"
                            placeholder={t({ tr: 'Ayşe Yılmaz', en: 'Jane Doe' })}
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            aria-invalid={fieldErrors.name ? true : undefined}
                            aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                          />
                          {fieldErrors.name ? (
                            <p id="contact-name-error" role="alert" className="text-xs font-medium text-red-600">
                              {fieldErrors.name[0]}
                              <span className="ml-1 text-red-700/80">{fieldCorrectionHint}</span>
                            </p>
                          ) : null}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-email" className="flex items-baseline justify-between gap-2">
                            <span>{t({ tr: 'İş e-postanız', en: 'Work email' })}</span>
                            <span className="text-xs font-semibold text-red-500">{requiredLabel}</span>
                          </Label>
                          <Input
                            id="contact-email"
                            name="email"
                            type="email"
                            placeholder="ornek@klinik.com"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            aria-invalid={fieldErrors.email ? true : undefined}
                            aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                          />
                          {fieldErrors.email ? (
                            <p id="contact-email-error" role="alert" className="text-xs font-medium text-red-600">
                              {fieldErrors.email[0]}
                              <span className="ml-1 text-red-700/80">{fieldCorrectionHint}</span>
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-phone" className="flex items-baseline justify-between gap-2">
                            <span>{t({ tr: 'Telefon', en: 'Phone' })}</span>
                            <span className="text-xs font-medium text-slate-500">{optionalLabel}</span>
                          </Label>
                          <Input
                            id="contact-phone"
                            name="phone"
                            type="tel"
                            placeholder="+90 5XX XXX XX XX"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={loading}
                            aria-invalid={fieldErrors.phone ? true : undefined}
                            aria-describedby={fieldErrors.phone ? 'contact-phone-error' : undefined}
                          />
                          {fieldErrors.phone ? (
                            <p id="contact-phone-error" role="alert" className="text-xs font-medium text-red-600">
                              {fieldErrors.phone[0]}
                              <span className="ml-1 text-red-700/80">{fieldCorrectionHint}</span>
                            </p>
                          ) : null}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-company" className="flex items-baseline justify-between gap-2">
                            <span>{t({ tr: 'Klinik / Kurum Adı', en: 'Clinic / Organization' })}</span>
                            <span className="text-xs font-medium text-slate-500">{optionalLabel}</span>
                          </Label>
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
                        <Label
                          id="contact-service-type-label"
                          htmlFor="contact-service-type"
                          className="flex items-baseline justify-between gap-2"
                        >
                          <span>{t({ tr: 'Hizmet Türü', en: 'Service Type' })}</span>
                          <span className="text-xs font-medium text-slate-500">{optionalLabel}</span>
                        </Label>
                        <Select
                          name="service_type"
                          value={serviceType}
                          onValueChange={(val) => setServiceType(val)}
                          disabled={loading}
                        >
                          <SelectTrigger
                            id="contact-service-type"
                            className="h-11 rounded-lg"
                            aria-labelledby="contact-service-type-label"
                          >
                            <SelectValue placeholder={t({ tr: 'Seçiniz', en: 'Select' })} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient-booking">
                              {t({
                                tr: 'Randevu ve hasta yönetimi',
                                en: 'Appointment and patient management',
                              })}
                            </SelectItem>
                            <SelectItem value="provider-onboarding">
                              {t({ tr: 'Sağlayıcı kurulum süreci', en: 'Provider setup' })}
                            </SelectItem>
                            <SelectItem value="clinic-admin">
                              {t({
                                tr: 'Klinik yönetim paneli',
                                en: 'Clinic administration dashboard',
                              })}
                            </SelectItem>
                            <SelectItem value="custom-integration">
                              {t({ tr: 'Özel entegrasyon', en: 'Custom integration' })}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-message" className="flex items-baseline justify-between gap-2">
                          <span>{t({ tr: 'Mesajınız', en: 'Your Message' })}</span>
                          <span className="text-xs font-medium text-slate-500">{optionalLabel}</span>
                        </Label>
                        <Textarea
                          id="contact-message"
                          name="message"
                          placeholder={t({
                            tr: 'Kurulum, demo veya fiyat hakkında kısaca yazın…',
                            en: 'Briefly note setup, demo, or pricing questions…',
                          })}
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          disabled={loading}
                          aria-invalid={fieldErrors.message ? true : undefined}
                          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                        />
                        {fieldErrors.message ? (
                          <p id="contact-message-error" role="alert" className="text-xs font-medium text-red-600">
                            {fieldErrors.message[0]}
                            <span className="ml-1 text-red-700/80">{fieldCorrectionHint}</span>
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                        <div className="flex items-center gap-2.5">
                          <input
                            id="contact-privacy"
                            name="privacyAccepted"
                            type="checkbox"
                            required
                            checked={privacyAccepted}
                            onChange={(e) => setPrivacyAccepted(e.target.checked)}
                            disabled={loading}
                            aria-required="true"
                            aria-invalid={fieldErrors.privacyAccepted ? true : undefined}
                            aria-describedby={
                              fieldErrors.privacyAccepted
                                ? 'contact-privacy-error'
                                : 'contact-privacy-hint'
                            }
                            className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-brand-blue focus:ring-2 focus:ring-brand-blue/40"
                          />
                          <label
                            htmlFor="contact-privacy"
                            className="flex min-h-11 cursor-pointer items-center text-xs font-medium leading-relaxed text-slate-600"
                          >
                            {language === 'tr' ? (
                              <>
                                <Link
                                  href="/privacy"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-brand-blue underline-offset-2 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Gizlilik politikasını
                                </Link>
                                {' '}ve{' '}
                                <Link
                                  href="/terms"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-brand-blue underline-offset-2 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  kullanım koşullarını
                                </Link>
                                {' '}okudum; iletişim talebim için bilgilerin işlenmesini kabul ediyorum.
                                <span className="text-red-500"> ({requiredLabel})</span>
                              </>
                            ) : (
                              <>
                                I have read the{' '}
                                <Link
                                  href="/privacy"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-brand-blue underline-offset-2 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  privacy policy
                                </Link>
                                {' '}and{' '}
                                <Link
                                  href="/terms"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-brand-blue underline-offset-2 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  terms of use
                                </Link>
                                , and I consent to processing my details for this inquiry.
                                <span className="text-red-500"> ({requiredLabel})</span>
                              </>
                            )}
                          </label>
                        </div>
                        <p id="contact-privacy-hint" className="pl-6 text-[11px] leading-snug text-slate-500">
                          {t({
                            tr: 'Pazarlama e-postası ayrıdır ve bu formla otomatik abone olmazsınız.',
                            en: 'Marketing email is separate — this form does not subscribe you automatically.',
                          })}
                        </p>
                        {fieldErrors.privacyAccepted ? (
                          <p id="contact-privacy-error" role="alert" className="pl-6 text-xs font-medium text-red-600">
                            {fieldErrors.privacyAccepted[0]}
                            <span className="ml-1 text-red-700/80">{fieldCorrectionHint}</span>
                          </p>
                        ) : null}
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        variant="ctaPrimary"
                        className="h-10 w-full rounded-lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-1.5 size-4 animate-spin text-white" />
                            {t({ tr: 'Talep gönderiliyor…', en: 'Sending request…' })}
                          </>
                        ) : (
                          <>
                            {t({ tr: 'Talebi gönder', en: 'Send request' })}
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
                <Link
                  href={option.href}
                  className="mt-4 inline-flex items-center text-sm font-semibold text-brand-blue hover:text-brand-teal"
                >
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
