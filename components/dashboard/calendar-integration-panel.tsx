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
      connected: 'Google Takvim bağlandı; meşgul dilimler içe aktarıldı.',
      denied: 'Google izni iptal edildi.',
      invalid: 'Google bağlantısı tamamlanamadı. Tekrar deneyin.',
      missing_refresh: 'Google bağlantısı tamamlanamadı. İzin ekranından tekrar bağlayın.',
      staff_missing: 'Personel bulunamadı.',
      disabled: 'Takvim senkronu şu an kapalı.',
      error: 'Google Takvim bağlantısı başarısız.',
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
        if (action === 'disconnect') toast.success('Google Takvim bağlantısı kaldırıldı')
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
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-5 text-brand-teal" />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-brand-ink">Google Takvim</p>
                <Badge variant="outline">Bağlı değil</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Google Takvim meşgul-dilim senkronu bu klinikte henüz etkin değil. Bağlantıyı Asistan
                destek ekibi açar; ardından personel hesabınızı buradan bağlayabilirsiniz.
              </p>
              <Button asChild size="sm" className="bg-brand-teal text-white hover:bg-brand-teal-hover">
                <a href="/contact">Google Takvim&apos;i bağla</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!enabled) {
    return (
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-brand-ink">Google Takvim</p>
            <Badge className="border-0 bg-amber-100 text-amber-900 hover:bg-amber-100">Hata</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Takvim senkronu geçici olarak kapalı. Tekrar açılması için destek ekibine yazın.
          </p>
          <Button asChild size="sm" variant="outline">
            <a href="/contact">Destek ile iletişime geç</a>
          </Button>
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
              <p className="text-sm font-semibold text-brand-ink">Google Takvim — meşgul dilimler</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Klinik randevusuna yazılmaz. Google&apos;daki meşgul saatler Asistan müsaitlik
                bloklarına aktarılır; hasta müsait saatleri ve panel çakışma kontrolü bunları dikkate
                alır. Randevuyu Google takvimine geri yazma sonraki aşamada gelecek.
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
                      connection.lastError ? (
                        <Badge className="border-0 bg-red-100 text-red-800 hover:bg-red-100">Hata</Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Bağlı</Badge>
                      )
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
                      Google Takvim&apos;i bağla
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
            Outlook meşgul-dilim senkronu yakında; Google Takvim bağlantısı hazır olduğunda aynı
            ekrandan eklenecek.
          </p>
          <Badge variant="outline">Yakında</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
