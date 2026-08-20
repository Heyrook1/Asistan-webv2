import { test, expect } from '@playwright/test'

/**
 * Locale regression guard for the patient app.
 *
 * The existing client specs match /bugün müsait|available today/i, which passes
 * in either language — that permissiveness is why a half-Turkish English page
 * shipped unnoticed. These assertions are deliberately one-sided: each locale
 * must show its own copy AND must not show the other's.
 *
 * Locale is the `asistan-lang` cookie (no path-based routing — /en 404s by
 * design), read server-side by lib/server-language.ts and client-side by
 * contexts/LanguageContext.
 */

const CLINICS = '/client/clinics'

// Copy owned by server components — these were the ones stuck in Turkish.
// Only the h1 heading qualifies: it is computed in app/client/clinics/page.tsx
// before any catalogue branch, so it renders whatever the database does. The
// empty-catalogue banner copy is deliberately NOT asserted here — CI runs
// without a database, so loadClinics returns failed:true and the page takes the
// error branch, where that banner never mounts.
const TR_ONLY = ['Uzman veya klinik ara']
const EN_ONLY = ['Search a specialist or clinic']

async function setLocale(context: import('@playwright/test').BrowserContext, lang: 'tr' | 'en', baseURL: string) {
  await context.addCookies([
    { name: 'asistan-lang', value: lang, url: baseURL, sameSite: 'Lax' },
  ])
}

test.describe('Patient app locale', () => {
  test.setTimeout(90_000)

  test('English locale renders no Turkish UI copy', async ({ context, page, baseURL }) => {
    await setLocale(context, 'en', baseURL!)
    await page.goto(CLINICS, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 })

    for (const phrase of EN_ONLY) {
      await expect(page.getByText(phrase, { exact: false }).first()).toBeVisible({
        timeout: 15_000,
      })
    }
    for (const phrase of TR_ONLY) {
      await expect(page.getByText(phrase, { exact: false })).toHaveCount(0)
    }
  })

  test('Turkish locale renders no English UI copy', async ({ context, page, baseURL }) => {
    await setLocale(context, 'tr', baseURL!)
    await page.goto(CLINICS, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 })

    for (const phrase of TR_ONLY) {
      await expect(page.getByText(phrase, { exact: false }).first()).toBeVisible({
        timeout: 15_000,
      })
    }
    for (const phrase of EN_ONLY) {
      await expect(page.getByText(phrase, { exact: false })).toHaveCount(0)
    }
  })

  test('locale is correct in server-rendered HTML, not just after hydration', async ({
    request,
    baseURL,
  }) => {
    // The bug class was server components unable to reach the client-side t(),
    // so asserting on the raw SSR payload is the assertion that actually bites.
    const en = await request.get(baseURL! + CLINICS, {
      headers: { Cookie: 'asistan-lang=en' },
    })
    expect(en.status()).toBe(200)
    const enHtml = await en.text()
    expect(enHtml).toContain('Search a specialist or clinic')
    expect(enHtml).not.toContain('Uzman veya klinik ara')

    const tr = await request.get(baseURL! + CLINICS, {
      headers: { Cookie: 'asistan-lang=tr' },
    })
    expect(tr.status()).toBe(200)
    const trHtml = await tr.text()
    expect(trHtml).toContain('Uzman veya klinik ara')
    expect(trHtml).not.toContain('Search a specialist or clinic')
  })
})
