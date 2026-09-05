#!/usr/bin/env node

/**
 * Prints every document — each cut included — to a committed PDF beside the
 * markdown it was authored as, so `/case-studies/playgram.mini.pdf` sits at the
 * page's own URL plus an extension.
 *
 * A static export has no request-time renderer, so the alternative to a
 * committed file is no PDF at all. It is the page's existing print stylesheet
 * that is printed, not a layout of its own.
 *
 * Run by hand when a document or anything shaping its printed form changes —
 * never by `next build`, so CI installs no browser. `--check` keeps that
 * honest: it hashes each PDF's whole source set against the manifest, needing
 * no browser, which is why `vet.sh` can run it beside every other check.
 *
 *   pnpm content:pdf            # render what changed, prune what is gone
 *   pnpm content:pdf --check    # report staleness, write nothing
 *
 * Bare Node runs this file, relying on its type stripping, so it needs Node
 * 22.18 or newer and every relative import carries its `.ts` extension.
 */

/* eslint-disable no-console -- stdout is this script's interface: progress,
   the `--check` staleness report, and the prune log are what a human runs it
   for. The rule stays `error` in the app, where a stray log ships to a user. */

import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { PUBLIC_DIR, type Routed } from '../src/shared/content/collections.ts';
import { contentHash } from '../src/shared/content/content-hash.ts';
import { findChromium } from './lib/chromium.ts';
import { contentFiles, filesUnder, REPO_ROOT } from './lib/content-tree.ts';
import { type Renderable, runRenderJob } from './lib/render-manifest.ts';

/** A document's PDF, and the route the dev server renders it from. */
type Printable = Renderable & Routed;

/** Records each render's source-set hash, beside the render it describes. */
const MANIFEST_NAME = 'pdf-renders.json';

/**
 * What shapes a printed page besides the document itself. A markdown-only hash
 * would let a style or component change ship behind a stale PDF; the cost of
 * casting this wide is that a tweak to any of it re-flags every PDF, and that
 * costs one `pnpm content:pdf` run.
 */
const SHARED_SOURCES = [
  'src/app/styles/print.scss',
  'src/app/styles/prose.scss',
  'src/pages/case-studies/ui',
];

/** How long the dev server gets to answer before the run is abandoned. */
const SERVE_TIMEOUT_MS = 120_000;

/** How long one print gets, the route's first compile included. */
const PRINT_TIMEOUT_MS = 180_000;

/** How often the wait for the dev server retries. */
const POLL_INTERVAL_MS = 500;

/**
 * Hashes a file set by path and content, so a rename counts as a change. The
 * separators are safe because base64 spells nothing but `A-Za-z0-9+/=`.
 */
function hashFiles(files: string[]): string {
  return contentHash(
    files
      .toSorted()
      .map(
        (file) =>
          `${path.relative(REPO_ROOT, file)}:${fs.readFileSync(file, 'base64')}`,
      )
      .join('\n'),
  );
}

/**
 * The assets a document points at, resolved against it. Matched with a pattern
 * because this runs outside the bundler, where `shared/content` is unavailable
 * — the same reason the mermaid and Open Graph scripts read their sources so.
 *
 * A sibling `.md` is a document of its own, with a PDF of its own, so counting
 * it here would make each cut stale on the others' edits.
 */
function referencedAssets(documentPath: string): string[] {
  const references = /(?:!?\[[^\]]*]\(|(?:src|href)=")([^\s")]+)/g;
  const markdown = fs.readFileSync(documentPath, 'utf8');

  return [
    ...new Set(
      [...markdown.matchAll(references)].flatMap((match) => {
        const target = (match[1] ?? '').replace(/#.*$/, '');

        if (
          target === '' ||
          target.endsWith('.md') ||
          /^(?:[a-z][\d+.a-z-]*:|\/\/|\/|#)/i.test(target)
        ) {
          return [];
        }

        const assetPath = path.resolve(path.dirname(documentPath), target);

        return fs.existsSync(assetPath) ? [assetPath] : [];
      }),
    ),
  ];
}

/**
 * Every document's PDF. The route is the output path's own place under
 * `public/`, minus the extension — which is the whole of the rule this
 * pipeline rests on.
 */
function collectPrintables(): Printable[] {
  const shared = SHARED_SOURCES.flatMap((source) =>
    filesUnder(path.join(REPO_ROOT, source)),
  );

  return contentFiles((name) => name.endsWith('.md')).map((documentPath) => {
    const stem = documentPath.replace(/\.md$/, '');

    return {
      route: `/${path.relative(PUBLIC_DIR, stem)}`,
      outputPath: `${stem}.pdf`,
      sourceHash: hashFiles([
        documentPath,
        ...referencedAssets(documentPath),
        ...shared,
      ]),
    };
  });
}

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.on('error', reject);
    server.listen(0, () => {
      const address = server.address();

      if (address === null || typeof address === 'string') {
        reject(new Error('The OS gave no port to render on.'));
        return;
      }

      server.close(() => {
        resolve(address.port);
      });
    });
  });
}

