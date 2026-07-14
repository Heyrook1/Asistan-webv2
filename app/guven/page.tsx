import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Database,
  FileLock2,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Trash2,
} from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getPublicTrustStats } from '@/lib/trust/public'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/guven', {
  title: 'Güven Merkezi',
  description:
    'Asistan Health güven mimarisi: KVKK, rol bazlı erişim, denetim izi, veri silme hakkı ve doğrulanabilir operasyon kontrolleri.',
})

const pillars = [
  {
    icon: ShieldCheck,
    title: 'KVKK odaklı tasarım',
    detail:
      'Hasta ve klinik verisi işletme bazında ayrılır. Rol bazlı izinler yalnızca gerekli kayıtlara erişim verir.',
  },
  {
    icon: LockKeyhole,
    title: 'Kimlik ve oturum güvenliği',
    detail:
      'Kimlik doğrulama Supabase Auth üzerinden yürütülür. Dashboard erişimi sunucu tarafı oturum kontrolü ile korunur.',
  },
  {
    icon: Database,
    title: 'Denetlenebilir işlemler',
    detail:
      'Hassas aksiyonlar (hasta, randevu, yetki, ayar değişiklikleri) denetim günlüğüne yazılır. Platform yönetişimi Super Admin panelinde izlenir.',
  },
  {
    icon: Trash2,
    title: 'Silme ve unutulma hakkı',
    detail:
      'KVKK silme talepleri yönetişim kuyruğunda işlenir. Tamamlanan taleplerde kişisel alanlar anonimleştirilir.',
  },
]

const proofItems = [
  {
    icon: BadgeCheck,
    title: 'Hekim profil doğrulama',
    detail:
      'Ruhsat, diploma ve kimlik alanları dolduruldukça hekim profili “doğrulandı / devam ediyor / bekleniyor” durumuna geçer.',
  },
  {
    icon: ClipboardList,
    title: 'Randevu sonrası yorum',
    detail:
      'Yorumlar tamamlanmış randevuya bağlanır. Landing’de yalnızca gerçek, maskelenmiş hasta yorumları gösterilir.',
  },
  {
    icon: Scale,
    title: 'Uyumluluk belgeleri',
    detail:
      'Aydınlatma metni ve politika versiyonları yönetişim paneline kaydedilebilir; değişiklikler denetim izine düşer.',
  },
  {
    icon: FileLock2,
    title: 'Şeffaf sınırlar',
    detail:
      'Sahte metrik, uydurma testimonial veya doğrulanmamış “sertifika” rozeti kullanmayız. Kanıt yoksa iddia etmeyiz.',
  },
]

export default async function TrustCenterPage() {
  const stats = await getPublicTrustStats()

  const statCards = [
    { label: 'Aktif klinik', value: stats.activeClinics },
    { label: 'Kimlik kaydı olan hekim', value: stats.verifiedDoctors },
    { label: 'Tamamlanan randevu', value: stats.completedAppointments },
    {
      label: 'Doğrulanmış yorum',
      value: stats.reviewCount,
      suffix: stats.averageRating ? ` · ort. ${stats.averageRating}/5` : '',
    },
  ]

  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-32">
        <div className="marketing-hero-bg absolute inset-0" />
        <div className="soft-grid absolute inset-0 opacity-60" />
        <div className="marketing-container relative z-10">
          <FadeUp className="mx-auto max-w-3xl text-center">
            <Badge className="marketing-chip mb-5 border-0">Güven Merkezi</Badge>
            <h1 className="font-heading text-4xl font-black leading-[1.08] text-brand-navy md:text-5xl">
              Güven, rozet değil; doğrulanabilir kontrol.
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
              Bu sayfa Asistan’ın güvenlik, KVKK ve kanıt yaklaşımını özetler. Aşağıdaki sayılar canlı
              veritabanından gelir; veri yoksa sıfır görünür — abartılmaz.
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="marketing-container grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item, index) => (
            <ScaleIn key={item.label} delay={0.04 * index}>
              <article className="rounded-2xl border border-black/5 bg-[#F7FAFC] p-5">
                <p className="text-3xl font-black tracking-tight text-brand-navy">
                  {item.value}
                  {item.suffix ?? ''}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">{item.label}</p>
              </article>
            </ScaleIn>
          ))}
        </div>
      </section>

      <section className="bg-dashboard-surface py-20">
        <div className="marketing-container">
          <FadeUp className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Kontrol katmanları</p>
            <h2 className="mt-3 text-3xl font-black text-brand-navy">Ne koruyoruz, nasıl kanıtlıyoruz?</h2>
          </FadeUp>
          <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((item, index) => (
              <ScaleIn key={item.title} delay={0.05 * index}>
                <article className="marketing-surface h-full rounded-2xl p-5">
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-blue">
                    <item.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-extrabold text-brand-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
                </article>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="marketing-container">
          <FadeUp className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Kanıt yüzeyi</p>
            <h2 className="mt-3 text-3xl font-black text-brand-navy">Üründe gördüğünüz güven sinyalleri</h2>
          </FadeUp>
          <div className="grid gap-4 md:grid-cols-2">
            {proofItems.map((item, index) => (
              <ScaleIn key={item.title} delay={0.05 * index}>
                <article className="h-full rounded-2xl border border-black/5 p-5">
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                    <item.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-extrabold text-brand-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
                </article>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-navy py-16 text-white">
        <div className="marketing-container grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <FadeUp>
            <h2 className="text-3xl font-black md:text-4xl">Hukuki ve operasyonel belgeler</h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/75">
              Gizlilik politikası ve kullanım koşulları herkese açıktır. Kurumsal DPA / aydınlatma metni
              versiyonları canlıya geçişte klinik bazında netleştirilir.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-xl bg-white text-brand-navy hover:bg-white/90">
                <Link href="/privacy">
                  Gizlilik
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10">
                <Link href="/terms">Kullanım koşulları</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10">
                <Link href="/contact">Güvenlik sorusu sor</Link>
              </Button>
            </div>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-sm leading-7 text-white/80">
              <p className="font-semibold text-white">Bu sayfada bilerek yapmadıklarımız</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Uydurma müşteri logosu veya sahte vaka çalışması</li>
                <li>Doğrulanmamış “ISO / sertifika” iddiası</li>
                <li>Gerçek randevuya bağlı olmayan “doğrulanmış yorum” rozeti</li>
                <li>Ölçülmemiş yüzde iyileşme vaatleri</li>
              </ul>
            </div>
          </FadeUp>
        </div>
      </section>
    </MarketingPageShell>
  )
}
