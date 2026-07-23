import { type NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { tourismLeadSchema } from '@/lib/concierge'
import { getTransporter, MAIL_FROM, DEMO_NOTIFY_TO } from '@/lib/email'
import { escapeHtml } from '@/lib/html-escape'
import { trackFunnelEvent } from '@/lib/observability/funnel'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anon'

  const allowed = await checkRateLimit(
    `tourism-lead:${ip}`,
    Math.min(RATE_LIMITS.public.limit, 6),
    RATE_LIMITS.public.window
  )
  if (!allowed) return apiError('Too many requests', 429)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON', 400)
  }

  const parsed = tourismLeadSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid form', 400)
  }

  const data = parsed.data

  try {
    const lead = await prisma.tourismLead.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email ?? null,
        preferredLang: data.preferredLang,
        procedureInterest: data.procedureInterest,
        travelDates: data.travelDates ?? null,
        clinicSlug: data.clinicSlug ?? null,
        notes: data.notes ?? null,
        source: 'visit-cyprus',
        status: 'NEW',
      },
      select: { id: true },
    })

    void trackFunnelEvent({
      step: 'book_requested',
      channel: 'tourism_concierge',
      metadata: { lang: data.preferredLang, hasClinic: Boolean(data.clinicSlug) },
    })

    // Best-effort ops email — booking lead still succeeds if mail fails.
    try {
      const transporter = getTransporter()
      if (transporter && DEMO_NOTIFY_TO) {
        const safe = {
          fullName: escapeHtml(data.fullName),
          phone: escapeHtml(data.phone),
          email: escapeHtml(data.email ?? '—'),
          lang: escapeHtml(data.preferredLang),
          procedure: escapeHtml(data.procedureInterest),
          travel: escapeHtml(data.travelDates ?? '—'),
          slug: escapeHtml(data.clinicSlug ?? '—'),
          notes: escapeHtml(data.notes ?? '—'),
        }
        await transporter.sendMail({
          from: MAIL_FROM,
          to: DEMO_NOTIFY_TO,
          subject: `[Tourism lead] ${data.preferredLang.toUpperCase()} — ${data.fullName}`,
          html: `<p>New KKTC medical-tourism lead (not travel agency).</p>
            <ul>
              <li>Name: ${safe.fullName}</li>
              <li>Phone: ${safe.phone}</li>
              <li>Email: ${safe.email}</li>
              <li>Lang: ${safe.lang}</li>
              <li>Procedure: ${safe.procedure}</li>
              <li>Travel: ${safe.travel}</li>
              <li>Clinic slug: ${safe.slug}</li>
              <li>Notes: ${safe.notes}</li>
              <li>Id: ${escapeHtml(lead.id)}</li>
            </ul>`,
        })
      }
    } catch {
      /* soft-fail */
    }

    return apiSuccess({ id: lead.id }, 201)
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : 'Could not save lead',
      500
    )
  }
}
