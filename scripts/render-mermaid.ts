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

/* eslint-disable no-console -- stdout is this script's interface: progress,
   the `--check` staleness report, and the prune log are what a human runs it
   for. The rule stays `error` in the app, where a stray log ships to a user. */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { contentHash } from '../src/shared/content/content-hash.ts';
import {
  COLOR_SCHEMES,
  type ColorScheme,
  MERMAID_DIR,
  mermaidFileName,
} from '../src/shared/content/mermaid-renders.ts';
import { findChromium } from './lib/chromium.ts';
import { CONTENT_ROOT, contentFiles, REPO_ROOT } from './lib/content-tree.ts';

type Fence = {
  hash: string;
  source: string;
  /** Repo-relative path of the document the fence was found in. */
  file: string;
};

const OUTPUT_DIR = path.join(REPO_ROOT, 'public', MERMAID_DIR);

/** The Mermaid built-in theme to render each colour scheme with. */
const MERMAID_THEMES: Record<ColorScheme, string> = {
  light: 'default',
  dark: 'dark',
};

const checkOnly = process.argv.includes('--check');

/** Every fence found, in document order. */
function collectFences(): Fence[] {
  const fencePattern = /^```mermaid[\t ]*\r?\n([\S\s]*?)^```/gm;

  return contentFiles(CONTENT_ROOT, (name) => name.endsWith('.md')).flatMap(
    (file) => {
      const markdown = fs.readFileSync(file, 'utf8');

      return [...markdown.matchAll(fencePattern)].map((match) => {
        const source = match[1] ?? '';

        return {
          hash: contentHash(source),
          source,
          file: path.relative(REPO_ROOT, file),
        };
      });
    },
  );
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
