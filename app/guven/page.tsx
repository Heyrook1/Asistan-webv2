import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  FileLock2,
  Scale,
  ShieldCheck,
} from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TRUST_CONTROL_POSTURE_LABEL,
  getPublicTrustControlMatrix,
  type TrustControlPosture,
} from '@/lib/brand/trust-control-matrix'
import {
  getPublicTrustStats,
  PUBLIC_TRUST_STATS_MIN_COMPLETED,
  shouldPublishPublicTrustStats,
} from '@/lib/trust/public'
import { withCanonical } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const metadata: Metadata = withCanonical('/guven', {
  title: 'Güven Merkezi',
  description:
    'Asistan Health güven kontrolleri: işletme ayrımı, rol erişimi, oturum koruması. Kanıtı olmayan iddialar planlanan kontrol olarak etiketlenir.',
})

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
      'Aydınlatma metni ve politika versiyonları yönetişim paneline kaydedilebilir; değişiklikler denetim izine düşebilir.',
  },
  {
    icon: FileLock2,
    title: 'Şeffaf sınırlar',
    detail:
      'Sahte metrik, uydurma testimonial veya doğrulanmamış “sertifika” rozeti kullanmayız. Kanıt yoksa iddia etmeyiz; planlanan kontrolleri açıkça etiketleriz.',
  },
]

const clinicAssurances = [
  {
    icon: FileLock2,
    title: 'Hasta bilgileri klinik sınırları içinde kalır',
    detail: 'İşletme bazlı veri ayrımı, başka bir kliniğin bilgisinin ekibinizin ekranına karışmamasını hedefler.',
  },
  {
    icon: ShieldCheck,
    title: 'Ekip erişimi görevle sınırlanır',
    detail: 'Roller, herkesin yalnızca günlük işi için gereken bilgiye erişmesine yardımcı olur.',
  },
  {
    icon: ClipboardList,
    title: 'Ne hazırsa açıkça görürsünüz',
    detail: 'Doğrulanmış kontrolleri gösterir, henüz tamamlanmayanları ise planlanan olarak açıkça etiketleriz.',
  },
]

function postureBadgeClass(posture: TrustControlPosture) {
  if (posture === 'active') return 'bg-emerald-500/10 text-emerald-800 ring-emerald-500/20'
  if (posture === 'partial') return 'bg-amber-500/10 text-amber-900 ring-amber-500/20'
  return 'bg-slate-200/80 text-slate-700 ring-slate-300/60'
}

