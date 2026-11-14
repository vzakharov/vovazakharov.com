const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  for (let i = 0; i < 4; i++) {
    console.log((await p.textContent('#readings')).slice(0, 40));
    await p.click('#newFloor');
  }
  console.log(errs);
  await b.close();
})();
