import { expect, test } from '@playwright/test'

test.describe('Header more menu', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('keeps overflow navigation visible below the header bar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const moreMenu = page.locator('[data-header-more]')
    await moreMenu.getByRole('button', { name: 'Daha fazla' }).click()

    const menu = moreMenu.getByRole('menu')
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Kaynaklar' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Hakkımızda' })).toBeVisible()
  })
})
