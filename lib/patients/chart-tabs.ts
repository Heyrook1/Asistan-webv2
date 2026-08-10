/**
 * Patient chart primary tab IA (5 slots).
 * Legacy ?tab= values remap into the new taxonomy.
 */

export const PATIENT_CHART_PRIMARY_TABS = [
  'genel',
  'klinik',
  'finans',
  'belgeler',
  'gecmis',
] as const

export type PatientChartPrimaryTab = (typeof PATIENT_CHART_PRIMARY_TABS)[number]

export type PatientChartTab = PatientChartPrimaryTab

const LEGACY_TAB_MAP: Record<string, PatientChartTab> = {
  genel: 'genel',
  klinik: 'klinik',
  finans: 'finans',
  belgeler: 'belgeler',
  gecmis: 'gecmis',
  // Legacy primary tabs
  zaman: 'gecmis',
  'klinik-gecmis': 'gecmis',
  randevular: 'gecmis',
  ilac: 'klinik',
  recete: 'klinik',
  'recete-ilac': 'klinik',
  tahlil: 'belgeler',
  dosya: 'belgeler',
  'tahlil-dosya': 'belgeler',
  // Legacy "Daha Fazla" overflow
  not: 'klinik',
  anket: 'klinik',
  alerji: 'klinik',
  tedavi: 'klinik',
  hikaye: 'klinik',
}

export function resolvePatientChartTab(raw: string | null | undefined): PatientChartTab {
  if (!raw) return 'genel'
  return LEGACY_TAB_MAP[raw] ?? 'genel'
}

export function isPatientChartPrimaryTab(value: string): value is PatientChartPrimaryTab {
  return (PATIENT_CHART_PRIMARY_TABS as readonly string[]).includes(value)
}
