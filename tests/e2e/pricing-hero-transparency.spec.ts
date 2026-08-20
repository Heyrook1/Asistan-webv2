import { expect, test } from '@playwright/test'

test.describe('Pricing hero and transparency content', () => {
  test('keeps plan selection in the hero and limitations in the lower transparency section', async ({ page }) => {
    await page.goto('/fiyatlandirma', { waitUntil: 'domcontentloaded' })

    const hero = page.getByTestId('pricing-hero')
    const summary = page.getByTestId('pricing-hero-summary')
    const planGrid = page.getByTestId('pricing-plan-grid')
    const transparency = page.getByTestId('pricing-transparency')

    await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Ekibinize uygun planı seçin.')
    await expect(summary).toContainText('Kullanıcı sayınızı, operasyon ihtiyacınızı ve bütçenizi karşılaştırın')
    await expect(summary).not.toContainText('İmzalı pilot')
    await expect(summary).not.toContainText('satış baskısı')

    await expect(transparency).toContainText('Şeffaflık')
    await expect(transparency).toContainText('Erken erişim şeffaflık notları')
    await expect(transparency).toContainText('SMS/WhatsApp')

    const [gridTop, transparencyTop] = await Promise.all([
      planGrid.evaluate((element) => element.getBoundingClientRect().top + window.scrollY),
      transparency.evaluate((element) => element.getBoundingClientRect().top + window.scrollY),
    ])
    expect(gridTop).toBeLessThan(transparencyTop)
  })
})
