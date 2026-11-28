// node render.mjs <module> [...] — each module default-exports { name, title, note, panels: [{ svg, tc, cap }] }
// and comes out as <name>.jpg: a storyboard sheet, plus <name>-<n>.jpg per panel with --panels.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
const out = resolve(import.meta.dirname, 'out');
mkdirSync(out, { recursive: true });
const args = process.argv.slice(2);
const each = args.includes('--panels');
const browser = await chromium.launch();
for (const m of args.filter(a => !a.startsWith('--'))) {
  const sheet = (await import(resolve(import.meta.dirname, m) + `?${Date.now()}`)).default;
  const cols = sheet.cols ?? sheet.panels.length;
  const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#101014;color:#eee;font-family:Inter,sans-serif;width:${cols * 660 + 40}px}
  h1{margin:0;padding:26px 30px 2px;font:900 italic 40px 'Inter Display',Inter,sans-serif;color:#ffd23e}
  p.n{margin:0;padding:0 30px 16px;font-size:20px;color:#b9b9c4;max-width:1500px;line-height:1.35}
  .row{display:grid;grid-template-columns:repeat(${cols},640px);gap:20px;padding:0 20px 26px}
  .p svg{width:640px;height:360px;display:block;border:3px solid #000;box-shadow:0 0 0 1px #444}
  .tc{font:700 17px 'JetBrains Mono',monospace;color:#ff5fa2;padding-top:10px}
  .cap{font-size:18px;line-height:1.35;color:#ddd;padding-top:4px}
  </style><h1>${sheet.title}</h1><p class="n">${sheet.note}</p><div class="row">${sheet.panels
    .map(p => `<div class="p">${p.svg}<div class="tc">${p.tc}</div><div class="cap">${p.cap}</div></div>`)
    .join('')}</div>`;
  writeFileSync(resolve(out, `${sheet.name}.html`), html);
  const page = await browser.newPage({ viewport: { width: cols * 660 + 40, height: 600 }, deviceScaleFactor: 2 });
  await page.setContent(html);
  await page.screenshot({ path: resolve(out, `${sheet.name}.jpg`), fullPage: true, type: 'jpeg', quality: 84 });
  if (each) {
    const els = await page.$$('.p svg');
    for (const [i, el] of els.entries()) await el.screenshot({ path: resolve(out, `${sheet.name}-${i + 1}.jpg`), type: 'jpeg', quality: 86 });
  }
  await page.close();
  console.log('wrote', sheet.name);
}
await browser.close();
