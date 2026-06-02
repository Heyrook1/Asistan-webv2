import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const root = process.cwd()
const feedDir = path.join(root, 'social-media-posts', 'profile-v1', 'feed')
const storyDir = path.join(root, 'social-media-posts', 'profile-v1', 'stories')
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

fs.mkdirSync(feedDir, { recursive: true })
fs.mkdirSync(storyDir, { recursive: true })

const esc = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function tspan(lines, x, startY, lineHeight, size, weight = 700, color = '#FFFFFF') {
  return `<text x="${x}" y="${startY}" fill="${color}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="-1">
    ${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`).join('')}
  </text>`
}

function mark(x = 74, y = 60) {
  return `<g transform="translate(${x} ${y})">
    <rect width="304" height="74" rx="37" fill="#FFFFFF" fill-opacity=".97"/>
    <image href="../../../public/images/asistan-mark.svg" x="18" y="10" width="54" height="54"/>
    <text x="84" y="49" fill="#001D42" font-family="Arial, Helvetica, sans-serif" font-size="35" font-weight="700" letter-spacing="-1">asistan</text>
    <circle cx="258" cy="24" r="5" fill="#05C8BC"/>
  </g>`
}

function chip(text, x = 76, y = 190, width = 280) {
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="50" rx="25" fill="#08C8C5"/>
    <text x="28" y="33" fill="#001D42" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" letter-spacing="3">${esc(text)}</text>
  </g>`
}

function cta(text = 'DEMO İÇİN İLETİŞİME GEÇİN', y = 1210) {
  return `<text x="78" y="${y}" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" letter-spacing=".4">${esc(text)}</text>
  <rect x="78" y="${y + 30}" width="390" height="5" rx="2.5" fill="#13D5CC"/>`
}

function icon(type, x, y) {
  const common = `stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"`
  const icons = {
    calendar: `<rect x="${x}" y="${y + 16}" width="94" height="86" rx="14" ${common}/><path d="M${x + 20} ${y}v32M${x + 74} ${y}v32M${x} ${y + 48}h94" ${common}/>`,
    users: `<circle cx="${x + 47}" cy="${y + 29}" r="22" ${common}/><path d="M${x + 5} ${y + 106}c4-27 19-42 42-42s38 15 42 42" ${common}/>`,
    team: `<circle cx="${x + 33}" cy="${y + 35}" r="18" ${common}/><circle cx="${x + 75}" cy="${y + 38}" r="15" ${common}/><path d="M${x} ${y + 106}c4-24 15-38 33-38 19 0 29 14 34 38M${x + 58} ${y + 106}c3-18 12-30 27-30 13 0 22 10 25 30" ${common}/>`,
    pin: `<path d="M${x + 47} ${y + 108}s42-39 42-70C${x + 89} ${y + 15} ${x + 70} ${y} ${x + 47} ${y}S${x + 5} ${y + 15} ${x + 5} ${y + 38}c0 31 42 70 42 70Z" ${common}/><circle cx="${x + 47}" cy="${y + 38}" r="12" ${common}/>`,
    check: `<path d="M${x + 3} ${y + 58}l28 28 65-72" ${common}/>`,
    spark: `<path d="M${x + 47} ${y}l14 34 34 14-34 14-14 34-14-34L${x - 1} ${y + 48}l34-14 14-34Z" ${common}/>`,
  }
  return icons[type]
}

function infoCard({ x, y, width = 430, title, body, type = 'check' }) {
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="164" rx="26" fill="#001D42" fill-opacity=".74" stroke="#FFFFFF" stroke-opacity=".16"/>
    <g transform="translate(30 28)">${icon(type, 0, 0)}</g>
    <text x="158" y="67" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="700">${esc(title)}</text>
    <text x="158" y="110" fill="#D8F8FF" font-family="Arial, Helvetica, sans-serif" font-size="20">${esc(body)}</text>
  </g>`
}

function photo(name, overlay = '.82') {
  return `<image href="../../../public/images/${name}" width="1080" height="1350" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1080" height="1350" fill="#001D42" fill-opacity="${overlay}"/>`
}

function feed({ file, photoName, label, title, subtitle, body = '', cards = [], footer }) {
  const svg = `<svg width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1350" fill="#001D42"/>
    ${photoName ? photo(photoName) : '<rect width="1080" height="1350" fill="#001D42"/><circle cx="970" cy="170" r="390" fill="#0066A8" fill-opacity=".42"/><circle cx="900" cy="1180" r="340" fill="#08C8C5" fill-opacity=".16"/>'}
    ${mark()}
    ${chip(label, 76, 190, Math.max(250, label.length * 18 + 56))}
    ${tspan(title, 76, 350, 84, 72)}
    ${tspan(subtitle, 80, 560, 46, 31, 400, '#D8F8FF')}
    ${body ? tspan(body, 80, 710, 42, 27, 400, '#FFFFFF') : ''}
    ${cards.map(infoCard).join('')}
    ${cta(footer)}
  </svg>`
  fs.writeFileSync(path.join(feedDir, `${file}.svg`), svg)
}

