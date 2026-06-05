import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const root = process.cwd()
const outDir = path.join(root, 'social-media-posts', 'profile-v2', 'feed')
const assetsDir = path.join(root, 'social-media-posts', 'profile-v2', 'assets')
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const img = (name) => `file:///${path.join(assetsDir, name).replaceAll('\\', '/')}`
const publicImg = (name) => `file:///D:/asistan-web/public/images/${name}`

fs.mkdirSync(outDir, { recursive: true })

const esc = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function text(lines, x, y, size, lineHeight, options = {}) {
  const {
    color = '#06284C',
    weight = 700,
    family = "Arial, Helvetica, sans-serif",
    spacing = '-1',
  } = options
  return `<text x="${x}" y="${y}" fill="${color}" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}">
    ${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`).join('')}
  </text>`
}

function brand({ x = 72, y = 64, light = false } = {}) {
  const color = light ? '#FFFFFF' : '#06284C'
  return `<g transform="translate(${x} ${y})">
    <image href="${publicImg('asistan-mark.svg')}" width="48" height="48"/>
    <text x="62" y="37" fill="${color}" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="700" letter-spacing="-1">asistan</text>
    <circle cx="209" cy="12" r="4" fill="#09BEB8"/>
  </g>`
}

function footer({ light = false, index }) {
  const color = light ? '#D8F9F7' : '#46708A'
  return `<g>
    <line x1="72" y1="1244" x2="1008" y2="1244" stroke="${color}" stroke-opacity=".42"/>
    <text x="72" y="1287" fill="${color}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="2">ASISTAN.ONLINE</text>
    <text x="974" y="1287" fill="${color}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700">${String(index).padStart(2, '0')}</text>
  </g>`
}

function pill(label, x, y, options = {}) {
  const { width = label.length * 16 + 48, dark = false } = options
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="42" rx="21" fill="${dark ? '#D9FFFA' : '#DDF9F6'}"/>
    <text x="22" y="28" fill="#087E80" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" letter-spacing="2">${esc(label)}</text>
  </g>`
}

function svg(content, background = '#F5F7F5') {
  return `<svg width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1350" fill="${background}"/>
    ${content}
  </svg>`
}

function dashboardPanel() {
  const bars = [96, 146, 122, 174, 198, 158, 214]
  return `<g transform="translate(82 528)">
    <rect width="916" height="594" rx="34" fill="#FFFFFF" stroke="#D9E8E8" stroke-width="2"/>
    <rect width="916" height="78" rx="34" fill="#F8FBFA"/>
    <circle cx="50" cy="39" r="12" fill="#09BEB8"/>
    <rect x="82" y="30" width="156" height="18" rx="9" fill="#C7DDDD"/>
    <rect x="704" y="25" width="154" height="28" rx="14" fill="#E2F8F5"/>
    <rect x="44" y="126" width="230" height="176" rx="22" fill="#F4F8F7"/>
    <rect x="68" y="154" width="110" height="16" rx="8" fill="#8DB0B1"/>
    <text x="68" y="238" fill="#06284C" font-family="Arial" font-size="64" font-weight="700">12</text>
    <rect x="306" y="126" width="262" height="176" rx="22" fill="#F4F8F7"/>
    <rect x="330" y="154" width="128" height="16" rx="8" fill="#8DB0B1"/>
    <text x="330" y="238" fill="#06284C" font-family="Arial" font-size="64" font-weight="700">04</text>
    <rect x="600" y="126" width="272" height="176" rx="22" fill="#F4F8F7"/>
    <rect x="624" y="154" width="128" height="16" rx="8" fill="#8DB0B1"/>
    <text x="624" y="238" fill="#06284C" font-family="Arial" font-size="64" font-weight="700">86%</text>
    <rect x="44" y="342" width="828" height="204" rx="22" fill="#F8FBFA"/>
    <line x1="88" y1="492" x2="834" y2="492" stroke="#D9E8E8" stroke-width="2"/>
    ${bars.map((height, index) => `<rect x="${112 + index * 98}" y="${512 - height}" width="48" height="${height}" rx="12" fill="${index === 5 ? '#09BEB8' : '#A5DADC'}"/>`).join('')}
  </g>`
}

