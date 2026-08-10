'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FileText, Printer, Send, Ban, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { printReportAsPdf } from '@/lib/client-export'
import {
  getInvoicePrintPayload,
  markInvoiceReady,
  submitInvoiceToKktc,
  voidInvoice,
  type ClinicInvoiceRow,
} from '@/lib/actions/invoices'
import { labelInvoiceStatus } from '@/lib/ui-labels'

function money(amount: number, currency: string) {
  return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

export function ClinicInvoicesBoard({
  invoices,
  invoiceEnabled,
  kktcApiConfigured,
  canManage,
}: {
  invoices: ClinicInvoiceRow[]
  invoiceEnabled: boolean
  kktcApiConfigured: boolean
  canManage: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [voidId, setVoidId] = useState<string | null>(null)

  function run(action: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        toast.error(result.error || 'İşlem başarısız')
        return
      }
      toast.success(okMsg)
      router.refresh()
    })
  }

  async function printInvoice(invoiceId: string) {
    startTransition(async () => {
      const result = await getInvoicePrintPayload({ invoiceId })
      if (!result.ok || !result.data) {
        toast.error(!result.ok ? result.error : 'Yazdırma başarısız')
        return
      }
      const doc = result.data.document
      printReportAsPdf({
        title: doc.seller.title,
        subtitle: `Fatura ${doc.number ?? '—'} · KKTC hizmet belgesi (e-SMM / GİB değil)`,
        sections: [
          {
            heading: 'Alıcı',
            rows: [
              ['Alan', 'Değer'],
              ['Ad', doc.buyer.name ?? '—'],
              ['Vergi no', doc.buyer.taxId ?? '—'],
            ],
          },
          {
            heading: 'Kalemler',
            rows: [
              ['Açıklama', 'Adet', 'Birim', 'Tutar'],
              ...doc.lineItems.map((line) => [
                line.description,
                String(line.quantity),
                String(line.unitPrice),
                String(line.quantity * line.unitPrice),
              ]),
            ],
          },
          {
            heading: 'Toplam',
            rows: [
              ['Kalem', 'Tutar'],
              ['Ara toplam', String(doc.totals.subtotal)],
              [`KDV %${doc.totals.taxRate}`, String(doc.totals.taxAmount)],
              ['Genel toplam', result.data.totalsLabel],
            ],
          },
        ],
      })
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-slate-50/80 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-brand-ink">KKTC e-Fatura taslakları</p>
        <p className="mt-1 leading-5">
          Tamamlanan randevudan hizmet faturası taslağı üretir. Resmi e-Fatura ağı yoktur. Maliye
          bağlantısı varsa gönderim denenir; yoksa fatura yazdırılabilir hazır duruma gelir.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Badge variant={invoiceEnabled ? 'default' : 'secondary'}>
            {invoiceEnabled ? 'Fatura açık' : 'Fatura kapalı (Ayarlar)'}
          </Badge>
          <Badge variant={kktcApiConfigured ? 'default' : 'secondary'}>
            {kktcApiConfigured ? 'Maliye bağlantısı hazır' : 'Maliye bağlantısı yok — yazdırın'}
          </Badge>
        </div>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6 text-sm text-muted-foreground">
            <FileText className="h-8 w-8 text-brand-teal" aria-hidden />
            <p>Henüz fatura yok. Ajanda’dan tamamlanan randevu için “Fatura taslağı” oluşturun.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <Card>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-brand-ink">{inv.number ?? inv.id.slice(0, 8)}</span>
                      <Badge variant="outline">{labelInvoiceStatus(inv.status)}</Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {inv.buyerName ?? 'Alıcı yok'} · {money(inv.total, inv.currency)}
                    </p>
                    {inv.lastError && (
                      <p className="text-xs text-destructive" role="alert">
                        {/API yok|env ile|yazd[ıi]r[ıi]labilir READY/i.test(inv.lastError)
                          ? 'Maliye bağlantısı yapılandırılmamış — belge yazdırılabilir durumda.'
                          : inv.lastError}
                      </p>
                    )}
                    {inv.providerRef && (
                      <p className="text-xs text-muted-foreground">Ref: {inv.providerRef}</p>
                    )}
                  </div>
                  {canManage && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => printInvoice(inv.id)}
                        aria-label="Faturayı yazdır"
                      >
                        <Printer className="mr-1 h-4 w-4" />
                        Yazdır
                      </Button>
                      {inv.status === 'DRAFT' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            run(() => markInvoiceReady({ invoiceId: inv.id }), 'Fatura hazır işaretlendi')
                          }
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Hazır
                        </Button>
                      )}
                      {(inv.status === 'DRAFT' || inv.status === 'READY' || inv.status === 'FAILED') && (
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          className="bg-brand-teal text-white hover:bg-brand-teal-hover"
                          onClick={() =>
                            run(
                              () => submitInvoiceToKktc({ invoiceId: inv.id }),
                              kktcApiConfigured
                                ? 'KKTC gönderimi tamam'
                                : 'Fatura yazdırılabilir olarak işaretlendi'
                            )
                          }
                        >
                          <Send className="mr-1 h-4 w-4" />
                          {kktcApiConfigured ? 'Maliye’ye gönder' : 'Yazdırılabilir yap'}
                        </Button>
                      )}
                      {inv.status !== 'SUBMITTED' && inv.status !== 'VOID' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={pending}
                          onClick={() => setVoidId(inv.id)}
                        >
                          <Ban className="mr-1 h-4 w-4" />
                          İptal
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={voidId !== null} onOpenChange={(open) => !open && setVoidId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bu faturayı iptal etmek istiyor musunuz?</AlertDialogTitle>
            <AlertDialogDescription>
              İptal edilen fatura yazdırılamaz ve maliye gönderimine kapalı kalır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hayır, geri dön</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!voidId) return
                const invoiceId = voidId
                setVoidId(null)
                run(() => voidInvoice({ invoiceId }), 'Fatura iptal edildi')
              }}
            >
              Evet, iptal et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
