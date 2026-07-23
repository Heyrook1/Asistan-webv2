/**
 * Canonical TR copy for password auth surfaces (BUG-003).
 * Keep diacritics here — pages import these strings; unit snapshot guards ASCII drift.
 */
export const passwordFlowCopy = {
  forgot: {
    badge: 'Şifre sıfırlama',
    title: 'Şifrenizi yenilemek için e-postanızı girin.',
    description: 'Sisteme kayıtlı adresinize şifre değiştirme bağlantısı gönderelim.',
    heading: 'Şifremi unuttum',
    hint: 'Bağlantı ile yeni şifre oluşturabilirsiniz.',
    submit: 'Bağlantı gönder',
    backToLogin: 'Giriş sayfasına dön',
    sentBadge: 'Şifre sıfırlama',
    sentTitle: 'E-posta bağlantısı gönderildi.',
    sentHeading: 'E-postanızı kontrol edin',
    sentBody: 'Bağlantıya tıkladıktan sonra yeni şifrenizi belirleyebilirsiniz.',
    sentHighlights: [
      'Gelen kutusu ve spam klasörünü kontrol edin',
      'Bağlantı açıldığında yeni şifrenizi belirleyin',
      'Ardından panelinize tekrar giriş yapın',
    ] as const,
  },
  setup: {
    badge: 'İlk kurulum',
    title: 'Ekip hesabı şifresini belirleyin.',
    description:
      'Davet bağlantısı doğrulandıktan sonra yeni şifrenizi kaydedip panelinize geçebilirsiniz.',
    heading: 'Şifrenizi belirleyin',
    hint: 'Ekip hesabınız için yeni şifre oluşturun.',
    passwordLabel: 'Yeni şifre',
    confirmLabel: 'Şifre tekrar',
    verifying: 'Bağlantı doğrulanıyor...',
    submit: 'Şifreyi kaydet',
    backPrompt: 'Geri dönmek için',
    backLink: 'giriş sayfasına geçin',
    highlights: [
      'Bağlantı otomatik olarak doğrulanır',
      'Yeni şifre anında aktif olur',
      'Kayıt sonrası doğrudan dashboard açılır',
    ] as const,
  },
  reset: {
    badge: 'Yeni şifre',
    title: 'Hesabınız için yeni şifre belirleyin.',
    description: 'Güçlü bir şifre seçin ve eski şifrenizin yerine kaydedin.',
    heading: 'Yeni şifre',
    hint: 'İki alana da aynı şifreyi girin.',
    passwordLabel: 'Yeni şifre',
    confirmLabel: 'Şifre tekrar',
    submit: 'Şifreyi güncelle',
    successBadge: 'Şifre güncellendi',
    successTitle: 'Yeni şifreniz hazır.',
    successDescription: 'Artık panelinize yeni şifrenizle güvenli şekilde giriş yapabilirsiniz.',
    successHeading: 'Şifre değişimi tamamlandı',
    successBody: 'Giriş ekranına dönerek devam edebilirsiniz.',
    successCta: 'Giriş Yap',
  },
} as const

export type PasswordFlowCopy = typeof passwordFlowCopy
