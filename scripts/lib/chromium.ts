/**
 * Where the render scripts find a browser. Bare Node runs them, relying on its
 * type stripping, so this file stays free of syntax the stripper cannot erase.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * The Playwright-managed builds of `<prefix>-<revision>`, newest revision
 * first, each tried at every `layouts` path in turn: Playwright moved its
 * builds from `chrome-linux/` to a `*-linux64/` directory, renaming the
 * headless shell's binary with it, and an image may carry either.
 */
function playwrightBuilds(prefix: string, layouts: string[]): string[] {
  const root = process.env['PLAYWRIGHT_BROWSERS_PATH'];

  if (root === undefined || !fs.existsSync(root)) return [];

  return fs
    .readdirSync(root)
    .filter(
      (name) =>
        name.startsWith(`${prefix}-`) &&
        /^\d+$/.test(name.slice(prefix.length + 1)),
    )
    .toSorted((a, b) => b.localeCompare(a, 'en', { numeric: true }))
    .flatMap((name) => layouts.map((layout) => path.join(root, name, layout)));
}

/**
 * Chromium is preinstalled in the agent environment and on most dev machines,
 * so a render is pointed at it rather than left to download its own.
 */
export function findChromium(): string {
  const candidates = [
    process.env['PUPPETEER_EXECUTABLE_PATH'],
    ...playwrightBuilds('chromium', [
      'chrome-linux64/chrome',
      'chrome-linux/chrome',
    ]),
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter((candidate): candidate is string => candidate !== undefined);

  const found = candidates.find((candidate) => fs.existsSync(candidate));

  if (found === undefined) {
    throw new Error(
      'No Chromium found. Set PUPPETEER_EXECUTABLE_PATH to a Chromium or ' +
        `Chrome binary. Looked at:\n  ${candidates.join('\n  ')}`,
    );
  }

  return found;
}

/**
 * The browser a bare `--screenshot` is taken with: Playwright's headless shell
 * where installed, since its full Chromium paints some 87 rows short of
 * `--window-size` and crops the bottom of a card.
 */
export function findScreenshotChromium(): string {
  const shell = playwrightBuilds('chromium_headless_shell', [
    'chrome-headless-shell-linux64/chrome-headless-shell',
    'chrome-linux/headless_shell',
  ]).find((candidate) => fs.existsSync(candidate));

  return shell ?? findChromium();
}
