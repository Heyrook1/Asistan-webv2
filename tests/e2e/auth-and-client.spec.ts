import { test, expect } from '@playwright/test'

test.describe('Auth gate & client discovery', () => {
  test.setTimeout(60_000)

  test('dashboard redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/(tr\/giris|en\/login|auth\/login)/, { timeout: 30_000 })
    await expect(page.getByLabel(/e-?posta|email/i).first()).toBeVisible({ timeout: 20_000 })
  })

  test('package-expired reason banner can render on login', async ({ page }) => {
    await page.goto('/tr/giris?reason=package-expired', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('alert').filter({ hasText: /paket|süresi|expire/i })).toBeVisible({
      timeout: 20_000,
    })
  })

  test('client discovery home loads in Turkish by default', async ({ page }) => {
    await page.goto('/client', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole('button', { name: /klinik ara|search clinics/i })).toBeVisible()
  })

  test('client clinics page shows filters', async ({ page }) => {
    await page.goto('/client/clinics', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/bugün müsait|available today/i).first()).toBeVisible({
      timeout: 30_000,
    })
  })
})
