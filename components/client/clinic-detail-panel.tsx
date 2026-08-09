import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, Phone, Star, ShieldCheck, Clock3 } from 'lucide-react'

import { DoctorLiveSlotChips } from '@/components/client/doctor-live-slot-chips'
import type { ClientClinicDetail } from '@/lib/client-marketplace/clinic-detail'
import { formatCurrency } from '@/lib/format'
import { getPublicBookPath } from '@/lib/public-booking/paths'
import { cn } from '@/lib/utils'

function mapsHref(clinic: ClientClinicDetail) {
  if (clinic.locationLat != null && clinic.locationLng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${clinic.locationLat},${clinic.locationLng}`
  }
  const q = [clinic.address, clinic.city, clinic.name].filter(Boolean).join(', ')
  if (!q) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

export function ClinicDetailPanel({ clinic }: { clinic: ClientClinicDetail }) {
  const bookBase = getPublicBookPath(clinic.slug)
  const mapUrl = mapsHref(clinic)
  const ratingLabel =
    clinic.ratingAverage != null ? clinic.ratingAverage.toFixed(1) : null

  return (
    <article className="space-y-5">
      <header className="overflow-hidden rounded-[1.35rem] bg-white ring-1 ring-slate-200/80">
        <div className="flex gap-4 p-4">
          <div className="relative size-[88px] shrink-0 overflow-hidden rounded-[1.1rem] bg-gradient-to-br from-[#0071E3] to-[#38BDF8]">
            {clinic.logoUrl ? (
              <Image
                src={clinic.logoUrl}
                alt=""
                fill
                className="object-cover"
                sizes="88px"
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
                  {clinic.reviewCount > 0 ? (
                    <span className="font-medium text-slate-400">({clinic.reviewCount})</span>
                  ) : null}
                </span>
              ) : (
                <span className="font-semibold text-slate-500">Yeni klinik</span>
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
                {clinic.verifiedDoctorCount} hekim kimlik kaydı
              </p>
            ) : null}
          </div>
        </div>

        {clinic.description ? (
          <p className="border-t border-slate-100 px-4 py-3 text-[13.5px] leading-relaxed text-slate-600">
            {clinic.description}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 border-t border-slate-100 p-4">
          {clinic.address ? (
            <p className="text-[13px] text-slate-600">
              <span className="font-semibold text-slate-800">Adres · </span>
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
                Ara
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
                Haritada aç
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="px-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Hizmetler
        </h2>
        {clinic.services.length === 0 ? (
          <p className="rounded-[1.1rem] bg-white px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200/80">
            Bu klinik için henüz yayınlanmış hizmet yok.
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
                      Seç
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
          Hekimler
        </h2>
        {clinic.doctors.length === 0 ? (
          <p className="rounded-[1.1rem] bg-white px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200/80">
            Randevuya açık hekim bulunamadı.
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
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{doctor.fullName}</p>
                      {doctor.specialty ? (
                        <p className="mt-0.5 text-[12.5px] text-slate-500">{doctor.specialty}</p>
                      ) : null}
                      <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                        {docRating ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">
                            ★ {docRating}
                          </span>
                        ) : null}
                        {firstSlotLabel ? (
                          <span className="rounded-full bg-[#0071E3]/10 px-2 py-0.5 text-[#0071E3]">
                            {firstSlotLabel}
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

      {clinic.recentReviews.length > 0 ? (
        <section className="space-y-3">
          <h2 className="px-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Yorumlar
          </h2>
          <ul className="space-y-2">
            {clinic.recentReviews.map((review) => (
              <li
                key={review.id}
                className="rounded-[1.1rem] bg-white p-3.5 ring-1 ring-slate-200/80"
              >
                <p className="text-[12px] font-semibold text-slate-700">
                  {review.clientName} · ★ {review.rating}
                </p>
                {review.comment ? (
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{review.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-10 pb-2 pt-1">
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
