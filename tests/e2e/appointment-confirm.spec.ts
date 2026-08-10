import { test, expect } from '@playwright/test'

/**
 * P0-01 — clinic confirm from list + calendar.
 * Requires E2E_CLINIC_EMAIL + E2E_CLINIC_PASSWORD (seed: demo.owner@example.com).
 */
const email = process.env.E2E_CLINIC_EMAIL ?? process.env.DEMO_CLINIC_EMAIL
const password = process.env.E2E_CLINIC_PASSWORD ?? process.env.DEMO_CLINIC_PASSWORD
const hasCreds = Boolean(email && password)

async function clinicLogin(page: import('@playwright/test').Page) {
  await page.goto('/tr/giris', { waitUntil: 'domcontentloaded' })
  await page.getByLabel(/e-?posta|email/i).first().fill(email!)
  await page.locator('input[type="password"]').first().fill(password!)
  await page.getByRole('button', { name: /giriş yap|log ?in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 45_000 })
}

test.describe('P0-01 appointment confirm', () => {
  test.setTimeout(90_000)
  test.skip(!hasCreds, 'Set E2E_CLINIC_EMAIL and E2E_CLINIC_PASSWORD to run confirm e2e')

  test('list view: Onayla updates status without crashing', async ({ page }) => {
    await clinicLogin(page)
    await page.goto('/dashboard/ajanda?mode=liste&status=SCHEDULED', {
      waitUntil: 'domcontentloaded',
    })

    const row = page.locator('li[id^="appointment-"]').filter({ hasText: /Onay bekliyor|Bekliyor|SCHEDULED/i }).first()
    const hasPending = await row.count().then((n) => n > 0).catch(() => false)
    if (!hasPending) {
      test.skip(true, 'No SCHEDULED appointment in list for this clinic')
      return
    }

    await row.getByLabel('İşlemler').click()
    await page.getByTestId('appointment-confirm').click()

    await expect(page.getByText(/Bir hata oluştu/i)).toHaveCount(0)
    await expect(
      page.getByText(/Durum güncellendi:\s*Onaylandı|Randevu zaten:\s*Onaylandı/i).first(),
    ).toBeVisible({ timeout: 20_000 })
  })

  test('calendar view: Onayla updates status without crashing', async ({ page }) => {
    await clinicLogin(page)
    await page.goto('/dashboard/ajanda?mode=takvim', { waitUntil: 'domcontentloaded' })

    // Prefer desktop day/week chips; fall back to mobile agenda.
    const confirmBtn = page.getByTestId(/calendar-confirm-/).first()
    const visible = await confirmBtn.isVisible().catch(() => false)
    if (!visible) {
      // Try status filter SCHEDULED so pending events show.
      const filter = page.getByRole('combobox').filter({ hasText: /durum|status|ajanda/i }).first()
      if (await filter.count()) {
        await filter.click().catch(() => undefined)
      }
    }

    const stillMissing = !(await confirmBtn.isVisible().catch(() => false))
    if (stillMissing) {
      test.skip(true, 'No SCHEDULED event with Onayla on calendar for this clinic')
      return
    }

    await confirmBtn.click()
    await expect(page.getByText(/Bir hata oluştu/i)).toHaveCount(0)
    await expect(
      page.getByText(/Durum güncellendi:\s*Onaylandı|Randevu zaten:\s*Onaylandı/i).first(),
    ).toBeVisible({ timeout: 20_000 })
  })
})
