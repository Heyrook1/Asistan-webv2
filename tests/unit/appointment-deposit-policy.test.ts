import { describe, expect, it } from 'vitest'

import { parseDepositPolicy } from '@/lib/payments/deposit-policy'

describe('appointment deposit policy (Q3)', () => {
  it('parses disabled policy as off', () => {
    const policy = parseDepositPolicy({
      depositEnabled: false,
      depositAmount: 200,
      noShowFeeEnabled: false,
      currency: 'TRY',
    })
    expect(policy.depositEnabled).toBe(false)
    expect(policy.depositAmount).toBe(200)
    expect(policy.noShowFeeEnabled).toBe(false)
  })

  it('parses enabled deposit + no-show note', () => {
    const policy = parseDepositPolicy({
      depositEnabled: true,
      depositAmount: '150.00',
      noShowFeeEnabled: true,
      noShowFeeAmount: 300,
      noShowFeeNote: '  Gelinmezse ücret alınır. ',
      currency: 'TRY',
    })
    expect(policy.depositEnabled).toBe(true)
    expect(policy.depositAmount).toBe(150)
    expect(policy.noShowFeeEnabled).toBe(true)
    expect(policy.noShowFeeAmount).toBe(300)
    expect(policy.noShowFeeNote).toBe('Gelinmezse ücret alınır.')
  })
})
