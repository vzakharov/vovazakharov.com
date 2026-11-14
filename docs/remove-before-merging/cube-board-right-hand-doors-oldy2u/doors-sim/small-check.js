const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  for (const k of ['1', '2', '3']) {
    await p.click(`[data-k="${k}"]`);
    await p.waitForTimeout(300);
    console.log(k, await p.textContent('#placedOut'), '|', await p.textContent('#readings'));
  }
  await p.click('#game');
  for (const k of ['1', '2', '3']) {
    await p.click(`[data-k="${k}"]`);
    await p.waitForFunction((n) => new RegExp(`этаж ${n} нашего`).test(document.getElementById('gameNote').textContent), +k + 1, { timeout: 30000 });
    console.log('game', k, await p.textContent('#gameNote'));
  }
  await p.click('[data-k="2"]');
  await p.waitForTimeout(500);
  await p.locator('.plan').screenshot({ path: path.join(__dirname, 'floor3.png') });
  await p.waitForTimeout(3000);
  console.log(await p.textContent('#sweepNote'));
  console.log(errs);
  await b.close();
})();
