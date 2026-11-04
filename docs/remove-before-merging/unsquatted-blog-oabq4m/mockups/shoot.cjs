// Spike: four ways a catalogue row could point at the blog post its name was
// picked for, injected into the live home page's first rows and screenshotted.
const { chromium } = require('playwright');

const VARIANTS = {
  // A: the category itself becomes the occasion, and the link.
  a: (row) => {
    const cat = row.querySelector('[class*="category"]');
    cat.innerHTML =
      '<a href="#" style="color:var(--color-accent);text-decoration:underline;text-underline-offset:3px">11.11 · Singles’ Day</a>';
  },
  // B: a line under the blurb, in the blurb's own voice.
  b: (row) => {
    const blurb = row.querySelector('p');
    blurb.insertAdjacentHTML(
      'beforeend',
      ' <a href="#" style="color:var(--color-accent);white-space:nowrap">Picked for Singles’ Day →</a>',
    );
  },
  // C: an icon button beside the heart.
  c: (row) => {
    const like = row.querySelector('[class*="pickName"] > :last-child');
    like.insertAdjacentHTML(
      'afterend',
      '<a href="#" title="Read the Singles’ Day post" style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;margin-left:2px;color:var(--color-accent)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg></a>',
    );
  },
  // D: a date stamp ahead of the name, the post's day as a tag.
  d: (row) => {
    const name = row.querySelector('[class*="pickName"]');
    name.insertAdjacentHTML(
      'afterbegin',
      '<a href="#" title="Read the Singles’ Day post" style="font:600 12px/1 var(--mantine-font-family-monospace);color:var(--color-background);background:var(--color-accent);border-radius:4px;padding:4px 6px;margin-right:8px;text-decoration:none;align-self:center">11.11</a>',
    );
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const page = await browser.newPage({
      viewport: { width: 900, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: scheme,
    });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForSelector('li[data-domain]');
    for (const [key, apply] of Object.entries(VARIANTS)) {
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('li[data-domain]');
      const rows = await page.$$('li[data-domain]');
      await page.evaluate(
        ([fn, row]) => new Function('row', `(${fn})(row)`)(row),
        [apply.toString(), rows[1]],
      );
      const list = await rows[0].evaluateHandle((li) => li.parentElement);
      const box = await list.boundingBox();
      const r2 = await rows[2].boundingBox();
      await page.screenshot({
        path: `tmp/mockups/variant-${key}-${scheme}.png`,
        clip: {
          x: box.x - 8,
          y: box.y - 8,
          width: box.width + 16,
          height: r2.y + r2.height - box.y + 16,
        },
      });
    }
    await page.close();
  }
  await browser.close();
})();
