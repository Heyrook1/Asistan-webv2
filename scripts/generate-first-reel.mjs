import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { chromium } from '@playwright/test'

const root = process.cwd()
const outputDir = path.join(root, 'social-media-posts', 'reels', 'reel-01-klinik-yonetimi')
const slidesDir = path.join(outputDir, 'slides')
const ffmpeg = 'C:/tmp/asistan-reels-tools/node_modules/ffmpeg-static/ffmpeg.exe'
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const publicImage = (name) => `file:///D:/asistan-web/public/images/${name}`

fs.mkdirSync(slidesDir, { recursive: true })

const esc = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function lines(items, x, y, size, lineHeight, weight = 700, color = '#FFFFFF') {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="-1">
    ${items.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`).join('')}
  </text>`
}

function logo() {
  return `<g transform="translate(78 104)">
    <rect width="312" height="78" rx="39" fill="#FFFFFF" fill-opacity=".97"/>
    <image href="${publicImage('asistan-mark.svg')}" x="18" y="10" width="58" height="58"/>
    <text x="90" y="52" fill="#001D42" font-family="Arial, Helvetica, sans-serif" font-size="37" font-weight="700" letter-spacing="-1">asistan</text>
    <circle cx="266" cy="25" r="5" fill="#05C8BC"/>
  </g>`
}

function chip(text, width = 300) {
  return `<g transform="translate(78 322)">
    <rect width="${width}" height="58" rx="29" fill="#08C8C5"/>
    <text x="30" y="38" fill="#001D42" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="700" letter-spacing="4">${esc(text)}</text>
  </g>`
}

function footer(text = '@asistan.kktc') {
  return `<text x="80" y="1760" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">${esc(text)}</text>
  <rect x="80" y="1798" width="440" height="7" rx="3.5" fill="#13D5CC"/>`
}

function photo(name, opacity = '.8') {
  return `<image href="${publicImage(name)}" width="1080" height="1920" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1080" height="1920" fill="#001D42" fill-opacity="${opacity}"/>`
}

function base(content, photoMarkup = '') {
  return `<svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1920" fill="#001D42"/>
    ${photoMarkup}
    <circle cx="980" cy="170" r="460" fill="#0066A8" fill-opacity=".34"/>
    <circle cx="870" cy="1860" r="520" fill="#08C8C5" fill-opacity=".15"/>
    ${content}
  </svg>`
}

function bullet(y, text) {
  return `<g transform="translate(86 ${y})">
    <circle cx="35" cy="35" r="35" fill="#08C8C5" fill-opacity=".22"/>
    <path d="M18 37l14 14 25-30" stroke="#35E1D0" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="102" y="46" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700">${esc(text)}</text>
  </g>`
}

const slides = [
  base(
    `${logo()}
    ${chip('KLİNİK YÖNETİMİ', 336)}
    ${lines(['Randevu takibi', 'hâlâ dağınık mı?'], 78, 610, 92, 108)}
    ${lines(['Ajandalar, mesajlar ve ekip koordinasyonu', 'tek yerde buluşsun.'], 82, 910, 38, 58, 400, '#D8F8FF')}
    ${footer('DAHA NET BİR KLİNİK AKIŞI')}`,
    photo('industry-pro.jpg', '.83')
  ),
  base(
    `${logo()}
    ${chip('ASİSTAN HEALTH', 306)}
    ${lines(['Randevu, hasta,', 'ekip yönetimi.'], 78, 610, 91, 108)}
    ${lines(['Kliniğinizin günlük operasyonu', 'tek panelde.'], 82, 900, 40, 60, 400, '#D8F8FF')}
    ${bullet(1110, 'Randevu ve uygun saatler')}
    ${bullet(1255, 'Hasta bilgileri')}
    ${bullet(1400, 'Ekip rolleri')}
    ${footer()}`,
    photo('medical-team.jpg', '.84')
  ),
  base(
    `${logo()}
    ${chip('DAHA GÖRÜNÜR TAKVİM', 398)}
    ${lines(['Boş saatleri görün.', 'Akışı birlikte yönetin.'], 78, 610, 82, 102)}
    ${lines(['Doktor, sekreter ve yöneticiler', 'aynı randevu düzeninde ilerlesin.'], 82, 920, 39, 60, 400, '#D8F8FF')}
    ${bullet(1190, 'Daha net günlük plan')}
    ${bullet(1340, 'Ekipçe kolay takip')}
    ${footer()}`,
    photo('industry-health.jpg', '.84')
  ),
  base(
    `${logo()}
    ${chip('YAKINDA', 250)}
    ${lines(['Asistan', 'Rezervasyon'], 78, 610, 100, 116)}
    ${lines(['Bölgenizdeki klinikleri keşfedin.', 'Uygun saatleri görün.'], 82, 940, 40, 62, 400, '#D8F8FF')}
    ${bullet(1220, 'Yakındaki klinikler')}
    ${bullet(1370, 'Uygun randevu saatleri')}
    ${footer('GELİŞMELER İÇİN TAKİP EDİN')}`
  ),
  base(
    `${logo()}
    ${chip('ASİSTAN HEALTH', 306)}
    ${lines(['Kliniğinizi', 'birlikte tanıyalım.'], 78, 610, 94, 112)}
    ${lines(['Size uygun kullanım senaryosunu', 'demo görüşmesinde anlatalım.'], 82, 930, 40, 62, 400, '#D8F8FF')}
    <g transform="translate(82 1220)">
      <rect width="740" height="126" rx="63" fill="#08C8C5"/>
      <text x="52" y="81" fill="#001D42" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="700">Demo için iletişime geçin</text>
    </g>
    ${footer('@asistan.kktc')}`
  ),
]

for (const [index, svg] of slides.entries()) {
  fs.writeFileSync(path.join(slidesDir, `${String(index + 1).padStart(2, '0')}.svg`), svg)
}

const browser = await chromium.launch({ headless: true, executablePath: chrome })
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
})

