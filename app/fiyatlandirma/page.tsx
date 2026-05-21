import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, HelpCircle, ShieldCheck, Sparkles } from "lucide-react"

import { Footer } from "@/components/marketing/footer"
import { Navbar } from "@/components/marketing/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Fiyatlandırma",
  description:
    "Asistan Health erken erişim, keşif görüşmesi ve kliniğe özel kurulum seçeneklerini inceleyin.",
}

const plans = [
  {
    name: "Ücretsiz Keşif",
    eyebrow: "İlk görüşme",
    description: "Kliniğinizin randevu, hasta ve ekip akışını birlikte değerlendirelim.",
    price: "0 TRY",
    note: "Kısa ihtiyaç analizi",
    cta: "Demo Talep Et",
    href: "/auth/sign-up",
    highlighted: false,
    features: [
      "İhtiyaç görüşmesi",
      "Klinik akışı değerlendirmesi",
      "Asistan Health tanıtımı",
      "Uygun kullanım senaryosu",
    ],
  },
  {
    name: "Erken Erişim",
    eyebrow: "Önerilen",
    description: "Asistan Health'i ilk kullanan klinikler ve sağlık ekipleri için.",
    price: "Başvuru ile",
    note: "Kurulum önceliği",
    cta: "Erken Erişim Başvurusu",
    href: "/auth/sign-up",
    highlighted: true,
    features: [
      "Randevu ve hasta takibi",
      "Sekreter ve ekip rolleri",
      "Hatırlatma akışları",
      "Kurulum desteği",
      "Geri bildirim önceliği",
    ],
  },
  {
    name: "Özel Kurulum",
    eyebrow: "Çok ekipli klinikler",
    description: "Birden fazla hekim, lokasyon veya özel operasyon ihtiyacı olan ekipler için.",
    price: "Özel teklif",
    note: "Kapsama göre planlanır",
    cta: "Klinik İçin Görüşelim",
    href: "/auth/sign-up",
    highlighted: false,
    features: [
      "İş akışı planlama",
      "Rol ve yetki kurgusu",
      "Veri geçişi değerlendirmesi",
      "Özel destek planı",
      "Sektöre özel yol haritası",
    ],
  },
]

const included = [
  "Asistan Health odağı",
  "Türkçe arayüz",
  "KKTC pazarı için keşif",
  "KVKK odaklı yaklaşım",
]

const faqs = [
  {
    question: "Asistan Health ile genel Asistan farkı nedir?",
    answer:
      "Asistan Health; hasta, randevu, doktor ve sekreter akışına göre önceliklendirilmiş sağlık sürümüdür.",
  },
  {
    question: "Klinik sekreterim kullanabilir mi?",
    answer:
      "Evet. Rol bazlı kullanım hedeflenir; sekreter, doktor ve yönetici akışları ayrı ihtiyaçlarla ele alınır.",
  },
  {
    question: "Fiyat neden sabit paket olarak verilmedi?",
    answer:
      "Erken erişimde klinik büyüklüğü, ekip sayısı ve kurulum ihtiyacı değiştiği için teklif görüşme sonrası netleşir.",
  },
  {
    question: "Hasta verileri nasıl korunur?",
    answer:
      "Ürün kararları gizlilik ve yetkilendirme odağıyla tasarlanır. Canlı kurulum öncesi veri süreci ayrıca değerlendirilir.",
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-[#F8FAFC] pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-[#0B7F6F]/10 text-[#0B7F6F] hover:bg-[#0B7F6F]/10">
              Fiyatlandırma
            </Badge>
            <h1 className="text-4xl font-bold leading-tight text-[#06142A] sm:text-5xl lg:text-6xl">
              Kliniğiniz için doğru başlangıcı seçin.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[#475569]">
              Asistan Health erken erişimde. Önce ihtiyacı anlayalım, ardından kliniğiniz için
              uygulanabilir kurulum planını netleştirelim.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative rounded-2xl border transition-shadow hover:shadow-lg ${
                  plan.highlighted ? "border-[#0B7F6F] shadow-lg shadow-[#0B7F6F]/10" : "border-[#E2E8F0]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-6 rounded-full bg-[#0B7F6F] px-4 py-1.5 text-xs font-semibold text-white">
                    Önerilen
                  </div>
                )}
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-[#0B7F6F]">{plan.eyebrow}</p>
                    <h2 className="mt-2 text-2xl font-bold text-[#06142A]">{plan.name}</h2>
                    <p className="mt-3 min-h-16 text-sm leading-relaxed text-[#64748B]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6 rounded-2xl bg-[#F8FAFC] p-5">
                    <p className="text-3xl font-bold text-[#06142A]">{plan.price}</p>
                    <p className="mt-1 text-sm text-[#64748B]">{plan.note}</p>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm text-[#475569]">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#0B7F6F]" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`mt-auto min-h-11 rounded-xl ${
                      plan.highlighted
                        ? "bg-[#0B7F6F] text-white hover:bg-[#09685C]"
                        : "border-[#CBD5E1] bg-white text-[#06142A] hover:bg-[#F8FAFC]"
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    <Link href={plan.href} aria-label={`${plan.name} için ${plan.cta}`}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-4">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#0B7F6F]" aria-hidden="true" />
                <span className="text-sm font-medium text-[#06142A]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <Badge className="mb-4 bg-[#185FA5]/10 text-[#185FA5] hover:bg-[#185FA5]/10">
              Sık sorulanlar
            </Badge>
            <h2 className="text-3xl font-bold text-[#06142A]">Karar vermeden önce bilmeniz gerekenler.</h2>
            <p className="mt-4 leading-relaxed text-[#64748B]">
              Erken erişim süreci, ürünün kliniğinizde nasıl kullanılacağını anlamak için birlikte
              ilerleyen kısa bir keşif adımıyla başlar.
            </p>
            <Button asChild className="mt-8 min-h-11 rounded-xl bg-[#0B7F6F] text-white hover:bg-[#09685C]">
              <Link href="/auth/sign-up" aria-label="Asistan Health için erken erişim başvurusu yap">
                Başvuru Yap
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question} className="rounded-2xl border-[#E2E8F0]">
                <CardContent className="flex gap-4 p-6">
                  <HelpCircle className="mt-1 h-5 w-5 shrink-0 text-[#0B7F6F]" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-[#06142A]">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{faq.answer}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl bg-[#06142A] p-8 text-white md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Sparkles className="mb-5 h-8 w-8 text-[#0B7F6F]" aria-hidden="true" />
              <h2 className="text-3xl font-bold">Kliniğiniz için uygun mu, birlikte görelim.</h2>
              <p className="mt-4 max-w-2xl text-white/75">
                Kısa bir görüşmede hasta, randevu ve ekip akışınızı anlayıp en doğru başlangıcı önerelim.
              </p>
            </div>
            <Button asChild className="min-h-11 rounded-xl bg-white text-[#06142A] hover:bg-white/90">
              <Link href="/auth/sign-up" aria-label="Asistan Health demo talep et">
                Demo Talep Et
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
