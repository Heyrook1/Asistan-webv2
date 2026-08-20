import { expect, test } from '@playwright/test'

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]

test.describe('Registration page heading structure', () => {
  for (const viewport of viewports) {
    test(`${viewport.name} starts with one descriptive H1`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/tr/kayit', { waitUntil: 'domcontentloaded' })

      const formHeading = page.getByRole('heading', {
        level: 1,
        name: 'Kliniğinizde 14 gün ücretsiz deneyin',
      })

      await expect(formHeading).toBeVisible({ timeout: 30_000 })
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.getByRole('heading').first()).toHaveText('Kliniğinizde 14 gün ücretsiz deneyin')
    })
  }
})
