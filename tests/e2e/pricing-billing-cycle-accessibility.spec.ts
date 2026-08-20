import { expect, test } from '@playwright/test'

test.describe('Pricing billing cycle accessibility', () => {
  test('exposes the selected cycle as a radio group and updates it with the keyboard', async ({ page }) => {
    await page.goto('/fiyatlandirma', { waitUntil: 'domcontentloaded' })

    const cycleGroup = page.getByRole('radiogroup', { name: 'Faturalandırma dönemi' })
    const monthly = page.getByRole('radio', { name: 'Aylık' })
    const annual = page.getByRole('radio', { name: 'Yıllık' })

    await expect(cycleGroup).toBeVisible({ timeout: 30_000 })
    await page.waitForTimeout(300)
    await expect(cycleGroup).toHaveAttribute('aria-describedby', 'pricing-cycle-status')
    await expect(monthly).toBeChecked()
    await expect(annual).not.toBeChecked()

    await monthly.focus()
    await page.keyboard.press('ArrowRight')

    await expect(annual).toBeChecked()
    await expect(monthly).not.toBeChecked()
    await expect(page.locator('#pricing-cycle-status')).toContainText('Yıllık faturalandırma')
  })
})
