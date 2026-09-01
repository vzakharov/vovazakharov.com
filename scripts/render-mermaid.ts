#!/usr/bin/env node

/**
 * Renders every `mermaid` fence in the content tree to a committed pair of
 * SVGs, one per theme, named by a hash of the fence.
 *
 * Run by hand when a diagram changes — never by `next build`, so CI never
 * installs puppeteer and the deploy stays fast. The build fails loudly on a
 * fence whose render is missing, which is what keeps that honest.
 *
 *   pnpm content:mermaid            # render what changed, prune what is gone
 *   pnpm content:mermaid --check    # report staleness, write nothing
 *
 * Bare Node runs this file, relying on its type stripping, so it needs Node
 * 22.18 or newer and every relative import carries its `.ts` extension.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  COLOR_SCHEMES,
  type ColorScheme,
  MERMAID_DIR,
  mermaidFileName,
  mermaidHash,
} from '../lib/content/mermaid-hash.ts';

type Fence = {
  hash: string;
  source: string;
  /** Repo-relative path of the document the fence was found in. */
  file: string;
};

const REPO_ROOT = path.join(import.meta.dirname, '..');
const CONTENT_ROOT = path.join(REPO_ROOT, 'public', 'content');
const OUTPUT_DIR = path.join(REPO_ROOT, 'public', MERMAID_DIR);

/** The Mermaid built-in theme to render each colour scheme with. */
const MERMAID_THEMES: Record<ColorScheme, string> = {
  light: 'default',
  dark: 'dark',
};

const checkOnly = process.argv.includes('--check');

/** Every markdown file under the content tree. */
function markdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return entry.name === 'generated' ? [] : markdownFiles(entryPath);
    }

    return entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

/** Every fence found, in document order. */
function collectFences(): Fence[] {
  const fencePattern = /^```mermaid[\t ]*\r?\n([\S\s]*?)^```/gm;

  return markdownFiles(CONTENT_ROOT).flatMap((file) => {
    const markdown = fs.readFileSync(file, 'utf8');

    return [...markdown.matchAll(fencePattern)].map((match) => {
      const source = match[1] ?? '';

      return {
        hash: mermaidHash(source),
        source,
        file: path.relative(REPO_ROOT, file),
      };
    });
  });
}

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
 * so mermaid-cli is told where it is rather than left to download its own.
 */
function findChromium(): string {
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
      'No Chromium found for mermaid-cli. Set PUPPETEER_EXECUTABLE_PATH to a ' +
        `Chromium or Chrome binary. Looked at:\n  ${candidates.join('\n  ')}`,
    );
  }

  return found;
}

function renderFence(
  { hash, source }: Fence,
  chromium: string,
  puppeteerConfig: string,
): void {
  const inputPath = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'mermaid-')),
    `${hash}.mmd`,
  );
  fs.writeFileSync(inputPath, source);

  for (const scheme of COLOR_SCHEMES) {
    execFileSync(
      'pnpm',
      [
        'dlx',
        '@mermaid-js/mermaid-cli',
        '--input',
        inputPath,
        '--output',
        path.join(OUTPUT_DIR, mermaidFileName(hash, scheme)),
        '--theme',
        MERMAID_THEMES[scheme],
        '--backgroundColor',
        'transparent',
        // Keeps the two renders' generated ids stable, so re-rendering an
        // unchanged fence produces an unchanged file.
        '--svgId',
        `mermaid-${hash}-${scheme}`,
        '--puppeteerConfigFile',
        puppeteerConfig,
      ],
      {
        stdio: 'inherit',
        env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: '1' },
      },
    );
  }

  console.log(`  rendered ${hash} (${chromium})`);
}

function main(): void {
  const fences = collectFences();
  const byHash = new Map(fences.map((fence) => [fence.hash, fence]));

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const existing = fs
    .readdirSync(OUTPUT_DIR)
    .filter((name) => name.endsWith('.svg'));

  const missing = [...byHash.values()].filter((fence) =>
    COLOR_SCHEMES.some(
      (scheme) => !existing.includes(mermaidFileName(fence.hash, scheme)),
    ),
  );

  const schemeSuffix = new RegExp(
    String.raw`\.(${COLOR_SCHEMES.join('|')})\.svg$`,
  );
  const orphans = existing.filter(
    (name) => !byHash.has(name.replace(schemeSuffix, '')),
  );

  console.log(
    `${fences.length} fence(s) in the content tree, ${missing.length} to render, ` +
      `${orphans.length} stale render(s) to prune.`,
  );

  if (checkOnly) {
    for (const fence of missing)
      console.log(`  missing: ${fence.hash} in ${fence.file}`);
    for (const name of orphans) console.log(`  stale:   ${name}`);
    process.exitCode = missing.length > 0 || orphans.length > 0 ? 1 : 0;
    return;
  }

  if (missing.length > 0) {
    const chromium = findChromium();
    const puppeteerConfig = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'mermaid-cfg-')),
      'puppeteer.json',
    );
    fs.writeFileSync(
      puppeteerConfig,
      JSON.stringify({
        executablePath: chromium,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      }),
    );

    for (const fence of missing) renderFence(fence, chromium, puppeteerConfig);
  }

  for (const name of orphans) {
    fs.rmSync(path.join(OUTPUT_DIR, name));
    console.log(`  pruned ${name}`);
  }
}

main();
