import { Database, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react'

import { FadeUp } from '@/components/marketing/motion-wrappers'

const complianceItems = [
  {
    icon: ShieldCheck,
    title: 'KVKK odaklı kontroller',
    detail: 'Veri erişimi iş rolüne göre sınırlandırılır; sadece gerekli kayıtlar görüntülenir.',
  },
  {
    icon: LockKeyhole,
    title: 'Rol bazlı yetki',
    detail: 'İşletme (tenant) bazlı veri ayrımı ve rol tabanlı izin katmanı ile güvenli iş akışları sağlanır.',
  },
  {
    icon: MapPin,
    title: 'KKTC odaklı operasyon',
    detail: 'Bölgesel ihtiyaçlara göre kliniğin operasyon diline uygun kurulum adımları uygulanır.',
  },
  {
    icon: Database,
    title: 'Denetlenebilir veri katmanı',
    detail: 'Kayıt değişiklikleri izlenebilir bir modelde tutulur; süreçler denetim ihtiyacına hazırdır.',
  },
]

export function ComplianceSection() {
  return (
    <section id="security" className="bg-brand-navy py-20 text-white md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-brand-cyan">
            Güvenlik & gizlilik
          </p>
          <h2 className="font-heading text-3xl font-black md:text-5xl">
            Güvenlik ve veri koruma temel tasarım ilkesidir.
          </h2>
          <p className="mt-5 text-base leading-7 text-white/75">
            KVKK odaklı kontroller, işletme bazlı veri ayrımı ve rol güvenliği; platformun
            işlevinden bağımsız bir temel katman olarak ele alınmıştır.{' '}
            <a href="/guven" className="font-semibold text-brand-cyan underline-offset-2 hover:underline">
              Güven Merkezi
            </a>
            &apos;nde doğrulanabilir kontrolleri inceleyin. Kanıtı olmayan sertifika iddiası
            kullanmayız.
          </p>
        </FadeUp>

        <div className="grid gap-4 md:grid-cols-2">
          {complianceItems.map((item, index) => (
            <FadeUp key={item.title} delay={index * 0.08}>
              <article className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-white/10 text-brand-cyan">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-extrabold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/75">{item.detail}</p>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
