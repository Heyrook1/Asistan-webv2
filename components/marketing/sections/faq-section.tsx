import { FadeUp } from '@/components/marketing/motion-wrappers'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  {
    question: 'Asistan Health hangi klinikler icin uygun?',
    answer:
      'Genel klinik, dis hekimligi, fizyoterapi ve estetik ekipleri icin aktif olarak kullanilabilir operasyon akislarini destekler.',
  },
  {
    question: 'Kurulum ne kadar suruyor?',
    answer:
      'Ilk kurulum genelde 1-3 gun icinde tamamlanir. Rol yetkileri, hizmet listesi ve bildirim akislari klinige gore birlikte ayarlanir.',
  },
  {
    question: 'SMS ve hatirlatma akislarini destekliyor mu?',
    answer:
      'Panel ici ve e-posta hatirlatmalari kullanima hazirdir. SMS, opsiyonel webhook kurulumuyla saglayiciniza baglanabilir; kutudan cikar cikmaz acik bir SMS servisi degildir.',
  },
  {
    question: 'Veri guvenligi ve yetki yonetimi nasil saglaniyor?',
    answer:
      'Rol bazli erisim, isletme bazli veri ayrimi ve oturum denetimi ile sadece yetkili kullanicilar ilgili kayitlara ulasir.',
  },
  {
    question: 'Demo ve canliya gecis sureci nasil ilerliyor?',
    answer:
      'Once demo panel acilir, ardindan veri ve ekip ayarlari tamamlanir. Ekip onboarding sonrasinda canli kullanima gecilir.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="border-y border-slate-200 bg-dashboard-surface py-20 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <FadeUp>
          <p className="mb-4 inline-block rounded-full bg-brand-blue/10 px-4 py-1.5 text-sm font-bold text-brand-blue">
            FAQ
          </p>
          <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Sik sorulan sorular</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Satin alma ve kurulum oncesinde ekiplerin en cok sordugu basliklar.
          </p>
        </FadeUp>

        <FadeUp delay={0.08}>
          <Accordion type="single" collapsible className="rounded-2xl border border-slate-200 bg-white px-5 md:px-6">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index}`} className="border-slate-200">
                <AccordionTrigger className="py-5 text-base font-bold text-brand-navy hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-7 text-slate-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeUp>
      </div>
    </section>
  )
}
