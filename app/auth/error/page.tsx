import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

import { AuthShell } from '@/components/marketing/auth-shell'
import { Button } from '@/components/ui/button'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <AuthShell
      badge="Auth Error"
      title="Kimlik dogrulama adiminda bir sorun olustu."
      description="Baglanti suresi dolmus olabilir veya oturum gecersiz hale gelmis olabilir."
      highlights={[
        'Baglantiyi tekrar acmayi deneyin',
        'Sifirlama/giris adimini yeniden baslatin',
        'Sorun surerse destek ile iletisime gecin',
      ]}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle className="size-7" />
        </div>
        <h2 className="text-2xl font-black text-brand-navy">Oturum acilamadi</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          {params?.error ? `Hata kodu: ${params.error}` : 'Belirlenemeyen bir dogrulama hatasi olustu.'}
        </p>

        <div className="mt-6 grid gap-2">
          <Button asChild className="h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
            <Link href="/auth/login">Giris Sayfasina Git</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 w-full rounded-lg border-brand-blue/20">
            <Link href="/auth/forgot-password">Sifre Sifirlama</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  )
}
