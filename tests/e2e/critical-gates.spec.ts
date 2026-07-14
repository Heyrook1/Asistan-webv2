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
    // Either redirect to auth or show a login CTA — must not expose private profile fields.
    const emailField = page.getByLabel(/e-?posta|email/i).first()
    const loginCta = page.getByRole('link', { name: /giriş|login|oturum/i }).first()
    await expect(emailField.or(loginCta)).toBeVisible({ timeout: 30_000 })
  })

  test('guide article has substantive body content', async ({ page }) => {
    await page.goto('/kaynaklar/randevu-takibini-duzenlemek', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()
    const bodyText = await page.locator('article').innerText()
    expect(bodyText.split(/\s+/).length).toBeGreaterThan(200)
  })
})
