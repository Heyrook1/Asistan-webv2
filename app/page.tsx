import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  CheckCircle2, 
  Smartphone,
  BarChart3,
  Bell,
  Shield,
  Zap
} from 'lucide-react'

const facilities = [
  {
    icon: Calendar,
    title: 'Akıllı Randevu Yönetimi',
    description: 'Müşterilerinizin online randevu almasını sağlayın. Otomatik hatırlatmalar ve takvim senkronizasyonu ile randevularınızı kolayca yönetin.',
  },
  {
    icon: Users,
    title: 'Müşteri Yönetimi',
    description: 'Müşteri bilgilerini, geçmiş randevuları ve tercihlerini tek bir yerden takip edin. Kişiselleştirilmiş hizmet sunun.',
  },
  {
    icon: Clock,
    title: 'Çalışma Saatleri',
    description: 'Haftalık çalışma programınızı kolayca ayarlayın. Tatil günleri ve özel durumlar için takvim bloklama özelliği.',
  },
  {
    icon: BarChart3,
    title: 'Detaylı Analitik',
    description: 'İşletmenizin performansını gerçek zamanlı olarak takip edin. Gelir, randevu ve müşteri istatistikleri.',
  },
  {
    icon: Bell,
    title: 'Bildirimler',
    description: 'Yeni randevular, iptal ve değişiklikler için anlık bildirimler alın. Hiçbir şeyi kaçırmayın.',
  },
  {
    icon: Smartphone,
    title: 'Mobil Uygulama',
    description: 'Müşterileriniz mobil uygulama üzerinden kolayca randevu alabilir. Her yerden erişim imkanı.',
  },
]

const pricingPlans = [
  {
    name: 'Başlangıç',
    price: '199',
    period: '/ay',
    description: 'Bireysel hizmet sağlayıcılar için ideal',
    features: [
      'Aylık 50 randevu',
      '1 kullanıcı',
      'Temel raporlama',
      'E-posta desteği',
      'Mobil uygulama erişimi',
    ],
    highlighted: false,
  },
  {
    name: 'Profesyonel',
    price: '499',
    period: '/ay',
    description: 'Büyüyen işletmeler için en popüler seçim',
    features: [
      'Sınırsız randevu',
      '5 kullanıcı',
      'Gelişmiş analitik',
      'Öncelikli destek',
      'Mobil uygulama erişimi',
      'SMS bildirimleri',
      'Özel marka renkleri',
    ],
    highlighted: true,
  },
  {
    name: 'Kurumsal',
    price: '999',
    period: '/ay',
    description: 'Büyük işletmeler ve zincirler için',
    features: [
      'Sınırsız randevu',
      'Sınırsız kullanıcı',
      'Özel raporlar',
      '7/24 telefon desteği',
      'Mobil uygulama erişimi',
      'SMS bildirimleri',
      'API erişimi',
      'Özel entegrasyonlar',
    ],
    highlighted: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/asistan-icon.png"
              alt="Asistan"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-foreground">asistan</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="#facilities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Özellikler
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Fiyatlandırma
            </Link>
            <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              İletişim
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/auth/login">Giriş Yap</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Ücretsiz Dene</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            {/* Logo Icon */}
            <div className="mb-8 animate-fade-in">
              <Image
                src="/images/asistan-icon.png"
                alt="Asistan Logo"
                width={120}
                height={120}
                className="h-28 w-auto md:h-32"
                priority
              />
            </div>
            
            {/* Full Logo with Slogan */}
            <div className="mb-8">
              <Image
                src="/images/asistan-full-logo.png"
                alt="Asistan - İşini Yöneten Akıllı Asistan"
                width={500}
                height={150}
                className="h-auto w-full max-w-md md:max-w-lg"
                priority
              />
            </div>

            <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Randevu yönetimini otomatikleştirin, müşterilerinize mükemmel deneyim sunun ve işinizi büyütün. 
              Türkiye&apos;nin en akıllı randevu ve hizmet yönetim platformu.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild className="h-12 px-8 text-base">
                <Link href="/auth/sign-up">
                  <Zap className="mr-2 h-5 w-5" />
                  Hemen Başla
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link href="/auth/login">
                  Giriş Yap
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>SSL Korumalı</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span>4.9/5 Kullanıcı Puanı</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>10,000+ Aktif İşletme</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="border-t bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Özellikler</Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              İşinizi Büyütecek Tüm Araçlar
            </h2>
            <p className="text-lg text-muted-foreground">
              Asistan, hizmet sağlayıcıların ihtiyaç duyduğu tüm özellikleri tek bir platformda sunar.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility, index) => (
              <Card key={index} className="group border-2 border-transparent bg-card transition-all hover:border-primary/20 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <facility.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{facility.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {facility.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Fiyatlandırma</Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              İşletmenize Uygun Plan Seçin
            </h2>
            <p className="text-lg text-muted-foreground">
              14 gün ücretsiz deneme. Kredi kartı gerekmez. İstediğiniz zaman iptal edin.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative flex flex-col ${
                  plan.highlighted 
                    ? 'border-2 border-primary shadow-lg scale-105' 
                    : 'border-2 border-transparent hover:border-muted-foreground/20'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">En Popüler</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}₺</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/auth/sign-up">Ücretsiz Dene</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Hemen Başlayın
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-primary-foreground/90">
            İşletmenizi dijitalleştirin ve müşterilerinize daha iyi hizmet sunun. 
            14 gün ücretsiz deneme ile risksiz başlayın.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild className="h-12 px-8 text-base">
              <Link href="/auth/sign-up">Ücretsiz Hesap Oluştur</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 border-primary-foreground/30 px-8 text-base text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/auth/login">Giriş Yap</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="mb-4 inline-block">
                <Image
                  src="/images/asistan-full-logo.png"
                  alt="Asistan"
                  width={200}
                  height={60}
                  className="h-12 w-auto"
                />
              </Link>
              <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                Türkiye&apos;nin lider randevu ve hizmet yönetim platformu. 
                İşletmenizi büyütmek için ihtiyacınız olan tüm araçlar tek bir yerde.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Ürün</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#facilities" className="hover:text-foreground transition-colors">Özellikler</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Fiyatlandırma</Link></li>
                <li><Link href="/auth/sign-up" className="hover:text-foreground transition-colors">Ücretsiz Dene</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Destek</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Yardım Merkezi</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">İletişim</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Gizlilik Politikası</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Asistan. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
