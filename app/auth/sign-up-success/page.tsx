import Link from 'next/link'
import { MailCheck } from 'lucide-react'

import { AuthShell } from '@/components/marketing/auth-shell'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      badge="Kayıt tamamlandı"
      title="E-posta doğrulama adımına geçtiniz."
      description="Hesabınızı aktif etmek için e-posta kutunuza gönderilen bağlantıyı açın."
      highlights={[
        'Gelen kutusu ve spam klasörünü kontrol edin',
        'Bağlantıya tıklayarak hesabı aktifleştirin',
        'Ardından panelinize giriş yapabilirsiniz',
      ]}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-brand-cyan/10 text-brand-blue">
          <MailCheck className="size-7" />
        </div>
        <h2 className="text-2xl font-black text-brand-navy">E-postanızı kontrol edin</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          Doğrulama bağlantısı açıldıktan sonra giriş ekranından devam edebilirsiniz.
        </p>
        <Button asChild className="mt-6 h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
          <Link href="/auth/login">Giriş sayfasına dön</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
