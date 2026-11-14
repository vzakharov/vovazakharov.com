const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.click('[data-u="side"]');
  await p.$eval('#density', (el) => { el.value = 100; el.dispatchEvent(new Event('input')); });
  for (const k of ['4', '5', '6', '7']) {
    await p.click(`[data-k="${k}"]`);
    for (const s of ['none', 'arm']) {
      await p.click(`[data-s="${s}"]`);
      console.log(k, s, await p.textContent('#gapOut'), '—', await p.textContent('#placedOut'));
    }
  }
  await p.click('[data-k="5"]');
  await p.locator('.controls').screenshot({ path: path.join(__dirname, 'controls.png') });
  console.log(errs);
  await b.close();
})();
