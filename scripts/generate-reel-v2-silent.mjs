import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { chromium } from '@playwright/test'

const root = process.cwd()
const outDir = path.join(root, 'social-media-posts', 'reels', 'reel-02-premium-silent')
const slidesDir = path.join(outDir, 'slides')
const assetsDir = path.join(root, 'social-media-posts', 'profile-v2', 'assets')
const ffmpeg = 'C:/tmp/asistan-reels-tools/node_modules/ffmpeg-static/ffmpeg.exe'
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const asset = (name) => `file:///${path.join(assetsDir, name).replaceAll('\\', '/')}`
const publicImg = (name) => `file:///D:/asistan-web/public/images/${name}`

fs.mkdirSync(slidesDir, { recursive: true })

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

function brand({ x = 82, y = 92, light = false } = {}) {
  return `<g transform="translate(${x} ${y})">
    <image href="${publicImg('asistan-mark.svg')}" width="58" height="58"/>
    <text x="74" y="44" fill="${light ? '#FFFFFF' : '#06284C'}" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="700" letter-spacing="-1">asistan</text>
    <circle cx="254" cy="14" r="5" fill="#09BEB8"/>
  </g>`
}

function pill(label, x = 82, y = 280, width = label.length * 18 + 56) {
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="54" rx="27" fill="#DDF9F6"/>
    <text x="26" y="36" fill="#087E80" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="3">${esc(label)}</text>
  </g>`
}

function footer(label) {
  return `<text x="84" y="1770" fill="#087E80" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="700">${esc(label)}</text>
  <rect x="84" y="1808" width="420" height="6" rx="3" fill="#09BEB8"/>`
}

function frame(content, background = '#F7FAF8') {
  return `<svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1920" fill="${background}"/>
    ${content}
  </svg>`
}

function dashboard() {
  const bars = [112, 180, 144, 218, 252, 196]
  return `<g transform="translate(92 1000)">
    <rect width="896" height="600" rx="36" fill="#FFFFFF" stroke="#D7E7E6" stroke-width="2"/>
    <rect width="896" height="90" rx="36" fill="#F8FBFA"/>
    <circle cx="54" cy="45" r="13" fill="#09BEB8"/>
    <rect x="88" y="34" width="174" height="22" rx="11" fill="#C6DEDD"/>
    <rect x="704" y="30" width="126" height="28" rx="14" fill="#DDF9F6"/>
    <rect x="46" y="150" width="240" height="180" rx="24" fill="#F4F8F7"/>
    <rect x="328" y="150" width="240" height="180" rx="24" fill="#F4F8F7"/>
    <rect x="610" y="150" width="240" height="180" rx="24" fill="#F4F8F7"/>
    <text x="74" y="268" fill="#06284C" font-family="Arial" font-size="72" font-weight="700">12</text>
    <text x="356" y="268" fill="#06284C" font-family="Arial" font-size="72" font-weight="700">04</text>
    <text x="638" y="268" fill="#06284C" font-family="Arial" font-size="72" font-weight="700">86%</text>
    <rect x="46" y="382" width="804" height="170" rx="24" fill="#F8FBFA"/>
    ${bars.map((height, index) => `<rect x="${114 + index * 112}" y="${544 - height * 0.58}" width="54" height="${height * 0.58}" rx="13" fill="${index === 4 ? '#09BEB8' : '#A3DADC'}"/>`).join('')}
  </g>`
}

const slides = [
  frame(`
    <image href="${asset('clinic-management.png')}" width="1080" height="1920" preserveAspectRatio="xMidYMid slice"/>
    <rect width="732" height="1920" fill="#F7FAF8" fill-opacity=".95"/>
    ${brand()}
    ${pill('ASİSTAN HEALTH')}
    ${text(['Klinik yönetimi,', 'daha sakin', 'bir ritimde.'], 82, 486, 96, 108, { family: "Georgia, 'Times New Roman', serif" })}
    ${text(['Randevu, hasta ve ekip akışınızı', 'tek bir merkezde yönetin.'], 86, 904, 38, 58, { color: '#46708A', weight: 400, spacing: '0' })}
    ${footer('Demo için iletişime geçin')}
  `),
  frame(`
    ${brand()}
    ${pill('OPERASYON')}
    ${text(['Bir klinik günü.', 'Tek ekranda.'], 82, 500, 94, 108, { family: "Georgia, 'Times New Roman', serif" })}
    ${text(['Günlük yoğunluğu ve randevu akışını', 'daha görünür hale getirin.'], 86, 790, 38, 58, { color: '#46708A', weight: 400, spacing: '0' })}
    ${dashboard()}
    ${footer('@asistan.kktc')}
  `),
  frame(`
    <image href="${asset('reservation-discovery.png')}" width="1080" height="1920" preserveAspectRatio="xMidYMid slice"/>
    <rect width="700" height="1920" fill="#F7FAF8" fill-opacity=".95"/>
    ${brand()}
    ${pill('YAKINDA')}
    ${text(['Randevunun', 'yeni yolu.'], 82, 500, 104, 120, { family: "Georgia, 'Times New Roman', serif" })}
    ${text(['Yakındaki klinikleri keşfedin.', 'Uygun saatleri görüntüleyin.'], 86, 840, 38, 58, { color: '#46708A', weight: 400, spacing: '0' })}
    ${text(['Asistan Rezervasyon'], 86, 1104, 33, 48, { color: '#087E80', weight: 700, spacing: '0' })}
    ${footer('Gelişmeler için takip edin')}
  `),
  frame(`
    <rect width="1080" height="1920" fill="#06284C"/>
    <circle cx="1040" cy="220" r="520" fill="#0A5272"/>
    <circle cx="860" cy="1830" r="470" fill="#087E80" fill-opacity=".42"/>
    ${brand({ light: true })}
    ${pill('DEMO')}
    ${text(['Kliniğinizi', 'birlikte', 'tanıyalım.'], 82, 520, 104, 116, { color: '#FFFFFF', family: "Georgia, 'Times New Roman', serif" })}
    ${text(['Size uygun kullanım senaryosunu', 'birlikte değerlendirelim.'], 86, 930, 39, 59, { color: '#C8EDEE', weight: 400, spacing: '0' })}
    <g transform="translate(84 1210)">
      <rect width="692" height="112" rx="56" fill="#09BEB8"/>
      <text x="48" y="72" fill="#06284C" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="700">Demo için iletişime geçin</text>
    </g>
    ${footer('@asistan.kktc')}
  `, '#06284C'),
]

for (const [index, slide] of slides.entries()) {
  const name = String(index + 1).padStart(2, '0')
  fs.writeFileSync(path.join(slidesDir, `${name}.svg`), slide)
}

const browser = await chromium.launch({ headless: true, executablePath: chrome })
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
})

for (let index = 1; index <= slides.length; index += 1) {
  const name = String(index).padStart(2, '0')
  await page.goto(`file:///${path.join(slidesDir, `${name}.svg`).replaceAll('\\', '/')}`)
  await page.screenshot({ path: path.join(slidesDir, `${name}.png`) })
}

