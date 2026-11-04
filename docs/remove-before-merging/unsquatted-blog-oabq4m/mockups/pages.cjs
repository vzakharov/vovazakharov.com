// Spike: the blog's index, a post and the two widgets, as static markup laid
// into the live dev page so the site's own faces, tokens and themes apply.
const { chromium } = require('playwright');

const STYLE = `
<style>
  body { background: var(--color-background); color: var(--color-foreground); margin: 0; }
  .m-wrap { max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; font-family: var(--font-body); }
  .m-top { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; }
  .m-mark { width: 32px; height: 32px; border-radius: 7px; background: var(--color-accent); display: grid; place-items: center; }
  .m-mark svg { stroke: var(--color-background); }
  .m-site { font: 700 22px var(--font-display); color: var(--color-foreground); text-decoration: none; }
  .m-crumb { color: var(--unsquatted-muted); font-size: 18px; }
  .m-crumb a { color: var(--color-accent); }
  .m-nav { margin-left: auto; font-size: 15px; display: flex; gap: 18px; }
  .m-nav a { color: var(--color-accent); }
  .m-eyebrow { font: 600 13px var(--m-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--color-accent); }
  h1.m-title { font: 700 44px/1.1 var(--font-display); margin: 10px 0 14px; }
  .m-lede { font-size: 20px; line-height: 1.5; color: var(--unsquatted-muted); margin: 0 0 14px; }
  .m-meta { font-size: 14px; color: var(--unsquatted-muted); display: flex; gap: 14px; align-items: center; border-bottom: 1px solid var(--color-border-hairline); padding-bottom: 22px; margin-bottom: 28px; }
  .m-meta a { color: var(--color-accent); }
  .m-prose p { font-size: 18px; line-height: 1.65; margin: 0 0 18px; }
  .m-prose h2 { font: 700 28px var(--font-display); margin: 36px 0 12px; }
  .m-aside { font-family: 'Caveat', cursive; color: var(--unsquatted-taken); font-size: 24px; transform: rotate(-3deg); display: inline-block; }
  /* Widget: a curated list, in the share card's rows. */
  .w { border: 1px solid var(--color-border-hairline); background: var(--color-surface); border-radius: 16px; padding: 18px 22px 14px; margin: 28px auto; max-width: 580px; }
  .w-label { font: 600 12px var(--m-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--unsquatted-muted); margin-bottom: 6px; }
  .w-row { display: flex; align-items: baseline; gap: 12px; padding: 11px 0; border-top: 1px solid var(--color-border-hairline); }
  .w-row:first-of-type { border-top: 0; }
  .w-dom { font: 22px var(--m-mono); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .w-heart { color: var(--unsquatted-muted); font-size: 18px; width: 22px; }
  .w-heart.on { color: var(--unsquatted-taken); }
  .w-free { color: var(--color-accent); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
  .w-maybe { color: var(--unsquatted-maybe); text-decoration: underline; text-underline-offset: 3px; }
  .w-taken { color: var(--unsquatted-taken); }
  .w-price { color: var(--unsquatted-muted); font-size: 14px; min-width: 120px; text-align: right; }
  @media (max-width: 600px) {
    .w-row { display: grid; grid-template-columns: 22px 1fr auto; row-gap: 2px; column-gap: 10px; }
    .w-dom { font-size: 18px; grid-row: span 2; align-self: center; }
    .w-price { grid-column: 3; min-width: 0; font-size: 13px; }
    .w-heart { grid-row: span 2; align-self: center; }
    .m-crumb, .m-nav a:first-child { display: none; }
    .m-meta { flex-wrap: wrap; gap: 6px 10px; }
    .w-foot { flex-wrap: wrap; gap: 8px; }
  }
  .w-foot { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border-hairline); margin-top: 4px; padding-top: 12px; font-size: 14px; color: var(--unsquatted-muted); }
  .w-foot a { color: var(--color-accent); }
  .w-share { border: 1px solid var(--color-border-hairline); border-radius: 8px; padding: 4px 8px; color: var(--unsquatted-muted); }
  /* Widget: one word across zones, the checker's own field. */
  .w-field { border: 2px solid var(--color-accent); background: var(--color-background); border-radius: 12px; padding: 12px 18px; font: 30px var(--m-mono); margin-bottom: 6px; }
  .w-tagline { font-size: 14px; color: var(--unsquatted-muted); margin: 6px 0 2px; font-style: italic; }
  /* Index. */
  .i-card { display: grid; grid-template-columns: 76px 1fr; gap: 18px; padding: 22px 0; border-top: 1px solid var(--color-border-hairline); }
  .i-date { font: 600 15px var(--m-mono); color: var(--color-background); background: var(--color-accent); border-radius: 6px; padding: 6px 0; text-align: center; height: fit-content; }
  .i-title { font: 700 26px var(--font-display); color: var(--color-foreground); text-decoration: none; }
  .i-desc { color: var(--unsquatted-muted); font-size: 17px; line-height: 1.5; margin: 6px 0 0; }
  .i-names { font: 14px var(--m-mono); color: var(--color-accent); margin-top: 8px; }
  .i-intro { font-size: 18px; line-height: 1.6; color: var(--unsquatted-muted); margin: 0 0 28px; }
</style>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap" rel="stylesheet">`;