const posts = [
  {
    file: '01_asistan_nedir',
    photoName: 'industry-health.jpg',
    label: 'ASİSTAN HEALTH',
    title: ['Kliniğinizin', 'dijital asistanı.'],
    subtitle: ['Randevu, hasta ve ekip yönetimi', 'tek panelde.'],
    cards: [
      { x: 76, y: 765, title: 'Daha net takvim', body: 'Günlük akışınızı görün', type: 'calendar' },
      { x: 550, y: 765, title: 'Tek merkez', body: 'Ekibiniz birlikte ilerlesin', type: 'team' },
    ],
  },
  {
    file: '02_tek_panel',
    label: 'NEDEN ASİSTAN?',
    title: ['Dağınık takip', 'yerine tek panel.'],
    subtitle: ['Kliniğinizin günlük iş akışını', 'daha kolay yönetin.'],
    cards: [
      { x: 76, y: 750, title: 'Randevu', body: 'Takvim ve uygun saatler', type: 'calendar' },
      { x: 550, y: 750, title: 'Hasta', body: 'Bilgiler tek yerde', type: 'users' },
      { x: 76, y: 945, title: 'Ekip', body: 'Rol bazlı iş akışı', type: 'team' },
      { x: 550, y: 945, title: 'Takip', body: 'Daha görünür operasyon', type: 'check' },
    ],
    footer: 'DEMO İÇİN İLETİŞİME GEÇİN',
  },
  {
    file: '03_bos_saatler',
    photoName: 'industry-pro.jpg',
    label: 'RANDEVU YÖNETİMİ',
    title: ['Boş saatler', 'görünür olsun.'],
    subtitle: ['Takviminizi ekipçe takip edin.', 'Gününüzü daha net planlayın.'],
    cards: [
      { x: 76, y: 800, title: 'Uygun saat takibi', body: 'Takviminizi düzenleyin', type: 'calendar' },
      { x: 550, y: 800, title: 'Ekip görünümü', body: 'Akışı birlikte yönetin', type: 'team' },
    ],
  },
  {
    file: '04_rezervasyon_yakinda',
    label: 'YAKINDA',
    title: ['Asistan', 'Rezervasyon'],
    subtitle: ['Bölgenizdeki klinikleri keşfedin.', 'Uygun saatleri görün.'],
    cards: [
      { x: 76, y: 785, title: 'Yakındaki klinikler', body: 'Bölgenizde keşfedin', type: 'pin' },
      { x: 550, y: 785, title: 'Uygun saatler', body: 'Takvimden görüntüleyin', type: 'calendar' },
    ],
    footer: 'GELİŞMELER İÇİN TAKİP EDİN',
  },
  {
    file: '05_kimler_icin',
    photoName: 'medical-team.jpg',
    label: 'KİMLER İÇİN?',
    title: ['Sağlık ekipleri', 'için tasarlandı.'],
    subtitle: ['Günlük operasyonunuzu', 'tek noktadan yönetin.'],
    body: ['Klinikler  •  Muayenehaneler', 'Diş hekimleri  •  Fizyoterapi', 'Estetik klinikleri'],
  },
  {
    file: '06_rezervasyon_deneyimi',
    photoName: 'industry-health.jpg',
    label: 'ASİSTAN REZERVASYON',
    title: ['Randevu deneyimi', 'kolaylaşıyor.'],
    subtitle: ['Klinikler için daha görünür takvim.', 'Kullanıcılar için daha kolay keşif.'],
    cards: [
      { x: 76, y: 820, title: 'Klinik keşfi', body: 'Bölgeye göre arama', type: 'pin' },
      { x: 550, y: 820, title: 'Randevu talebi', body: 'Uygun saate göre', type: 'check' },
    ],
    footer: 'YAKINDA  •  GELİŞMELER İÇİN TAKİP EDİN',
  },
  {
    file: '07_uc_adim',
    label: 'KOLAY KURULUM',
    title: ['Üç adımda', 'başlayın.'],
    subtitle: ['Kliniğiniz için sade ve anlaşılır', 'bir başlangıç süreci.'],
    body: ['01  Hesabınızı oluşturun', '02  Hizmet ve ekip bilgilerinizi ekleyin', '03  Randevu akışınızı yönetin'],
  },
  {
    file: '08_ekibinizle_yonetin',
    photoName: 'medical-team.jpg',
    label: 'EKİP YÖNETİMİ',
    title: ['Ekibiniz aynı', 'akışta ilerlesin.'],
    subtitle: ['Doktor, sekreter ve yöneticiler', 'için ortak operasyon görünümü.'],
    cards: [
      { x: 76, y: 820, title: 'Ortak takvim', body: 'Günün akışı tek yerde', type: 'calendar' },
      { x: 550, y: 820, title: 'Ekip rolleri', body: 'Yetkiye göre erişim', type: 'team' },
    ],
  },
  {
    file: '09_demo',
    label: 'ASİSTAN HEALTH',
    title: ['Kliniğinizi', 'birlikte tanıyalım.'],
    subtitle: ['Size uygun kullanım senaryosunu', 'demo görüşmesinde anlatalım.'],
    body: ['KKTC odaklı başlangıç', 'Klinik yönetimi ve rezervasyon altyapısı', 'Sorularınız için Instagram’dan yazın'],
  },
]

