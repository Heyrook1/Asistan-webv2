/**
 * lib/email.ts
 * Nodemailer SMTP transport — tüm uygulama genelinde paylaşılan tek örnek.
 *
 * Gerekli .env değişkenleri:
 *   SMTP_HOST   – SMTP sunucu adresi (ör. mail.asistan.online)
 *   SMTP_PORT   – Port (genellikle 587 TLS veya 465 SSL)
 *   SMTP_USER   – SMTP kullanıcı adı / e-posta (ör. noreply@asistan.online)
 *   SMTP_PASS   – SMTP şifresi
 *   SMTP_FROM   – Göndericinin "From" adresi (varsayılan: SMTP_USER)
 */

import nodemailer from 'nodemailer'

function createTransport() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    // Geliştirme ortamında SMTP ayarlanmadıysa Nodemailer Ethereal preview kullan
    // (production'da eksik değişken hata verir — kasıtlı olarak throw ediyoruz)
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'E-posta gönderilemedi: SMTP_HOST, SMTP_USER ve SMTP_PASS ortam değişkenleri eksik.',
      )
    }

    // Dev: sessizce loglama modu
    return nodemailer.createTransport({ jsonTransport: true })
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export const transporter = createTransport()

export const MAIL_FROM =
  process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@asistan.online'

export const DEMO_NOTIFY_TO =
  process.env.DEMO_NOTIFY_TO ?? 'info@asistan.online'
