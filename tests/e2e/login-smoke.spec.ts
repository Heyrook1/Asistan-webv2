import { test, expect } from '@playwright/test'

// Login page smoke: page loads, key form fields render.
// We do not attempt a real Supabase login here — that requires test credentials
// and a dedicated test database.

test.describe('Login page', () => {
  test.setTimeout(60_000)

  test('renders the login form on localized route', async ({ page }) => {
    await page.goto('/tr/giris', { waitUntil: 'domcontentloaded' })

    await expect(page).toHaveURL(/\/tr\/giris/)

    const emailField = page.getByLabel(/e-?posta|email/i).first()
    const passwordField = page.getByLabel(/şifre|sifre|password|parola/i).first()
    await expect(emailField).toBeVisible({ timeout: 20_000 })
    await expect(passwordField).toBeVisible()

    const submit = page.getByRole('button', { name: /giriş|giris|sign in|oturum|devam/i }).first()
    await expect(submit).toBeVisible()
  })

  test('legacy /auth/login preserves query and lands on localized login', async ({ page }) => {
    await page.goto('/auth/login?reason=package-expired', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/(tr\/giris|en\/login).*reason=package-expired/, {
      timeout: 20_000,
    })
  })
})
