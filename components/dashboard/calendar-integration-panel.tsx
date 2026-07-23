'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarDays, Link2Off, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export type CalendarStaffRow = {
  id: string
  fullName: string
  role: string
  isBookable: boolean
}

export type CalendarConnectionRow = {
  id: string
  staffId: string
  provider: 'GOOGLE' | 'OUTLOOK'
  accountEmail: string | null
  syncEnabled: boolean
  lastSyncAt: string | null
  lastError: string | null
}

export function CalendarIntegrationPanel({
  enabled,
  configured,
  canManageTeam,
  selfStaffId,
  staff,
  connections,
}: {
  enabled: boolean
  configured: boolean
  canManageTeam: boolean
  selfStaffId: string | null
  staff: CalendarStaffRow[]
  connections: CalendarConnectionRow[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)

  const connectionByStaff = useMemo(() => {
    const map = new Map<string, CalendarConnectionRow>()
    for (const row of connections) {
      if (row.provider === 'GOOGLE') map.set(row.staffId, row)
    }
    return map
  }, [connections])

  const visibleStaff = useMemo(() => {
    if (canManageTeam) return staff.filter((s) => s.isBookable)
    if (selfStaffId) return staff.filter((s) => s.id === selfStaffId && s.isBookable)
    return []
  }, [canManageTeam, selfStaffId, staff])

  useEffect(() => {
    const status = searchParams.get('calendar')
    if (!status) return
    const messages: Record<string, string> = {
      connected: 'Google Calendar bağlandı; meşgul dilimler içe aktarıldı.',
      denied: 'Google yetkilendirmesi iptal edildi.',
      invalid: 'Geçersiz OAuth dönüşü.',
      missing_refresh: 'Google yenileme jetonu alınamadı. Tekrar bağlayın (consent).',
      staff_missing: 'Personel bulunamadı.',
      disabled: 'Takvim senkronu şu an kapalı.',
      error: 'Google Calendar bağlantısı başarısız.',
    }
    const message = messages[status]
    if (message) {
      if (status === 'connected') toast.success(message)
      else toast.error(message)
    }
    const params = new URLSearchParams(searchParams.toString())
    params.delete('calendar')
    router.replace(`/dashboard/ayarlar?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  function connect(staffId: string) {
    window.location.href = `/api/integrations/google-calendar/start?staffId=${encodeURIComponent(staffId)}`
  }

  function manage(connectionId: string, action: 'sync' | 'disconnect') {
    setBusyId(connectionId)
    startTransition(async () => {
      try {
        const res = await fetch('/api/integrations/google-calendar/manage', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ connectionId, action }),
        })
        const json = (await res.json()) as { ok?: boolean; error?: string; importedBlocks?: number }
        if (!res.ok || !json.ok) {
          toast.error(json.error || 'İşlem başarısız')
          return
        }
        if (action === 'disconnect') toast.success('Google Calendar bağlantısı kaldırıldı')
        else toast.success(`Senkron tamamlandı (${json.importedBlocks ?? 0} meşgul dilim)`)
        router.refresh()
      } catch {
        toast.error('Ağ hatası')
      } finally {
        setBusyId(null)
      }
    })
  }

  if (!configured) {
    return (
      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-semibold text-brand-ink">Takvim entegrasyonları</p>
          <p className="text-sm text-muted-foreground">
            Google Calendar meşgul-dilim senkronu için sunucu ortamına{' '}
            <code className="text-xs">GOOGLE_CALENDAR_CLIENT_ID</code>,{' '}
            <code className="text-xs">GOOGLE_CALENDAR_CLIENT_SECRET</code> ve{' '}
            <code className="text-xs">CALENDAR_TOKEN_ENCRYPTION_KEY</code> ekleyin. Outlook yazma
            desteklenmiyor; önce yalnızca Google FreeBusy (busy blocks).
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!enabled) {
    return (
      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-semibold text-brand-ink">Takvim entegrasyonları</p>
          <p className="text-sm text-muted-foreground">
            Özellik bayrağı kapalı (<code className="text-xs">ASISTAN_FLAG_CALENDAR_SYNC=0</code>).
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-5 text-brand-teal" />
            <div>
              <p className="text-sm font-semibold text-brand-ink">Google Calendar — meşgul dilimler</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Klinik randevusuna yazılmaz. Google&apos;daki meşgul saatler Asistan müsaitlik
                bloklarına aktarılır; hasta slotları ve panel çakışma kontrolü bunları dikkate
                alır. Randevu geri yazma (write-back) sonraki aşama.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {visibleStaff.length === 0 ? (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Bağlanacak randevu alınabilir personel yok. Doktor kaydınızın “randevu alınabilir”
            olduğundan emin olun.
          </CardContent>
        </Card>
      ) : (
        visibleStaff.map((member) => {
          const connection = connectionByStaff.get(member.id)
          return (
            <Card key={member.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-brand-ink">{member.fullName}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{member.role}</Badge>
                    {connection ? (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Bağlı</Badge>
                    ) : (
                      <Badge variant="outline">Bağlı değil</Badge>
                    )}
                  </div>
                  {connection?.accountEmail ? (
                    <p className="text-xs text-muted-foreground">{connection.accountEmail}</p>
                  ) : null}
                  {connection?.lastSyncAt ? (
                    <p className="text-xs text-muted-foreground">
                      Son senkron: {new Date(connection.lastSyncAt).toLocaleString('tr-TR')}
                    </p>
                  ) : null}
                  {connection?.lastError ? (
                    <p className="text-xs text-destructive">{connection.lastError}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {connection ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending && busyId === connection.id}
                        onClick={() => manage(connection.id, 'sync')}
                      >
                        <RefreshCw className="mr-1.5 size-3.5" />
                        Şimdi senkronla
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending && busyId === connection.id}
                        onClick={() => manage(connection.id, 'disconnect')}
                      >
                        <Link2Off className="mr-1.5 size-3.5" />
                        Bağlantıyı kes
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      className="bg-brand-teal text-white hover:bg-brand-teal-hover"
                      onClick={() => connect(member.id)}
                    >
                      Google&apos;ı bağla
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}

      <Card>
        <CardContent className="space-y-2 p-5">
          <p className="text-sm font-semibold text-brand-ink">Outlook</p>
          <p className="text-xs text-muted-foreground">
            Microsoft Graph busy-block senkronu planlandı; Google production MVP tamamlandıktan
            sonra aynı bağlantı modeline eklenecek.
          </p>
          <Badge variant="outline">Yakında</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
