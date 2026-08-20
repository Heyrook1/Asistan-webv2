import { expect, test, type Locator } from '@playwright/test'

async function expectLabelToBeTouchTarget(label: Locator, checkbox: Locator, visibleCopy: Locator) {
  await expect(label).toBeVisible()
  await expect(checkbox).not.toBeChecked()

  const box = await label.boundingBox()
  expect(box).not.toBeNull()
  expect(box?.width).toBeGreaterThanOrEqual(44)
  expect(box?.height).toBeGreaterThanOrEqual(44)

  // A non-link portion of the visible consent copy must toggle the associated control.
  await visibleCopy.click()
  await expect(checkbox).toBeChecked()
}

test.describe('Checkbox touch targets', () => {
  for (const viewport of [
    { name: 'mobile', width: 320, height: 844 },
    { name: 'desktop', width: 1440, height: 900 },
  ]) {
    test(`${viewport.name} contact consent label is a 44px clickable target`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/contact', { waitUntil: 'domcontentloaded' })
      await expect(page.locator('form').first()).toBeVisible({ timeout: 30_000 })

      await expectLabelToBeTouchTarget(
        page.locator('label[for="contact-privacy"]'),
        page.locator('#contact-privacy'),
        page.locator('label[for="contact-privacy"] span.text-red-500'),
      )
    })

    test(`${viewport.name} registration consent label is a 44px clickable target`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/tr/kayit', { waitUntil: 'domcontentloaded' })
      await expect(page.locator('form').first()).toBeVisible({ timeout: 30_000 })

      await expectLabelToBeTouchTarget(
        page.locator('label[for="register-terms"]'),
        page.locator('#register-terms'),
        page.locator('label[for="register-terms"] span[aria-hidden="true"]'),
      )
    })
  }
})