export default async function TrustCenterPage() {
  const stats = await getPublicTrustStats()
  const publishStats = shouldPublishPublicTrustStats(stats)
  const matrix = getPublicTrustControlMatrix()

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
      <section className="relative overflow-hidden pb-16 pt-10 md:pb-20 md:pt-12">
        <div className="marketing-hero-bg absolute inset-0" />
        <div className="soft-grid absolute inset-0 opacity-60" />
        <div className="marketing-container relative z-10">
          <FadeUp className="mx-auto max-w-3xl text-center">
            <Badge className="marketing-chip mb-5 border-0">Güven Merkezi</Badge>
            <h1 className="font-heading text-4xl font-black leading-[1.16] tracking-tight text-brand-navy md:text-5xl">
              Güven, rozet değil; doğrulanabilir kontrol.
            </h1>
            <p className="mt-6 text-base leading-8 text-[#6B7280] md:text-lg">
              Her public iddia kod kontrolü, otomatik test ve son doğrulama tarihine bağlanır. Kanıt kapısı
              kapalıysa kontrol <strong className="font-semibold text-brand-navy">planlanan</strong> olarak
              etiketlenir — kesin dil kullanılmaz.
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="bg-white py-12 md:py-14" aria-labelledby="clinic-assurances-heading">
        <div className="marketing-container">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Klinik için</p>
            <h2 id="clinic-assurances-heading" className="mt-3 text-3xl font-black text-brand-navy md:text-4xl">
              Klinik için bugün ne anlama geliyor?
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
              Güvenlik kontrollerini teknik terimlere boğmadan, günlük klinik akışındaki karşılığıyla anlatıyoruz.
            </p>
          </FadeUp>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {clinicAssurances.map((item, index) => (
              <ScaleIn key={item.title} delay={0.05 * index}>
                <article className="h-full rounded-2xl border border-[#E6EAF0] bg-[var(--section-surface-neutral)] p-5">
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                    <item.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-brand-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
                </article>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {publishStats ? (
        <section className="bg-[var(--section-surface-blue)] py-14">
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
      ) : (
        <section className="bg-[var(--section-surface-blue)] py-14">
          <div className="marketing-container">
            <ScaleIn>
              <article className="rounded-2xl border border-brand-blue/10 bg-[#F7FAFC] px-6 py-5 text-sm leading-7 text-slate-600">
                <p className="font-semibold text-brand-navy">Canlı platform metrikleri henüz yayında değil</p>
                <p className="mt-2">
                  Erken aşamada sıfır veya tek haneli sayıları vitrine koymuyoruz. Önce kanıtlı kontroller
                  (işletme ayrımı, rol erişimi, oturum) devrede; toplam{' '}
                  {PUBLIC_TRUST_STATS_MIN_COMPLETED}+ tamamlanan randevu birikince özet istatistikler burada
                  açılır.
                </p>
              </article>
            </ScaleIn>
          </div>
        </section>
      )}

      <section className="bg-white py-20">
        <div className="marketing-container">
          <FadeUp className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Kontrol matrisi</p>
            <h2 className="mt-3 text-3xl font-black text-brand-navy">Public iddia → kod → test</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Aşağıdaki satırlar ürün güven iddialarının kanıt kapısıdır. Owner ve son doğrulama tarihi
              güncel tutulur.
            </p>
          </FadeUp>

          <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-[#F7FAFC] text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Public iddia</th>
                  <th className="px-4 py-3">Kod kontrolü</th>
                  <th className="px-4 py-3">Otomatik test</th>
                  <th className="px-4 py-3">Son doğrulama</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3.5 font-semibold text-brand-navy">{row.publicClaim}</td>
                    <td className="px-4 py-3.5 text-slate-600">{row.codeControl}</td>
                    <td className="px-4 py-3.5 text-slate-600">{row.automatedTest}</td>
                    <td className="px-4 py-3.5 tabular-nums text-slate-600">{row.lastVerified}</td>
                    <td className="px-4 py-3.5 text-slate-600">{row.owner}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1',
                          postureBadgeClass(row.posture),
                        )}
                      >
                        {TRUST_CONTROL_POSTURE_LABEL[row.posture].tr}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {matrix.map((item, index) => (
              <ScaleIn key={item.id} delay={0.04 * index}>
                <article className="marketing-surface h-full rounded-2xl p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-blue">
                      <ShieldCheck className="size-5" aria-hidden="true" />
                    </div>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1',
                        postureBadgeClass(item.posture),
                      )}
                    >
                      {item.postureLabel}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-brand-navy">{item.publicClaim}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.publicDetail}</p>
                  <p className="mt-3 text-[11px] text-slate-400">
                    Owner: {item.owner} · doğrulama {item.lastVerified}
                  </p>
                </article>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--section-surface-neutral)] py-20">
        <div className="marketing-container">
          <FadeUp className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Kanıt yüzeyi</p>
            <h2 className="mt-3 text-3xl font-black text-brand-navy">Üründe gördüğünüz güven sinyalleri</h2>
          </FadeUp>
          <div className="grid gap-4 md:grid-cols-2">
            {proofItems.map((item, index) => (
              <ScaleIn key={item.title} delay={0.05 * index}>
                <article className="h-full rounded-2xl border border-black/5 bg-white p-5">
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
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/terms">Kullanım koşulları</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10"
              >
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
                <li>Kanıtsız kesin “kişisel alanlar anonimleştirilir” dili</li>
                <li>Ölçülmemiş yüzde iyileşme vaatleri</li>
              </ul>
            </div>
          </FadeUp>
        </div>
      </section>
    </MarketingPageShell>
  )
}
