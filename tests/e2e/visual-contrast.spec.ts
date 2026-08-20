import { expect, test, type Page } from '@playwright/test'

type Rgb = [number, number, number]

function hexToRgb(hex: string): Rgb {
  const value = hex.replace('#', '')
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

function contrastRatio(foreground: Rgb, background: Rgb) {
  const luminance = (rgb: Rgb) =>
    rgb
      .map((channel) => {
        const value = channel / 255
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
      })
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)

  const [first, second] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (first + 0.05) / (second + 0.05)
}

async function expectPlaceholderContrast(page: Page, selector: string) {
  const details = await page.locator(selector).evaluate((element) => {
    return {
      placeholder: element.getAttribute('placeholder'),
      mutedForeground: getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim(),
    }
  })

  expect(details.placeholder).toBeTruthy()
  expect(contrastRatio(hexToRgb(details.mutedForeground), [255, 255, 255])).toBeGreaterThanOrEqual(4.5)
}

test.describe('Visual text contrast', () => {
  test('shared text palette clears AA contrast on its intended surfaces', () => {
    const pairs = [
      ['normal foreground', '#1D1D1F', '#F7F7F5', 4.5],
      ['normal muted text', '#5D6068', '#F7F7F5', 4.5],
      ['interactive blue text', '#0063C8', '#F7F7F5', 4.5],
      ['white text on primary action', '#FFFFFF', '#0071E3', 4.5],
      ['required-state text', '#C22326', '#FFFFFF', 4.5],
      ['success-state text', '#047857', '#FFFFFF', 4.5],
      ['warning-state text', '#A16207', '#FFFFFF', 4.5],
      ['alert-state text', '#C2410C', '#FFFFFF', 4.5],
      ['information-state text', '#0369A1', '#FFFFFF', 4.5],
      ['large muted text', '#5D6068', '#FFFFFF', 3],
      ['dark interactive blue text', '#5BA3F5', '#0B1220', 4.5],
      ['dark muted text', '#94A3B8', '#0B1220', 4.5],
      ['dark required-state text', '#F87171', '#0B1220', 4.5],
      ['dark success-state text', '#34D399', '#0B1220', 4.5],
      ['dark warning-state text', '#FBBF24', '#0B1220', 4.5],
      ['dark alert-state text', '#FB923C', '#0B1220', 4.5],
      ['dark information-state text', '#38BDF8', '#0B1220', 4.5],
    ] as const

    for (const [, foreground, background, minimum] of pairs) {
      expect(contrastRatio(hexToRgb(foreground), hexToRgb(background))).toBeGreaterThanOrEqual(minimum)
    }
  })

  test('contact labels, helper copy, badge and placeholders render with AA contrast', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(500)
    await expect(page.getByRole('heading', { name: /Bize ulaşın|Contact us/i })).toBeVisible()

    await expectPlaceholderContrast(page, '#contact-name')
    await expectPlaceholderContrast(page, '#contact-email')
    await expectPlaceholderContrast(page, '#contact-message')

    await expect(page.locator('.marketing-chip').first()).toHaveCSS('color', 'rgb(0, 99, 200)')
  })

  test('home uses the accessible blue text tone and footer placeholder', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(500)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const eyebrowColor = await page.locator('p.text-\\[\\#0071E3\\]').first().evaluate((element) => getComputedStyle(element).color)
    expect(eyebrowColor).toBe('rgb(0, 99, 200)')
    await expectPlaceholderContrast(page, 'footer input[type="email"]')
  })
})
