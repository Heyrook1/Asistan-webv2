import { expect, test } from '@playwright/test'

test.describe('Pricing plan decision area', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('shows all plan prices and core differences in the first scroll', async ({ page }) => {
    await page.goto('/fiyatlandirma', { waitUntil: 'domcontentloaded' })

    const planGrid = page.getByTestId('pricing-plan-grid')
    const planCards = page.getByTestId('pricing-plan-card')

    await expect(planGrid).toBeVisible({ timeout: 30_000 })
    await expect(planCards).toHaveCount(3)

    const [gridTop, proofTop] = await Promise.all([
      planGrid.evaluate((element) => element.getBoundingClientRect().top + window.scrollY),
      page
        .locator('#pricing-proof-gate-title')
        .evaluate((element) => element.getBoundingClientRect().top + window.scrollY),
    ])
    expect(gridTop).toBeLessThan(proofTop)
    expect(gridTop).toBeLessThan(560)

    await page.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight * 0.75)))

    for (const card of await planCards.all()) {
      await expect(card).toBeInViewport()
      await expect(card.getByRole('heading', { level: 2 })).toBeInViewport()
      await expect(card.getByText(/TRY|İletişime geçiniz/).first()).toBeInViewport()
      await expect(card.locator('li').first()).toBeInViewport()
    }
  })
})
