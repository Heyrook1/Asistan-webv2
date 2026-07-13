import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTransporter, MAIL_FROM, DEMO_NOTIFY_TO } from '@/lib/email'

const demoBookingSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  clinic: z.string().min(2, 'Klinik adı en az 2 karakter olmalı'),
  email: z.string().email('Geçersiz e-posta adresi'),
  date: z.string().min(1, 'Tarih seçilmeli'),
  time: z.string().min(1, 'Saat seçilmeli'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = demoBookingSchema.safeParse(body)

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors).flat()[0] ?? 'Geçersiz form verisi'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { name, clinic, email, date, time } = result.data

    // ── 1. Veritabanına kaydet ──────────────────────────────────────────────
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DemoBooking" (
        "id"        TEXT PRIMARY KEY,
        "name"      TEXT NOT NULL,
        "clinic"    TEXT NOT NULL,
        "email"     TEXT NOT NULL,
        "date"      TEXT NOT NULL,
        "time"      TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await prisma.$executeRawUnsafe(
      `INSERT INTO "DemoBooking" ("id", "name", "clinic", "email", "date", "time", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      crypto.randomUUID(),
      name,
      clinic,
      email,
      date,
      time,
    )

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
                          ['👤 Ad Soyad', name],
                          ['🏥 Klinik / Kurum', clinic],
                          ['📧 E-posta', email],
                          ['📅 Tercih Edilen Tarih', date],
                          ['🕐 Tercih Edilen Saat', time],
                          ['🕓 Talep Zamanı', submittedAt],
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
                        <a href="mailto:${email}?subject=Asistan Demo Randevu Onayı&body=Merhaba ${name},%0A%0ADemo talebinizi aldık. ${date} tarihinde ${time} saatinde görüşmek üzere sizi bekliyoruz."
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
                        Merhaba ${name},
                      </p>
                      <p style="margin:0 0 24px;color:#5D6068;font-size:14px;line-height:1.7">
                        Demo talebinizi başarıyla aldık. Ekibimiz en kısa sürede sizinle iletişime geçerek
                        randevunuzu onaylayacaktır.
                      </p>

                      <!-- Booking summary -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="border:1px solid #E0E2E7;border-radius:12px;overflow:hidden;margin-bottom:24px">
                        ${[
                          ['🏥 Klinik / Kurum', clinic],
                          ['📅 Tercih Edilen Tarih', date],
                          ['🕐 Tercih Edilen Saat', time],
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
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
