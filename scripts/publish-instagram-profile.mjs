import { chromium } from '@playwright/test'

const root = 'D:/asistan-web/social-media-posts/profile-v1/feed'

const posts = [
  {
    file: '02_tek_panel.png',
    caption: `Dağınık ajandalar ve manuel takip yerine daha net bir klinik akışı.

Randevu planlama, hasta bilgileri, ekip rolleri ve günlük operasyon görünümü Asistan Health ile tek panelde.

Demo için iletişime geçin.

#AsistanHealth #Klinik #Doktor #SağlıkTeknolojileri #KKTC`,
  },
  {
    file: '03_bos_saatler.png',
    caption: `Kliniğinizin uygun saatlerini daha görünür hale getirin.

Takviminizi ekipçe takip edin, günlük randevu akışını daha kolay planlayın.

Demo için iletişime geçin.

#RandevuYönetimi #KlinikYönetimi #AsistanHealth #KKTC`,
  },
  {
    file: '04_rezervasyon_yakinda.png',
    caption: `Randevu deneyimi iki taraf için de kolaylaşıyor.

Asistan Rezervasyon ile kullanıcılar bölgelerindeki klinikleri ve doktorları keşfedebilecek, uygun saatleri görüntüleyebilecek ve randevu talebi oluşturabilecek.

Gelişmeler için takip edin.

#Asistan #AsistanRezervasyon #KKTC #OnlineRandevu #SağlıkTeknolojileri`,
  },
  {
    file: '05_kimler_icin.png',
    caption: `Asistan Health, sağlık ekiplerinin gerçek günlük ritmine göre tasarlandı.

Klinikler, muayenehaneler, diş hekimleri, fizyoterapi merkezleri ve estetik klinikleri için daha düzenli bir operasyon akışı.

Size uygun kurulumu konuşalım.

#Klinik #DişHekimi #Fizyoterapi #EstetikKliniği #KKTC`,
  },
  {
    file: '06_rezervasyon_deneyimi.png',
    caption: `Yeni nesil randevu deneyimi yakında.

Klinikler için daha görünür takvim, kullanıcılar için daha kolay keşif ve uygun saate göre randevu talebi.

Gelişmeler için takip edin.

#AsistanRezervasyon #OnlineRandevu #KKTC #SağlıkTeknolojileri`,
  },
  {
    file: '07_uc_adim.png',
    caption: `Kliniğinizi dijital düzene taşımak karmaşık olmak zorunda değil.

Hesabınızı oluşturun, hizmet ve ekip bilgilerinizi ekleyin, randevu akışınızı tek panelden yönetmeye başlayın.

Demo için iletişime geçin.

#AsistanHealth #KlinikYönetimi #DijitalDönüşüm #KKTC`,
  },
  {
    file: '08_ekibinizle_yonetin.png',
    caption: `Doktor, sekreter ve yöneticiler aynı randevu düzenini görebilsin.

Asistan Health ile ortak takvim ve ekip rollerini tek merkezden yönetin.

Demo için iletişime geçin.

#EkipYönetimi #RandevuYönetimi #AsistanHealth #Klinik #KKTC`,
  },
  {
    file: '09_demo.png',
    caption: `Kliniğinizin ihtiyaçlarını birlikte değerlendirelim.

Asistan Health klinik yönetimi ve yaklaşan Asistan Rezervasyon deneyimi hakkında bilgi almak için Instagram üzerinden bize mesaj gönderin.

Demo için iletişime geçin.

#Asistan #AsistanHealth #AsistanRezervasyon #KKTC #Demo`,
  },
]

const browser = await chromium.connectOverCDP('http://127.0.0.1:9223')
const page = browser.contexts()[0].pages()[0]

async function closeCompletionDialog() {
  const done = page.getByText('Done', { exact: true })
  if (await done.count()) {
    await done.click()
    await page.waitForTimeout(1200)
  }
}

async function publish(post, index) {
  await closeCompletionDialog()
  await page.goto('https://www.instagram.com/asistan.kktc/', {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForTimeout(2500)

  await page.locator('svg[aria-label="New post"]').click()
  await page.waitForTimeout(1200)

  const dialog = page.locator('[role=dialog]')
  await dialog.getByText('Select From Computer', { exact: true }).waitFor()
  await page.locator('input[type=file]').last().setInputFiles(`${root}/${post.file}`)

  await dialog.getByText('Crop', { exact: true }).waitFor()
  await dialog.getByText('Next', { exact: true }).click()

  await dialog.getByText('Edit', { exact: true }).waitFor()
  await dialog.getByText('Next', { exact: true }).click()

  await dialog.locator('[contenteditable=true]').waitFor()
  await dialog.locator('[contenteditable=true]').fill(post.caption)
  await dialog.getByText('Share', { exact: true }).click()

  await dialog.getByText('Post shared', { exact: true }).waitFor({
    timeout: 90000,
  })
  console.log(`Shared ${index + 2}/9: ${post.file}`)
  await closeCompletionDialog()
}

for (const [index, post] of posts.entries()) {
  await publish(post, index)
}

await page.goto('https://www.instagram.com/asistan.kktc/', {
  waitUntil: 'domcontentloaded',
})
await page.waitForTimeout(5000)
console.log((await page.locator('body').innerText()).slice(0, 500))
await page.screenshot({
  path: 'D:/asistan-web/tmp-instagram-profile-complete.png',
  fullPage: true,
})

await browser.close()
