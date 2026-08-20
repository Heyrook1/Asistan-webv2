import { test, expect } from '@playwright/test'

const requiredFields = ['contact-name', 'contact-email']
const optionalFields = ['contact-phone', 'contact-company', 'contact-service-type', 'contact-message']

test.describe('Contact form requirement labels', () => {
  test('explains required and optional fields before submission', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('form').first()).toBeVisible({ timeout: 30_000 })

    for (const fieldId of requiredFields) {
      await expect(page.locator(`label[for="${fieldId}"]`)).toContainText('Zorunlu')
      await expect(page.locator(`#${fieldId}`)).toHaveAttribute('required', '')
    }

    for (const fieldId of optionalFields) {
      await expect(page.locator(`label[for="${fieldId}"]`)).toContainText('İsteğe bağlı')
    }

    for (const fieldId of ['contact-phone', 'contact-company', 'contact-message']) {
      await expect(page.locator(`#${fieldId}`)).not.toHaveAttribute('required', '')
    }
    await expect(page.locator('#contact-privacy')).toHaveAttribute('required', '')
    await expect(page.locator('label[for="contact-privacy"]')).toContainText('Zorunlu')
  })
})
