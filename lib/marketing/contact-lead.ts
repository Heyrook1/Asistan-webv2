import 'server-only'

import { z } from 'zod'

/** Privacy notice version stamped on contact / demo inquiry leads. */
export const CONTACT_PRIVACY_NOTICE_VERSION = '2026-08-10'

export const contactLeadSchema = z.object({
  name: z.string().trim().min(2, 'Ad en az 2 karakter olmalı').max(120),
  email: z.string().trim().email('Geçersiz e-posta').max(160),
  phone: z.string().trim().min(6, 'Geçersiz telefon').max(40),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  service_type: z
    .enum(['patient-booking', 'provider-onboarding', 'clinic-admin', 'custom-integration'])
    .optional(),
  message: z.string().trim().min(10, 'Mesaj en az 10 karakter olmalı').max(4000),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Gizlilik ve kullanım koşullarını kabul etmelisiniz' }),
  }),
  /** Honeypot — bots fill this; humans leave it empty. */
  website: z.string().max(200).optional(),
})

export type ContactLeadInput = z.infer<typeof contactLeadSchema>

export const CONTACT_SERVICE_TYPE_LABELS: Record<
  NonNullable<ContactLeadInput['service_type']>,
  { tr: string; en: string }
> = {
  'patient-booking': {
    tr: 'Randevu ve hasta yönetimi',
    en: 'Appointment and patient management',
  },
  'provider-onboarding': {
    tr: 'Sağlayıcı kurulum süreci',
    en: 'Provider setup',
  },
  'clinic-admin': {
    tr: 'Klinik yönetim paneli',
    en: 'Clinic administration dashboard',
  },
  'custom-integration': {
    tr: 'Özel entegrasyon',
    en: 'Custom integration',
  },
}
