/**
 * Where the render scripts find a browser. Bare Node runs them, relying on its
 * type stripping, so this file stays free of syntax the stripper cannot erase.
 */

import fs from 'node:fs';
import path from 'node:path';

/** The Playwright-managed Chromium builds, newest first. */
function playwrightChromiums(): string[] {
  const root = process.env['PLAYWRIGHT_BROWSERS_PATH'];

  if (root === undefined || !fs.existsSync(root)) return [];

  return fs
    .readdirSync(root)
    .filter((name) => name.startsWith('chromium'))
    .toSorted()
    .toReversed()
    .map((name) => path.join(root, name, 'chrome-linux', 'chrome'));
}

/**
 * Chromium is preinstalled in the agent environment and on most dev machines,
 * so a render is pointed at it rather than left to download its own.
 */
export function findChromium(): string {
  const candidates = [
    process.env['PUPPETEER_EXECUTABLE_PATH'],
    ...playwrightChromiums(),
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
