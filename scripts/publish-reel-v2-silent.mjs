import { chromium } from '@playwright/test'

const video =
  'D:/asistan-web/social-media-posts/reels/reel-02-premium-silent/asistan-health-reel-v2-silent.mp4'
const cover =
  'D:/asistan-web/social-media-posts/reels/reel-02-premium-silent/cover.png'

const caption = `Klinik yönetimi, daha sakin bir ritimde.

Asistan Health ile randevu, hasta ve ekip akışınızı tek bir merkezden yönetin.

Asistan Rezervasyon ile yeni nesil randevu deneyimi yakında.

Demo için iletişime geçin.

#Asistan #AsistanHealth #AsistanRezervasyon #KlinikYönetimi #RandevuYönetimi #KKTC`

const browser = await chromium.connectOverCDP('http://127.0.0.1:9223')
const page = browser.contexts()[0].pages()[0]

await page.goto('https://www.instagram.com/asistan.kktc/', {
  waitUntil: 'domcontentloaded',
})
await page.waitForTimeout(2200)
await page.getByLabel('New post').click()
await page.waitForTimeout(900)

let dialog = page.locator('[role=dialog]')
await dialog.getByText('Select From Computer', { exact: true }).waitFor()
await page.locator('input[type=file]').last().setInputFiles(video)

dialog = page.locator('[role=dialog]')
await dialog.getByText('Crop', { exact: true }).waitFor()
await dialog.getByText('Next', { exact: true }).click()

dialog = page.locator('[role=dialog]')
await dialog.getByText('Edit', { exact: true }).waitFor()
const chooseCover = dialog.getByText('Select From Computer', { exact: true })
if (await chooseCover.count()) {
  const chooser = page.waitForEvent('filechooser')
  await chooseCover.click()
  await (await chooser).setFiles(cover)
  await page.waitForTimeout(900)
}
await dialog.getByText('Next', { exact: true }).click()

dialog = page.locator('[role=dialog]')
await dialog.locator('[contenteditable=true]').fill(caption)
await dialog.getByText('Share', { exact: true }).click()

await page.locator('[role=dialog]').getByText('Reel shared', { exact: true }).waitFor({
  timeout: 120000,
})
console.log('Silent reel shared.')

const done = page.getByText('Done', { exact: true })
if (await done.count()) {
  await done.click()
}

await page.goto('https://www.instagram.com/asistan.kktc/', {
  waitUntil: 'domcontentloaded',
})
await page.waitForTimeout(4000)

const reelHrefs = await page.locator('a').evaluateAll((anchors) =>
  anchors
    .map((anchor) => anchor.getAttribute('href'))
    .filter((href) => href?.includes('/reel/'))
)

console.log(`reels=${JSON.stringify(reelHrefs)}`)
console.log((await page.locator('body').innerText()).slice(0, 240))

await page.screenshot({
  path: 'D:/asistan-web/tmp-instagram-profile-v2-reel.png',
  fullPage: true,
})

await browser.close()
