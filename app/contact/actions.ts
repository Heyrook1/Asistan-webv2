'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getTransporter, MAIL_FROM, DEMO_NOTIFY_TO } from '@/lib/email'
import { escapeHtml } from '@/lib/html-escape'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import {
  CONTACT_PRIVACY_NOTICE_VERSION,
  CONTACT_SERVICE_TYPE_LABELS,
  contactLeadSchema,
} from '@/lib/marketing/contact-lead'

export type SubmitContactResult =
  | { success: true; id: string }
  | { success: false; error?: string; code?: string; errors?: Record<string, string[]> }

export async function submitContactForm(formData: unknown): Promise<SubmitContactResult> {
  const headerStore = await headers()
  const ip =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip')?.trim() ||
    'anon'

  const allowed = await checkRateLimit(
    `contact-lead:${ip}`,
    Math.min(RATE_LIMITS.public.limit, 6),
    RATE_LIMITS.public.window,
  )
  if (!allowed) {
    return {
      success: false,
      code: 'RATE_LIMITED',
      error: 'Çok fazla istek. Lütfen bir dakika sonra tekrar deneyin.',
    }
  }

  const result = contactLeadSchema.safeParse(formData)
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors }
  }

  const data = result.data
  if (data.website?.trim()) {
    // Bot honeypot — pretend success without persisting.
    return { success: true, id: 'ignored' }
  }

  try {
    const lead = await prisma.contactLead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company?.trim() ? data.company.trim() : null,
        serviceType: data.service_type ?? null,
        message: data.message,
        privacyAcceptedAt: new Date(),
        privacyNoticeVersion: CONTACT_PRIVACY_NOTICE_VERSION,
        source: 'contact',
        status: 'NEW',
      },
      select: { id: true },
    })

    const serviceLabel = data.service_type
      ? CONTACT_SERVICE_TYPE_LABELS[data.service_type].tr
      : '—'

    try {
      const transporter = getTransporter()
      if (transporter && DEMO_NOTIFY_TO) {
        const safe = {
          name: escapeHtml(data.name),
          email: escapeHtml(data.email),
          phone: escapeHtml(data.phone),
          company: escapeHtml(data.company?.trim() || '—'),
          service: escapeHtml(serviceLabel),
          message: escapeHtml(data.message).replace(/\n/g, '<br/>'),
        }
        await transporter.sendMail({
          from: MAIL_FROM,
          to: DEMO_NOTIFY_TO,
          replyTo: data.email,
          subject: `[Contact / Demo] ${data.name}${data.company?.trim() ? ` — ${data.company.trim()}` : ''}`,
          html: `<p>Yeni iletişim / demo talebi (/contact — takvim slotu değil).</p>
            <ul>
              <li><strong>Ad:</strong> ${safe.name}</li>
              <li><strong>E-posta:</strong> ${safe.email}</li>
              <li><strong>Telefon:</strong> ${safe.phone}</li>
              <li><strong>Kurum:</strong> ${safe.company}</li>
              <li><strong>Hizmet:</strong> ${safe.service}</li>
            </ul>
            <p><strong>Mesaj</strong></p>
            <p>${safe.message}</p>`,
        })
      }
    } catch (mailError) {
      // Lead already stored — do not fail the user response.
      console.error('[contact] notify failed', mailError)
    }

    return { success: true, id: lead.id }
  } catch (error) {
    console.error('[contact] submission error', error)
    return {
      success: false,
      error: 'Mesaj gönderilemedi. Lütfen merhaba@asistan.online adresine yazın veya sonra tekrar deneyin.',
    }
  }
}
