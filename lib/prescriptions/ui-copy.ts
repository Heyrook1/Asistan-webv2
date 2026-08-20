/**
 * Printable clinic Rx copy (BUG-006) — never “E-reçete oluşturuldu”.
 * Official / national e-reçete networks are out of product boundary.
 */
export const prescriptionUiCopy = {
  createTitle: 'Klinik reçete oluştur',
  createSubmit: 'Klinik reçeteyi oluştur',
  createPending: 'Oluşturuluyor...',
  createSuccess: (protocolNo: string) => `Klinik reçete oluşturuldu (${protocolNo})`,
  timelineTitle: 'Klinik reçete oluşturuldu',
  patientIdentityRequired: 'Klinik reçete için hasta KKTC kimlik numarası zorunludur',
  draftFailed: 'Taslak oluşturulamadı',
  otherDoctorProfileForbidden: 'Başka doktorun reçete profilini düzenleme yetkiniz yok',
} as const

/** Affirmative shipped UX that implies official e-reçete — forbidden in product UI. */
export const FORBIDDEN_ERECETE_UX_SNIPPETS = [
  'E-recete olusturuldu',
  'E-reçete oluşturuldu',
  'E-receteyi olustur',
  'E-reçeteyi oluştur',
  'E-recete icin',
  'E-reçete için',
  'E-recete',
  'E-reçete',
  'e-recete',
  'e-reçete',
] as const