for (let index = 0; index < slides.length; index += 1) {
  const name = String(index + 1).padStart(2, '0')
  await page.goto(`file:///${path.join(slidesDir, `${name}.svg`).replaceAll('\\', '/')}`)
  await page.screenshot({ path: path.join(slidesDir, `${name}.png`) })
}

await browser.close()

fs.copyFileSync(path.join(slidesDir, '05.png'), path.join(outputDir, 'cover.png'))

const sceneDuration = 3.7
const transition = 0.35
const totalDuration = sceneDuration * slides.length - transition * (slides.length - 1)
const args = []

for (let index = 1; index <= slides.length; index += 1) {
  args.push('-loop', '1', '-t', String(sceneDuration), '-i', path.join(slidesDir, `${String(index).padStart(2, '0')}.png`))
}

args.push(
  '-f',
  'lavfi',
  '-i',
  `aevalsrc=0.045*sin(2*PI*220*t)+0.026*sin(2*PI*277.18*t)+0.018*sin(2*PI*329.63*t):s=44100:d=${totalDuration}`,
  '-filter_complex',
  [
    ...slides.map(
      (_, index) =>
        `[${index}:v]scale=1080:1920,zoompan=z='min(zoom+0.00045,1.032)':d=111:s=1080x1920:fps=30,trim=duration=${sceneDuration},setpts=PTS-STARTPTS[v${index}]`
    ),
    `[v0][v1]xfade=transition=fade:duration=${transition}:offset=3.35[x1]`,
    `[x1][v2]xfade=transition=fade:duration=${transition}:offset=6.70[x2]`,
    `[x2][v3]xfade=transition=fade:duration=${transition}:offset=10.05[x3]`,
    `[x3][v4]xfade=transition=fade:duration=${transition}:offset=13.40[video]`,
    `[5:a]afade=t=in:st=0:d=1.0,afade=t=out:st=${totalDuration - 1.5}:d=1.5[audio]`,
  ].join(';'),
  '-map',
  '[video]',
  '-map',
  '[audio]',
  '-c:v',
  'libx264',
  '-preset',
  'medium',
  '-crf',
  '20',
  '-pix_fmt',
  'yuv420p',
  '-c:a',
  'aac',
  '-b:a',
  '128k',
  '-movflags',
  '+faststart',
  '-t',
  String(totalDuration),
  '-y',
  path.join(outputDir, 'asistan-health-reel-01.mp4')
)

const result = spawnSync(ffmpeg, args, { encoding: 'utf8' })
if (result.status !== 0) {
  console.error(result.stderr)
  process.exit(result.status ?? 1)
}

console.log(`Generated reel: ${path.join(outputDir, 'asistan-health-reel-01.mp4')}`)
