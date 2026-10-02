/**
 * Where the render scripts find a browser. Bare Node runs them, relying on its
 * type stripping, so this file stays free of syntax the stripper cannot erase.
 */

import fs from 'node:fs';
import path from 'node:path';

/** The Playwright-managed builds whose directory starts with `prefix`, newest first. */
function playwrightBuilds(prefix: string, binary: string): string[] {
  const root = process.env['PLAYWRIGHT_BROWSERS_PATH'];

  if (root === undefined || !fs.existsSync(root)) return [];

  return fs
    .readdirSync(root)
    .filter((name) => name.startsWith(prefix))
    .toSorted()
    .toReversed()
    .map((name) => path.join(root, name, 'chrome-linux', binary));
}

/**
 * Chromium is preinstalled in the agent environment and on most dev machines,
 * so a render is pointed at it rather than left to download its own.
 */
export function findChromium(): string {
  const candidates = [
    process.env['PUPPETEER_EXECUTABLE_PATH'],
    ...playwrightBuilds('chromium', 'chrome'),
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
 * The browser a bare `--screenshot` is taken with. Playwright's full Chromium
 * paints the viewport some 87 rows short of `--window-size` and leaves the
 * rest of the image blank, cropping whatever reaches the bottom of a card; its
 * headless shell paints the whole window, so it goes first where it is there.
 */
export function findScreenshotChromium(): string {
  const shell = playwrightBuilds(
    'chromium_headless_shell',
    'headless_shell',
  ).find((candidate) => fs.existsSync(candidate));

  return shell ?? findChromium();
}
