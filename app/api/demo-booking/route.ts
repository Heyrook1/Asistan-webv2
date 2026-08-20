import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTransporter, MAIL_FROM, DEMO_NOTIFY_TO } from '@/lib/email'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { escapeHtml } from '@/lib/html-escape'

const demoBookingSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(120),
  clinic: z.string().min(2, 'Klinik adı en az 2 karakter olmalı').max(160),
  email: z.string().email('Geçersiz e-posta adresi').max(160),
  date: z.string().min(1, 'Tarih seçilmeli').max(40),
  time: z.string().min(1, 'Saat seçilmeli').max(40),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
    const allowed = await checkRateLimit(
      `demo-booking:${ip}`,
      RATE_LIMITS.public.limit,
      RATE_LIMITS.public.window
    )
    if (!allowed) {
      return apiError('Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.', 429)
    }

    const body = await request.json()
    const result = demoBookingSchema.safeParse(body)

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors).flat()[0] ?? 'Geçersiz form verisi'
      return apiError(firstError, 400)
    }

    const { name, clinic, email, date, time } = result.data

    // ── 1. Veritabanına kaydet ──────────────────────────────────────────────
    await prisma.demoBooking.create({
      data: { name, clinic, email, date, time },
    })

    // User-supplied values are escaped before HTML interpolation (email body XSS).
    const safe = {
      name: escapeHtml(name),
      clinic: escapeHtml(clinic),
      email: escapeHtml(email),
      date: escapeHtml(date),
      time: escapeHtml(time),
    }
    const mailtoReply = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
      'Asistan Demo Randevu Onayı'
    )}&body=${encodeURIComponent(
      `Merhaba ${name},\n\nDemo talebinizi aldık. ${date} tarihinde ${time} saatinde görüşmek üzere sizi bekliyoruz.`
    )}`

    // ── 2. Bildirim e-postası gönder ────────────────────────────────────────
    const submittedAt = new Date().toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      dateStyle: 'long',
      timeStyle: 'short',
    })

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="tr">
        <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
        <body style="margin:0;padding:0;background:#F7FAFD;font-family:'Segoe UI',Arial,sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7FAFD;padding:40px 0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

                  <!-- Header -->
                  <tr>
                    <td style="background:#0071E3;padding:28px 36px">
                      <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px">
                        🗓 Yeni Demo Talebi
                      </p>
                      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px">
                        Asistan Health — Demo Rezervasyon Bildirimi
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 36px">
                      <p style="margin:0 0 24px;color:#1D1D1F;font-size:15px;line-height:1.6">
                        Yeni bir demo talebi oluşturuldu. Aşağıdaki bilgileri inceleyerek randevuyu onaylayabilirsiniz.
                      </p>

                      <!-- Info table -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="border:1px solid #E0E2E7;border-radius:12px;overflow:hidden">
                        ${[
                          ['👤 Ad Soyad', safe.name],
                          ['🏥 Klinik / Kurum', safe.clinic],
                          ['📧 E-posta', safe.email],
                          ['📅 Tercih Edilen Tarih', safe.date],
                          ['🕐 Tercih Edilen Saat', safe.time],
                          ['🕓 Talep Zamanı', escapeHtml(submittedAt)],
                        ]
                          .map(
                            ([label, value], idx) => `
                          <tr style="background:${idx % 2 === 0 ? '#F7F9FB' : '#ffffff'}">
                            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#5D6068;width:200px;border-bottom:1px solid #E0E2E7">
                              ${label}
                            </td>
                            <td style="padding:12px 16px;font-size:13px;color:#1D1D1F;border-bottom:1px solid #E0E2E7">
                              ${value}
                            </td>
                          </tr>`,
                          )
                          .join('')}
                      </table>

                      <!-- CTA -->
                      <div style="margin:28px 0 0;text-align:center">
                        <a href="${escapeHtml(mailtoReply)}"
                          style="display:inline-block;background:#0071E3;color:#ffffff;text-decoration:none;
                                 padding:13px 28px;border-radius:10px;font-size:14px;font-weight:700;
                                 letter-spacing:-0.2px">
                          Müşteriyi E-postayla Yanıtla
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#F7F9FB;border-top:1px solid #E0E2E7;padding:16px 36px;
                               font-size:11px;color:#86868B;text-align:center">
                      Bu e-posta Asistan Health platformu tarafından otomatik gönderilmiştir.<br/>
                      © 2026 Asistan Health — kktc.asistan.online
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    // ── 2a. Admin bildirim e-postası ────────────────────────────────────────
    try {
      await getTransporter().sendMail({
        from: `"Asistan Health" <${MAIL_FROM}>`,
        to: DEMO_NOTIFY_TO,
        replyTo: email,
        subject: `🗓 Yeni Demo Talebi — ${name} (${clinic})`,
        html: htmlBody,
        text: [
          'YENİ DEMO TALEBİ',
          '─────────────────',
          `Ad Soyad   : ${name}`,
          `Klinik     : ${clinic}`,
          `E-posta    : ${email}`,
          `Tarih      : ${date}`,
          `Saat       : ${time}`,
          `Talep      : ${submittedAt}`,
        ].join('\n'),
      })
    } catch (mailError) {
      console.error('[demo-booking] Admin bildirimi gönderilemedi:', mailError)
    }

    // ── 2b. Müşteriye otomatik onay e-postası ───────────────────────────────
    const autoReplyHtml = `
      <!DOCTYPE html>
      <html lang="tr">
        <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
        <body style="margin:0;padding:0;background:#F7FAFD;font-family:'Segoe UI',Arial,sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7FAFD;padding:40px 0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

                  <!-- Header -->
                  <tr>
                    <td style="background:#0071E3;padding:28px 36px">
                      <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px">
                        ✅ Demo Talebiniz Alındı
                      </p>
                      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px">
                        Asistan Health — Demo Rezervasyon Onayı
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 36px">
                      <p style="margin:0 0 8px;color:#1D1D1F;font-size:16px;font-weight:700">
                        Merhaba ${safe.name},
                      </p>
                      <p style="margin:0 0 24px;color:#5D6068;font-size:14px;line-height:1.7">
                        Demo talebinizi başarıyla aldık. Ekibimiz en kısa sürede sizinle iletişime geçerek
                        randevunuzu onaylayacaktır.
                      </p>

                      <!-- Booking summary -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="border:1px solid #E0E2E7;border-radius:12px;overflow:hidden;margin-bottom:24px">
                        ${[
                          ['🏥 Klinik / Kurum', safe.clinic],
                          ['📅 Tercih Edilen Tarih', safe.date],
                          ['🕐 Tercih Edilen Saat', safe.time],
                        ]
                          .map(
                            ([label, value], idx) => `
                          <tr style="background:${idx % 2 === 0 ? '#F7F9FB' : '#ffffff'}">
                            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#5D6068;width:220px;border-bottom:1px solid #E0E2E7">
                              ${label}
                            </td>
                            <td style="padding:12px 16px;font-size:13px;color:#1D1D1F;border-bottom:1px solid #E0E2E7">
                              ${value}
                            </td>
                          </tr>`,
                          )
                          .join('')}
                      </table>

                      <p style="margin:0;color:#5D6068;font-size:13px;line-height:1.7">
                        Sorularınız için bize
                        <a href="mailto:info@asistan.online" style="color:#0071E3;text-decoration:none;font-weight:600">info@asistan.online</a>
                        adresinden ulaşabilirsiniz.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#F7F9FB;border-top:1px solid #E0E2E7;padding:16px 36px;
                               font-size:11px;color:#86868B;text-align:center">
                      Bu e-posta Asistan Health platformu tarafından otomatik gönderilmiştir.<br/>
                      © 2026 Asistan Health — kktc.asistan.online
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    try {
      await getTransporter().sendMail({
        from: `"Asistan Health" <${MAIL_FROM}>`,
        to: email,
        subject: `✅ Demo Talebiniz Alındı — ${date} ${time}`,
        html: autoReplyHtml,
        text: [
          `Merhaba ${name},`,
          '',
          'Demo talebinizi başarıyla aldık. Ekibimiz en kısa sürede sizinle iletişime geçerek randevunuzu onaylayacaktır.',
          '',
          `Klinik : ${clinic}`,
          `Tarih  : ${date}`,
          `Saat   : ${time}`,
          '',
          'Sorularınız için: info@asistan.online',
          '',
          '© 2026 Asistan Health — kktc.asistan.online',
        ].join('\n'),
      })
    } catch (mailError) {
      console.error('[demo-booking] Müşteri auto-reply gönderilemedi:', mailError)
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası'
    console.error('[demo-booking] error:', error)
    return apiError(message, 500)
  }
}
