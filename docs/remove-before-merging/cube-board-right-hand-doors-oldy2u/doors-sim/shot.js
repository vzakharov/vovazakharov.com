const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, colorScheme: 'dark' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.waitForFunction(() => document.getElementById('chart').childElementCount > 0, null, { timeout: 60000 });
  await page.screenshot({ path: path.join(__dirname, 'shot.png'), fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log({ errors, overflow });
  await browser.close();
})();
