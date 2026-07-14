/**
 * Klinik dili sözlüğü — marketing / satış copy’sinde tercih edilen TR ifadeler.
 * Teknik jargon (RLS, webhook, orchestration…) klinik muhataba sadeleştirilir.
 */

export type CopyPreferred = {
  avoid: string
  prefer: string
  note?: string
}

export const CLINIC_COPY_PREFERENCES: CopyPreferred[] = [
  { avoid: 'Multi-Branch', prefer: 'Çok şubeli', note: 'İngilizce ürün jargonu' },
  { avoid: 'RLS', prefer: 'işletme bazlı veri ayrımı', note: 'Postgres terimini UI’da açma' },
  { avoid: 'Orkestrasyon', prefer: 'randevu düzeni', note: 'Aşırı soyut' },
  { avoid: 'webhook', prefer: 'bildirim kurulumu', note: 'Teknik kanal adı' },
  { avoid: 'onboarding', prefer: 'kurulum / ilk ayar', note: 'TR klinik dili' },
  { avoid: 'enterprise-grade', prefer: 'kurumsal seviye', note: 'EN kalıntı' },
  { avoid: 'slot', prefer: 'müsait saat', note: 'Hasta/klinik diline çevir' },
  { avoid: 'tenant', prefer: 'işletme', note: 'SaaS jargonu' },
]

/** Common ASCII typos to reject in new marketing pages (regex sources). */
export const ASCII_TR_SMELLS = [
  /\bCozumler\b/,
  /\bSaglik\b/,
  /\bGuzellik\b/,
  /\bSimdi\b/,
  /\bsiradaki\b/i,
  /\bodakli\b/,
  /\bguvenli\b/i,
  /\bIlk\b/,
  /\bSektor\b/,
  /\bmusteri\b/,
  /\bYakinda\b/,
  /\bPlanlaniyor\b/,
  /\bBaslangic\b/,
  /\bFiyatlandirma\b/,
  /\bKliniginiz\b/,
  /\bUrun\b/,
  /\bIsletme\b/,
  /\bHatirlatma\b/,
  /\bYillik\b/,
  /\bAylik\b/,
] as const

export function preferClinicCopy(text: string): string {
  return CLINIC_COPY_PREFERENCES.reduce(
    (out, row) => out.replaceAll(row.avoid, row.prefer),
    text,
  )
}