await browser.close()
fs.copyFileSync(path.join(slidesDir, '01.png'), path.join(outDir, 'cover.png'))

const duration = 3.5
const transition = 0.32
const total = duration * slides.length - transition * (slides.length - 1)
const args = []

for (let index = 1; index <= slides.length; index += 1) {
  args.push('-loop', '1', '-t', String(duration), '-i', path.join(slidesDir, `${String(index).padStart(2, '0')}.png`))
}

args.push(
  '-filter_complex',
  [
    ...slides.map(
      (_, index) =>
        `[${index}:v]scale=1080:1920,zoompan=z='min(zoom+0.00035,1.024)':d=105:s=1080x1920:fps=30,trim=duration=${duration},setpts=PTS-STARTPTS[v${index}]`
    ),
    `[v0][v1]xfade=transition=fade:duration=${transition}:offset=3.18[x1]`,
    `[x1][v2]xfade=transition=fade:duration=${transition}:offset=6.36[x2]`,
    `[x2][v3]xfade=transition=fade:duration=${transition}:offset=9.54[video]`,
  ].join(';'),
  '-map',
  '[video]',
  '-an',
  '-c:v',
  'libx264',
  '-preset',
  'medium',
  '-crf',
  '20',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  '-t',
  String(total),
  '-y',
  path.join(outDir, 'asistan-health-reel-v2-silent.mp4')
)

const result = spawnSync(ffmpeg, args, { encoding: 'utf8' })
if (result.status !== 0) {
  console.error(result.stderr)
  process.exit(result.status ?? 1)
}

console.log(`Generated silent reel: ${path.join(outDir, 'asistan-health-reel-v2-silent.mp4')}`)
