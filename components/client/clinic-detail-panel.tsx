import Image from 'next/image'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Clock3,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Wallet,
} from 'lucide-react'

import { DoctorLiveSlotChips } from '@/components/client/doctor-live-slot-chips'
import type { ClientClinicDetail } from '@/lib/client-marketplace/clinic-detail'
import { formatCurrency } from '@/lib/format'
import { getPublicBookPath } from '@/lib/public-booking/paths'
import { getServerLanguage, type ServerLanguage, type Translate } from '@/lib/server-language'
import { cn } from '@/lib/utils'

function mapsHref(clinic: ClientClinicDetail) {
  if (clinic.locationLat != null && clinic.locationLng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${clinic.locationLat},${clinic.locationLng}`
  }
  const q = [clinic.address, clinic.city, clinic.name].filter(Boolean).join(', ')
  if (!q) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

function formatReviewDate(iso: string, language: ServerLanguage) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function AboutCopy({ clinic, t }: { clinic: ClientClinicDetail; t: Translate }) {
  if (clinic.description?.trim()) {
    return (
      <p className="text-[13.5px] leading-relaxed text-slate-600">{clinic.description.trim()}</p>
    )
  }
  if (clinic.specialtySummary.length > 0) {
    return (
      <p className="text-[13.5px] leading-relaxed text-slate-600">
        {t({
          tr: 'Bu klinikte randevuya açık branşlar: ',
          en: 'Specialties open for booking at this clinic: ',
        })}
        <span className="font-semibold text-slate-800">
          {clinic.specialtySummary.join(', ')}
        </span>
        {t({
          tr: '. Klinik henüz ayrıntılı bir tanıtım metni paylaşmadı — hizmet ve hekim kartlarından karar verebilirsiniz.',
          en: '. The clinic has not published a detailed introduction yet — you can decide from the service and doctor cards below.',
        })}
      </p>
    )
  }
  return (
    <p className="text-[13.5px] leading-relaxed text-slate-500">
      {t({
        tr: 'Klinik henüz tanıtım metni paylaşmadı. Aşağıdaki hizmetler, hekimler ve müsait saatlerle randevu kararı verebilirsiniz.',
        en: 'The clinic has not published an introduction yet. You can decide using the services, doctors and open slots below.',
      })}
    </p>
  )
}

export async function ClinicDetailPanel({ clinic }: { clinic: ClientClinicDetail }) {
  const { language, t } = await getServerLanguage()
  const bookBase = getPublicBookPath(clinic.slug)
  const mapUrl = mapsHref(clinic)
  const ratingLabel =
    clinic.ratingAverage != null ? clinic.ratingAverage.toFixed(1) : null
  const policy = clinic.bookingPolicy
  const hasFeePolicy =
    (policy.depositEnabled && policy.depositAmount != null) || policy.noShowFeeEnabled

  return (
    <article className="space-y-5">
      <header className="overflow-hidden rounded-[1.35rem] bg-white ring-1 ring-slate-200/80">
        <div className="flex gap-4 p-4">
          <div className="relative size-[96px] shrink-0 overflow-hidden rounded-[1.1rem] bg-gradient-to-br from-[#0071E3] to-[#38BDF8]">
            {clinic.logoUrl ? (
              <Image
                src={clinic.logoUrl}
                alt={`${clinic.name} logosu`}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
            ) : (
              <span className="flex size-full items-center justify-center text-3xl font-bold text-white">
                {clinic.name.slice(0, 1).toLocaleUpperCase('tr-TR')}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-[1.35rem] font-extrabold tracking-tight text-slate-900">
              {clinic.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-600">
              {ratingLabel ? (
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                  {ratingLabel}
                  <span className="font-medium text-slate-400">
                    ({t({
                      tr: `${clinic.reviewCount} yorum`,
                      en: `${clinic.reviewCount} review${clinic.reviewCount === 1 ? '' : 's'}`,
                    })})
                  </span>
                </span>
              ) : (
                <span className="font-semibold text-slate-500">
                  {t({ tr: 'Yeni klinik · henüz yorum yok', en: 'New clinic · no reviews yet' })}
                </span>
              )}
              {clinic.city ? (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <MapPin className="size-3.5" aria-hidden />
                  {clinic.city}
                </span>
              ) : null}
            </div>
            {clinic.verifiedDoctorCount > 0 ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                <ShieldCheck className="size-3.5" aria-hidden />
                {t({
                  tr: `${clinic.verifiedDoctorCount} doğrulanmış hekim profili`,
                  en: `${clinic.verifiedDoctorCount} verified doctor profile${clinic.verifiedDoctorCount === 1 ? '' : 's'}`,
                })}
              </p>
            ) : (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                <Info className="size-3.5" aria-hidden />
                {t({
                  tr: 'Hekim kimlik kaydı henüz tamamlanmamış',
                  en: 'Doctor identity records not completed yet',
                })}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 px-4 py-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {t({ tr: 'Klinik hakkında', en: 'About the clinic' })}
          </h2>
          <AboutCopy clinic={clinic} t={t} />
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 p-4">
          {clinic.address ? (
            <p className="text-[13px] text-slate-600">
              <span className="font-semibold text-slate-800">
                {t({ tr: 'Adres · ', en: 'Address · ' })}
              </span>
              {clinic.address}
              {clinic.city ? `, ${clinic.city}` : ''}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {clinic.phone ? (
              <a
                href={`tel:${clinic.phone}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-slate-100 px-3.5 text-[12.5px] font-semibold text-slate-800"
              >
                <Phone className="size-3.5" aria-hidden />
                {t({ tr: 'Ara', en: 'Call' })}
              </a>
            ) : null}
            {mapUrl ? (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-slate-100 px-3.5 text-[12.5px] font-semibold text-slate-800"
              >
                <MapPin className="size-3.5" aria-hidden />
                {t({ tr: 'Haritada aç', en: 'Open in Maps' })}
              </a>
            ) : null}
          </div>
        </div>
      </header>

      {/* Trust / decision strip */}
      <section
        className="space-y-3 rounded-[1.25rem] bg-white p-4 ring-1 ring-slate-200/80"
        aria-labelledby="clinic-trust-heading"
      >
        <h2
          id="clinic-trust-heading"
          className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400"
        >
          {t({ tr: 'Randevu öncesi bilmeniz gerekenler', en: 'What to know before booking' })}
        </h2>

        <div className="space-y-3">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#0071E3]" aria-hidden />
            <div>
              <p className="text-[13px] font-semibold text-slate-900">
                {t({ tr: 'Doğrulama ne demek?', en: 'What does “verified” mean?' })}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-600">
                {t({
                  tr: '“Doğrulanmış” hekim, klinik panelinde lisans, diploma veya KKTC kimlik numarası kaydı olan profildir. Platform tıbbi yeterlilik belgesi doğrulamaz; kayıtların varlığını gösterir.',
                  en: 'A “verified” doctor is a profile with a licence, diploma or TRNC identity number on record in the clinic panel. The platform does not validate medical qualifications; it shows that these records exist.',
                })}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-[#0071E3]" aria-hidden />
            <div>
              <p className="text-[13px] font-semibold text-slate-900">
                {t({ tr: 'İptal ve yeniden planlama', en: 'Cancelling and rescheduling' })}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-600">
                {t({ tr: 'Randevu başlangıcından en az ', en: 'You can cancel or reschedule in the app up to ' })}
                <span className="font-semibold text-slate-800">
                  {t({
                    tr: `${policy.cancelMinHours} saat`,
                    en: `${policy.cancelMinHours} hour${policy.cancelMinHours === 1 ? '' : 's'}`,
                  })}
                </span>
                {t({
                  tr: ' önce uygulama üzerinden iptal veya erteleme yapabilirsiniz. Daha kısa sürede klinik ile iletişime geçin.',
                  en: ' before the appointment starts. Any later than that, please contact the clinic directly.',
                })}
              </p>
            </div>
          </div>

          {hasFeePolicy ? (
            <div className="flex gap-3">
              <Wallet className="mt-0.5 size-4 shrink-0 text-[#0071E3]" aria-hidden />
              <div className="space-y-1">
                <p className="text-[13px] font-semibold text-slate-900">
                  {t({ tr: 'Ücret politikası', en: 'Fee policy' })}
                </p>
                {policy.depositEnabled && policy.depositAmount != null ? (
                  <p className="text-[12.5px] leading-relaxed text-slate-600">
                    {t({ tr: 'Depozito: ', en: 'Deposit: ' })}
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(policy.depositAmount, clinic.currency)}
                    </span>{' '}
                    {t({ tr: '(randevu sonrası)', en: '(after the appointment)' })}
                  </p>
                ) : null}
                {policy.noShowFeeEnabled ? (
                  <p className="text-[12.5px] leading-relaxed text-slate-600">
                    {t({ tr: 'Gelinmedi ücreti: ', en: 'No-show fee: ' })}
                    <span className="font-semibold text-slate-800">
                      {policy.noShowFeeAmount != null
                        ? formatCurrency(policy.noShowFeeAmount, clinic.currency)
                        : t({ tr: 'Klinik politikası', en: 'Per clinic policy' })}
                    </span>
                    {policy.noShowFeeNote ? ` — ${policy.noShowFeeNote}` : ''}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex gap-3">
            <Clock3 className="mt-0.5 size-4 shrink-0 text-[#0071E3]" aria-hidden />
            <div>
              <p className="text-[13px] font-semibold text-slate-900">
                {t({ tr: 'Çalışma saatleri', en: 'Opening hours' })}
              </p>
              {clinic.openingHours.length > 0 ? (
                <ul className="mt-1.5 space-y-1 text-[12.5px] text-slate-600">
                  {clinic.openingHours.map((line) => (
                    <li key={line.weekday} className="flex justify-between gap-3">
                      <span className="font-medium text-slate-700">{line.label}</span>
                      <span className="tabular-nums text-right">
                        {line.windows.map((w) => `${w.startTime}–${w.endTime}`).join(', ')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-600">
                  {t({
                    tr: 'Klinik genel açılış saati yayınlamadı. Saatler hekim müsaitliğine göre — açık slotlardan seçin.',
                    en: 'The clinic has not published general opening hours. Times follow each doctor’s availability — pick from the open slots.',
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
            <div>
              <p className="text-[13px] font-semibold text-slate-900">
                {t({ tr: 'Erişim ve hizmet şekli', en: 'Accessibility and format' })}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-600">
                {t({
                  tr: 'Engelli erişimi, otopark veya online/yüz yüze ayrımı klinik tarafından henüz yayınlanmadı. Randevu yüz yüze klinik ziyareti olarak planlanır; özel ihtiyaçlarınız için klinikle görüşün.',
                  en: 'The clinic has not published accessibility, parking, or online/in-person details yet. Appointments are scheduled as in-person clinic visits; contact the clinic about any specific needs.',
                })}
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-[1rem] bg-amber-50/80 px-3 py-2.5 ring-1 ring-amber-200/70">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden />
            <div>
              <p className="text-[13px] font-semibold text-amber-950">
                {t({ tr: 'Acil durum değil', en: 'Not for emergencies' })}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-amber-900/90">
                {t({
                  tr: 'Bu kanal planlı randevu içindir. Yaşamı tehdit eden durumda ',
                  en: 'This channel is for scheduled appointments. In a life-threatening emergency call ',
                })}
                <span className="font-semibold">112</span>
                {t({
                  tr: ' veya yerel acil servisi arayın.',
                  en: ' or your local emergency number.',
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {clinic.locations.length > 0 ? (
        <section className="space-y-3">
          <h2 className="px-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {t({ tr: 'Lokasyonlar', en: 'Locations' })}
          </h2>
          <ul className="space-y-2">
            {clinic.locations.map((loc) => (
              <li
                key={loc.id}
                className="rounded-[1.1rem] bg-white p-3.5 text-[13px] text-slate-600 ring-1 ring-slate-200/80"
              >
                <p className="font-bold text-slate-900">{loc.name}</p>
                {(loc.address || loc.city) && (
                  <p className="mt-1">
                    {[loc.address, loc.city].filter(Boolean).join(', ')}
                  </p>
                )}
                {loc.phone ? (
                  <a
                    href={`tel:${loc.phone}`}
                    className="mt-2 inline-flex text-[12.5px] font-semibold text-[#0071E3]"
                  >
                    {loc.phone}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="px-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {t({ tr: 'Hizmetler', en: 'Services' })}
        </h2>
        {clinic.services.length === 0 ? (
          <p className="rounded-[1.1rem] bg-white px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200/80">
            {t({
              tr: 'Bu klinik için henüz yayınlanmış hizmet yok.',
              en: 'No services have been published for this clinic yet.',
            })}
          </p>
        ) : (
          <ul className="space-y-2">
            {clinic.services.map((service) => {
              const bookHref = `${bookBase}?serviceId=${encodeURIComponent(service.id)}`
              return (
                <li
                  key={service.id}
                  className="rounded-[1.1rem] bg-white p-3.5 ring-1 ring-slate-200/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">{service.name}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-3.5" aria-hidden />
                          {service.durationMin} dk
                        </span>
                        <span>
                          {service.price != null
                            ? formatCurrency(service.price, service.currency)
                            : 'Fiyat sorulur'}
                        </span>
                      </p>
                      {service.description ? (
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">
                          {service.description}
                        </p>
                      ) : null}
                    </div>
                    <Link
                      href={bookHref}
                      className="rz-press inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-[#0071E3] px-3.5 text-[12px] font-bold text-white"
                    >
                      {t({ tr: 'Seç', en: 'Select' })}
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="px-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {t({ tr: 'Hekimler', en: 'Doctors' })}
        </h2>
        {clinic.doctors.length === 0 ? (
          <p className="rounded-[1.1rem] bg-white px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200/80">
            {t({
              tr: 'Randevuya açık hekim bulunamadı.',
              en: 'No doctors are currently open for booking.',
            })}
          </p>
        ) : (
          <ul className="space-y-2">
            {clinic.doctors.map((doctor) => {
              const firstServiceId = doctor.services[0]?.id
              const bookHref = firstServiceId
                ? `${bookBase}?doctorId=${encodeURIComponent(doctor.id)}&serviceId=${encodeURIComponent(firstServiceId)}`
                : `${bookBase}?doctorId=${encodeURIComponent(doctor.id)}`
              const docRating =
                doctor.reviews.averageRating != null
                  ? doctor.reviews.averageRating.toFixed(1)
                  : null
              const firstSlot = doctor.nextSlots[0]
              const firstSlotLabel = firstSlot ? firstSlot.startTime : null
              return (
                <li
                  key={doctor.id}
                  className="rounded-[1.1rem] bg-white p-3.5 ring-1 ring-slate-200/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#0071E3] to-[#38BDF8]">
                        {doctor.avatarUrl ? (
                          <Image
                            src={doctor.avatarUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-sm font-bold text-white">
                            {doctor.fullName.slice(0, 1).toLocaleUpperCase('tr-TR')}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1 font-bold text-slate-900">
                          <Link
                            href={`/client/doctors/${doctor.id}`}
                            className="truncate rounded outline-none hover:text-[#0071E3] focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
                          >
                            {doctor.fullName}
                          </Link>
                          {doctor.verified ? (
                            <BadgeCheck
                              className="size-4 shrink-0 text-[#0071E3]"
                              aria-label={t({
                                tr: 'Doğrulanmış hekim profili',
                                en: 'Verified doctor profile',
                              })}
                            />
                          ) : null}
                        </p>
                        {doctor.specialty ? (
                          <p className="mt-0.5 text-[12.5px] text-slate-500">{doctor.specialty}</p>
                        ) : null}
                        <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                          {doctor.verified ? (
                            <span className="rounded-full bg-[#0071E3]/10 px-2 py-0.5 text-[#0071E3]">
                              {t({ tr: 'Doğrulanmış', en: 'Verified' })}
                            </span>
                          ) : null}
                          {docRating ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">
                              ★ {docRating}
                              {doctor.reviews.reviewCount > 0
                                ? ` (${doctor.reviews.reviewCount})`
                                : ''}
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                              Yorum yok
                            </span>
                          )}
                          {firstSlotLabel ? (
                            <span className="rounded-full bg-[#0071E3]/10 px-2 py-0.5 text-[#0071E3]">
                              En erken {firstSlotLabel}
                            </span>
                          ) : null}
                        </div>
                        {doctor.bio ? (
                          <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">
                            {doctor.bio}
                          </p>
                        ) : null}
                        {firstServiceId ? (
                          <DoctorLiveSlotChips
                            businessId={clinic.id}
                            doctorId={doctor.id}
                            serviceId={firstServiceId}
                            bookBase={bookBase}
                            initialSlots={doctor.nextSlots}
                          />
                        ) : null}
                      </div>
                    </div>
                    <Link
                      href={bookHref}
                      className={cn(
                        'rz-press inline-flex h-10 shrink-0 items-center rounded-full px-3.5 text-[12px] font-bold',
                        'bg-slate-900 text-white',
                      )}
                    >
                      Randevu
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2 px-0.5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {t({ tr: 'Yorumlar', en: 'Reviews' })}
          </h2>
          <p className="text-[12px] font-semibold text-slate-500">
            {clinic.reviewCount > 0
              ? t({
                  tr: `${clinic.reviewCount} randevu sonrası yorum`,
                  en: `${clinic.reviewCount} post-appointment review${clinic.reviewCount === 1 ? '' : 's'}`,
                })
              : t({ tr: 'Henüz yorum yok', en: 'No reviews yet' })}
          </p>
        </div>
        {clinic.recentReviews.length === 0 ? (
          <p className="rounded-[1.1rem] bg-white px-4 py-6 text-center text-sm leading-relaxed text-slate-500 ring-1 ring-slate-200/80">
            {clinic.reviewCount > 0
              ? t({
                  tr: 'Yorumlar var ancak metin paylaşılmamış. Puan özeti yukarıda.',
                  en: 'There are reviews, but no written comments were shared. The rating summary is above.',
                })
              : t({
                  tr: 'Tamamlanan randevulardan sonra hastalar puan ve yorum bırakabilir. Bu klinik için henüz değerlendirme yok.',
                  en: 'Patients can leave a rating and review after a completed appointment. There are no reviews for this clinic yet.',
                })}
          </p>
        ) : (
          <ul className="space-y-2">
            {clinic.recentReviews.map((review) => {
              const when = formatReviewDate(review.createdAt, language)
              return (
                <li
                  key={review.id}
                  className="rounded-[1.1rem] bg-white p-3.5 ring-1 ring-slate-200/80"
                >
                  <p className="text-[12px] font-semibold text-slate-700">
                    {review.clientName} · ★ {review.rating}
                    {when ? (
                      <span className="font-medium text-slate-400"> · {when}</span>
                    ) : null}
                  </p>
                  {review.comment ? (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                      {review.comment}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="sticky bottom-[var(--rz-dock-clearance)] z-10 pb-2 pt-1">
        <Link
          href={bookBase}
          className="rz-press flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(0,113,227,0.35)]"
        >
          Randevu al
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
