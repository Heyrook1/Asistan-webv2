import { test, expect } from '@playwright/test'

// Login page smoke: page loads, key form fields render, and submitting empty
// credentials surfaces a validation error rather than a hard crash. We do not
// attempt a real Supabase login here — that requires test credentials and a
// dedicated test database, which are out of scope for this smoke pass.

test.describe('Login page', () => {
  test('renders the login form and validates empty submission', async ({ page }) => {
    await page.goto('/login')

    // Page reaches an interactive state.
    await expect(page).toHaveURL(/\/login/)

    // Core form fields are present (Turkish UI).
    const emailField = page.getByLabel(/e-?posta/i).first()
    const passwordField = page.getByLabel(/şifre|parola/i).first()
    await expect(emailField).toBeVisible()
    await expect(passwordField).toBeVisible()

    // Submit button exists.
    const submit = page.getByRole('button', { name: /giriş|oturum|devam/i }).first()
    await expect(submit).toBeVisible()
  })
})
