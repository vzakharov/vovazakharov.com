#!/usr/bin/env node

/**
 * Holds `LOCALE_FONTS` in `src/shared/ui/locale-fonts.tsx` to the font files
 * the built pages actually use:
 *
 *   pnpm check:font-preloads
 *
 * A page outside the default language is opened in headless Chromium, and the
 * files its text used are read off the `@font-face` rules the browser loaded —
 * not off what it fetched, which a preload would answer for itself. Its
 * preloads are read from the HTML. `fontPreloadFindings` holds the two
 * against each other.
 */

/* eslint-disable no-console -- stdout is this script's interface: which page
   preloads what it should not, or misses what it should, is the whole report
   the non-zero exit refers to. The rule stays `error` in the app, where a stray
   log ships to a user. */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';

import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n/locales';

import { builtSites, pageRoute, walk } from './lib/built-sites.ts';
import { type Browser, launch } from './lib/cdp.ts';
import { fontPreloadFindings, type PageFonts } from './lib/font-preloads.ts';
import { withPrintOrigin } from './lib/print-origin.ts';

/**
 * A page's language, by the last segment naming one rather than the last
 * segment: a CV subpage follows its locale (`/cv/cto/ru/profile`), and no
 * document may be named after a language, so the segment is unambiguous.
 */
const pageLocale = (route: string): Locale =>
  route.split('/').findLast((segment) => isLocale(segment)) ?? DEFAULT_LOCALE;

const LINK = /<link\b[^>]*>/g;
const attribute = (tag: string, name: string) =>
  new RegExp(String.raw`\s${name}="([^"]*)"`).exec(tag)?.[1];

function preloadedFonts(html: string): Set<string> {
  return new Set(
    [...html.matchAll(LINK)].flatMap(([tag]) =>
      attribute(tag, 'rel') === 'preload' && attribute(tag, 'as') === 'font'
        ? [attribute(tag, 'href') ?? '']
        : [],
    ),
  );
}

/**
 * Runs in the page once its fonts settle. A face the text needed is `loaded`;
 * a preloaded one nothing needed stays `unloaded`. `FontFace` carries no URL,
 * so each is matched back to its rule by the descriptors both serialize, and
 * one that matches nothing fails the run rather than reading as unused.
 */
const USED_FONTS = String.raw`(async () => {
  await document.fonts.ready;
  const key = (family, style, weight, range) =>
    [family.replace(/["']/g, ''), style, weight, range].join('|');
  const loaded = [...document.fonts]
    .filter((face) => face.status === 'loaded')
    .map((face) => key(face.family, face.style, face.weight, face.unicodeRange));
  const files = new Map();
  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (!(rule instanceof CSSFontFaceRule)) continue;
      const css = (name, fallback) => rule.style.getPropertyValue(name) || fallback;
      const src = /url\(["']?([^"')]+)/.exec(css('src', ''));
      if (!src) continue;
      files.set(
        key(css('font-family', ''), css('font-style', 'normal'),
          css('font-weight', 'normal'), css('unicode-range', 'U+0-10FFFF')),
        new URL(src[1], sheet.href ?? location.href).pathname,
      );
    }
  }
  return loaded.map((face) => files.get(face) ?? 'unmatched: ' + face);
})()`;

const Evaluated = z.object({
  result: z.object({ value: z.array(z.string()) }),
});

/** Tabs measured at once: a static page settles in a few hundred ms. */
const TABS = Math.max(1, os.availableParallelism());

type Tab = { measure: (url: string) => Promise<Set<string>> };

async function openTab(browser: Browser): Promise<Tab> {
  const target = z
    .object({ targetId: z.string() })
    .parse(await browser.send('Target.createTarget', { url: 'about:blank' }));
  const { sessionId } = z
    .object({ sessionId: z.string() })
    .parse(
      await browser.send('Target.attachToTarget', { ...target, flatten: true }),
    );
  let onLoad: (() => void) | undefined;
  browser.on('Page.loadEventFired', (_, from) => {
    if (from === sessionId) onLoad?.();
  });
  await browser.send('Page.enable', {}, sessionId);

  return {
    measure: async (url) => {
      const loaded = new Promise<void>((resolve) => {
        onLoad = resolve;
      });
      await browser.send('Page.navigate', { url }, sessionId);
      await loaded;
      const { result } = Evaluated.parse(
        await browser.send(
          'Runtime.evaluate',
          { expression: USED_FONTS, awaitPromise: true, returnByValue: true },
          sessionId,
        ),
      );
      const unmatched = result.value.filter((file) =>
        file.startsWith('unmatched'),
      );
      if (unmatched.length > 0) {
        throw new Error(
          `${url}: no @font-face rule for ${unmatched.join(', ')}`,
        );
      }
      return new Set(result.value);
    },
  };
}

/** Fills in `used` on every page outside the default language. */
async function measure(out: string, pages: PageFonts[]): Promise<void> {
  const queue = pages.filter((page) => page.locale !== DEFAULT_LOCALE);
  if (queue.length === 0) return;

  const browser = await launch();
  try {
    await withPrintOrigin({ serve: 'export', dir: out }, async (origin) => {
      const tabs = await Promise.all(
        Array.from({ length: Math.min(TABS, queue.length) }, async () =>
          openTab(browser),
        ),
      );
      let next = 0;
      // Each tab takes the next page in the queue once it is done with its last.
      const drain = async (tab: Tab): Promise<void> => {
        const page = queue[next++];
        if (!page) return;
        page.used = await tab.measure(`${origin}${page.route}`);
        await drain(tab);
      };
      await Promise.all(tabs.map(async (tab) => drain(tab)));
    });
  } finally {
    await browser.close();
  }
}

/** How many routes a finding names before it says how many more. */
const SHOWN_ROUTES = 5;

const sites = await Promise.all(
  builtSites().map(async (out) => {
    const pages = walk(out, '.html').map((file): PageFonts => {
      const route = pageRoute(out, file);
      return {
        route,
        locale: pageLocale(route),
        preloaded: preloadedFonts(fs.readFileSync(file, 'utf8')),
      };
    });
    await measure(out, pages);
    return { site: path.basename(path.dirname(out)), pages };
  }),
);

let failed = false;

for (const { site, pages } of sites) {
  for (const { problem, routes } of fontPreloadFindings(pages)) {
    failed = true;
    const more = routes.length - SHOWN_ROUTES;
    console.error(`${site}: ${problem} — ${String(routes.length)} page(s):`);
    for (const route of routes.slice(0, SHOWN_ROUTES)) {
      console.error(`  ${route}`);
    }
    if (more > 0) console.error(`  … and ${String(more)} more`);
  }
}

if (failed) {
  console.error(
    '\nThe preloads a language adds are `LOCALE_FONTS` in\n' +
      'src/shared/ui/locale-fonts.tsx. Each localized section renders\n' +
      '`LocaleFonts` from the component every one of its pages carries —\n' +
      '`MusicNav`, `CvPage`; a page missing them all lacks it. Preload exactly\n' +
      'what every page in the language uses.',
  );
  process.exit(1);
}

const checked = sites.reduce((sum, { pages }) => sum + pages.length, 0);
console.log(`font preloads OK — ${String(checked)} pages checked`);
