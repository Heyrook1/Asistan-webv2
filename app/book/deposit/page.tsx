import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicDepositView } from '@/lib/payments/deposit-public'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Randevu depozitosu',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function BookDepositPage({
  searchParams,
}: {
  searchParams: Promise<{
    depositId?: string
    t?: string
    pi?: string
    session_id?: string
    cancelled?: string
  }>
}) {
  const params = await searchParams
  const depositId = params.depositId?.trim()

  if (!depositId) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-16">
        <h1 className="text-xl font-bold text-slate-900">Depozito bulunamadı</h1>
        <p className="mt-2 text-sm text-slate-600">
          Geçerli bir ödeme bağlantısı kullanın veya klinik ile iletişime geçin.
        </p>
      </main>
    )
  }

  const view = await getPublicDepositView({
    depositId,
    accessToken: params.t?.trim() || null,
    paymentIntentId: params.pi?.trim() || null,
    checkoutSessionId: params.session_id?.trim() || null,
  })

  const amountLabel = `${view.amount} ${view.currency}`
  const cancelled = params.cancelled === '1'

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-16">
      <p className="text-xs font-semibold tracking-wide text-[#0071E3] uppercase">
        Asistan Rezervasyon
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Randevu depozitosu</h1>
      {view.clinicName ? (
        <p className="mt-1 text-sm text-slate-600">{view.clinicName}</p>
      ) : null}

      {view.error ? (
        <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {view.error}
        </div>
      ) : null}

      {cancelled ? (
        <div role="status" className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Ödeme iptal edildi. Randevunuz kayıtlı kaldı — dilerseniz tekrar deneyebilirsiniz.
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Tutar</dt>
            <dd className="font-semibold text-slate-900">{amountLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Durum</dt>
            <dd className="font-semibold text-slate-900">
              {view.status === 'PAID'
                ? 'Ödendi'
                : view.status === 'PENDING'
                  ? 'Ödeme bekleniyor'
                  : view.status}
            </dd>
          </div>
          {view.stripeStatus ? (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Kart ödeme</dt>
              <dd className="font-medium text-slate-700">
                {view.stripeStatus === 'succeeded'
                  ? 'Başarılı'
                  : view.stripeStatus === 'processing'
                    ? 'İşleniyor'
                    : view.stripeStatus === 'requires_payment_method' ||
                        view.stripeStatus === 'requires_action'
                      ? 'Kart bekleniyor'
                      : view.stripeStatus === 'canceled'
                        ? 'İptal'
                        : 'Beklemede'}
              </dd>
            </div>
          ) : null}
        </dl>

        {view.instructions ? (
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-700">
            {view.instructions}
          </pre>
        ) : null}

        <div className="mt-5 flex flex-col gap-2">
          {view.status === 'PENDING' && view.payUrl ? (
            <Button asChild className="h-11 min-h-11 w-full bg-[#0071E3] text-white hover:bg-[#0063C8]">
              <a href={view.payUrl}>Kart ile öde</a>
            </Button>
          ) : null}
          {view.status === 'PAID' ? (
            <p className="text-center text-sm font-medium text-emerald-700">
              Teşekkürler — depozito onaylandı. Klinik paneline düşer.
            </p>
          ) : null}
          <Button asChild variant="outline" className="h-11 min-h-11 w-full">
            <Link href={`/book/deposit?depositId=${encodeURIComponent(depositId)}`}>Durumu yenile</Link>
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        Randevu kaydı ödeme olmadan da oluşmuş olabilir; klinik onayını bekleyin.
      </p>
    </main>
  )
}
