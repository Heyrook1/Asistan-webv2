import { test, expect } from '@playwright/test'

test.describe('Public marketing & SEO', () => {
  test.setTimeout(120_000)

  test('homepage renders brand and primary CTA region', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('body')).toBeVisible()
    await expect(page.getByRole('link').first()).toBeVisible({ timeout: 20_000 })
  })

  test('privacy page is indexable content', async ({ page }) => {
    await page.goto('/privacy', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/gizlilik|kvkk|privacy/i, {
      timeout: 45_000,
    })
  })

  test('terms page is indexable content', async ({ page }) => {
    await page.goto('/terms', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/kullanım|koşul|terms/i, {
      timeout: 45_000,
    })
  })

  test('kaynaklar guide cards link to real articles', async ({ page }) => {
    await page.goto('/kaynaklar', { waitUntil: 'domcontentloaded' })
    const guideLink = page.locator('a[href^="/kaynaklar/"]').first()
    await expect(guideLink).toBeVisible({ timeout: 45_000 })

    const href = await guideLink.getAttribute('href')
    expect(href).toMatch(/^\/kaynaklar\/[a-z0-9-]+$/)

    await page.goto(href!, { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/kaynaklar\/[a-z0-9-]+/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 })
  })

  test('/sonuclar never exposes draft/internal or unverified pilot duration claims', async ({
    page,
  }) => {
    await page.goto('/sonuclar', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 45_000 })
    const body = await page.locator('body').innerText()
    expect(body).not.toMatch(/kktc-signed-noshow-template/i)
    expect(body).not.toMatch(/status\s*=\s*draft/i)
    expect(body).not.toContain('İmzalı metrik şablonu')
    expect(body).not.toContain('Innovation pillar')
    expect(body).not.toMatch(/90 günlük|60 günlük|45 günlük/)
    expect(body).toMatch(/doğrulanmış|yayınlamıyoruz|onay/i)
  })

  test('sitemap.xml and robots.txt are served', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    const sitemapBody = await sitemap.text()
    expect(sitemapBody).toContain('https://kktc.asistan.online/')
    expect(sitemapBody).toContain('/privacy')
    expect(sitemapBody).not.toContain('/dashboard')

    const robots = await request.get('/robots.txt')
    expect(robots.ok()).toBeTruthy()
    const robotsBody = await robots.text()
    expect(robotsBody).toContain('Sitemap:')
    expect(robotsBody).toMatch(/Disallow:\s*\/dashboard/i)
  })
})
