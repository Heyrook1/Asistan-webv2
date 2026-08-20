import { expect, test, type Locator } from '@playwright/test'

async function expectConversionPair(container: Locator) {
  const primary = container.locator('[data-cta-priority="primary"]')
  const secondary = container.locator('[data-cta-priority="secondary"]')

  await expect(primary).toHaveCount(1)
  await expect(secondary).toHaveCount(1)
  await expect(primary).toHaveAttribute('href', '/tr/kayit')
  await expect(secondary).toHaveAttribute('href', '/contact')

  const targets = await container.locator('a').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  )
  expect(targets.filter((href) => href === '/tr/kayit')).toHaveLength(1)
  expect(targets.filter((href) => href === '/contact')).toHaveLength(1)
}

test.describe('Conversion CTA hierarchy', () => {
  test('home prioritizes the free trial and avoids duplicate conversion targets', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    for (const testId of [
      'home-hero-conversion-ctas',
      'home-pricing-conversion-ctas',
      'home-final-conversion-ctas',
    ]) {
      await expectConversionPair(page.getByTestId(testId))
    }

    const header = page.locator('header')
    await expect(header.locator('[data-cta-priority="primary"]')).toHaveCount(1)
    await expect(header.locator('[data-cta-priority="primary"]')).toHaveAttribute('href', '/tr/kayit')
    await expect(header.locator('[data-cta-priority="secondary"]')).toHaveCount(0)

    await expect(page.getByTestId('floating-cta')).toHaveCount(0)
    // The CTA's scroll listener is installed after client hydration.
    await page.waitForTimeout(300)
    await page.evaluate(() => window.scrollTo(0, 600))
    await expect(page.getByTestId('floating-cta')).toBeVisible()
    await expect(page.getByTestId('floating-cta').locator('a')).toHaveAttribute('href', '/tr/kayit')
  })

  test('mobile navigation keeps the trial primary and the demo secondary', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /gez/i }).click()

    await expectConversionPair(page.locator('#mobile-navigation-menu'))
  })

  test('pricing conversion zones use the same CTA pair', async ({ page }) => {
    await page.goto('/fiyatlandirma', { waitUntil: 'domcontentloaded' })

    for (const testId of [
      'pricing-conversion-ctas',
      'pricing-faq-conversion-ctas',
      'pricing-final-conversion-ctas',
    ]) {
      await expectConversionPair(page.getByTestId(testId))
    }
  })
})
