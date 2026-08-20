import { expect, test } from '@playwright/test'

test.describe('Mobile navigation modal behavior', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('is modal, traps focus, and restores focus after Escape', async ({ page }) => {
    await page.goto('/fiyatlandirma', { waitUntil: 'domcontentloaded' })

    const trigger = page.getByRole('button', { name: 'Gezinme menüsünü aç' })
    await expect(trigger).toBeVisible({ timeout: 30_000 })
    // Wait for the client-side dialog and focus-trap handlers to hydrate.
    await page.waitForTimeout(300)
    await trigger.click()

    const dialog = page.getByRole('dialog', { name: 'Mobil menü' })
    const focusable = dialog.locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
    const firstFocusable = focusable.first()
    const lastFocusable = focusable.last()

    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(page.locator('#main-content')).toHaveAttribute('inert', '')
    await expect(firstFocusable).toBeFocused()

    await lastFocusable.focus()
    await page.keyboard.press('Tab')
    await expect(firstFocusable).toBeFocused()

    await firstFocusable.focus()
    await page.keyboard.press('Shift+Tab')
    await expect(lastFocusable).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(page.locator('#main-content')).not.toHaveAttribute('inert', '')
    await expect(trigger).toBeFocused()
  })
})
