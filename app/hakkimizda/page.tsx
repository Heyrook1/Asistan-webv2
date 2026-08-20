import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  Compass,
  MapPin,
  ShieldCheck,
  Target,
} from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeLeft, FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Button } from '@/components/ui/button'
import { DEMO_CONTACT_PATH, ENTRY_CTA, getClinicTrialPath } from '@/lib/entry-routes'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/hakkimizda', {
  title: 'Hakkımızda | Asistan Health',
  description:
    'Asistan Health: KKTC klinikleri için randevu, hasta takibi ve ekip yönetimi. Neden var olduğumuzu, misyonumuzu ve vizyonumuzu okuyun.',
})

const storyChapters = [
  {
    step: '01',
    title: 'Dağınık bilgi, gizli maliyet',
    body: 'Birçok klinikte randevu hâlâ Excel, defter ve WhatsApp arasında geziyor. Hasta aradığında ekip farklı cevaplar veriyor; iptal unutuluyor, no-show istatistiği tutulmuyor. Sorun “yazılım yokluğu” değil; bilginin tek sahibi olmaması.',
  },
  {
    step: '02',
    title: 'Küçük kliniklere büyük SaaS dayatması',
    body: 'Küresel klinik yazılımları özellik listesiyle gelir; KKTC ölçeğinde kurulum, dil, fiyat ve destek gerçekçi olmayabilir. Biz tersini tercih ettik: önce günlük operasyon (ajanda, hasta kartı, yetki), sonra genişleme.',
  },
  {
    step: '03',
    title: 'Şimdi ne yapıyoruz?',
    body: 'Asistan erken erişimde. Sağlık dikeyinde randevu, hasta kaydı, ekip rolleri, hatırlatma ve abonelik görünürlüğünü sağlam tutuyoruz. “Her şey hazır” demiyoruz; hazır olanı güvenilir şekilde teslim ediyoruz.',
  },
]

const commitments = [
  {
    icon: MapPin,
    title: 'KKTC önce',
    body: 'Ürün kararlarını yerel klinik akışına göre veririz. Genel “dünya pazarı” vaadi yerine burada işe yarayan paneli önceleriz.',
  },
  {
    icon: CalendarDays,
    title: 'Operasyon netliği',
    body: 'Sekreter ve hekim aynı ajandayı görsün; durumlar (onaylı, iptal, gelinmedi) kayıt altında kalsın. Gösterişli ama kullanılmayan ekran üretmeyiz.',
  },
  {
    icon: ShieldCheck,
    title: 'Güven ve dürüstlük',
    body: 'Hasta verisi hassastır. Rol bazlı erişim, denetim izi ve açık gizlilik metni zorunluluktur. Kanıtı olmayan AI veya sertifika iddiası kullanmayız.',
  },
]

