import { describe, expect, it } from 'vitest'

import {
  PATIENT_CHART_PRIMARY_TABS,
  resolvePatientChartTab,
} from '@/lib/patients/chart-tabs'

describe('patient chart tabs IA', () => {
  it('exposes five primary slots', () => {
    expect(PATIENT_CHART_PRIMARY_TABS).toEqual([
      'genel',
      'klinik',
      'finans',
      'belgeler',
      'gecmis',
    ])
  })

  it('remaps legacy tab query values', () => {
    expect(resolvePatientChartTab('zaman')).toBe('gecmis')
    expect(resolvePatientChartTab('klinik-gecmis')).toBe('gecmis')
    expect(resolvePatientChartTab('randevular')).toBe('gecmis')
    expect(resolvePatientChartTab('ilac')).toBe('klinik')
    expect(resolvePatientChartTab('recete')).toBe('klinik')
    expect(resolvePatientChartTab('recete-ilac')).toBe('klinik')
    expect(resolvePatientChartTab('tahlil')).toBe('belgeler')
    expect(resolvePatientChartTab('dosya')).toBe('belgeler')
    expect(resolvePatientChartTab('tahlil-dosya')).toBe('belgeler')
    expect(resolvePatientChartTab('not')).toBe('klinik')
    expect(resolvePatientChartTab('anket')).toBe('klinik')
    expect(resolvePatientChartTab('alerji')).toBe('klinik')
    expect(resolvePatientChartTab('tedavi')).toBe('klinik')
    expect(resolvePatientChartTab('hikaye')).toBe('klinik')
    expect(resolvePatientChartTab(undefined)).toBe('genel')
  })
})
