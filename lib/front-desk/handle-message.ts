import 'server-only'

import { prisma } from '@/lib/prisma'
import { getAvailableSlots } from '@/lib/client-marketplace/availability'
import { createGuestPublicBooking } from '@/lib/public-booking/create-guest-booking'
import { getPublicClinicBySlug } from '@/lib/public-booking/clinic-by-slug'
import { trackFunnelEvent } from '@/lib/observability/funnel'
import {
  matchServiceByQuery,
  parseFrontDeskIntent,
} from './intents'
import { loadFrontDeskSession, saveFrontDeskSession } from './session'
import { emptyDraft, type FrontDeskDraft, type FrontDeskStep } from './types'

export type FrontDeskHandleResult = {
  replies: string[]
  step: FrontDeskStep
  bookedAppointmentId?: string
}

function formatServiceMenu(services: Array<{ name: string }>) {
  return services.map((s, i) => `${i + 1}) ${s.name}`).join('\n')
}

function formatSlotMenu(slots: Array<{ startTime: string }>) {
  return slots.map((s, i) => `${i + 1}) ${s.startTime}`).join('\n')
}

function pickDoctor(
  clinic: NonNullable<Awaited<ReturnType<typeof getPublicClinicBySlug>>>,
  serviceId: string
) {
  const assigned = clinic.doctors.filter(
    (d) => !d.serviceIds?.length || d.serviceIds.includes(serviceId)
  )
  const pool = assigned.length > 0 ? assigned : clinic.doctors
  return pool[0] ?? null
}

async function loadSlots(input: {
  businessId: string
  doctorId: string
  serviceId: string
  date: string
  locationId?: string | null
}) {
  const slots = await getAvailableSlots({
    businessId: input.businessId,
    doctorId: input.doctorId,
    serviceId: input.serviceId,
    date: input.date,
    locationId: input.locationId,
  })
  return slots.slice(0, 8)
}

function helpText(clinicName: string) {
  return (
    `${clinicName} WhatsApp randevu asistanı (otomatik ön büro).\n` +
    `Komutlar: randevu · yardım · iptal\n` +
    `Adımlar: hizmet → tarih (bugün/yarın/GG.AA.YYYY) → saat → ad soyad → onay.`
  )
}

/**
 * One inbound WhatsApp (or test) message → reply texts + session update.
 * Uses real getAvailableSlots + createGuestPublicBooking.
 */