const MARK = `<span class="m-mark"><svg width="20" height="20" viewBox="0 0 64 64" fill="none" stroke-width="8" stroke-linecap="round"><path d="M20 18v17a12 12 0 0 0 24 0V18"/></svg></span>`;

const TOP = (crumb) => `
  <div class="m-top">${MARK}<a class="m-site" href="#">Unsquatted</a>
    ${crumb ? `<span class="m-crumb">/ <a href="#">blog</a></span>` : ''}
    <span class="m-nav"><a href="#">checker</a><a href="#">blog</a><a href="#">rss</a></span>
  </div>`;

const LIST_WIDGET = `
  <div class="w">
    <div class="w-label">Domains for one</div>
    <div class="w-row"><span class="w-heart">♡</span><span class="w-dom">tableforone.com</span><span class="w-free">grab →</span><span class="w-price">$12/yr</span></div>
    <div class="w-row"><span class="w-heart on">♥</span><span class="w-dom">soloheart.shop</span><span class="w-free">grab →</span><span class="w-price">$2, then $34/yr</span></div>
    <div class="w-row"><span class="w-heart">♡</span><span class="w-dom">onlyone.gift</span><span class="w-maybe">maybe →</span><span class="w-price">$4, then $29/yr</span></div>
    <div class="w-row"><span class="w-heart">♡</span><span class="w-dom">partyofone.com</span><span class="w-taken">taken 1999</span><span class="w-price"></span></div>
    <div class="w-row"><span class="w-heart">♡</span><span class="w-dom">elevenelevens.com</span><span class="w-free">grab →</span><span class="w-price">$12/yr</span></div>
    <div class="w-foot"><a href="#">Check your own in the full checker →</a><span class="w-share">⤴ share</span></div>
  </div>`;

const NAME_WIDGET = `
  <div class="w">
    <div class="w-field">single</div>
    <div class="w-row"><span class="w-heart">♡</span><span class="w-dom"><b>single.com</b></span><span class="w-taken"><b>taken 1994</b></span><span class="w-price"></span></div>
    <div class="w-row"><span class="w-heart">♡</span><span class="w-dom">single.shop</span><span class="w-taken">taken 2016</span><span class="w-price"></span></div>
    <div class="w-row"><span class="w-heart">♡</span><span class="w-dom">single.gift</span><span class="w-maybe">maybe →</span><span class="w-price">$4, then $29/yr</span></div>
    <div class="w-tagline">okay, maybe not this one. They were all taken by 1994.</div>
    <div class="w-foot"><a href="#">Try another word in the checker →</a><span class="w-share">⤴ share</span></div>
  </div>`;

