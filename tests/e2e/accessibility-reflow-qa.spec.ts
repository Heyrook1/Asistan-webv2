import { expect, test, type Page } from '@playwright/test'

const reflowRoutes = [
  { name: 'home', route: '/', selector: '[data-testid="home-hero-conversion-ctas"]' },
  { name: 'pricing', route: '/fiyatlandirma', selector: '[data-testid="pricing-plan-card"]' },
  { name: 'registration', route: '/tr/kayit', selector: 'form button[type="submit"]' },
  { name: 'demo request', route: '/contact', selector: 'form button[type="submit"]' },
] as const

async function expectRouteToReflow(page: Page, route: (typeof reflowRoutes)[number]) {
  await page.goto(route.route, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('main')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator(route.selector).first()).toBeVisible()

  const layout = await page.evaluate((selector) => {
    const root = document.documentElement
    const target = document.querySelector(selector)
    const rect = target?.getBoundingClientRect()

    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      target: rect
        ? { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) }
        : null,
    }
  }, route.selector)

  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1)
  expect(layout.target).not.toBeNull()
  expect(layout.target?.left).toBeGreaterThanOrEqual(-1)
  expect(layout.target?.right).toBeLessThanOrEqual(layout.clientWidth + 1)
}

test.describe('Critical accessibility and reflow QA', () => {
  for (const viewport of [
    { name: '320px reflow', width: 320, height: 844 },
    // 640 CSS px models a 1280px desktop viewport viewed at 200% zoom.
    { name: '200% zoom equivalent', width: 640, height: 900 },
  ]) {
    for (const route of reflowRoutes) {
      test(`${route.name} has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport)
        await expectRouteToReflow(page, route)
      })
    }
  }

  test('keyboard navigation exposes the main content and critical controls', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const skipLink = page.getByRole('link', { name: /ana.*ge./i })

    await page.keyboard.press('Tab')
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()

    await page.goto('/fiyatlandirma', { waitUntil: 'domcontentloaded' })
    const monthly = page.getByRole('radio').first()
    const annual = page.getByRole('radio').nth(1)
    await monthly.focus()
    await page.keyboard.press('ArrowRight')
    await expect(annual).toBeChecked()

    await page.goto('/tr/kayit', { waitUntil: 'domcontentloaded' })
    const terms = page.getByRole('checkbox', { name: /kullan.m.*kabul/i })
    await terms.focus()
    await page.keyboard.press('Space')
    await expect(terms).toBeChecked()
  })

  test('screen-reader roles and labels describe the registration and demo flows', async ({ page }) => {
    await page.goto('/tr/kayit', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Ad Soyad' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'E-posta Adresi' })).toBeVisible()
    await expect(page.locator('main form button[type="submit"]')).toBeVisible()

    await page.goto('/contact', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /ad soyad/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /postan/i })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: /gizlilik/i })).toBeVisible()
    await expect(page.locator('main form button[type="submit"]')).toBeVisible()
  })
})
