const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  const destDir = path.join(__dirname, '../social-media-posts/reels/templates');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  console.log('Navigating to dark theme...');
  await page.goto('http://localhost:3000/tools/reels-outro?preview=true&theme=midnight-navy');
  console.log('Waiting for animations...');
  await page.waitForTimeout(6000);
  const darkPath = path.join(destDir, 'reels_outro_final_dark.png');
  await page.screenshot({ path: darkPath, type: 'png' });
  console.log('Dark screenshot saved to:', darkPath);

  console.log('Navigating to light theme...');
  await page.goto('http://localhost:3000/tools/reels-outro?preview=true&theme=clean-light');
  console.log('Waiting for animations...');
  await page.waitForTimeout(6000);
  const lightPath = path.join(destDir, 'reels_outro_final_light.png');
  await page.screenshot({ path: lightPath, type: 'png' });
  console.log('Light screenshot saved to:', lightPath);

  const artDir = 'C:/Users/Ersan/.gemini/antigravity/brain/996b6a8c-0892-439b-a623-156288ff7752';
  fs.copyFileSync(darkPath, path.join(artDir, 'reels_outro_final_dark_updated.png'));
  fs.copyFileSync(lightPath, path.join(artDir, 'reels_outro_final_light_updated.png'));
  console.log('Copied to artifacts.');

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
