/**
 * Shared auth form microcopy (5.3) — TR locale, KKTC-facing placeholders.
 * Action-oriented errors; no John Doe / ASCII-stripped labels.
 */
export const authFormCopy = {
  emailInvalid: {
    tr: 'E-posta adresinde @ işareti olmalı (ör. ornek@klinik.com)',
    en: 'Email must include @ (e.g. clinic@example.com)',
  },
  emailPlaceholder: {
    tr: 'ornek@klinik.com',
    en: 'clinic@example.com',
  },
  namePlaceholder: {
    tr: 'Ayşe Yılmaz',
    en: 'Jane Clinic',
  },
} as const
