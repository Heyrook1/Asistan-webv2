import { expect, test } from '@playwright/test'

test.describe('Contact form honeypot accessibility', () => {
  test('keeps the Website honeypot out of the visual, keyboard, and accessibility flows', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('form').first()).toBeVisible({ timeout: 30_000 })

    const honeypot = page.locator('#contact-website')
    await expect(honeypot).not.toBeVisible()
    await expect(honeypot).toHaveAttribute('tabindex', '-1')
    await expect(page.getByRole('textbox', { name: 'Website' })).toHaveCount(0)

    await page.locator('#contact-name').focus()
    await page.keyboard.press('Shift+Tab')
    await expect(honeypot).not.toBeFocused()
  })
})
