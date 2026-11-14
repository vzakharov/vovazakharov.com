const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  for (const k of ['5', '7']) {
    await p.click(`[data-k="${k}"]`);
    for (const s of ['none', 'arm']) {
      await p.click(`[data-s="${s}"]`);
      for (const gap of [0, 8, 48]) {
        await p.$eval('#gap', (el, v) => { el.value = v; el.dispatchEvent(new Event('input')); }, gap);
        const t = Date.now();
        await p.$eval('#density', (el) => { el.value = 100; el.dispatchEvent(new Event('input')); });
        const placed = await p.textContent('#placedOut');
        console.log(`k=${k} ${s} gap=${gap}: ${Date.now() - t} ms — ${placed}`);
      }
    }
  }
  console.log(errs);
  await b.close();
})();
