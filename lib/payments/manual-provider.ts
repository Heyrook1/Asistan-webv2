import type { CreatePaymentIntentInput, CreatePaymentIntentResult, MembershipPaymentProvider } from './types'

function defaultBankInstructions(input: CreatePaymentIntentInput) {
  const custom = process.env.MEMBERSHIP_BANK_INSTRUCTIONS?.trim()
  if (custom) {
    return custom
      .replaceAll('{{amount}}', String(input.amount))
      .replaceAll('{{currency}}', input.currency)
      .replaceAll('{{plan}}', input.planName)
      .replaceAll('{{paymentId}}', input.paymentId)
  }

  return [
    `Paket: ${input.planName} (${input.billingPeriod === 'YEARLY' ? 'yıllık' : 'aylık'})`,
    `Tutar: ${input.amount} ${input.currency}`,
    `Referans: ${input.paymentId.slice(0, 8)} · ${input.businessName}`,
    '',
    'Ödeme elden / banka havalesi ile alınır. Transfer sonrası ekibimiz paketi onaylar (genelde 1 iş günü).',
    'İletişim: merhaba@asistan.online',
  ].join('\n')
}

export const manualMembershipProvider: MembershipPaymentProvider = {
  kind: 'MANUAL',
  async createIntent(input): Promise<CreatePaymentIntentResult> {
    return {
      provider: 'MANUAL',
      providerRef: `manual_${input.paymentId}`,
      checkoutUrl: null,
      instructions: defaultBankInstructions(input),
    }
  },
}
