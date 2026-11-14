const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.click('#game');
  await p.waitForFunction(() => /нашего мира/.test(document.getElementById('gameNote').textContent), null, { timeout: 60000 });
  console.log(await p.textContent('#gameNote'));
  const t = Date.now();
  await p.click('[data-k="7"]');
  await p.waitForFunction(() => /этаж 8/.test(document.getElementById('gameNote').textContent), null, { timeout: 120000 });
  console.log(await p.textContent('#gameNote'), Date.now() - t, 'ms');
  await p.locator('.plan').screenshot({ path: path.join(__dirname, 'plan.png') });
  console.log(errs);
  await b.close();
})();
