import Link from 'next/link'
import { Bell, MessageCircleOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Shown when staff in-app chat is frozen (default). */
export function MesajlarDeprecatedPanel() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 py-8">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <MessageCircleOff className="h-5 w-5" aria-hidden />
          </div>
          <CardTitle className="text-xl">Ekip sohbeti kapatıldı</CardTitle>
          <CardDescription className="text-[15px] leading-relaxed">
            Asistan içinde Slack/WhatsApp benzeri bir mesajlaşma ürünü tutmuyoruz. Klinikler ve hastalar
            zaten WhatsApp&apos;ta yaşıyor — biz randevu onay, iptal ve hatırlatma kanallarına odaklanıyoruz.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-2">
            <Link href="/dashboard/bildirimler">
              <Bell className="h-4 w-4" aria-hidden />
              Bildirimler
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/ajanda">Ajandaya dön</Link>
          </Button>
        </CardContent>
      </Card>
      <p className="px-1 text-sm text-muted-foreground">
        Hasta SMS / WhatsApp bildirimleri için{' '}
        <Link href="/dashboard/ayarlar?tab=entegrasyonlar" className="font-medium text-brand-teal underline-offset-2 hover:underline">
          Ayarlar → Entegrasyonlar
        </Link>
        {' '}
        ekranından kanal durumunu görün; bağlanmamışsa destek ekibine yazın.
      </p>
    </div>
  )
}
