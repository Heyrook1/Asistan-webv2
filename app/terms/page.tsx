import type { Metadata } from 'next'
import Link from 'next/link'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import {
  LegalCta,
  LegalDocumentBody,
  LegalHero,
  LegalP,
  LegalUl,
  type LegalSection,
} from '@/components/marketing/legal-document'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/terms', {
  title: 'Kullanım Koşulları',
  description:
    'Asistan Health kullanım koşulları: hesap, abonelik, sorumluluklar, kabul edilemez kullanım ve fesih hükümleri.',
})

const EFFECTIVE_DATE = '13 Temmuz 2026'

const sections: LegalSection[] = [
  {
    id: 'taraflar',
    title: 'Taraflar ve kabul',
    content: (
      <>
        <LegalP>
          Bu Kullanım Koşulları (“Koşullar”), Asistan Health (“Asistan”, “biz”) ile platformu kullanan
          gerçek veya tüzel kişi (“Kullanıcı”, “siz”, “İşletme”) arasındaki sözleşmeyi oluşturur.
        </LegalP>
        <LegalP>
          Siteyi ziyaret etmeniz, hesap oluşturmanız veya panele giriş yapmanız bu Koşulları ve{' '}
          <Link href="/privacy" className="font-semibold text-brand-blue underline-offset-2 hover:underline">
            Gizlilik Politikası
          </Link>
          ’nı kabul ettiğiniz anlamına gelir. Kabul etmiyorsanız hizmeti kullanmayınız.
        </LegalP>
        <LegalP>
          Kuruma özel yazılı sözleşme, sipariş formu veya veri işleme sözleşmesi (DPA) varsa; çelişki
          halinde o belgelerdeki özel hükümler önceliklidir.
        </LegalP>
      </>
    ),
  },
  {
    id: 'tanimlar',
    title: 'Tanımlar',
    content: (
      <LegalUl
        items={[
          <><strong>Platform:</strong> kktc.asistan.online ve ilişkili web / mobil arayüzler</>,
          <><strong>Klinik Paneli:</strong> randevu, hasta, ekip ve operasyon yönetimi arayüzü</>,
          <><strong>Hasta / Client Arayüzü:</strong> randevu keşfi ve rezervasyon deneyimi</>,
          <><strong>İçerik:</strong> panele girilen veya yüklenen her türlü veri, metin, dosya ve kayıt</>,
          <><strong>Abonelik:</strong> seçilen plan kapsamında sunulan ücretli veya deneme erişimi</>,
        ]}
      />
    ),
  },
  {
    id: 'hizmet',
    title: 'Hizmetin kapsamı',
    content: (
      <>
        <LegalP>
          Asistan; kliniklerin randevu yönetimi, hasta takibi, ekip yetkilendirme, bildirim ve ilişkili
          operasyon süreçlerini dijitalleştirmesine yardımcı olan bir yazılım hizmetidir (SaaS).
        </LegalP>
        <LegalP>
          Asistan bir sağlık kuruluşu, teşhis aracı veya tıbbi cihaz değildir; hekimlik / diş hekimliği /
          tedavi kararı vermez. Tıbbi uygulamadan doğan sorumluluk ilgili sağlık profesyoneline ve
          kliniğe aittir.
        </LegalP>
        <LegalP>
          Özellik seti plana, bölgeye (KKTC odaklı kurulum) ve ürün yol haritasına göre değişebilir.
          “Yakında”, “yol haritası” veya erken erişim olarak işaretlenen özellikler tamamlanmış hizmet
          sayılmaz ve ücretli pakete otomatik dahil değildir.
        </LegalP>
        <LegalP>Açıkça yol haritasında tutulan ve bugün satışa dahil olmayan örnekler:</LegalP>
        <LegalUl
          items={[
            <>Kart / online ödeme tahsilatı (elden / faturalı yenileme modeli geçerlidir)</>,
            <>App Store / Google Play mağaza yayını (bekleyen listede)</>,
            <>SMS / WhatsApp hatırlatma kanalı kurulumu (panel ve e-posta odaklıdır)</>,
            <>Kuruma özel entegrasyonlar (ayrı kapsam ve sözleşme gerektirir)</>,
          ]}
        />
      </>
    ),
  },
  {
    id: 'veri-isleme',
    title: 'Veri işleme (klinik B2B)',
    content: (
      <>
        <LegalP>
          Klinik hasta ve operasyon verilerinde kural olarak klinik veri sorumlusudur; Asistan veri
          işleyen olarak hizmet verir. Kurumsal satışlarda veri işleme koşulları{' '}
          <Link href="/privacy" className="font-semibold text-brand-blue underline-offset-2 hover:underline">
            Gizlilik Politikası
          </Link>
          {' '}ve talep halinde ayrı veri işleme sözleşmesi (DPA) ile tamamlanır.
        </LegalP>
        <LegalP>
          Güven mimarisi özeti için{' '}
          <Link href="/guven" className="font-semibold text-brand-blue underline-offset-2 hover:underline">
            Güven Merkezi
          </Link>
          ’ne bakınız. Demo / deneme hesaplarında gerçek hasta verisi yüklenmemesini öneririz.
        </LegalP>
      </>
    ),
  },
  {
    id: 'hesap',
    title: 'Hesap, yetki ve güvenlik',
    content: (
      <>
        <LegalUl
          items={[
            <>Doğru, güncel ve eksiksiz kayıt bilgisi vermekle yükümlüsünüz.</>,
            <>Hesap giriş bilgilerinizi gizli tutmak sizin sorumluluğunuzdadır.</>,
            <>İşletme sahibi; ekip üyelerinin rollerini ve izinlerini doğru atamakla yükümlüdür.</>,
            <>Yetkisiz erişim şüphesinde derhal bizi bilgilendirmelisiniz.</>,
            <>Asistan, güvenlik ihlali veya kötüye kullanım şüphesinde hesabı askıya alabilir.</>,
          ]}
        />
        <LegalP>
          Panel yalnızca yetkili ekip üyeleri tarafından kullanılmalıdır. Paylaşılan hesaplar ve zayıf
          parola uygulamaları güvenlik riski oluşturur ve sözleşme ihlali sayılabilir.
        </LegalP>
      </>
    ),
  },
  {
    id: 'abonelik',
    title: 'Abonelik, deneme ve ücretler',
    content: (
      <>
        <LegalP>
          Ücretli planlar, deneme süreleri ve paket limitleri{' '}
          <Link href="/fiyatlandirma" className="font-semibold text-brand-blue underline-offset-2 hover:underline">
            Fiyatlandırma
          </Link>{' '}
          sayfasında ve/veya size özel teklifte belirtilir. Paket süresi dolduğunda erişim kısıtlanabilir.
        </LegalP>
        <LegalP>
          Ödeme altyapısı bağlandığında faturalandırma, yenileme ve iptal koşulları ilgili ödeme
          sağlayıcısı ve yazılı sözleşme hükümlerine tabidir. Ücret iadesi, aksi yazılı kararlaştırılmadıkça
          yapılmaz.
        </LegalP>
      </>
    ),
  },
  {
    id: 'kullanici-yukumlulukleri',
    title: 'Kullanıcı yükümlülükleri',
    content: (
      <LegalUl
        items={[
          <>Mevzuata, mesleki etik kurallara ve hasta gizliliğine uygun hareket etmek</>,
          <>Yalnızca yetkili olduğunuz hasta ve işletme verilerini işlemek</>,
          <>Platformu üçüncü kişilerin haklarını ihlal edecek şekilde kullanmamak</>,
          <>Zararlı yazılım, otomasyon saldırısı, tersine mühendislik veya servis kesintisi girişimlerinde bulunmamak</>,
          <>Asistan markasını, arayüzünü veya içeriklerini izinsiz kopyalamamak</>,
          <>Hasta rızası / aydınlatma yükümlülüklerini (veri sorumlusu sıfatıyla) klinik olarak yerine getirmek</>,
        ]}
      />
    ),
  },
  {
    id: 'yasaklar',
    title: 'Kabul edilemez kullanım',
    content: (
      <LegalUl
        items={[
          <>Yasadışı, yanıltıcı veya dolandırıcılık amaçlı kullanım</>,
          <>Başkasına ait hesap veya verilere yetkisiz erişim</>,
          <>Spam, izinsiz ticari iletişim veya toplu kötüye kullanım</>,
          <>Sistem güvenlik testlerini izinsiz veya yıkıcı biçimde yürütmek</>,
          <>Sahte klinik, sahte hekim profili veya doğrulanmamış kimlik bilgisi oluşturmak</>,
          <>Hasta verilerini platform dışına yetkisiz aktarmak veya satmak</>,
        ]}
      />
    ),
  },
  {
    id: 'icerik',
    title: 'İçerik ve hasta verisi',
    content: (
      <>
        <LegalP>
          Panele yüklediğiniz veya girdiğiniz İçerik üzerinde (kişisel veriler ve üçüncü kişi hakları
          saklı kalmak kaydıyla) gerekli haklara sahip olduğunuzu beyan edersiniz.
        </LegalP>
        <LegalP>
          Klinik hasta verileri bakımından İşletme kural olarak veri sorumlusudur; Asistan veri işleyen
          olarak hizmet sunar. Ayrıntılar{' '}
          <Link href="/privacy" className="font-semibold text-brand-blue underline-offset-2 hover:underline">
            Gizlilik Politikası
          </Link>
          ’ndadır.
        </LegalP>
        <LegalP>
          Yasal zorunluluk, güvenlik veya hizmet ifası için gerekli olmadığı sürece İçeriğinizi üçüncü
          kişilere satmayız.
        </LegalP>
      </>
    ),
  },
  {
    id: 'fikri-mulkiyet',
    title: 'Fikri mülkiyet',
    content: (
      <LegalP>
        Platform yazılımı, tasarımı, metinleri, logoları ve markaları Asistan’a veya lisansverenlerine
        aittir. Bu Koşullar size mülkiyet hakkı vermez; yalnızca aboneliğiniz süresince sınırlı,
        devredilemez, geri alınabilir bir kullanım hakkı tanır.
      </LegalP>
    ),
  },
  {
    id: 'ucuncu-taraflar',
    title: 'Üçüncü taraf hizmetler',
    content: (
      <LegalP>
        Kimlik doğrulama, barındırma, e-posta iletimi, analitik veya bildirim gibi üçüncü taraf
        hizmetler kullanılabilir. Bu hizmetlerin kendi koşulları uygulanabilir; Asistan, üçüncü
        tarafların bağımsız eylemlerinden doğan sonuçlardan, kanunen zorunlu olduğu ölçüde dışında,
        sorumlu tutulamaz.
      </LegalP>
    ),
  },
  {
    id: 'garanti',
    title: 'Garanti reddi',
    content: (
      <LegalP>
        Platform “olduğu gibi” ve “mevcut olduğu sürece” sunulur. Kesintisiz, hatasız veya belirli bir
        amaca tamamen uygun çalışma konusunda, kanunen zorunlu garantiler dışında açık veya zımni
        garanti verilmez. Erken erişim / beta özellikler ek risk içerebilir.
      </LegalP>
    ),
  },
  {
    id: 'sorumluluk',
    title: 'Sorumluluğun sınırlandırılması',
    content: (
      <>
        <LegalP>
          Kanunen izin verilen azami ölçüde Asistan; dolaylı, arızi, özel, sonuçsal zararlar,
          kâr kaybı, veri kaybı veya iş kesintisinden sorumlu değildir.
        </LegalP>
        <LegalP>
          Asistan’ın bu Koşullardan doğan toplam sorumluluğu, olaydan önceki üç (3) ay içinde ilgili
          abonelik için ödediğiniz ücretlerle sınırlıdır (ücretsiz kullanımda yasal zorunlu asgari
          tutarla sınırlıdır). Bu sınır, Asistan’ın ağır kusuru veya kanunen sınırlanamayan
          sorumlulukları için geçerli olmayabilir.
        </LegalP>
        <LegalP>
          Klinik kararlar, hasta sonuçları, personel hataları ve İşletmenin veri sorumlusu
          yükümlülüklerinden Asistan sorumlu değildir.
        </LegalP>
      </>
    ),
  },
  {
    id: 'tazmin',
    title: 'Tazmin',
    content: (
      <LegalP>
        Bu Koşulların ihlali, İçeriğiniz veya platformu kullanımınızdan kaynaklanan üçüncü kişi
        taleplerine karşı Asistan’ı, yöneticilerini ve çalışanlarını savunmayı, tazmin etmeyi ve
        zararsız tutmayı kabul edersiniz (kanunen izin verilen ölçüde).
      </LegalP>
    ),
  },
  {
    id: 'fesih',
    title: 'Askıya alma ve fesih',
    content: (
      <>
        <LegalP>
          Koşulların ihlali, yasal risk, güvenlik tehdidi veya ödeme temerrüdü halinde erişiminiz
          askıya alınabilir veya sonlandırılabilir.
        </LegalP>
        <LegalP>
          Hesabınızı kapatmak veya veri dışa aktarımı / silme talebi için{' '}
          <a href="mailto:merhaba@asistan.online" className="font-semibold text-brand-blue underline-offset-2 hover:underline">
            merhaba@asistan.online
          </a>{' '}
          adresine başvurabilirsiniz. Yasal saklama zorunlulukları saklıdır.
        </LegalP>
      </>
    ),
  },
  {
    id: 'degisiklik',
    title: 'Koşullarda değişiklik',
    content: (
      <LegalP>
        Koşullar güncellenebilir. Güncel metin bu sayfada yayımlanır. Önemli değişikliklerde makul
        bildirim yapılabilir. Değişikliklerden sonra hizmeti kullanmaya devam etmeniz güncel
        Koşulları kabul ettiğiniz anlamına gelir.
      </LegalP>
    ),
  },
  {
    id: 'hukuk',
    title: 'Uygulanacak hukuk ve uyuşmazlık',
    content: (
      <LegalP>
        Bu Koşullar, zorunlu tüketici / kamu düzeni hükümleri saklı kalmak kaydıyla, KKTC hukukuna
        tabidir. Uyuşmazlıklarda öncelikle iyi niyetli müzakere; sonuç alınamazsa KKTC mahkemeleri /
        yetkili merciler yetkilidir. Tüketici haklarına ilişkin zorunlu kurallar saklıdır.
      </LegalP>
    ),
  },
  {
    id: 'iletisim',
    title: 'İletişim',
    content: (
      <LegalUl
        items={[
          <>Genel: <a href="mailto:merhaba@asistan.online" className="font-semibold text-brand-blue underline-offset-2 hover:underline">merhaba@asistan.online</a></>,
          <><Link href="/contact" className="font-semibold text-brand-blue underline-offset-2 hover:underline">İletişim formu</Link></>,
          <><Link href="/privacy" className="font-semibold text-brand-blue underline-offset-2 hover:underline">Gizlilik Politikası</Link></>,
          <><Link href="/guven" className="font-semibold text-brand-blue underline-offset-2 hover:underline">Güven Merkezi</Link></>,
        ]}
      />
    ),
  },
]

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <LegalHero
        badge="Kullanım Koşulları"
        title="Asistan Health Kullanım Koşulları"
        effectiveDate={EFFECTIVE_DATE}
        summary={
          <>
            Platformu kullanmadan önce hesap, abonelik, kabul edilemez kullanım, sorumluluk
            sınırları ve fesih hükümlerini okuyunuz. Gizlilik detayları için{' '}
            <Link href="/privacy" className="font-semibold text-brand-blue underline-offset-2 hover:underline">
              Gizlilik Politikası
            </Link>
            ’na bakınız.
          </>
        }
      />
      <LegalDocumentBody sections={sections} />
      <LegalCta
        title="Kuruma özel sözleşme mi gerekiyor?"
        description="Onboarding öncesi hizmet kapsamı, SLA ve veri işleme sözleşmesini birlikte netleştirebiliriz."
        actionHref="/contact"
        actionLabel="İletişime geç"
      />
    </MarketingPageShell>
  )
}
