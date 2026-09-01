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
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MERMAID_DIR,
  mermaidFileName,
  mermaidHash,
} from '../lib/content/mermaid-hash.mjs';

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_ROOT = path.join(REPO_ROOT, 'public', 'content');
const OUTPUT_DIR = path.join(REPO_ROOT, 'public', MERMAID_DIR);

/** Mermaid's built-in themes, mapped to the site's two colour schemes. */
const THEMES = { light: 'default', dark: 'dark' };

const checkOnly = process.argv.includes('--check');

/** @returns {string[]} Every markdown file under the content tree. */
function markdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return entry.name === 'generated' ? [] : markdownFiles(entryPath);
    }

    return entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

/**
 * @returns {{hash: string, source: string, file: string}[]} Every fence found,
 * in document order.
 */
function collectFences() {
  const fencePattern = /^```mermaid[ \t]*\r?\n([\s\S]*?)^```/gm;

  return markdownFiles(CONTENT_ROOT).flatMap((file) => {
    const markdown = fs.readFileSync(file, 'utf8');

    return [...markdown.matchAll(fencePattern)].map((match) => ({
      hash: mermaidHash(match[1]),
      source: match[1],
      file: path.relative(REPO_ROOT, file),
    }));
  });
}

/**
 * Chromium is preinstalled in the agent environment and on most dev machines,
 * so mermaid-cli is told where it is rather than left to download its own.
 *
 * @returns {string} Path to a Chromium binary.
 */
function findChromium() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    ...(process.env.PLAYWRIGHT_BROWSERS_PATH
      ? fs
          .globSync(
            path.join(
              process.env.PLAYWRIGHT_BROWSERS_PATH,
              'chromium*/chrome-linux/chrome'
            )
          )
          .sort()
          .reverse()
      : []),
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);

  const found = candidates.find((candidate) => fs.existsSync(candidate));

  if (!found) {
    throw new Error(
      'No Chromium found for mermaid-cli. Set PUPPETEER_EXECUTABLE_PATH to a ' +
        `Chromium or Chrome binary. Looked at:\n  ${candidates.join('\n  ')}`
    );
  }

  return found;
}

function renderFence({ hash, source }, chromium, puppeteerConfig) {
  const inputPath = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'mermaid-')),
    `${hash}.mmd`
  );
  fs.writeFileSync(inputPath, source);

  for (const [scheme, mermaidTheme] of Object.entries(THEMES)) {
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
        mermaidTheme,
        '--backgroundColor',
        'transparent',
        // Keeps the two renders' generated ids stable, so re-rendering an
        // unchanged fence produces an unchanged file.
        '--svgId',
        `mermaid-${hash}-${scheme}`,
        '--puppeteerConfigFile',
        puppeteerConfig,
      ],
      { stdio: 'inherit', env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: '1' } }
    );
  }

  console.log(`  rendered ${hash} (${chromium})`);
}

function main() {
  const fences = collectFences();
  const byHash = new Map(fences.map((fence) => [fence.hash, fence]));

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const existing = fs
    .readdirSync(OUTPUT_DIR)
    .filter((name) => name.endsWith('.svg'));

  const missing = [...byHash.values()].filter((fence) =>
    Object.keys(THEMES).some(
      (scheme) =>
        !existing.includes(mermaidFileName(fence.hash, scheme))
    )
  );

  const orphans = existing.filter(
    (name) => !byHash.has(name.replace(/\.(light|dark)\.svg$/, ''))
  );

  console.log(
    `${fences.length} fence(s) in the content tree, ${missing.length} to render, ` +
      `${orphans.length} stale render(s) to prune.`
  );

  if (checkOnly) {
    for (const fence of missing) console.log(`  missing: ${fence.hash} in ${fence.file}`);
    for (const name of orphans) console.log(`  stale:   ${name}`);
    process.exitCode = missing.length || orphans.length ? 1 : 0;
    return;
  }

  if (missing.length) {
    const chromium = findChromium();
    const puppeteerConfig = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'mermaid-cfg-')),
      'puppeteer.json'
    );
    fs.writeFileSync(
      puppeteerConfig,
      JSON.stringify({
        executablePath: chromium,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      })
    );

    for (const fence of missing) renderFence(fence, chromium, puppeteerConfig);
  }

  for (const name of orphans) {
    fs.rmSync(path.join(OUTPUT_DIR, name));
    console.log(`  pruned ${name}`);
  }
}

main();
