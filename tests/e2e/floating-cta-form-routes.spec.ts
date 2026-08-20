import { test, expect } from '@playwright/test'

const formRoutes = ['/contact', '/tr/kayit']
const viewports = [320, 390, 768, 1440]
const contactScreenshotViewports = [
  { name: 'mobile-320', width: 320, height: 844 },
  { name: 'mobile-360', width: 360, height: 844 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 },
]

test.describe('Floating CTA form-route guard', () => {
  test('never renders over form controls from 320px to 1440px', async ({ page }) => {
    for (const route of formRoutes) {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('form').first()).toBeVisible({ timeout: 30_000 })
      await page.waitForTimeout(500)

      for (const width of viewports) {
        await page.setViewportSize({ width, height: 900 })
        await expect(page.getByTestId('floating-cta')).toHaveCount(0)
      }
    }
  })

  test('contact form preserves the approved layout at key breakpoints', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

    for (const viewport of contactScreenshotViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/contact', { waitUntil: 'domcontentloaded' })
      await expect(page.locator('form').first()).toBeVisible({ timeout: 30_000 })
      await page.addStyleTag({
        content: 'nextjs-portal { display: none !important; }',
      })
      await page.waitForTimeout(500)
      await expect(page).toHaveScreenshot(`contact-form-${viewport.name}.png`, {
        animations: 'disabled',
        caret: 'hide',
        fullPage: false,
      })
    }
  })
})
