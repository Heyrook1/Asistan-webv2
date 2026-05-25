import Link from 'next/link'
import { MailCheck } from 'lucide-react'

import { AuthShell } from '@/components/marketing/auth-shell'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      badge="Kayit Tamamlandi"
      title="E-posta dogrulama adimina gectiniz."
      description="Hesabinizi aktif etmek icin e-posta kutunuza gonderilen baglantiyi acin."
      highlights={[
        'Gelen kutusu ve spam klasorunu kontrol edin',
        'Baglantiya tiklayarak hesabi aktiflestirin',
        'Ardindan panelinize giris yapabilirsiniz',
      ]}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-brand-cyan/10 text-brand-blue">
          <MailCheck className="size-7" />
        </div>
        <h2 className="text-2xl font-black text-brand-navy">E-postanizi kontrol edin</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          Dogrulama baglantisi acildiktan sonra giris ekranindan devam edebilirsiniz.
        </p>
        <Button asChild className="mt-6 h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
          <Link href="/auth/login">Giris Sayfasina Don</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