export default function AboutPage() {
  return (
    <MarketingPageShell>
      {/* Hero — brand + story promise */}
      <section className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-12">
        <div className="marketing-hero-bg absolute inset-0" />
        <div className="soft-grid absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:block">
          <Image
            src="/images/medical-team.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-35"
            sizes="48vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6F7F9] via-[#F6F7F9]/75 to-transparent" />
        </div>

        <div className="marketing-container relative z-10 max-w-3xl">
          <FadeUp>
            <p className="text-sm font-semibold tracking-[0.14em] text-brand-blue uppercase">
              Asistan
            </p>
            <h1 className="mt-4 font-heading text-4xl font-black leading-[1.16] tracking-tight text-brand-navy sm:text-5xl md:text-[3.25rem]">
              Klinik gününü sakinleştirmek için kurulduk.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#6B7280]">
              Asistan Health, KKTC’deki sağlık işletmelerinin randevu, hasta ve ekip
              işlerini tek panelde toplamasına yardım eden erken erişim bir
              operasyon ürünüdür. Hasta yüzeyi Asistan Rezervasyon’dur. Büyük vaat
              değil; net iş.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                variant="ctaPrimary"
                className="min-h-11 rounded-xl px-6"
              >
                <Link href={getClinicTrialPath('tr')}>
                  {ENTRY_CTA.clinicTrial.tr}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ctaSecondary"
                className="min-h-11 rounded-xl bg-white/80 text-brand-navy"
              >
                <Link href={DEMO_CONTACT_PATH}>{ENTRY_CTA.demoRequest.tr}</Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Story */}
      <section className="border-t border-slate-200/80 bg-white py-20 md:py-24">
        <div className="marketing-container">
          <FadeUp className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-blue uppercase">
              Hikâyemiz
            </p>
            <h2 className="mt-3 font-heading text-3xl font-black text-brand-navy md:text-4xl">
              Neden bir randevu paneli daha?
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Çünkü piyasadaki çoğu araç ya çok ağır ya da yerel ihtiyaca uzak.
              Biz, Lefkoşa’dan başlayarak “bugün klinik nasıl çalışıyor?”
              sorusundan hareket ettik.
            </p>
          </FadeUp>

          <div className="mt-14 space-y-0 border-t border-slate-200">
            {storyChapters.map((chapter, index) => (
              <FadeUp key={chapter.step} delay={0.05 * index}>
                <article className="grid gap-4 border-b border-slate-200 py-10 md:grid-cols-[7rem_1fr] md:gap-10">
                  <p className="font-heading text-3xl font-black tabular-nums text-brand-blue/35">
                    {chapter.step}
                  </p>
                  <div>
                    <h3 className="text-xl font-bold text-brand-navy">{chapter.title}</h3>
                    <p className="mt-3 max-w-2xl text-[15px] leading-8 text-slate-600">
                      {chapter.body}
                    </p>
                  </div>
                </article>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="bg-[#EEF2F6] py-20 md:py-24">
        <div className="marketing-container">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-blue uppercase">
              Yönümüz
            </p>
            <h2 className="mt-3 font-heading text-3xl font-black text-brand-navy md:text-4xl">
              Misyon ve vizyon
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Startup dilinde abartı kolaydır. Bizim metnimiz, şu an yaptığımız
              işle yarın verdiğimiz sözün arasını açık tutmak için yazıldı.
            </p>
          </FadeUp>

          <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <ScaleIn>
              <div className="h-full border-l-2 border-brand-blue pl-6 md:pl-8">
                <div className="mb-4 flex items-center gap-2 text-brand-blue">
                  <Target className="h-5 w-5" aria-hidden="true" />
                  <p className="text-xs font-semibold tracking-[0.14em] uppercase">
                    Misyon
                  </p>
                </div>
                <h3 className="font-heading text-2xl font-black leading-snug text-brand-navy">
                  Klinik ekiplerinin idari yükünü azaltmak; randevu ve hasta
                  bilgisini tek, güvenilir kaynaktan yönetilebilir kılmak.
                </h3>
                <p className="mt-5 text-[15px] leading-8 text-slate-600">
                  Bu; sekreterin çifte giriş yapmaması, hekimin kendi takvimini
                  görmesi, gelmeyen randevunun kayıt altına alınması demektir.
                  Tıbbi teşhis veya tedavi kararı sunmayız — o klinik ve hekimin
                  işidir. Biz operasyonu düzenleriz.
                </p>
              </div>
            </ScaleIn>

            <ScaleIn delay={0.08}>
              <div className="h-full border-l-2 border-brand-navy/25 pl-6 md:pl-8">
                <div className="mb-4 flex items-center gap-2 text-brand-navy">
                  <Compass className="h-5 w-5" aria-hidden="true" />
                  <p className="text-xs font-semibold tracking-[0.14em] uppercase">
                    Vizyon
                  </p>
                </div>
                <h3 className="font-heading text-2xl font-black leading-snug text-brand-navy">
                  Hedefimiz: KKTC kliniklerinin kanıtladıkça tercih ettiği operasyon
                  altyapısı olmak.
                </h3>
                <p className="mt-5 text-[15px] leading-8 text-slate-600">
                  Bu, bugünkü pazar sıralaması iddiası değildir. Asistan Health erken
                  erişimde; tercihi sloganla değil tek ajanda, net yetkiler ve ölçülebilir
                  operasyon sonucuyla kazanmak istiyoruz. Sonra — ve yalnızca sağlıkta
                  kanıtladıktan sonra — güzellik, hukuk gibi randevu yoğun dikeylere
                  kontrollü genişlemek. Bölgenin “her sektöre her şey” platformu olmak değil;
                  önce bir dikeyde güvenilir standart olmak.
                </p>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* How we decide */}
      <section className="bg-white py-20 md:py-24">
        <div className="marketing-container">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <FadeUp>
              <p className="text-xs font-semibold tracking-[0.16em] text-brand-blue uppercase">
                Çalışma ilkeleri
              </p>
              <h2 className="mt-3 font-heading text-3xl font-black text-brand-navy md:text-4xl">
                Nasıl karar veriyoruz?
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Özellik eklemeden önce soruyoruz: Bu, klinikte her gün kullanılan
                bir akışı mı güçlendiriyor? Değilse bekler.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-slate-300 text-brand-navy"
                >
                  <Link href="/guven">Güven Merkezi</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-slate-300 text-brand-navy"
                >
                  <Link href="/kaynaklar">Kaynaklar</Link>
                </Button>
              </div>
            </FadeUp>

            <div className="space-y-8">
              {commitments.map((item, index) => (
                <FadeLeft key={item.title} delay={0.06 * index}>
                  <div className="flex gap-4 border-b border-slate-200 pb-8 last:border-0 last:pb-0">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-navy">{item.title}</h3>
                      <p className="mt-2 text-[15px] leading-7 text-slate-600">{item.body}</p>
                    </div>
                  </div>
                </FadeLeft>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stage honesty */}
      <section className="border-y border-slate-200 bg-[#F6F7F9] py-16 md:py-20">
        <div className="marketing-container max-w-3xl">
          <FadeUp>
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-blue uppercase">
              Bugün neredeyiz?
            </p>
            <h2 className="mt-3 font-heading text-2xl font-black text-brand-navy md:text-3xl">
              Erken erişim. Abartısız yol haritası.
            </h2>
            <p className="mt-5 text-[15px] leading-8 text-slate-600">
              Ajanda, hasta kartı, ekip yetkileri, hatırlatmalar ve temel analitik
              aktif odaktır. Online ödeme, mağaza yayınları ve bazı bildirim
              kanalları yol haritasında — satış sayfalarında “yakında” geçenler
              tamamlanmış sayılmaz. Kurulum ve fiyat için doğrudan konuşuruz;
              sahte metrik veya uydurma ekip öyküsü yayınlamayız.
            </p>
            <p className="mt-4 text-[15px] leading-8 text-slate-600">
              İletişim:{' '}
              <a
                href="mailto:merhaba@asistan.online"
                className="font-semibold text-brand-blue underline-offset-2 hover:underline"
              >
                merhaba@asistan.online
              </a>
              {' · '}
              <Link
                href={DEMO_CONTACT_PATH}
                className="font-semibold text-brand-blue underline-offset-2 hover:underline"
              >
                Demo / satış formu
              </Link>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <FadeUp className="marketing-container rounded-3xl bg-brand-navy px-8 py-10 text-white md:px-12 md:py-14">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-heading text-2xl font-black md:text-3xl">
                Kliniğinizin gününü birlikte sakinleştirelim.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
                Deneme hesabı açın veya ekiple 20 dakikalık bir kurulum görüşmesi
                planlayın. Satış vaadi değil; mevcut paneli birlikte gezeriz.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="min-h-11 rounded-xl bg-white text-brand-navy shadow-[0_10px_22px_-14px_rgba(15,23,42,0.5)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-white/90 hover:shadow-[0_16px_28px_-14px_rgba(15,23,42,0.58)] active:translate-y-0">
                <Link href={getClinicTrialPath('tr')}>{ENTRY_CTA.clinicTrial.short.tr}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-11 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href={DEMO_CONTACT_PATH}>{ENTRY_CTA.demoRequest.tr}</Link>
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>
    </MarketingPageShell>
  )
}