const POST = `
  <div class="m-wrap">${TOP(true)}
    <div class="m-eyebrow">11.11 · Singles’ Day</div>
    <h1 class="m-title">A domain for one</h1>
    <p class="m-lede">Four ones in a row started as a joke among Nanjing students and became the biggest shopping day on Earth. Here are the names it left lying around.</p>
    <div class="m-meta"><span>Nov 9, 2026</span><span>·</span><span>5 min read</span><span>·</span><span>by <a href="#">the Unnamed</a></span><span style="margin-left:auto"><a href="#">.md</a></span></div>
    <div class="m-prose">
      <p>In 1993, a few students at Nanjing University decided that if couples got Valentine’s Day, the rest of them deserved something too. They picked November 11th, because 11.11 looks like four bare sticks — <i>guanggun</i>, Chinese slang for a bachelor. Nobody asked a marketing department. That came later.</p>
      ${LIST_WIDGET}
      <h2>The most single thing on the internet</h2>
      <p>A one-word domain is the bachelor of the web: everyone wants one, and they were all spoken for before you were allowed to vote. We checked anyway. You’re welcome.</p>
      ${NAME_WIDGET}
      <p>(mock text — the real copy is the first bite’s job.)</p>
    </div>
  </div>`;

const INDEX = `
  <div class="m-wrap">${TOP(false)}
    <div class="m-eyebrow">The blog</div>
    <h1 class="m-title" style="margin-bottom:4px">The Unnamed of Unsquatted</h1>
    <p style="font: italic 400 26px/1.3 var(--font-display); color: var(--unsquatted-muted); margin: 0 0 22px">, on unsquatted (and some squatted) names</p>
    <p class="i-intro">Every holiday is a naming opportunity if you squint. I squint professionally. — <i>the Unnamed</i></p>
    <div class="i-card"><span class="i-date">30.11</span><div><a class="i-title" href="#">Cyber Monday, but make it a TLD</a><p class="i-desc">The internet’s own shopping day, and the zones nobody thought to sell on it.</p><div class="i-names">clickandcart.shop · cyberdeal.day · +8</div></div></div>
    <div class="i-card"><span class="i-date">27.11</span><div><a class="i-title" href="#">Black Friday, in the red</a><p class="i-desc">Why the day is called black, and twelve names that are still in the black.</p><div class="i-names">doorbuster.shop · blackink.day · +10</div></div></div>
    <div class="i-card"><span class="i-date">19.11</span><div><a class="i-title" href="#">A man, a plan, a domain</a><p class="i-desc">International Men’s Day, and the names men keep not registering.</p><div class="i-names">mancave.shop · dadjoke.day · +9</div></div></div>
    <div class="i-card"><span class="i-date">11.11</span><div><a class="i-title" href="#">A domain for one</a><p class="i-desc">Four ones in a row started as a joke among Nanjing students and became the biggest shopping day on Earth.</p><div class="i-names">tableforone.com · soloheart.shop · +12</div></div></div>
  </div>`;

(async () => {
  const browser = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    for (const [name, html, width] of [
      ['post', POST, 900],
      ['index', INDEX, 900],
      ['post-phone', POST, 390],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        deviceScaleFactor: 2,
        colorScheme: scheme,
      });
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      await page.waitForSelector('li[data-domain] button');
      await page.evaluate(
        ([markup, s]) => {
          const mono = getComputedStyle(
            document.querySelector('li[data-domain] button'),
          ).fontFamily;
          document.documentElement.style.setProperty('--m-mono', mono);
          document.documentElement.setAttribute('data-mantine-color-scheme', s);
          document.body.innerHTML = markup;
        },
        [STYLE + html, scheme],
      );
      await page.waitForTimeout(800);
      await page.screenshot({
        path: `tmp/mockups/${name}-${scheme}.png`,
        fullPage: true,
      });
      await page.close();
    }
  }
  await browser.close();
})();