for (const post of posts) feed(post)

function story({ file, label, title, subtitle, body = [], footer = 'DEMO İÇİN İLETİŞİME GEÇİN' }) {
  const svg = `<svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1920" fill="#001D42"/>
    <circle cx="930" cy="160" r="410" fill="#0066A8" fill-opacity=".42"/>
    <circle cx="840" cy="1780" r="480" fill="#08C8C5" fill-opacity=".16"/>
    ${mark(76, 94)}
    ${chip(label, 76, 312, Math.max(250, label.length * 18 + 56))}
    ${tspan(title, 76, 520, 96, 78)}
    ${tspan(subtitle, 80, 790, 52, 34, 400, '#D8F8FF')}
    ${body.map((line, index) => `<g transform="translate(80 ${1060 + index * 150})"><circle cx="34" cy="34" r="34" fill="#08C8C5" fill-opacity=".22"/><path d="M18 36l13 13 24-28" stroke="#35E1D0" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><text x="98" y="45" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="700">${esc(line)}</text></g>`).join('')}
    <text x="80" y="1750" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="700">${esc(footer)}</text>
    <rect x="80" y="1782" width="420" height="6" rx="3" fill="#13D5CC"/>
  </svg>`
  fs.writeFileSync(path.join(storyDir, `${file}.svg`), svg)
}

const stories = [
  {
    file: '01_klinik_yonetimi',
    label: 'ASİSTAN HEALTH',
    title: ['Kliniğinizin', 'iş akışı cebinizde.'],
    subtitle: ['Randevu, hasta ve ekip yönetimi', 'tek noktada.'],
    body: ['Daha net takvim', 'Daha görünür operasyon', 'Ekipçe kolay takip'],
  },
  {
    file: '02_rezervasyon_yakinda',
    label: 'YAKINDA',
    title: ['Asistan', 'Rezervasyon'],
    subtitle: ['Bölgenizdeki klinikleri keşfedin.', 'Uygun saatleri görün.'],
    body: ['Yakındaki klinikler', 'Uygun randevu saatleri', 'Kolay randevu talebi'],
    footer: 'GELİŞMELER İÇİN TAKİP EDİN',
  },
  {
    file: '03_demo',
    label: 'DEMO',
    title: ['Kliniğiniz için', 'Asistan’ı keşfedin.'],
    subtitle: ['Size uygun kullanım senaryosunu', 'birlikte değerlendirelim.'],
    body: ['Instagram’dan mesaj gönderin', 'Sorularınızı iletin', 'Demo görüşmesini planlayalım'],
  },
  {
    file: '04_soru',
    label: 'SORU & CEVAP',
    title: ['Kliniğinizde en çok', 'hangi süreç zaman alıyor?'],
    subtitle: ['Randevu takibi mi?', 'Hasta bilgileri mi? Ekip koordinasyonu mu?'],
    body: ['Yanıtınızı bize mesajla gönderin'],
    footer: 'MESAJLARINIZI BEKLİYORUZ',
  },
]

for (const item of stories) story(item)

async function renderDirectory(browser, directory, width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  for (const file of fs.readdirSync(directory).filter((name) => name.endsWith('.svg'))) {
    await page.goto(`file:///${path.join(directory, file).replaceAll('\\', '/')}`)
    await page.screenshot({ path: path.join(directory, file.replace('.svg', '.png')) })
  }
  await page.close()
}

const browser = await chromium.launch({ headless: true, executablePath: chrome })
await renderDirectory(browser, feedDir, 1080, 1350)
await renderDirectory(browser, storyDir, 1080, 1920)
await browser.close()

console.log(`Generated ${posts.length} feed posts and ${stories.length} stories.`)
