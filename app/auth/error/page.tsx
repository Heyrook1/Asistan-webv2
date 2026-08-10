import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

import { AuthShell } from '@/components/marketing/auth-shell'
import { Button } from '@/components/ui/button'

export default async function AuthErrorPage() {
  return (
    <AuthShell
      badge="Kimlik doğrulama"
      title="Kimlik doğrulama adımında bir sorun oluştu."
      description="Bağlantı süresi dolmuş olabilir veya oturum geçersiz hale gelmiş olabilir."
      highlights={[
        'Bağlantıyı tekrar açmayı deneyin',
        'Sıfırlama veya giriş adımını yeniden başlatın',
        'Sorun sürerse destek ile iletişime geçin',
      ]}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle className="size-7" />
        </div>
        <h2 className="text-2xl font-black text-brand-navy">Oturum açılamadı</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          Bağlantı süresi dolmuş veya oturum geçersiz olabilir. Giriş veya şifre sıfırlamayı yeniden
          deneyin; sorun sürerse destek ile iletişime geçin.
        </p>

        <div className="mt-6 grid gap-2">
          <Button asChild className="h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
            <Link href="/auth/login">Giriş sayfasına git</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 w-full rounded-lg border-brand-blue/20">
            <Link href="/auth/forgot-password">Şifre sıfırlama</Link>
          </Button>
          <Button asChild variant="ghost" className="h-11 w-full rounded-lg">
            <Link href="/contact">Destek ile iletişime geç</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  )
}