export async function handleFrontDeskMessage(input: {
  slug: string
  peerKey: string
  text: string
  inboundId?: string | null
  now?: Date
}): Promise<FrontDeskHandleResult> {
  const clinic = await getPublicClinicBySlug(input.slug)
  if (!clinic) {
    return { replies: ['Klinik bulunamadı.'], step: 'idle' }
  }

  const business = await prisma.business.findFirst({
    where: { id: clinic.id },
    select: { whatsappAgentEnabled: true, name: true },
  })

  if (!business?.whatsappAgentEnabled) {
    return {
      replies: [
        'Bu klinik için WhatsApp randevu asistanı kapalı. Lütfen klinik telefonunu arayın veya web randevu linkini kullanın.',
      ],
      step: 'idle',
    }
  }

  const session = await loadFrontDeskSession({
    businessId: clinic.id,
    peerKey: input.peerKey,
  })

  if (input.inboundId && session.lastInboundId === input.inboundId) {
    return { replies: [], step: session.step }
  }

  void trackFunnelEvent({
    step: 'book_requested',
    businessId: clinic.id,
    channel: 'whatsapp_front_desk',
    metadata: { phase: session.step },
  })

  let step: FrontDeskStep = session.step
  let draft: FrontDeskDraft = { ...session.draft }
  const replies: string[] = []
  const intent = parseFrontDeskIntent(input.text, input.now ?? new Date())

  const reset = () => {
    step = 'idle'
    draft = emptyDraft()
  }

  if (intent.type === 'restart') {
    reset()
    replies.push('Tamam, baştan başlayalım. Randevu için “randevu” yazın veya bir hizmet seçin.')
    if (clinic.services.length) {
      draft.serviceOptions = clinic.services.slice(0, 9).map((s) => ({ id: s.id, name: s.name }))
      step = 'awaiting_service'
      replies.push(`Hizmetler:\n${formatServiceMenu(draft.serviceOptions)}`)
    }
  } else if (intent.type === 'help' || (intent.type === 'greet' && step === 'idle')) {
    replies.push(helpText(clinic.name))
    if (clinic.services.length === 0) {
      replies.push('Şu an online randevuya açık hizmet yok.')
    } else {
      draft.serviceOptions = clinic.services.slice(0, 9).map((s) => ({ id: s.id, name: s.name }))
      step = 'awaiting_service'
      replies.push(`Hizmet seçin (numara veya ad):\n${formatServiceMenu(draft.serviceOptions)}`)
    }
  } else if (intent.type === 'greet' && step !== 'idle') {
    replies.push(`Devam ediyoruz (${step}). “iptal” ile sıfırlayabilirsiniz.`)
  } else {
    // Step-specific handling
    if (step === 'idle' || step === 'done') {
      if (intent.type === 'service_query' || intent.type === 'pick_number') {
        draft.serviceOptions = clinic.services.slice(0, 9).map((s) => ({ id: s.id, name: s.name }))
        step = 'awaiting_service'
      } else {
        replies.push(helpText(clinic.name))
        draft.serviceOptions = clinic.services.slice(0, 9).map((s) => ({ id: s.id, name: s.name }))
        step = 'awaiting_service'
        if (draft.serviceOptions.length) {
          replies.push(`Hizmetler:\n${formatServiceMenu(draft.serviceOptions)}`)
        }
      }
    }

    if (step === 'awaiting_service') {
      const options = draft.serviceOptions ?? clinic.services.slice(0, 9)
      let picked =
        intent.type === 'pick_number' && intent.index >= 1 && intent.index <= options.length
          ? options[intent.index - 1]
          : null
      if (!picked && intent.type === 'service_query') {
        picked = matchServiceByQuery(options, intent.query)
      }
      if (picked) {
        const doctor = pickDoctor(clinic, picked.id)
        if (!doctor) {
          replies.push('Bu hizmet için müsait hekim yok.')
        } else {
          draft.serviceId = picked.id
          draft.serviceName = picked.name
          draft.doctorId = doctor.id
          draft.doctorName = doctor.fullName
          step = 'awaiting_date'
          replies.push(
            `“${picked.name}” seçildi (${doctor.fullName}). Tarih yazın: bugün, yarın veya GG.AA.YYYY`
          )
        }
      } else if (intent.type !== 'greet') {
        replies.push(`Hizmeti seçemedim. Numara veya ad yazın:\n${formatServiceMenu(options)}`)
      }
    } else if (step === 'awaiting_date') {
      if (intent.type === 'date') {
        draft.date = intent.date
        const slots = await loadSlots({
          businessId: clinic.id,
          doctorId: draft.doctorId!,
          serviceId: draft.serviceId!,
          date: intent.date,
          locationId: clinic.locations[0]?.id ?? null,
        })
        if (slots.length === 0) {
          replies.push(`${intent.date} için boş slot yok. Başka bir tarih deneyin.`)
        } else {
          draft.slotOptions = slots
          step = 'awaiting_slot'
          replies.push(`${intent.date} müsait saatler:\n${formatSlotMenu(slots)}\nNumara veya saat yazın (örn. 14:30).`)
        }
      } else {
        replies.push('Tarih bekliyorum: bugün, yarın veya GG.AA.YYYY')
      }
    } else if (step === 'awaiting_slot') {
      const options = draft.slotOptions ?? []
      let slot =
        intent.type === 'pick_number' && intent.index >= 1 && intent.index <= options.length
          ? options[intent.index - 1]
          : null
      if (!slot && intent.type === 'time') {
        slot = options.find((s) => s.startTime === intent.startTime) ?? null
      }
      if (slot) {
        draft.startTime = slot.startTime
        draft.endTime = slot.endTime
        if (draft.fullName?.trim()) {
          step = 'confirming'
          replies.push(
            `Özet: ${draft.serviceName} · ${draft.date} ${draft.startTime} · ${draft.fullName}\nOnaylamak için “evet” yazın.`
          )
        } else {
          step = 'awaiting_name'
          replies.push('Ad Soyad yazın (randevu kaydı için).')
        }
      } else {
        replies.push(
          options.length
            ? `Saat seçin:\n${formatSlotMenu(options)}`
            : 'Önce geçerli bir tarih seçin.'
        )
      }
    } else if (step === 'awaiting_name') {
      if (intent.type === 'name') {
        draft.fullName = intent.fullName
        step = 'confirming'
        replies.push(
          `Özet: ${draft.serviceName} · ${draft.date} ${draft.startTime} · ${draft.fullName}\nOnaylamak için “evet” yazın. İptal için “iptal”.`
        )
      } else if (intent.type === 'service_query' && input.text.trim().length >= 3) {
        draft.fullName = input.text.trim()
        step = 'confirming'
        replies.push(
          `Özet: ${draft.serviceName} · ${draft.date} ${draft.startTime} · ${draft.fullName}\nOnaylamak için “evet” yazın.`
        )
      } else {
        replies.push('Ad Soyad bekliyorum.')
      }
    } else if (step === 'confirming') {
      if (intent.type === 'confirm') {
        const booking = await createGuestPublicBooking(
          {
            businessId: clinic.id,
            doctorId: draft.doctorId,
            serviceId: draft.serviceId,
            locationId: clinic.locations[0]?.id ?? undefined,
            date: draft.date,
            startTime: draft.startTime,
            fullName: draft.fullName,
            phone: input.peerKey,
            note: '[WhatsApp ön-büro]',
          },
          input.inboundId ? `wa-${input.inboundId}` : undefined
        )

        if (!booking.ok) {
          replies.push(booking.error || 'Randevu oluşturulamadı. Başka saat deneyin veya “iptal”.')
          step = 'awaiting_slot'
        } else {
          const appointmentId = String(booking.data.appointmentId)
          void trackFunnelEvent({
            step: 'book_confirmed',
            businessId: clinic.id,
            appointmentId,
            channel: 'whatsapp_front_desk',
            ok: true,
          })
          replies.push(
            `${booking.data.message}\n${draft.serviceName} · ${draft.date} ${draft.startTime}\nYeni randevu için “randevu” yazın.`
          )
          step = 'done'
          draft = emptyDraft()
          await saveFrontDeskSession({
            businessId: clinic.id,
            peerKey: input.peerKey,
            step,
            draft,
            lastInboundId: input.inboundId ?? null,
          })
          return {
            replies,
            step,
            bookedAppointmentId: appointmentId,
          }
        }
      } else {
        replies.push('Onay için “evet”, iptal için “iptal” yazın.')
      }
    }
  }

  await saveFrontDeskSession({
    businessId: clinic.id,
    peerKey: input.peerKey,
    step,
    draft,
    lastInboundId: input.inboundId ?? null,
  })

  return { replies, step }
}
