/**
 * KKTC medical-tourism concierge copy — page-local TR/EN/RU.
 * Not a travel agency, visa service, hotel booker, or “AI concierge”.
 */

export type ConciergeLang = 'tr' | 'en' | 'ru'

export const CONCIERGE_LANGS: ConciergeLang[] = ['tr', 'en', 'ru']

export function parseConciergeLang(raw: string | null | undefined): ConciergeLang {
  const v = (raw || '').trim().toLowerCase()
  if (v === 'tr' || v === 'en' || v === 'ru') return v
  return 'en'
}

export type ConciergeCopy = {
  langLabel: string
  eyebrow: string
  title: string
  subtitle: string
  honesty: string
  stepsTitle: string
  steps: [string, string, string]
  formTitle: string
  fullName: string
  phone: string
  email: string
  procedure: string
  travelDates: string
  clinicSlug: string
  clinicSlugHint: string
  notes: string
  submit: string
  submitting: string
  success: string
  bookCta: string
  bookHint: string
  notIncludedTitle: string
  notIncluded: string[]
  errors: {
    required: string
    phone: string
    email: string
    generic: string
  }
}

export const CONCIERGE_COPY: Record<ConciergeLang, ConciergeCopy> = {
  tr: {
    langLabel: 'Türkçe',
    eyebrow: 'KKTC · Medikal ziyaret',
    title: 'Kuzey Kıbrıs’ta klinik randevusu',
    subtitle:
      'Dilinizde kısa bir form doldurun; ekibimiz uygun kliniğe yönlendirir veya doğrudan online randevu alın.',
    honesty:
      'Bu bir seyahat acentesi değildir. Vize, otel veya transfer satmayız — yalnızca klinik randevu yönlendirmesi.',
    stepsTitle: 'Nasıl çalışır',
    steps: [
      'İlgi alanınızı ve tercih dilinizi yazın',
      'Ekip veya klinik sizinle iletişime geçer',
      'Online randevu linki ile saati kilitleyin',
    ],
    formTitle: 'Talep formu',
    fullName: 'Ad Soyad',
    phone: 'Telefon (WhatsApp tercih)',
    email: 'E-posta (isteğe bağlı)',
    procedure: 'İlgilendiğiniz işlem / branş',
    travelDates: 'Tahmini seyahat tarihleri',
    clinicSlug: 'Klinik slug (varsa)',
    clinicSlugHint: 'Örn. demo-klinik — boş bırakabilirsiniz',
    notes: 'Not',
    submit: 'Talep gönder',
    submitting: 'Gönderiliyor…',
    success: 'Talebiniz alındı. Kısa sürede dönüş yapılacak.',
    bookCta: 'Doğrudan randevu al',
    bookHint: 'Klinik slug’ınız varsa hemen online randevu açın.',
    notIncludedTitle: 'Kapsam dışı',
    notIncluded: ['Vize / pasaport işlemleri', 'Otel ve uçak rezervasyonu', 'Yapay zeka concierge iddiası'],
    errors: {
      required: 'Zorunlu alanları doldurun',
      phone: 'Geçerli bir telefon girin',
      email: 'Geçerli bir e-posta girin',
      generic: 'Gönderilemedi — tekrar deneyin',
    },
  },
  en: {
    langLabel: 'English',
    eyebrow: 'Northern Cyprus · Medical visit',
    title: 'Book a clinic visit in Northern Cyprus',
    subtitle:
      'Share your preferred language and treatment interest. We route you to a clinic or you book online directly.',
    honesty:
      'This is not a travel agency. We do not sell visas, hotels, or transfers — clinic appointment routing only.',
    stepsTitle: 'How it works',
    steps: [
      'Tell us your interest and language',
      'Our team or the clinic contacts you',
      'Lock a slot via the online booking link',
    ],
    formTitle: 'Request form',
    fullName: 'Full name',
    phone: 'Phone (WhatsApp preferred)',
    email: 'Email (optional)',
    procedure: 'Treatment / specialty interest',
    travelDates: 'Approximate travel dates',
    clinicSlug: 'Clinic slug (if any)',
    clinicSlugHint: 'e.g. demo-clinic — optional',
    notes: 'Notes',
    submit: 'Send request',
    submitting: 'Sending…',
    success: 'Request received. We will follow up shortly.',
    bookCta: 'Book online now',
    bookHint: 'If you already have a clinic slug, open booking immediately.',
    notIncludedTitle: 'Out of scope',
    notIncluded: ['Visa / passport processing', 'Hotel & flight booking', '“AI concierge” claims'],
    errors: {
      required: 'Please fill required fields',
      phone: 'Enter a valid phone number',
      email: 'Enter a valid email',
      generic: 'Could not send — try again',
    },
  },
  ru: {
    langLabel: 'Русский',
    eyebrow: 'Северный Кипр · Медицинский визит',
    title: 'Запись в клинику на Северном Кипре',
    subtitle:
      'Укажите язык и интересующую процедуру. Мы направим вас в клинику или вы запишетесь онлайн сами.',
    honesty:
      'Это не турагентство. Мы не оформляем визы, отели и трансферы — только маршрутизация к записи в клинику.',
    stepsTitle: 'Как это работает',
    steps: [
      'Укажите интерес и язык',
      'Команда или клиника свяжется с вами',
      'Закрепите слот по ссылке онлайн-записи',
    ],
    formTitle: 'Форма заявки',
    fullName: 'Имя и фамилия',
    phone: 'Телефон (желательно WhatsApp)',
    email: 'Email (необязательно)',
    procedure: 'Интересующая процедура / направление',
    travelDates: 'Ориентировочные даты поездки',
    clinicSlug: 'Slug клиники (если есть)',
    clinicSlugHint: 'например demo-clinic — необязательно',
    notes: 'Комментарий',
    submit: 'Отправить заявку',
    submitting: 'Отправка…',
    success: 'Заявка получена. Мы скоро свяжемся.',
    bookCta: 'Записаться онлайн',
    bookHint: 'Если у вас уже есть slug клиники — откройте запись сразу.',
    notIncludedTitle: 'Не входит',
    notIncluded: ['Виза / паспорт', 'Отель и авиабилеты', 'Заявления об «ИИ-консьерже»'],
    errors: {
      required: 'Заполните обязательные поля',
      phone: 'Укажите корректный телефон',
      email: 'Укажите корректный email',
      generic: 'Не удалось отправить — попробуйте снова',
    },
  },
}

export function getConciergeCopy(lang: ConciergeLang): ConciergeCopy {
  return CONCIERGE_COPY[lang]
}
