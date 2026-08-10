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

export const metadata: Metadata = withCanonical('/privacy', {
  title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni',
  description:
    'Asistan Health gizlilik politikası: kişisel verilerin işlenmesi, KVKK hakları, saklama süreleri, güvenlik ve başvuru kanalları.',
})

const EFFECTIVE_DATE = '13 Temmuz 2026'

const sections: LegalSection[] = [
  {
    id: 'giris',
    title: 'Giriş ve kapsam',
    content: (
      <>
        <LegalP>
          Bu Gizlilik Politikası ve Kişisel Verilerin Korunması Aydınlatma Metni (“Politika”),
          Asistan Health (“Asistan”, “biz”, “platform”) tarafından işletilen{' '}
          <Link href="https://kktc.asistan.online" className="font-semibold text-brand-blue underline-offset-2 hover:underline">
            kktc.asistan.online
          </Link>{' '}
          web sitesi, klinik yönetim paneli, hasta (client) arayüzü ve ilişkili mobil uygulamalar
          üzerinden işlenen kişisel verilere ilişkindir.
        </LegalP>
        <LegalP>
          Politika; Türkiye Cumhuriyeti 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”)
          ile KKTC’de geçerli kişisel veri koruma kurallarının temel ilkeleri gözetilerek
          hazırlanmıştır. Kuruma özel sözleşmeler, veri işleme sözleşmeleri (DPA) ve onboarding
          kapsamında paylaşılan ek metinler bu Politikaya ek hükümler getirebilir.
        </LegalP>
        <LegalP>
          Tıbbi teşhis, tedavi kararı veya hekimlik faaliyeti Asistan tarafından yürütülmez.
          Klinik kayıtlarındaki tıbbi içerikten ilgili sağlık kuruluşu ve yetkili sağlık personeli
          sorumludur.
        </LegalP>
      </>
    ),
  },
  {
    id: 'veri-sorumlusu',
    title: 'Veri sorumlusu, veri işleyen ve iletişim',
    content: (
      <>
        <LegalP>
          <strong>Platform hesapları, pazarlama, destek ve site kullanım verileri</strong> bakımından
          Asistan Health veri sorumlusudur.
        </LegalP>
        <LegalP>
          <strong>Klinik hasta kayıtları, randevular, reçete ve klinik operasyon verileri</strong>{' '}
          bakımından kural olarak ilgili klinik / işletme veri sorumlusudur; Asistan, bu verileri
          klinik adına ve klinik talimatları doğrultusunda işleyen <strong>veri işleyen</strong>{' '}
          konumundadır (SaaS altyapı sağlayıcısı).
        </LegalP>
        <LegalP>
          Kurumsal satış ve onboarding süreçlerinde, talep üzerine yazılı veri işleme sözleşmesi (DPA),
          alt işlemci listesi ve güvenlik özeti paylaşılabilir. Demo / satış görüşmelerinde paylaşılan
          iletişim bilgileri yalnızca teklif, destek ve sözleşme süreçleri için işlenir.
        </LegalP>
        <LegalP>Başvuru ve iletişim:</LegalP>
        <LegalUl
          items={[
            <>E-posta: <a href="mailto:merhaba@asistan.online" className="font-semibold text-brand-blue underline-offset-2 hover:underline">merhaba@asistan.online</a></>,
            <>Konu satırı önerisi: “KVKK / Gizlilik Başvurusu”</>,
            <>Güven mimarisi özeti: <Link href="/guven" className="font-semibold text-brand-blue underline-offset-2 hover:underline">Güven Merkezi</Link></>,
          ]}
        />
      </>
    ),
  },
  {
    id: 'veri-kategorileri',
    title: 'İşlenen kişisel veri kategorileri',
    content: (
      <>
        <LegalP>Hizmetin niteliğine göre aşağıdaki kategoriler işlenebilir:</LegalP>
        <LegalUl
          items={[
            <>Kimlik ve iletişim: ad-soyad, e-posta, telefon; KKTC / TC kimlik veya pasaport numarası yalnızca klinik politikası veya açıkça gerekli hallerde (varsayılan randevu formunda zorunlu değildir)</>,
            <>Hesap ve yetki: kullanıcı kimliği, rol, izinler, oturum ve güvenlik olayları</>,
            <>Klinik operasyon: hasta kartı, randevu, hizmet, ekip, mesajlaşma, hatırlatma tercihleri</>,
            <>Sağlıkla ilişkili veriler: klinik tarafından girilen anamnez, not, reçete ve dosya içerikleri (özel nitelikli kişisel veri)</>,
            <>Ödeme / üyelik (varsa): plan, abonelik durumu, fatura iletişim bilgisi — kart verisi saklanıyorsa ödeme sağlayıcısı üzerinden</>,
            <>Teknik veriler: IP, cihaz/tarayıcı bilgisi, log, çerez ve benzeri teknolojiler</>,
            <>Destek kayıtları: talep içeriği, yazışma ve çözüm notları</>,
          ]}
        />
        <LegalP>
          Asistan, klinik operasyonu için gerekli olmayan kişisel verileri toplamamaya öncelik verir
          (veri minimizasyonu).
        </LegalP>
      </>
    ),
  },
  {
    id: 'amaclar',
    title: 'İşleme amaçları',
    content: (
      <LegalUl
        items={[
          <>Hesap oluşturma, kimlik doğrulama ve yetkilendirme</>,
          <>Randevu, hasta takibi, ekip yönetimi ve klinik operasyonunun yürütülmesi</>,
          <>Panel içi bildirimler; yapılandırıldığı ölçüde e-posta / SMS / WhatsApp hatırlatmaları</>,
          <>Güvenlik, kötüye kullanım önleme, denetim izi ve olay müdahalesi</>,
          <>Sözleşme / abonelik yönetimi, destek ve müşteri iletişimi</>,
          <>Ürün iyileştirme (mümkün olduğunca toplu / anonim istatistiklerle)</>,
          <>Yasal yükümlülüklerin yerine getirilmesi ve yetkili makam taleplerinin karşılanması</>,
          <>Açık rıza bulunan hallerde bilgilendirme ve pazarlama iletişimi</>,
        ]}
      />
    ),
  },
  {
    id: 'hukuki-sebepler',
    title: 'Hukuki sebepler',
    content: (
      <>
        <LegalP>Kişisel veriler, duruma göre şu hukuki sebeplere dayanılarak işlenir:</LegalP>
        <LegalUl
          items={[
            <>Sözleşmenin kurulması veya ifası (hesap, abonelik, hizmet sunumu)</>,
            <>Kanuni yükümlülük</>,
            <>Meşru menfaat (güvenlik, dolandırıcılık önleme, hizmet sürekliliği — temel hak ve özgürlükleri ihlal etmemek kaydıyla)</>,
            <>Açık rıza (özellikle özel nitelikli veriler, pazarlama iletişimi ve isteğe bağlı kanallar)</>,
          ]}
        />
        <LegalP>
          Klinik tarafında özel nitelikli sağlık verilerinin işlenmesi; ilgili mevzuat, mesleki
          yükümlülükler ve klinik ile hasta arasındaki hukuki ilişki çerçevesinde yürütülür. Asistan,
          bu verileri yalnızca hizmetin sağlanması için gerekli teknik ve organizasyonel sınırlar
          içinde işler.
        </LegalP>
        <LegalP>
          Genel randevu formunda kimlik / pasaport numarası varsayılan olarak zorunlu değildir
          (veri minimizasyonu). Klinik bunu açıkça zorunlu kıldığında işleme dayanağı, randevu ve
          hasta dosyasının klinik tarafında yürütülmesi (sözleşmenin ifası / meşru menfaat) ile
          sınırlıdır; platform katmanında belgenin kendisi değil, tek yönlü hash tutulur.
        </LegalP>
      </>
    ),
  },
  {
    id: 'toplama',
    title: 'Toplama yöntemleri',
    content: (
      <LegalUl
        items={[
          <>Doğrudan sizden: kayıt, profil, randevu, iletişim formları, destek talepleri</>,
          <>Klinik personelinden: hasta ve randevu kayıtlarının panele girilmesi</>,
          <>Otomatik yollarla: oturum, güvenlik ve kullanım logları, çerezler</>,
          <>Hizmet sağlayıcılardan: kimlik doğrulama (ör. Supabase Auth), barındırma ve iletim altyapısı</>,
        ]}
      />
    ),
  },
  {
    id: 'saklama',
    title: 'Saklama süreleri',
    content: (
      <>
        <LegalP>
          Veriler; işleme amacının gerektirdiği süre, yasal saklama yükümlülükleri ve klinik ile
          yapılan sözleşmedeki sürelerle sınırlı tutulur. Amaç ortadan kalktığında veya talep
          üzerine (yasal istisnalar saklı kalmak kaydıyla) silme, yok etme veya anonimleştirme
          uygulanır.
        </LegalP>
        <LegalUl
          items={[
            <>Hesap ve abonelik kayıtları: sözleşme süresi + yasal zamanaşımı / muhasebe süreleri</>,
            <>Güvenlik ve denetim logları: güvenlik ve uyumluluk için makul süre</>,
            <>Klinik hasta / randevu verileri: veri sorumlusunun (klinik) talimatı ve sektörel saklama kuralları</>,
            <>
              Kimlik belgesi (KKTC / TC / pasaport): genel randevu linkinde varsayılan olarak
              toplanmaz. Klinik zorunlu kılarsa veya kullanıcı isteğe bağlı verirse, platform kimlik
              katmanında yalnızca tek yönlü (hash) değer tutulur; genel linkten hasta kartına düz
              metin yazılmaz. Hash eşleşmesi tek başına otomatik birleştirme için yeterli değildir —
              doğrulanmış sahiplik (ör. ek iletişim sinyali veya personel onayı) gerekir. Silme /
              unutulma taleplerinde hash alanı da anonimleştirilebilir (yasal saklama istisnaları
              saklıdır).
            </>,
            <>Pazarlama rızası kayıtları: rıza geri alınana veya hesap kapanana kadar</>,
          ]}
        />
        <LegalP>
          Platformdaki silme / unutulma talepleri yönetişim süreçleriyle işlenir; tamamlanan
          taleplerde kişisel alanlar anonimleştirilebilir. Ayrıntılar için{' '}
          <Link href="/guven" className="font-semibold text-brand-blue underline-offset-2 hover:underline">
            Güven Merkezi
          </Link>
          ’ne bakınız.
        </LegalP>
      </>
    ),
  },
  {
    id: 'aktarim',
    title: 'Aktarım ve alt işlemciler',
    content: (
      <>
        <LegalP>
          Hizmetin sunulması için sınırlı sayıda güvenilir hizmet sağlayıcı (barındırma, veritabanı,
          kimlik doğrulama, e-posta iletimi, hata izleme, oran sınırlama vb.) kullanılabilir. Bu
          aktarımlar sözleşmesel ve teknik güvencelerle yapılır.
        </LegalP>
        <LegalP>
          Veriler, hizmet altyapısının bulunduğu ülkelerde işlenebilir. Yurt dışı aktarım söz konusu
          olduğunda; KVKK ve ilgili mevzuattaki şartlar, uygun güvenceler ve gerektiğinde açık rıza
          mekanizmaları gözetilir.
        </LegalP>
        <LegalP>
          Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına bilgi aktarılabilir.
        </LegalP>
      </>
    ),
  },
  {
    id: 'guvenlik',
    title: 'Güvenlik önlemleri',
    content: (
      <>
        <LegalP>Asistan; yetkisiz erişim, kayıp, değiştirme ve ifşaya karşı makul teknik ve idari tedbirler uygular:</LegalP>
        <LegalUl
          items={[
            <>Kimlik doğrulama ve sunucu tarafı oturum kontrolleri</>,
            <>İşletme bazlı veri ayrımı ve rol bazlı erişim (RBAC)</>,
            <>Hassas işlemlerde denetim izi</>,
            <>İletişimde TLS ve erişim anahtarlarının sunucu tarafında tutulması</>,
            <>Oran sınırlama ve güvenlik izleme araçları (yapılandırıldığı ölçüde)</>,
          ]}
        />
        <LegalP>
          Hiçbir sistem %100 güvenlik garanti edemez. Hesap parolalarının gizliliği ve ekip
          üyelerinin yetki yönetimi klinik / kullanıcı sorumluluğundadır.
        </LegalP>
      </>
    ),
  },
  {
    id: 'haklar',
    title: 'Kişisel veri sahibi hakları',
    content: (
      <>
        <LegalP>
          KVKK’nın 11. maddesi ve ilgili mevzuat kapsamında; kişisel veri sahibi olarak aşağıdaki
          haklara sahipsiniz (kanuni istisnalar saklıdır):
        </LegalP>
        <LegalUl
          items={[
            <>Kişisel verilerinizin işlenip işlenmediğini öğrenme</>,
            <>İşlenmişse buna ilişkin bilgi talep etme</>,
            <>İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</>,
            <>Yurt içinde / yurt dışında aktarıldığı üçüncü kişileri bilme</>,
            <>Eksik veya yanlış işlenmişse düzeltilmesini isteme</>,
            <>KVKK md. 7 çerçevesinde silinmesini veya yok edilmesini isteme</>,
            <>Düzeltme / silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</>,
            <>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</>,
            <>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</>,
          ]}
        />
        <LegalP>
          Klinik hasta kaydınıza ilişkin talepleriniz için öncelikle ilgili kliniğe başvurmanız
          gerekebilir; Asistan, veri işleyen sıfatıyla klinik talimatları ve yasal çerçeve
          doğrultusunda destek sağlar.
        </LegalP>
        <LegalP>
          Başvurularınızı <a href="mailto:merhaba@asistan.online" className="font-semibold text-brand-blue underline-offset-2 hover:underline">merhaba@asistan.online</a>{' '}
          adresine iletebilirsiniz. Kimlik doğrulaması istenebilir; başvurular mevzuatta öngörülen
          sürelerde sonuçlandırılmaya çalışılır.
        </LegalP>
      </>
    ),
  },
  {
    id: 'cerezler',
    title: 'Çerezler ve benzeri teknolojiler',
    content: (
      <>
        <LegalP>
          Oturumun sürdürülmesi, güvenlik, tercihlerin hatırlanması ve (varsa) istatistik amaçlarıyla
          çerez / yerel depolama kullanılabilir. Zorunlu çerezler hizmetin çalışması için gereklidir;
          analitik veya pazarlama çerezleri kullanılıyorsa mümkün olduğunca bilgilendirme ve tercih
          mekanizmaları sunulur.
        </LegalP>
        <LegalP>
          Tarayıcı ayarlarından çerezleri sınırlayabilirsiniz; bu durumda bazı özellikler
          çalışmayabilir.
        </LegalP>
      </>
    ),
  },
  {
    id: 'cocuklar',
    title: 'Çocuklar',
    content: (
      <LegalP>
        Platform, doğrudan çocuklara yönelik bir hizmet olarak tasarlanmamıştır. Reşit olmayan bir
        kişiye ait verilerin klinik süreçte işlenmesi gerektiğinde; veli / vasi onayı ve ilgili
        mevzuat klinik (veri sorumlusu) tarafından sağlanır.
      </LegalP>
    ),
  },
  {
    id: 'degisiklikler',
    title: 'Politika değişiklikleri',
    content: (
      <LegalP>
        Bu Politika güncellenebilir. Güncel sürüm bu sayfada yayımlanır; yürürlük tarihi güncellenir.
        Önemli değişikliklerde makul bilgilendirme (panel bildirimi veya e-posta) yapılabilir.
        Hizmeti kullanmaya devam etmeniz, yürürlükteki Politika’yı kabul ettiğiniz anlamına gelir
        — kanunen açık rıza gerektiren haller saklıdır.
      </LegalP>
    ),
  },
  {
    id: 'ilgili-belgeler',
    title: 'İlgili belgeler',
    content: (
      <LegalUl
        items={[
          <><Link href="/terms" className="font-semibold text-brand-blue underline-offset-2 hover:underline">Kullanım Koşulları</Link></>,
          <><Link href="/guven" className="font-semibold text-brand-blue underline-offset-2 hover:underline">Güven Merkezi</Link></>,
          <><Link href="/contact" className="font-semibold text-brand-blue underline-offset-2 hover:underline">İletişim</Link></>,
        ]}
      />
    ),
  },
]

export default function PrivacyPage() {
  return (
    <MarketingPageShell>
      <LegalHero
        badge="Gizlilik · KVKK"
        title="Gizlilik Politikası ve Aydınlatma Metni"
        effectiveDate={EFFECTIVE_DATE}
        summary={
          <>
            Hasta, klinik ve kullanıcı verilerinin nasıl toplandığı, işlendiği, saklandığı ve
            haklarınızın nasıl kullanıldığı. Teknik güven kontrolleri için{' '}
            <Link href="/guven" className="font-semibold text-brand-blue underline-offset-2 hover:underline">
              Güven Merkezi
            </Link>
            ’ni de inceleyebilirsiniz.
          </>
        }
      />
      <LegalDocumentBody sections={sections} />
      <LegalCta
        title="KVKK veya gizlilik başvurunuz mu var?"
        description="Kimlik doğrulamalı başvurularınızı e-posta ile iletebilirsiniz. Klinik hasta kaydına ilişkin taleplerde ilgili kliniği de bilgilendirmeniz süreci hızlandırır."
        actionHref="mailto:merhaba@asistan.online?subject=KVKK%20%2F%20Gizlilik%20Basvurusu"
        actionLabel="merhaba@asistan.online"
      />
    </MarketingPageShell>
  )
}
