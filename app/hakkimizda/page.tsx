import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Building2, HeartHandshake, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react"

import { Footer } from "@/components/marketing/footer"
import { Navbar } from "@/components/marketing/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Asistan, KKTC'deki klinikler ve hizmet işletmeleri için geliştirilen AI destekli iş yönetim platformudur.",
}

const principles = [
  {
    icon: MapPin,
    title: "Yerel ihtiyaç",
    description: "Ürün kararlarını KKTC'deki işletmelerin gerçek operasyon sorunlarına göre şekillendiriyoruz.",
  },
  {
    icon: HeartHandshake,
    title: "Sade kullanım",
    description: "Teknik bilgi gerektirmeyen, sekreter ve yönetici ekiplerinin hızlı kavrayacağı akışlar tasarlıyoruz.",
  },
  {
    icon: ShieldCheck,
    title: "Gizlilik odağı",
    description: "Hasta ve müşteri bilgisinin hassasiyetini ürün deneyiminin merkezinde tutuyoruz.",
  },
  {
    icon: Building2,
    title: "Sektörel odak",
    description: "Önce sağlık, ardından güzellik, hukuk ve emlak gibi dikeylerde net çözümler geliştiriyoruz.",
  },
]

const roadmap = [
  {
    status: "Aktif odak",
    title: "Asistan Health",
    description: "Klinikler için randevu, hasta takibi, hatırlatma ve ekip rolleri.",
  },
  {
    status: "Sırada",
    title: "Beauty",
    description: "Güzellik merkezleri ve salonlar için müşteri ve randevu akışları.",
  },
  {
    status: "Planlanıyor",
    title: "Hukuk ve Emlak",
    description: "Danışan, dosya, portföy ve görüşme takibi için sektörlere özel sürümler.",
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-[#F8FAFC] pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <Badge className="mb-6 bg-[#0B7F6F]/10 text-[#0B7F6F] hover:bg-[#0B7F6F]/10">
                Hakkımızda
              </Badge>
              <h1 className="text-4xl font-bold leading-tight text-[#06142A] sm:text-5xl lg:text-6xl">
                KKTC'den başlayan iş yönetimi platformu.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#475569]">
                Asistan, küçük ve orta ölçekli işletmelerin randevu, müşteri, hasta ve ekip
                yönetimini tek panelde toplamak için geliştiriliyor. İlk odağımız Asistan Health.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="min-h-11 rounded-xl bg-[#0B7F6F] text-white hover:bg-[#09685C]">
                  <Link href="/auth/sign-up" aria-label="Asistan erken erişim başvurusu yap">
                    Erken Erişime Katıl
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="min-h-11 rounded-xl border-[#CBD5E1] text-[#06142A]">
                  <Link href="/cozumler/health" aria-label="Asistan Health çözümünü incele">
                    Health'i İncele
                  </Link>
                </Button>
              </div>
            </div>

            <Card className="rounded-3xl border-[#E2E8F0] bg-white shadow-xl shadow-slate-200/60">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B7F6F]/10">
                  <Sparkles className="h-7 w-7 text-[#0B7F6F]" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-[#06142A]">Neden buradan başlıyoruz?</h2>
                <p className="mt-4 leading-relaxed text-[#64748B]">
                  KKTC'deki birçok işletme randevu ve müşteri takibini hâlâ dağınık mesajlar,
                  notlar ve tablolarla yürütüyor. Asistan, bu günlük yükü daha görünür ve yönetilir
                  hale getirmek için tasarlanıyor.
                </p>
                <div className="mt-6 rounded-2xl bg-[#F8FAFC] p-5">
                  <p className="text-sm font-semibold text-[#06142A]">İlk sektör</p>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Sağlık ekipleri: doktorlar, klinik yöneticileri ve sekreterler.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Badge className="mb-4 bg-[#185FA5]/10 text-[#185FA5] hover:bg-[#185FA5]/10">
              Yaklaşımımız
            </Badge>
            <h2 className="text-3xl font-bold text-[#06142A]">Ürünü sahadaki iş akışına göre kuruyoruz.</h2>
            <p className="mt-4 leading-relaxed text-[#64748B]">
              Amaç, işletmeyi daha karmaşık bir sisteme taşımak değil; zaten yapılan işleri daha
              düzenli, takip edilebilir ve güvenli hale getirmek.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle) => (
              <Card key={principle.title} className="rounded-2xl border-[#E2E8F0]">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B7F6F]/10">
                    <principle.icon className="h-6 w-6 text-[#0B7F6F]" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#06142A]">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#64748B]">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <Badge className="mb-4 bg-[#0B7F6F]/10 text-[#0B7F6F] hover:bg-[#0B7F6F]/10">
                Yol haritası
              </Badge>
              <h2 className="text-3xl font-bold text-[#06142A]">Önce sağlık, sonra diğer hizmet sektörleri.</h2>
              <p className="mt-4 leading-relaxed text-[#64748B]">
                Asistan tek bir genel araç olmak yerine, her sektörün diline ve günlük akışına göre
                ayrı çözümler sunmayı hedefler.
              </p>
            </div>

            <div className="space-y-4">
              {roadmap.map((item) => (
                <Card key={item.title} className="rounded-2xl border-[#E2E8F0] bg-white">
                  <CardContent className="flex gap-4 p-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B7F6F]/10">
                      <Users className="h-5 w-5 text-[#0B7F6F]" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#0B7F6F]">
                        {item.status}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-[#06142A]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl bg-[#06142A] p-8 text-white md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-bold">Asistan Health'i kliniğinizde deneyin.</h2>
              <p className="mt-4 max-w-2xl text-white/75">
                İlk görüşmede mevcut randevu ve hasta takip akışınızı anlayıp en doğru başlangıcı önerelim.
              </p>
            </div>
            <Button asChild className="min-h-11 rounded-xl bg-white text-[#06142A] hover:bg-white/90">
              <Link href="/auth/sign-up" aria-label="Asistan Health için erken erişim başvurusu yap">
                Erken Erişime Katıl
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
