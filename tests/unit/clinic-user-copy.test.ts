import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/** Clinic-facing surfaces that must not ship ASCII-TR typos or env-key leaks. */
const CLINIC_USER_COPY_SURFACES = [
  'components/dashboard/prescription-form-drawer.tsx',
  'components/dashboard/calendar-integration-panel.tsx',
  'lib/actions/appointments.ts',
  'lib/actions/team.ts',
  'lib/actions/messages.ts',
] as const

const FORBIDDEN_ASCII_SNIPPETS = [
  'Doktor secimi',
  'Doktor secin',
  'Recete yazan',
  'Recete notu',
  'Lutfen randevu',
  'sube secin',
  'onaylandi',
  'tarafindan onaylandi',
  'tamamlandi',
  'diger hastalara',
  'Cok fazla istek',
  'Gecersiz e-posta',
  'Form hatali',
  'Uye bulunamadi',
  'duzenleme yetkiniz',
  'write-back',
  'OAuth dönüşü',
  '(consent)',
  'yenileme jetonu',
  'Microsoft Graph',
  'busy-block',
  'production MVP',
  'KKTC_EFATURA_*',
  'sunucu env',
] as const

describe('clinic user-facing Turkish copy', () => {
  it('rejects known ASCII typos and tech English in clinic surfaces', () => {
    for (const rel of CLINIC_USER_COPY_SURFACES) {
      const src = readFileSync(join(process.cwd(), rel), 'utf8')
      for (const snippet of FORBIDDEN_ASCII_SNIPPETS) {
        expect(src, `${rel} must not contain "${snippet}"`).not.toContain(snippet)
      }
      expect(src, rel).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY ayarlanmali/)
      expect(src, rel).not.toMatch(/SUPABASE_SECRET_KEY veya SUPABASE_SERVICE_ROLE_KEY/)
    }
  })
})
