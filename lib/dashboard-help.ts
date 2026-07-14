export type HelpQuickLink = {
  href: string
  title: string
  description: string
}

export type HelpFaq = {
  q: string
  a: string
}

/** In-dashboard help center — quick paths + FAQ (TR). */
export const HELP_QUICK_LINKS: HelpQuickLink[] = [
  {
    href: '/dashboard/ajanda',
    title: 'Ajanda & randevu',
    description: 'Günlük liste, takvim ve onay bekleyen randevular.',
  },
  {
    href: '/dashboard/hastalar',
    title: 'Hasta kayıtları',
    description: 'Hasta ekleme, arama ve dosya notları.',
  },
  {
    href: '/dashboard/takim',
    title: 'Takım & roller',
    description: 'Personel davetleri ve yetki düzeni.',
  },
  {
    href: '/dashboard/ayarlar?tab=hesap',
    title: 'Hesap ayarları',
    description: 'Profil, işletme bilgisi ve abonelik durumu.',
  },
]

export const HELP_FAQ: HelpFaq[] = [
  {
    q: 'Randevu onayını kim verir?',
    a: 'Online veya sekreter tarafından oluşturulan bekleyen (SCHEDULED) randevular, yetkisi olan ekip üyelerince ajandadan onaylanır veya iptal edilir.',
  },
  {
    q: 'Hasta randevu alabilir mi?',
    a: 'Evet — hasta tarafı /client üzerinden klinik keşfi ve randevu talebi yapabilir. Klinik paneli bu talepleri ajandada görür.',
  },
  {
    q: 'Paket sürem doldu, ne yapmalıyım?',
    a: 'Ayarlar → Abonelik sekmesinden durumunuzu kontrol edin. Yenileme elden / faturalı süreçtedir; merhaba@asistan.online veya iletişim formuyla talep açabilirsiniz.',
  },
  {
    q: 'SMS veya WhatsApp hatırlatması var mı?',
    a: 'Şu an paneliçi bildirim ve e-posta odaklıdır. SMS / WhatsApp kanalı yol haritasındadır; satış metinlerinde “yakında” olanlar tamamlanmış sayılmaz.',
  },
]

export const HELP_SUPPORT = {
  email: 'merhaba@asistan.online',
  mailto: 'mailto:merhaba@asistan.online?subject=Asistan%20destek%20talebi',
  contactPath: '/contact',
  resourcesPath: '/kaynaklar',
  trustPath: '/guven',
} as const
