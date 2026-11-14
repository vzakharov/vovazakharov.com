const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.click('#game');
  await p.waitForFunction(() => /нашего мира/.test(document.getElementById('gameNote').textContent), null, { timeout: 30000 });
  console.log('newDoors disabled:', await p.$eval('#newDoors', (el) => el.disabled));
  for (const s of ['arm', 'none'])
    for (const d of [3, 30, 100]) {
      await p.click(`[data-s="${s}"]`);
      await p.$eval('#density', (el, v) => { el.value = v; el.dispatchEvent(new Event('input')); }, d);
      console.log(s, d, await p.textContent('#placedOut'));
    }
  await p.click('[data-s="arm"]');
  await p.$eval('#density', (el) => { el.value = 3; el.dispatchEvent(new Event('input')); });
  const a = await p.textContent('#readings');
  await p.click('#game'); await p.click('#game');
  await p.waitForFunction(() => /нашего мира/.test(document.getElementById('gameNote').textContent), null, { timeout: 30000 });
  console.log('same after toggle:', a === (await p.textContent('#readings')));
  console.log(await p.textContent('#gameNote'));
  console.log(errs);
  await b.close();
})();
