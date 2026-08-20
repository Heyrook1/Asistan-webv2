import { expect, test } from '@playwright/test'

test.describe('Contact form validation recovery', () => {
  test('prompts the user to correct invalid fields and focuses the first one', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('form').first()).toBeVisible({ timeout: 30_000 })

    await page.getByRole('button', { name: 'Talebi gönder' }).click()

    await expect(page.getByTestId('contact-validation-summary')).toHaveText(
      'Lütfen işaretli alanları düzeltin',
    )
    await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('#contact-name')).toBeFocused()
  })
})
