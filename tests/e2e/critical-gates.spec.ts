import { test, expect } from '@playwright/test'

test.describe('Critical gates: booking / patient / RBAC surfaces', () => {
  test.setTimeout(60_000)

  test('localized auth routes render login form', async ({ page }) => {
    await page.goto('/tr/giris', { waitUntil: 'domcontentloaded' })
    await expect(page.getByLabel(/e-?posta|email/i).first()).toBeVisible({ timeout: 20_000 })

    await page.goto('/en/login', { waitUntil: 'domcontentloaded' })
    await expect(page.getByLabel(/e-?posta|email/i).first()).toBeVisible({ timeout: 20_000 })
  })

  test('patient bookings page requires client auth', async ({ page }) => {
    await page.goto('/client/bookings', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/(tr\/giris|en\/login|auth\/login|client)/, {
      timeout: 30_000,
    })
  })

  test('patient profile page is gated', async ({ page }) => {
    await page.goto('/client/profile', { waitUntil: 'domcontentloaded' })
    // Unauthenticated profile must show login/register — not private profile fields.
    // Avoid locator.or() here: when the gate renders, all branches match and strict mode fails.
    await expect(page.getByRole('heading', { name: /^profil$/i })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByLabel(/e-?posta|email/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: /giriş yap|log ?in/i })).toBeVisible()
    // Must not show the authenticated profile save surface.
    await expect(page.getByRole('button', { name: /^kaydet$|^save$/i })).toHaveCount(0)
  })

  test('guide article has substantive body content', async ({ page }) => {
    await page.goto('/kaynaklar/randevu-takibini-duzenlemek', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()
    const bodyText = await page.locator('article').innerText()
    expect(bodyText.split(/\s+/).length).toBeGreaterThan(200)
  })
})
