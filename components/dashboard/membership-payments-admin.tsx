'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { confirmMembershipPayment, rejectMembershipPayment } from '@/lib/actions/system-admin'

export type PendingMembershipPaymentRow = {
  id: string
  businessId: string
  businessName: string
  planCode: string
  planName: string
  billingPeriod: string
  amount: number
  currency: string
  provider: string
  createdAt: string
}

export function MembershipPaymentsAdmin({
  payments,
}: {
  payments: PendingMembershipPaymentRow[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Bekleyen self-serve paket ödemesi yok.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {payments.map((row) => (
        <Card key={row.id}>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-brand-ink">{row.businessName}</p>
                <Badge variant="outline">{row.provider}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {row.planName} · {row.billingPeriod} · {row.amount} {row.currency} ·{' '}
                {new Date(row.createdAt).toLocaleString('tr-TR')}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">{row.id}</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await confirmMembershipPayment(row.id)
                    if (!result.ok) {
                      toast.error(result.error)
                      return
                    }
                    toast.success('Ödeme onaylandı — paket aktif')
                    router.refresh()
                  })
                }
              >
                Onayla
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await rejectMembershipPayment(row.id)
                    if (!result.ok) {
                      toast.error(result.error)
                      return
                    }
                    toast.success('Talep iptal edildi')
                    router.refresh()
                  })
                }
              >
                Reddet
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
