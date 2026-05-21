import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpen, CalendarCheck, Clock, FileText, MessageSquare, Shield } from "lucide-react"

import { Footer } from "@/components/marketing/footer"
import { Navbar } from "@/components/marketing/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export const metadata: Metadata = {
  title: "Kaynaklar",
  description:
    "Klinikler için randevu yönetimi, hasta iletişimi ve ekip takibi hakkında pratik Asistan rehberleri.",
}

const guides = [
  {
    type: "Rehber",
    icon: CalendarCheck,
    title: "Kliniklerde randevu takibini düzenlemenin yolları",
    description: "Takvim, hatırlatma ve takip sorumluluğunu daha net bir akışa yerleştirin.",
    time: "6 dk okuma",
  },
  {
    type: "Hasta iletişimi",
    icon: MessageSquare,
    title: "Hasta hatırlatmaları neden önemlidir?",
    description: "Gelmeyen randevuları azaltmak için hatırlatma dilini ve zamanlamayı planlayın.",
    time: "5 dk okuma",
  },
  {
    type: "Ekip",
    icon: BookOpen,
    title: "Sekreter ve doktor takvimini aynı panelden yönetmek",
    description: "Rol bazlı görünümle ekip içi karışıklığı azaltan temel kullanım senaryoları.",
    time: "7 dk okuma",
  },
  {
    type: "Gizlilik",
    icon: Shield,
    title: "Kliniklerde veri gizliliği için temel alışkanlıklar",
    description: "Hasta bilgisi, yetki ve erişim süreçlerinde dikkat edilmesi gereken noktalar.",
    time: "4 dk okuma",
  },
  {
    type: "Operasyon",
    icon: Clock,
    title: "Gelmeyen randevuları azaltmak için takip akışı",
    description: "Randevu öncesi ve sonrası yapılacak küçük kontrollerle takibi güçlendirin.",
    time: "6 dk okuma",
  },
  {
    type: "Ürün notları",
    icon: FileText,
    title: "Asistan Health ürün notları",
    description: "Erken erişim döneminde öncelik verilen sağlık sektörü ihtiyaçlarını takip edin.",
    time: "3 dk okuma",
  },
]

const topics = ["Randevu yönetimi", "Hasta iletişimi", "Ekip takibi", "Veri gizliliği"]

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-[#F8FAFC] pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <Badge className="mb-6 bg-[#0B7F6F]/10 text-[#0B7F6F] hover:bg-[#0B7F6F]/10">
                Kaynaklar
              </Badge>
              <h1 className="text-4xl font-bold leading-tight text-[#06142A] sm:text-5xl lg:text-6xl">
                Klinik yönetimi için sade rehberler.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#475569]">
                Randevu takibi, hasta iletişimi ve ekip düzeni hakkında kısa, uygulanabilir ve
                sağlık ekiplerinin günlük diline yakın içerikler.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {topics.map((topic) => (
                  <span key={topic} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#475569]">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <Card className="rounded-3xl border-[#E2E8F0] bg-white shadow-xl shadow-slate-200/60">
              <CardContent className="p-6 md:p-8">
                <p className="text-sm font-semibold text-[#0B7F6F]">Öne çıkan rehber</p>
                <h2 className="mt-3 text-2xl font-bold text-[#06142A]">
                  Excel ve WhatsApp ile randevu takibi nerede zorlaşır?
                </h2>
                <p className="mt-4 leading-relaxed text-[#64748B]">
                  Randevu değişiklikleri, hasta hatırlatmaları ve ekip içi bilgi paylaşımı aynı
                  anda büyüdüğünde operasyon dağılmaya başlar. Bu rehber, ilk düzenleme adımlarını
                  gösterir.
                </p>
                <Button asChild className="mt-6 min-h-11 rounded-xl bg-[#0B7F6F] text-white hover:bg-[#09685C]">
                  <Link href="/auth/sign-up" aria-label="Öne çıkan rehber hakkında demo talep et">
                    Demo Talep Et
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#06142A]">Son içerikler</h2>
              <p className="mt-3 max-w-2xl text-[#64748B]">
                Erken erişim döneminde özellikle klinik operasyonlarına odaklanan içerikler.
              </p>
            </div>
            <Button asChild variant="outline" className="min-h-11 rounded-xl border-[#CBD5E1] text-[#06142A]">
              <Link href="/cozumler/health" aria-label="Asistan Health çözümünü incele">
                Health Çözümünü İncele
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Card
                key={guide.title}
                className="rounded-2xl border-[#E2E8F0] transition-all hover:border-[#0B7F6F]/40 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B7F6F]/10">
                      <guide.icon className="h-5 w-5 text-[#0B7F6F]" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#0B7F6F]">
                      {guide.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold leading-snug text-[#06142A]">{guide.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#64748B]">{guide.description}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {guide.time}
                    </span>
                    <span className="inline-flex items-center text-sm font-semibold text-[#0B7F6F]">
                      Oku
                      <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Badge className="mb-5 bg-[#185FA5]/10 text-[#185FA5] hover:bg-[#185FA5]/10">
            E-posta listesi
          </Badge>
          <h2 className="text-3xl font-bold text-[#06142A]">Yeni rehberleri kaçırmayın.</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[#64748B]">
            Asistan Health ürün notları ve klinik operasyon rehberleri hazır oldukça e-posta ile
            paylaşalım.
          </p>
          <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="email">
              E-posta adresi
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="E-posta adresiniz"
              className="min-h-11 rounded-xl border-[#CBD5E1]"
              autoComplete="email"
            />
            <Button className="min-h-11 rounded-xl bg-[#0B7F6F] text-white hover:bg-[#09685C]">
              Haberdar Ol
            </Button>
          </form>
          <p className="mt-3 text-xs text-[#94A3B8]">Sadece ürün ve rehber duyuruları gönderilir.</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