/**
 * A served page, read to the end. Draining the body matters: an unread response
 * leaves the socket half-consumed, and the dev server closes it under the next
 * request — which surfaces as a socket error rather than as a retry.
 */
async function served(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    await response.arrayBuffer();

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Waits for the server to answer at all — it refuses connections until it is
 * listening, then pays a compile cost, so the wait is a poll. Each route's own
 * first compile needs no such warm-up: it happens inside Chromium's request,
 * which waits for it like any client.
 */
async function awaitServer(
  origin: string,
  server: ReturnType<typeof spawn>,
  deadline: number = Date.now() + SERVE_TIMEOUT_MS,
): Promise<void> {
  if (await served(origin)) return;

  if (server.exitCode !== null) {
    throw new Error(
      `The dev server exited with ${server.exitCode} before answering on ` +
        `${origin}. Run \`pnpm dev\` to see why.`,
    );
  }

  if (Date.now() > deadline) {
    throw new Error(`The dev server did not answer on ${origin}.`);
  }

  await sleep(POLL_INTERVAL_MS);

  return awaitServer(origin, server, deadline);
}

/**
 * A dev server rather than `next build` plus a static host: the printed page is
 * the same either way, and this is one process to start and stop.
 *
 * Next is spawned directly and into a process group of its own, so the whole
 * server goes down with the run. Through `pnpm` the kill would reach only the
 * wrapper, and the `next dev` it left behind holds `.next/dev/lock` against
 * every later run.
 */
async function withDevServer(
  run: (origin: string, server: ReturnType<typeof spawn>) => Promise<void>,
): Promise<void> {
  const port = await freePort();
  const origin = `http://localhost:${port}`;
  const server = spawn(
    path.join(REPO_ROOT, 'node_modules', '.bin', 'next'),
    ['dev', '--port', String(port)],
    { cwd: REPO_ROOT, stdio: 'ignore', detached: true },
  );

  try {
    console.log(`  waiting for the dev server on ${origin} …`);
    await run(origin, server);
  } finally {
    if (server.pid !== undefined && server.exitCode === null) {
      process.kill(-server.pid, 'SIGTERM');
    }
  }
}

/**
 * `--no-pdf-header-footer` is deliberate. Chrome's default footer prints the
 * URL it fetched — the dev server's `localhost` — and the CLI cannot override
 * it, since `footerTemplate` belongs to the DevTools protocol rather than the
 * flag surface. That text also carries no `ToUnicode` map, so it is neither
 * selectable nor searchable. The page prints its own canonical URL instead.
 */
function printRoute(
  { route, outputPath }: Printable,
  origin: string,
  chromium: string,
): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  execFileSync(
    chromium,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--no-pdf-header-footer',
      // Without it the print can fire before the page's images have painted.
      '--virtual-time-budget=20000',
      `--print-to-pdf=${outputPath}`,
      `${origin}${route}`,
    ],
    { stdio: 'inherit', timeout: PRINT_TIMEOUT_MS },
  );

  console.log(
    `  rendered ${path.relative(REPO_ROOT, outputPath)} from ${route}`,
  );
}

async function printAll(stale: Printable[]): Promise<void> {
  const chromium = findChromium();

  await withDevServer(async (origin, server) => {
    await awaitServer(origin, server);

    for (const printable of stale) printRoute(printable, origin, chromium);
  });
}

await runRenderJob(
  {
    label: 'document PDF',
    manifestName: MANIFEST_NAME,
    isOutput: (name) => name.endsWith('.pdf'),
    entries: collectPrintables(),
    render: printAll,
  },
  process.argv.includes('--check'),
);
