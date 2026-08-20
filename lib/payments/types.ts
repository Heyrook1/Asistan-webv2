export type CreatePaymentIntentInput = {
  paymentId: string
  businessId: string
  businessName: string
  planCode: string
  planName: string
  billingPeriod: 'MONTHLY' | 'YEARLY'
  amount: number
  currency: string
  packageDurationDays: number
  customerEmail?: string | null
}

export type CreatePaymentIntentResult = {
  provider: 'MANUAL' | 'STRIPE'
  providerRef: string | null
  checkoutUrl: string | null
  instructions: string
}

export interface MembershipPaymentProvider {
  readonly kind: 'MANUAL' | 'STRIPE'
  createIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult>
}
