import {
  BookOpen,
  CalendarCheck,
  Clock,
  FileText,
  MessageSquare,
  Shield,
  type LucideIcon,
} from 'lucide-react'

export type GuideSection = {
  heading: string
  body: string
}

export type Guide = {
  slug: string
  type: string
  icon: LucideIcon
  title: string
  description: string
  /** Lead paragraphs for SEO substance (rendered above numbered sections). */
  intro: string[]
  sections: GuideSection[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'randevu-takibini-duzenlemek',
    type: 'Rehber',
    icon: CalendarCheck,
    title: 'Kliniklerde randevu takibini düzenlemenin yolları',
    description:
      'Takvim, hatırlatma ve takip sorumluluğunu daha net bir akışa yerleştirin.',
    intro: [
      'KKTC kliniklerinde randevu kaosu çoğu zaman yazılım eksikliğinden değil, bilginin birkaç kanala dağılmasından doğar. Excel, defter, WhatsApp ve kişisel takvim aynı anda kullanıldığında güncelleme unutulur; hasta “kaçta geleceğim?” diye aradığında ekip farklı cevaplar verir.',
      'Bu rehber, tek kaynak kuralı, durum sözlüğü ve günlük kapanış rutiniyle ajandayı operasyonel hale getirmenize yardımcı olur. Amaç yazılım satmak değil; sabah paniklerini azaltacak alışkanlıkları netleştirmektir.',
    ],
    sections: [
      {
        heading: 'Tek kaynak kuralı',
        body: 'Randevu bilgisi birden fazla yerde tutulduğunda (Excel, defter, WhatsApp) güncelleme kaçınılmaz olarak unutulur. Klinik için tek bir ajanda kaynağı seçin; tüm ekip aynı ekranı güncellesin. WhatsApp’ta gelen “yarın 14:00 olur mu?” mesajı ajandaya işlenmeden onaylanmasın. Tek kaynak, iptal ve ertelemede de aynı kuralı uygular: değişen saat önce panelde, sonra hastaya iletilir.',
      },
      {
        heading: 'Durumları netleştirin',
        body: 'Bekleyen, onaylı, tamamlandı, iptal ve gelinmedi durumlarını ayırın. “Belki gelir” gibi gri alanlar takip listesini şişirir. Her durum için kimin aksiyon alacağı belli olsun: sekreter onaylar, doktor not ekler, no-show aynı gün işaretlenir. Durum sözlüğünü ekiple bir kez yazın; yeni personel ilk gün bu sözlüğü görsün.',
      },
      {
        heading: 'Günlük kapanış rutini',
        body: 'Günün sonunda 5 dakikalık kontrol: yarınki randevular onaylı mı, eksik telefon var mı, iptaller işlendi mi? Bu küçük rutin, sabah paniklerini büyük ölçüde azaltır. Kapanışı tek kişiye bağlamak yerine “bugünün sahibi” rotasyonu kullanın; izin günlerinde ajanda sahipsiz kalmasın.',
      },
      {
        heading: 'Çakışma ve çift rezervasyon',
        body: 'Aynı doktor + aynı saat için ikinci kayıt açılmamalı. Elle “sıkıştırma” alışkanlığı kısa vadede hasta memnuniyeti gibi görünür; uzun vadede gecikme ve şikayet üretir. Kapasite doluysa bekleme listesi veya alternatif gün önerin; gizli ekstra slot açmayın.',
      },
      {
        heading: 'Ölçün, sonra iyileştirin',
        body: 'Haftalık bakın: kaç randevu iptal, kaç no-show, hangi günler yoğun? Sayı yoksa “çok yoğunuz” hissi ile hareket edilir. Basit bir haftalık özet, hatırlatma saatini veya onay politikasını değiştirmek için yeterlidir.',
      },
    ],
  },
  {
    slug: 'hasta-hatirlatmalari',
    type: 'Hasta iletişimi',
    icon: MessageSquare,
    title: 'Hasta hatırlatmaları neden önemlidir?',
    description:
      'Gelmeyen randevuları azaltmak için hatırlatma dilini ve zamanlamayı planlayın.',
    intro: [
      'No-show (gelmeme) kliniklerde hem gelir hem moral kaybıdır. Çoğu hasta kötü niyetli değildir; randevuyu unutur, saati karıştırır veya iptal yolunu bilmez. İyi kurgulanmış hatırlatma, boş slotu son dakikaya bırakmadan doldurmanıza yardım eder.',
      'Kanal seçimi (e-posta, panel, ileride SMS/WhatsApp) kadar dil ve zamanlama da kritiktir. Bu rehber, spam olmadan hatırlatma kurmak için pratik bir çerçeve sunar.',
    ],
    sections: [
      {
        heading: 'Zamanlama',
        body: 'Çoğu klinik için 24 saat ve 2 saat önce iki hatırlatma yeterlidir. Çok sık mesaj spam hissi yaratır; tek ve geç hatırlatma ise unutulmayı engellemez. Yeni hastalarda veya sabah erken slotlarda ek bir teyit düşünülebilir. Deneyip no-show oranına bakın; her klinik aynı ritme ihtiyaç duymaz.',
      },
      {
        heading: 'Kısa ve net dil',
        body: 'Mesajda klinik adı, tarih, saat ve iptal / erteleme yolu olsun. Hasta “ne yapmam lazım?” diye düşünmemeli. Onay veya iptal için tek bir net çağrı ekleyin. Uzun tıbbi açıklamalar hatırlatmaya ait değildir; o bilgi muayene sırasında verilir.',
      },
      {
        heading: 'Kanal seçimi',
        body: 'Şimdilik e-posta ve panel bildirimi güvenli başlangıçtır. SMS veya WhatsApp eklenecekse opt-in alın; aksi halde hem maliyet hem güven kaybı yaşanır. KKTC’de WhatsApp yaygın olsa da, yazılı onay ve kayıt tutulabilirlik için e-posta / panel izi saklamak iyidir.',
      },
      {
        heading: 'İptal ve erteleme yolu',
        body: 'Hatırlatma “gelin” demekten ibaret olmamalı. Hasta gelemeyecekse tek tıkla veya net bir telefon satırıyla haber verebilmeli. Geç iptaller için klinik politikasını (ör. 4 saat kala) mesajda kısaca belirtmek beklentiyi netleştirir.',
      },
      {
        heading: 'Ölçüm',
        body: 'Hatırlatma açıkken no-show oranını aylık izleyin. Düşüş yoksa zamanlamayı veya dili değiştirin; kanalı körü körüne çoğaltmayın. Tekrarlayan gelmemelerde ayrı bir takip kuralı (öncelikli teyit, bekleme listesi) tanımlayın.',
      },
    ],
  },
  {
    slug: 'sekreter-doktor-takvimi',
    type: 'Ekip',
    icon: BookOpen,
    title: 'Sekreter ve doktor takvimini aynı panelden yönetmek',
    description:
      'Rol bazlı görünümle ekip içi karışıklığı azaltan temel kullanım senaryoları.',
    intro: [
      'Aynı klinik içinde sekreter “tüm günü”, doktor “kendi hastasını” görmek ister. Tek Excel’de bu ayrımı yönetmek zordur; yetkisiz değişiklikler ve “kim sildi?” tartışmaları sık görülür. WhatsApp grupları kısa vadede köprü olur; uzun vadede kimsenin sahibi olmadığı bir ikinci ajanda yaratır.',
      'Rol bazlı panel, ortak kaynak (tek ajanda) ile farklı görünümleri birleştirir. Bu rehber, ortak dil, çakışma kuralları ve izin günü devriyle ekip senkronunu anlatır. Amaç herkesin her şeyi görmesi değil; doğru kişinin doğru aksiyonu almasıdır.',
    ],
    sections: [
      {
        heading: 'Rol bazlı görünüm',
        body: 'Sekreter tüm günü görür; doktor çoğunlukla kendi randevularına odaklanır. Aynı panelde farklı izinler, “kim neyi değiştirebilir?” tartışmasını bitirir. Personel hesabı paylaşmayın; herkes kendi girişi ile çalışsın ki denetim izi anlamlı olsun. Yeni ekip üyesi için varsayılan rolü “en geniş yetki” değil, göreve uygun minimum yetki olsun.',
      },
      {
        heading: 'Ortak isimlendirme',
        body: 'Hizmet adları, odalar ve kısa notlar için ortak bir sözlük kullanın. “Kontrol” ile “muayene” aynı şey mi? Ekip aynı dili konuşmazsa takvim dolsa da kafa karışır. Yeni hizmet eklerken sekreter ve doktor birlikte kısa bir isim seçsin. Renk veya etiket kullanıyorsanız anlamlarını da yazılı tutun.',
      },
      {
        heading: 'Çakışma önleme',
        body: 'Çift rezervasyonu panel kurallarına bırakın. WhatsApp üzerinden “bir dakika ayır” talepleri ajandaya düşmeden işlenmesin; aksi halde doktorun günü parçalanır. Acil slotlar için ayrı bir etiket veya kısa blok tanımlamak, gizli ezme alışkanlığından iyidir. Doktor molası da ajandada görünür blok olsun.',
      },
      {
        heading: 'Devir ve izin günleri',
        body: 'Sekreter izinliyken ajanda sahipsiz kalmasın. Yedek kişi ve “bugünün kontrol listesi” yazılı olsun. Doktor değişiminde açık randevuların kime aktarılacağı önceden netleşsin; hasta arandığında “bilmiyoruz” cevabı güven zedeler. Devir notunu ajanda gününe kısa madde olarak bırakmak yeterlidir.',
      },
      {
        heading: 'Günlük senkron',
        body: 'Sabah 3 dakikalık bakış: onay bekleyenler, eksik telefonlar, ilk hasta. Akşam kapanışta yarını kontrol edin. Bu iki kısa ritüel, sekreter–doktor gerilimini çoğu klinikte azaltır; uzun toplantıya gerek kalmaz.',
      },
    ],
  },
  {
    slug: 'veri-gizliligi-aliskanliklari',
    type: 'Gizlilik',
    icon: Shield,
    title: 'Kliniklerde veri gizliliği için temel alışkanlıklar',
    description:
      'Hasta bilgisi, yetki ve erişim süreçlerinde dikkat edilmesi gereken noktalar.',
    intro: [
      'Sağlık verisi hem etik hem yasal olarak hassastır. Yazılım şifreleme ve erişim kontrolü sağlasa da, ekranın bekleme salonuna dönük bırakılması veya paylaşılan şifre gibi alışkanlıklar riski yeniden açar. Teknik önlem ile davranış önlemi birlikte çalışır.',
      'Bu rehber, minimum yetki, fiziksel disiplin ve başvuru kanallarını günlük pratikte hatırlatır. Detaylı hukuki metin için gizlilik politikasına bakın; burada alışkanlık odaklıyız. Amaç korkutmak değil, tekrarlanabilir küçük kurallar koymaktır.',
    ],
    sections: [
      {
        heading: 'Minimum yetki',
        body: 'Herkese tüm hasta kayıtlarını açmayın. Rol ve görev kadar erişim verin. Eski personelin hesabını aynı gün kapatın; paylaşılan şifre kullanmayın. “Herkes admin” kolaylığı kısa vadede hız, uzun vadede denetimsizlik demektir. Stajyer veya geçici personel için süreli hesap düşünün.',
      },
      {
        heading: 'Ekran ve kağıt disiplini',
        body: 'Bekleme alanında hasta listesi açık bırakılmasın. Yazdırılan reçete veya notlar çöpte okunabilir halde kalmasın. Küçük alışkanlıklar büyük riskleri keser. Toplantı veya mola sırasında ekran kilidi alışkanlığı edinin. Yazıcı kuyruğunda kalan çıktıları da kontrol edin.',
      },
      {
        heading: 'Politika ve başvuru',
        body: 'Gizlilik metninizi okunabilir tutun; hasta veya personel taleplerinin nereye gideceğini bilin. Asistan Güven Merkezi ve gizlilik sayfası başlangıç noktasıdır. Kuruma özel DPA ve alt işlemci listesi talep edildiğinde satış / destek kanalından isteyin. Başvuru yanıt süresini dahili olarak da tanımlayın.',
      },
      {
        heading: 'Mobil ve uzaktan erişim',
        body: 'Telefonda hasta kartı açıyorsanız genel alanda ekranı göstermeyin. Ortak cihazlarda oturumu kapatın. Klinik dışı Wi‑Fi’de hassas işlem yapıyorsanız VPN veya en azından bilinçli bir risk değerlendirmesi yapın. Kaybolan telefonda hesap erişimini hemen kapatın.',
      },
      {
        heading: 'Denetim izi alışkanlığı',
        body: 'Kim neyi değiştirdi sorusu geldiğinde panik yerine kayıtlara bakın. Bu yüzden ortak hesap kullanmamak kritiktir. Şüpheli bir erişimde önce hesabı kilitleyin, sonra destek ile konuşun; “sonra bakarız” demeyin.',
      },
    ],
  },
  {
    slug: 'gelmeyen-randevulari-azaltmak',
    type: 'Operasyon',
    icon: Clock,
    title: 'Gelmeyen randevuları azaltmak için takip akışı',
    description:
      'Randevu öncesi ve sonrası yapılacak küçük kontrollerle takibi güçlendirin.',
    intro: [
      'No-show’u sıfırlamak gerçekçi değildir; ölçülebilir şekilde azaltmak ise mümkündür. Öncesi (teyit), günü (kayıt) ve sonrası (kural) üçlüsü, “boş bırakalım” alışkanlığından çıkmanızı sağlar. Küçük kliniklerde bile haftalık sayı tutmak fark yaratır.',
      'Veri tutmadan politika koymak zordur. Bu rehber, kayıt disiplinini ve tekrarlayan gelmemeler için klinik kurallarını adım adım anlatır. Amaç hastayı cezalandırmak değil, boş slotu erken geri kazanmaktır.',
    ],
    sections: [
      {
        heading: 'Öncesi',
        body: 'Yeni hastalarda telefon doğrulaması yapın. Riskli saatler (erken sabah, Cuma akşamı) için ekstra hatırlatma düşünün. Onaysız talepleri ayrı kuyrukta tutun. İlk randevularda kısa bir “nasıl gelecek / park” notu da gecikmeleri azaltır. Adres veya yol tarifi belirsizse hatırlatmaya bir cümle ekleyin.',
      },
      {
        heading: 'Günü',
        body: 'Gelinmedi kaydını aynı gün işleyin. “Boş bırakalım” yaklaşımı istatistiği çarpıtır ve tekrarlayan no-show’ları gizler. Geç gelen hastayı “tamamlandı” ile karıştırmayın; süre ve durum ayrı tutulsun. 15 dakika kuralı gibi net bir klinik eşiği ekiple paylaşın.',
      },
      {
        heading: 'Sonrası',
        body: 'Tekrarlayan gelmemelerde bekleme listesi veya depozito politikası gibi klinik kurallarını netleştirin. Veri olmadan kural koymak zor; kayıt tutmak ilk adımdır. Politikayı hastaya ilk randevuda kısa ve net anlatın. İstisna yapacaksanız istisnayı da not edin.',
      },
      {
        heading: 'Bekleme listesi',
        body: 'İptal veya no-show sonrası boşalan saati doldurmak için kısa bir bekleme listesi tutun. Aynı gün aranabilecek 3–5 hasta çoğu klinikte yeterlidir. Listeyi WhatsApp karmaşasına bırakmayın; panelde veya tek bir ortak notta tutun. Aranan kişiye “bugün X saati açıldı” diye net söyleyin.',
      },
      {
        heading: 'Haftalık gözden geçirme',
        body: 'Her hafta: no-show sayısı, en riskli gün/saat, hatırlatma açık mı? 10 dakikalık bakış, bir sonraki haftanın hatırlatma zamanını veya onay politikasını değiştirmek için yeterlidir. Trend yoksa “çok no-show var” hissi ile yanlış karar verilir.',
      },
    ],
  },
  {
    slug: 'urun-notlari',
    type: 'Ürün notları',
    icon: FileText,
    title: 'Asistan Health ürün notları',
    description:
      'Erken erişim döneminde öncelik verilen sağlık sektörü ihtiyaçlarını takip edin.',
    intro: [
      'Asistan, KKTC klinikleri için randevu, hasta kartı ve ekip yetkilerini tek panelde toplayan bir operasyon aracıdır. Bu sayfa pazarlama vaadi değil; mevcut odak ve yol haritası dürüstlüğüdür. Satış konuşmasında “her şey hazır” dememek için bu metni referans alın.',
      '“Yakında” işaretlenen özellikler tamamlanmış sayılmaz. Satın alma veya demo kararında bu ayrımı bilinçli tutmanızı isteriz. Gerçek kullanımda çıkan ihtiyaçlar, yol haritasını güncellemenin ana kaynağıdır.',
    ],
    sections: [
      {
        heading: 'Şu an odak',
        body: 'Ajanda, hasta kartı, ekip yetkileri, abonelik görünürlüğü ve güvenilir temel analitik. Amacımız “her özellik” değil; klinikte her gün kullanılan akışları sağlam tutmak. Destek ve kurulumda da aynı öncelik sırasını izleriz. Ölçüm: randevu oluşturulabiliyor mu, hasta bulunabiliyor mu, yetki karışıklığı var mı?',
      },
      {
        heading: 'Yakında',
        body: 'Bildirim kanallarının yapılandırılması, online ödeme ve mağaza yayın süreçleri yol haritasında. Satış sayfalarında “yakında” olarak işaretlenenler tamamlanmış sayılmaz. Tarih vermeden vaat etmektense net durum paylaşmayı tercih ederiz. Öncelik sırası klinik geri bildirimleriyle değişebilir.',
      },
      {
        heading: 'Geri bildirim',
        body: 'Kliniklerden gelen istekleri önceliklendirirken “kaç kişi günlük kullanır?” sorusunu soruyoruz. Öneri ve kurulum için iletişim formunu veya merhaba@asistan.online adresini kullanın. Tek klinik özel isteği, genel ürün kararına dönüşmeden önce ölçülür. Ekran görüntüsü veya kısa senaryo paylaşmak hızlandırır.',
      },
      {
        heading: 'Güven ve veri',
        body: 'Klinik hasta verilerinde Asistan kural olarak veri işleyen konumundadır; klinik veri sorumlusudur. Detay için gizlilik politikası ve Güven Merkezi sayfalarına bakın. Service role anahtarı yalnızca sunucu tarafı yönetim işlerinde kullanılır; tarayıcıya verilmez. Destek erişimi gerektiğinde support mode ile sınırlı ve izlenebilir bakış tercih edilir.',
      },
      {
        heading: 'Paket ve yenileme',
        body: 'Abonelik elden / manuel yenileme modeliyle ilerler. Süre bitimine yaklaşınca panelde uyarı görünür; ödeme için iletişim kanalları paylaşılır. Otomatik kart çekimi vaadi yoktur. Demo süreleri ve plan adları üyelik ekranında net görünmelidir.',
      },
    ],
  },
]

const FEATURED_SLUG = 'randevu-takibini-duzenlemek'

export function getGuideBySlug(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug) ?? null
}

export function getFeaturedGuide() {
  return getGuideBySlug(FEATURED_SLUG) ?? GUIDES[0]
}

export function estimateReadingMinutes(guide: Guide) {
  const text = [
    guide.title,
    guide.description,
    ...guide.intro,
    ...guide.sections.flatMap((s) => [s.heading, s.body]),
  ].join(' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function readingTimeLabel(guide: Guide) {
  return `${estimateReadingMinutes(guide)} dk okuma`
}

/** Rough word count for SEO substance checks. */
export function guideWordCount(guide: Guide) {
  const text = [
    guide.title,
    guide.description,
    ...guide.intro,
    ...guide.sections.flatMap((s) => [s.heading, s.body]),
  ].join(' ')
  return text.trim().split(/\s+/).filter(Boolean).length
}
