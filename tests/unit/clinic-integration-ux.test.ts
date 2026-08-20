import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  INTEGRATION_STATUS_LABEL,
  looksLikeClinicIntegrationRunbookLeak,
  resolveChannelLinkStatus,
} from '@/lib/integrations/clinic-status'

const CLINIC_SURFACES = [
  'components/dashboard/patient-outbound-channels-panel.tsx',
  'components/dashboard/calendar-integration-panel.tsx',
  'components/dashboard/mesajlar-deprecated-panel.tsx',
  'app/dashboard/ayarlar/settings-form.tsx',
  'lib/actions/invoices.ts',
  'components/dashboard/clinic-invoices-board.tsx',
]

describe('clinic integration status (P1-04)', () => {
  it('maps configured / error / disconnected', () => {
    expect(resolveChannelLinkStatus({ configured: false, errors: 0, sent: 0 })).toBe('disconnected')
    expect(resolveChannelLinkStatus({ configured: true, errors: 0, sent: 2 })).toBe('connected')
    expect(resolveChannelLinkStatus({ configured: true, errors: 1, sent: 0 })).toBe('error')
    expect(INTEGRATION_STATUS_LABEL.connected).toBe('Bağlı')
    expect(INTEGRATION_STATUS_LABEL.disconnected).toBe('Bağlı değil')
    expect(INTEGRATION_STATUS_LABEL.error).toBe('Hata')
  })

  it('detects runbook leaks', () => {
    expect(looksLikeClinicIntegrationRunbookLeak('Set SMS_PROVIDER_WEBHOOK_URL')).toBe(true)
    expect(looksLikeClinicIntegrationRunbookLeak('HTTP ACK vs DLR')).toBe(true)
    expect(looksLikeClinicIntegrationRunbookLeak('docs/patient-outbound-channels.md')).toBe(true)
    expect(looksLikeClinicIntegrationRunbookLeak('KKTC_EFATURA_* env')).toBe(true)
    expect(looksLikeClinicIntegrationRunbookLeak('Google OAuth redirect')).toBe(true)
    expect(looksLikeClinicIntegrationRunbookLeak('SMS sağlayıcısını bağla')).toBe(false)
  })

  it('clinic settings surfaces do not leak deploy runbook copy', () => {
    const root = process.cwd()
    for (const rel of CLINIC_SURFACES) {
      const text = readFileSync(join(root, rel), 'utf8')
      expect(looksLikeClinicIntegrationRunbookLeak(text), rel).toBe(false)
    }
  })
})
