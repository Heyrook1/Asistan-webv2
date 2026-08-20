/**
 * One-shot image optimization for public/images (P0).
 * Usage: node scripts/optimize-public-images.mjs
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = path.join(process.cwd(), 'public', 'images')

async function main() {
  const iconSrcPath = path.join(ROOT, 'asistan-icon.png')
  if (!fs.existsSync(iconSrcPath)) throw new Error('missing asistan-icon.png')
  const iconBuf = fs.readFileSync(iconSrcPath)

  async function writeIcon(destName, size) {
    const dest = path.join(ROOT, destName)
    const tmp = dest + '.tmp.png'
    await sharp(iconBuf)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, palette: true })
      .toFile(tmp)
    fs.renameSync(tmp, dest)
    console.log(`[ok] ${destName} ${size}x${size} → ${(fs.statSync(dest).size / 1024).toFixed(1)} KB`)
  }

  await writeIcon('icon-192.png', 192)
  await writeIcon('icon-512.png', 512)
  await writeIcon('apple-touch-icon.png', 180)
  await writeIcon('asistan-icon.png', 512)

  const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico')
  if (fs.existsSync(faviconPath)) {
    const tmp = faviconPath + '.tmp.png'
    await sharp(iconBuf).resize(32, 32).png({ compressionLevel: 9, palette: true }).toFile(tmp)
    fs.renameSync(tmp, faviconPath)
    console.log(`[ok] favicon.ico → ${(fs.statSync(faviconPath).size / 1024).toFixed(1)} KB`)
  }

  // Hero JPEG
  {
    const name = 'rezervasyon-clinic-hero.jpg'
    const src = path.join(ROOT, name)
    const tmp = src + '.tmp.jpg'
    const before = fs.statSync(src).size
    await sharp(src)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toFile(tmp)
    fs.renameSync(tmp, src)
    console.log(
      `[ok] ${name} → ${(fs.statSync(src).size / 1024).toFixed(1)} KB (was ${(before / 1024).toFixed(1)} KB)`
    )
  }

  // Light logo
  {
    const name = 'asistan-full-logo-light.png'
    const src = path.join(ROOT, name)
    const tmp = src + '.tmp.png'
    const before = fs.statSync(src).size
    await sharp(src)
      .resize({ width: 1210, withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: 80, palette: true })
      .toFile(tmp)
    fs.renameSync(tmp, src)
    console.log(
      `[ok] ${name} → ${(fs.statSync(src).size / 1024).toFixed(1)} KB (was ${(before / 1024).toFixed(1)} KB)`
    )
  }

  for (const name of [
    'asistan-logo.png',
    'asistan-main.png',
    'asistan-wordmark.png',
    'mobile-icon.png',
  ]) {
    const p = path.join(ROOT, name)
    if (fs.existsSync(p)) {
      fs.unlinkSync(p)
      console.log(`[del] ${name}`)
    }
  }

  console.log('[done]')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