const posts = [
  {
    file: '01_marka_vaadi',
    svg: svg(`
      <image href="${img('clinic-management.png')}" width="1080" height="1350" preserveAspectRatio="xMidYMid slice"/>
      <rect width="1080" height="1350" fill="#06284C" fill-opacity=".08"/>
      <rect x="0" width="690" height="1350" fill="#F7FAF8" fill-opacity=".94"/>
      ${brand()}
      ${pill('ASİSTAN HEALTH', 72, 252)}
      ${text(['Klinik yönetimi,', 'daha sakin', 'bir ritimde.'], 72, 384, 76, 86, { family: "Georgia, 'Times New Roman', serif", weight: 700 })}
      ${text(['Randevu, hasta ve ekip akışınızı', 'tek bir merkezde yönetin.'], 76, 700, 31, 46, { color: '#46708A', weight: 400, spacing: '0' })}
      ${text(['Demo için iletişime geçin'], 76, 1010, 27, 38, { color: '#087E80', weight: 700, spacing: '0' })}
      <rect x="76" y="1042" width="274" height="4" rx="2" fill="#09BEB8"/>
      ${footer({ index: 1 })}
    `),
  },
  {
    file: '02_rezervasyon',
    svg: svg(`
      <image href="${img('reservation-discovery.png')}" width="1080" height="1350" preserveAspectRatio="xMidYMid slice"/>
      <rect width="1080" height="1350" fill="#06284C" fill-opacity=".10"/>
      <rect x="0" width="660" height="1350" fill="#F7FAF8" fill-opacity=".95"/>
      ${brand()}
      ${pill('YAKINDA', 72, 252)}
      ${text(['Randevunun', 'yeni yolu.'], 72, 390, 82, 94, { family: "Georgia, 'Times New Roman', serif" })}
      ${text(['Yakındaki klinikleri keşfedin.', 'Uygun saatleri görüntüleyin.'], 76, 650, 31, 47, { color: '#46708A', weight: 400, spacing: '0' })}
      ${text(['Asistan Rezervasyon'], 76, 854, 28, 40, { color: '#087E80', weight: 700, spacing: '0' })}
      ${footer({ index: 2 })}
    `),
  },
  {
    file: '03_demo',
    svg: svg(`
      <rect width="1080" height="1350" fill="#06284C"/>
      <circle cx="1008" cy="210" r="404" fill="#0A5272"/>
      <circle cx="878" cy="1240" r="344" fill="#087E80" fill-opacity=".38"/>
      ${brand({ light: true })}
      ${pill('DEMO', 72, 252, { dark: true })}
      ${text(['Kliniğinizi', 'birlikte', 'tanıyalım.'], 72, 408, 87, 98, { color: '#FFFFFF', family: "Georgia, 'Times New Roman', serif" })}
      ${text(['Size uygun kullanım senaryosunu', 'birlikte değerlendirelim.'], 76, 760, 32, 48, { color: '#C8EDEE', weight: 400, spacing: '0' })}
      <g transform="translate(74 936)">
        <rect width="540" height="88" rx="44" fill="#09BEB8"/>
        <text x="42" y="57" fill="#06284C" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">Demo için iletişime geçin</text>
      </g>
      ${footer({ light: true, index: 3 })}
    `, '#06284C'),
  },
  {
    file: '04_tek_ekran',
    svg: svg(`
      ${brand()}
      ${pill('OPERASYON', 72, 218)}
      ${text(['Bir klinik günü.', 'Tek ekranda.'], 72, 348, 72, 84, { family: "Georgia, 'Times New Roman', serif" })}
      ${text(['Gününüzü daha görünür ve daha yönetilebilir hale getirin.'], 76, 560, 29, 42, { color: '#46708A', weight: 400, spacing: '0' })}
      ${dashboardPanel()}
      ${footer({ index: 4 })}
    `),
  },
  {
    file: '05_bos_saatler',
    svg: svg(`
      <image href="${img('reception-operations.png')}" width="1080" height="1350" preserveAspectRatio="xMidYMid slice"/>
      <rect width="1080" height="1350" fill="#06284C" fill-opacity=".10"/>
      <rect x="54" y="720" width="752" height="484" rx="34" fill="#F8FBFA" fill-opacity=".96"/>
      ${brand({ x: 74, y: 68 })}
      ${pill('RANDEVU AKIŞI', 96, 782)}
      ${text(['Boş saatler', 'kaybolmasın.'], 96, 902, 70, 82, { family: "Georgia, 'Times New Roman', serif" })}
      ${text(['Takviminizi ekipçe izleyin.', 'Günün akışını daha net planlayın.'], 100, 1094, 28, 42, { color: '#46708A', weight: 400, spacing: '0' })}
    `),
  },
  {
    file: '06_saglik_ekipleri',
    svg: svg(`
      ${brand()}
      ${pill('KİMLER İÇİN?', 72, 218)}
      ${text(['Sağlık ekipleri', 'için tasarlandı.'], 72, 354, 76, 88, { family: "Georgia, 'Times New Roman', serif" })}
      ${text(['Günlük operasyonunuzun ihtiyaçlarına', 'uyum sağlayan sade bir altyapı.'], 76, 596, 30, 45, { color: '#46708A', weight: 400, spacing: '0' })}
      <g transform="translate(78 790)">
        ${['Klinikler ve muayenehaneler', 'Diş hekimleri', 'Fizyoterapi merkezleri', 'Estetik klinikleri'].map((label, index) => `
          <g transform="translate(0 ${index * 92})">
            <circle cx="18" cy="18" r="18" fill="#DDF9F6"/>
            <circle cx="18" cy="18" r="6" fill="#09BEB8"/>
            <text x="66" y="28" fill="#06284C" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700">${label}</text>
          </g>
        `).join('')}
      </g>
      ${footer({ index: 6 })}
    `),
  },
  {
    file: '07_ekip',
    svg: svg(`
      <image href="${img('clinic-management.png')}" width="1080" height="1350" preserveAspectRatio="xMidYMid slice"/>
      <rect width="1080" height="1350" fill="#06284C" fill-opacity=".18"/>
      <rect x="52" y="80" width="748" height="560" rx="34" fill="#F8FBFA" fill-opacity=".96"/>
      ${brand({ x: 82, y: 116 })}
      ${pill('EKİP YÖNETİMİ', 82, 260)}
      ${text(['Aynı ritimde', 'ilerleyen ekipler.'], 82, 390, 70, 82, { family: "Georgia, 'Times New Roman', serif" })}
      ${text(['Doktor, sekreter ve yöneticiler için', 'ortak operasyon görünümü.'], 86, 590, 28, 42, { color: '#46708A', weight: 400, spacing: '0' })}
    `),
  },
  {
    file: '08_kurulum',
    svg: svg(`
      ${brand()}
      ${pill('KOLAY BAŞLANGIÇ', 72, 218)}
      ${text(['Üç adım.', 'Daha net bir başlangıç.'], 72, 354, 72, 86, { family: "Georgia, 'Times New Roman', serif" })}
      <g transform="translate(76 700)">
        ${[
          ['01', 'Hesabınızı oluşturun', 'Kliniğiniz için başlangıç yapın.'],
          ['02', 'Ekibinizi tanımlayın', 'Hizmet ve ekip bilgilerini ekleyin.'],
          ['03', 'Akışı yönetin', 'Takviminizi tek noktadan görün.'],
        ].map(([no, title, body], index) => `
          <g transform="translate(0 ${index * 150})">
            <text x="0" y="38" fill="#09BEB8" font-family="Georgia, serif" font-size="44" font-weight="700">${no}</text>
            <text x="108" y="26" fill="#06284C" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700">${title}</text>
            <text x="108" y="68" fill="#46708A" font-family="Arial, Helvetica, sans-serif" font-size="23">${body}</text>
          </g>
        `).join('')}
      </g>
      ${footer({ index: 8 })}
    `),
  },
  {
    file: '09_marka',
    svg: svg(`
      <rect width="1080" height="1350" fill="#06284C"/>
      <circle cx="1060" cy="176" r="382" fill="#0A5272"/>
      <circle cx="850" cy="1260" r="320" fill="#087E80" fill-opacity=".38"/>
      ${brand({ light: true })}
      ${pill('ASİSTAN', 72, 252, { dark: true })}
      ${text(['İşinizi yöneten', 'akıllı asistan.'], 72, 420, 88, 100, { color: '#FFFFFF', family: "Georgia, 'Times New Roman', serif" })}
      ${text(['Sağlık ekipleri için klinik yönetimi.', 'Kullanıcılar için yeni nesil rezervasyon.'], 76, 748, 31, 48, { color: '#C8EDEE', weight: 400, spacing: '0' })}
      ${text(['@asistan.kktc'], 76, 1020, 30, 42, { color: '#FFFFFF', weight: 700, spacing: '0' })}
      ${footer({ light: true, index: 9 })}
    `, '#06284C'),
  },
]

for (const post of posts) {
  fs.writeFileSync(path.join(outDir, `${post.file}.svg`), post.svg)
}

const browser = await chromium.launch({ headless: true, executablePath: chrome })
const page = await browser.newPage({
  viewport: { width: 1080, height: 1350 },
  deviceScaleFactor: 1,
})

for (const post of posts) {
  await page.goto(`file:///${path.join(outDir, `${post.file}.svg`).replaceAll('\\', '/')}`)
  await page.screenshot({ path: path.join(outDir, `${post.file}.png`) })
}

await browser.close()
console.log(`Generated ${posts.length} profile-v2 feed assets.`)
