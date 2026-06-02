import { chromium } from '@playwright/test'

const root = 'D:/asistan-web/social-media-posts/profile-v2/feed'
const profileUrl = 'https://www.instagram.com/asistan.kktc/'

const posts = [
  {
    file: '09_marka.png',
    caption: `İşinizi yöneten akıllı asistan.

Sağlık ekipleri için klinik yönetimi. Kullanıcılar için yeni nesil rezervasyon deneyimi.

Demo için iletişime geçin.

#Asistan #AsistanHealth #AsistanRezervasyon #KKTC`,
  },
  {
    file: '08_kurulum.png',
    caption: `Üç adımda daha net bir başlangıç.

Hesabınızı oluşturun, ekibinizi tanımlayın ve randevu akışınızı tek noktadan yönetmeye başlayın.

Demo için iletişime geçin.

#AsistanHealth #DijitalDönüşüm #KlinikYönetimi #KKTC`,
  },
  {
    file: '07_ekip.png',
    caption: `Aynı ritimde ilerleyen ekipler.

Doktor, sekreter ve yöneticiler için ortak operasyon görünümü.

Demo için iletişime geçin.

#EkipYönetimi #KlinikYönetimi #AsistanHealth #KKTC`,
  },
  {
    file: '06_saglik_ekipleri.png',
    caption: `Sağlık ekiplerinin günlük ihtiyaçlarına uyum sağlayan sade bir altyapı.

Klinikler, muayenehaneler, diş hekimleri, fizyoterapi merkezleri ve estetik klinikleri için tasarlandı.

#AsistanHealth #Klinik #DişHekimi #Fizyoterapi #KKTC`,
  },
  {
    file: '05_bos_saatler.png',
    caption: `Boş saatler kaybolmasın.

Takviminizi ekipçe izleyin, günün akışını daha net planlayın.

Demo için iletişime geçin.

#RandevuYönetimi #Klinik #AsistanHealth #KKTC`,
  },
  {
    file: '04_tek_ekran.png',
    caption: `Bir klinik günü. Tek ekranda.

Randevularınızı, günlük yoğunluğu ve ekip akışını daha görünür hale getirin.

Demo için iletişime geçin.

#KlinikYönetimi #RandevuYönetimi #AsistanHealth #KKTC`,
  },
  {
    file: '03_demo.png',
    caption: `Kliniğinizi birlikte tanıyalım.

Size uygun kullanım senaryosunu değerlendirmek ve Asistan Health hakkında bilgi almak için bize mesaj gönderin.

Demo için iletişime geçin.

#Asistan #AsistanHealth #Demo #KKTC`,
  },
  {
    file: '02_rezervasyon.png',
    caption: `Randevunun yeni yolu yakında.

Asistan Rezervasyon ile kullanıcılar bölgelerindeki klinikleri keşfedebilecek ve uygun saatleri görüntüleyebilecek.

Gelişmeler için takip edin.

#AsistanRezervasyon #OnlineRandevu #KKTC #SağlıkTeknolojileri`,
  },
  {
    file: '01_marka_vaadi.png',
    caption: `Klinik yönetimi, daha sakin bir ritimde.

Asistan Health ile randevu, hasta ve ekip akışınızı tek bir merkezden yönetin.

Demo için iletişime geçin.

#Asistan #AsistanHealth #KlinikYönetimi #KKTC`,
  },
]

const browser = await chromium.connectOverCDP('http://127.0.0.1:9223')
const page = browser.contexts()[0].pages()[0]

async function waitForProfile() {
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2200)
}

async function removeCurrentPosts() {
  await waitForProfile()
  const hrefs = await page.locator('a').evaluateAll((anchors) =>
    anchors
      .map((anchor) => anchor.getAttribute('href'))
      .filter((href) => href?.includes('/p/'))
  )

  console.log(`Removing ${hrefs.length} old feed posts.`)

  for (const [index, href] of hrefs.entries()) {
    await page.goto(`https://www.instagram.com${href}`, {
      waitUntil: 'domcontentloaded',
    })
    await page.waitForTimeout(1600)
    await page.getByLabel('More Options').click()
    await page.getByText('Delete', { exact: true }).click()
    await page.getByText('Delete', { exact: true }).last().click()
    await page.waitForTimeout(1400)
    console.log(`Removed ${index + 1}/${hrefs.length}`)
  }
}

async function closeCompletionDialog() {
  const done = page.getByText('Done', { exact: true })
  if (await done.count()) {
    await done.click()
    await page.waitForTimeout(1000)
  }
}

async function publish(post, index) {
  await closeCompletionDialog()
  await waitForProfile()
  await page.getByLabel('New post').click()
  await page.waitForTimeout(900)

  const dialog = page.locator('[role=dialog]')
  await dialog.getByText('Select From Computer', { exact: true }).waitFor()
  await page.locator('input[type=file]').last().setInputFiles(`${root}/${post.file}`)

  await dialog.getByText('Crop', { exact: true }).waitFor()
  await dialog.getByText('Next', { exact: true }).click()
  await dialog.getByText('Edit', { exact: true }).waitFor()
  await dialog.getByText('Next', { exact: true }).click()

  await dialog.locator('[contenteditable=true]').fill(post.caption)
  await dialog.getByText('Share', { exact: true }).click()
  await dialog.getByText('Post shared', { exact: true }).waitFor({
    timeout: 90000,
  })
  console.log(`Shared v2 ${index + 1}/${posts.length}: ${post.file}`)
  await closeCompletionDialog()
}

await removeCurrentPosts()

for (const [index, post] of posts.entries()) {
  await publish(post, index)
}

await waitForProfile()
console.log((await page.locator('body').innerText()).slice(0, 300))
await page.screenshot({
  path: 'D:/asistan-web/tmp-instagram-profile-v2.png',
  fullPage: true,
})

await browser.close()
