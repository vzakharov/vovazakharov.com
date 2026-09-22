#!/usr/bin/env tsx

/**
 * Prints every printable page to a PDF at that page's own URL plus an
 * extension: each document and its cuts beside the markdown they were authored
 * as (`/case-studies/playgram.mini.pdf`), and the CV once per framing and
 * language (`/cv/cto/en.pdf`).
 *
 * A static export has no request-time renderer, so the alternative to a file
 * produced ahead of the request is no PDF at all. It is each page's existing
 * print stylesheet that is printed, not a layout of its own.
 *
 * **The PDFs are build artifacts.** The deploy runs this after `next build`
 * with `--from-out` and copies what it produces into `out/`, so the `.pdf` link
 * a page always emits answers 404 in a tree where this has not run —
 * `.claude/rules/content.md` carries the whole contract.
 *
 * A render that says the same thing as the file already there keeps that file's
 * bytes, which is what lets a restored cache stay a cache rather than churn.
 *
 *   pnpm content:pdf:<site>                 # spawn a dev server and print from it
 *   pnpm content:pdf:<site> --origin <url>  # print from a server already up
 *   pnpm content:pdf:<site> --from-out      # print from `out/`, as the deploy does
 *   pnpm content:pdf:<site> --check         # report staleness, write nothing
 *
 * One run serves one site, because it is entered in that app's directory —
 * which is what `public/`, `out/` and the dev server it spawns all resolve
 * against.
 *
 * Runs under `tsx`: the CV's routes come from `src/` through the `@/` alias, and
 * the `i18n` barrel behind them is a JSON import bare Node cannot take without
 * an attribute.
 */

/* eslint-disable no-console -- stdout is this script's interface: progress,
   the `--check` staleness report, and the prune log are what a human runs it
   for. The rule stays `error` in the app, where a stray log ships to a user. */

import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { siteConfig } from '@/shared/config/site-config';
import { PUBLIC_DIR, type Routed } from '@/shared/content/collections';
import { contentHash } from '@/shared/content/content-hash';
import { routing } from '@/shared/i18n';

import { cvPath } from '@/pages/cv/lib/cv-urls';
import { CV_VARIANTS } from '@/pages/cv/lib/cv-variants';

import { flag, given } from './lib/argv.ts';
import { findChromium } from './lib/chromium.ts';
import {
  CONTENT_DIRS,
  contentFiles,
  filesUnder,
  RENDERED_SITE,
  REPO_ROOT,
} from './lib/content-tree.ts';
import { type PrintOrigin, withPrintOrigin } from './lib/print-origin.ts';
import { type Renderable, runRenderJob } from './lib/render-manifest.ts';
import { sameRender } from './lib/same-render.ts';

/** A document's PDF, and the route the dev server renders it from. */
type Printable = Renderable & Routed;

/** Records each render's source-set hash, beside the render it describes. */
const MANIFEST_NAME = 'pdf-renders.json';

/**
 * What shapes any printed page: the print sheet, the theme it is drawn with,
 * the presentation components and the helpers they are built from, and the site
 * identity the footer prints.
 * Anything omitted here can ship behind a PDF the check calls fresh; the price
 * of casting it wide is that a tweak to any of it re-flags every PDF on every
 * site, and that costs one run each.
 */
const PRINT_SOURCES = [
  'src/app/styles/print.scss',
  'src/app/styles/theme.ts',
  'src/app/styles/theme.module.scss',
  // Names Mantine's sheets and their order, which decide what a rule on the
  // page resolves to.
  'src/app/ui/theme-provider.tsx',
  'src/shared/config',
  'src/shared/lib',
  'src/shared/ui',
];

/** What shapes a document's printed page on top of that: its prose and its pipeline. */
const DOCUMENT_SOURCES = [
  'src/app/styles/prose.scss',
  'src/entities/document',
  'src/pages/documents/ui',
  'src/shared/content',
];

/**
 * The mark the pipeline closes an article with, where the site has one. It
 * prints, so it shapes the page as surely as the stylesheet does — and it sits
 * under `public/`, which nothing else in these lists reaches.
 */
const SEAL_SOURCES = (() => {
  const { seal } = siteConfig(RENDERED_SITE);

  return seal === undefined
    ? []
    : [path.relative(REPO_ROOT, path.join(PUBLIC_DIR, seal.path))];
})();

/** What shapes the CV's printed page; its own language's catalogue is added per printable. */
const CV_SOURCES = ['src/pages/cv'];

/** The CV is one site's page, so the other site's run neither prints it nor walks its directory. */
const PRINTS_CV = RENDERED_SITE === 'vova';

const CV_DIR = path.join(PUBLIC_DIR, cvPath());

/** How long one print gets, the route's first compile included. */
const PRINT_TIMEOUT_MS = 180_000;

/**
 * How many pages print at once. Each print is a Chromium of its own, and they
 * share one server, so a collection of any size stays within this.
 */
const PRINT_WORKERS = Math.min(4, os.availableParallelism());

/** Generous for Chromium's chatter, so a noisy page fails on its content rather than its buffer. */
const PRINT_OUTPUT_LIMIT = 8 * 1024 * 1024;

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

function sourceFiles(...sources: string[][]): string[] {
  return sources
    .flat()
    .flatMap((source) => filesUnder(path.join(REPO_ROOT, source)));
}

/**
 * Every document's PDF. The route is the output path's own place under
 * `public/`, minus the extension — which is the whole of the rule this
 * pipeline rests on.
 */
function documentPrintables(): Printable[] {
  const shared = sourceFiles(PRINT_SOURCES, DOCUMENT_SOURCES, SEAL_SOURCES);

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

/**
 * The CV's PDF per framing and language, at the page's canonical address plus an
 * extension. Only the printable's own catalogue is hashed, so rewording the
 * English leaves the Russian print alone.
 */
function cvPrintables(): Printable[] {
  if (!PRINTS_CV) return [];

  const shared = sourceFiles(PRINT_SOURCES, CV_SOURCES);

  return CV_VARIANTS.flatMap((variant) =>
    routing.locales.map((locale) => {
      const route = cvPath(variant, locale);

      return {
        route,
        outputPath: path.join(PUBLIC_DIR, `${route}.pdf`),
        sourceHash: hashFiles([
          ...shared,
          path.join(REPO_ROOT, `src/shared/i18n/messages/${locale}.json`),
        ]),
      };
    }),
  );
}

/** The flags that pick a print origin; the default is what a hand-run render wants. */
function printOrigin(): PrintOrigin {
  if (given('origin')) {
    const url = flag('origin');

    if (url === undefined || url.startsWith('-')) {
      throw new Error(
        '`--origin` needs a URL, e.g. `--origin http://localhost:3000`.',
      );
    }

    return { serve: 'url', origin: url.replace(/\/+$/, '') };
  }

  return given('from-out')
    ? { serve: 'export', dir: path.join(process.cwd(), 'out') }
    : { serve: 'dev', site: RENDERED_SITE };
}

/**
 * One worker, taking the next printable whenever it is free. A shared queue
 * rather than a fixed split, so a slow page holds back only itself.
 */
async function drain(
  queue: Printable[],
  print: (printable: Printable) => Promise<void>,
): Promise<void> {
  const next = queue.shift();

  if (next === undefined) return;

  await print(next);

  return drain(queue, print);
}

/**
 * One Chromium, run to completion. Its output is buffered rather than
 * inherited: several prints share this stdout, and interleaved chatter names no
 * route. A failure carries the whole command line, the page's URL included, so
 * the buffer is worth reading only when there is one.
 */
async function headless(chromium: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      chromium,
      args,
      { timeout: PRINT_TIMEOUT_MS, maxBuffer: PRINT_OUTPUT_LIMIT },
      (error) => {
        if (error === null) {
          resolve();
          return;
        }

        // `ExecFileException` is an `Error` by shape and not by construction,
        // so it is rewrapped for callers that expect a real one. Its message
        // already carries the command line and Chromium's stderr.
        reject(new Error(error.message, { cause: error }));
      },
    );
  });
}

/**
 * `--no-pdf-header-footer` is deliberate. Chrome's default footer prints the
 * URL it fetched — the server's `localhost` — and the CLI cannot override it,
 * since `footerTemplate` belongs to the DevTools protocol rather than the flag
 * surface. That text also carries no `ToUnicode` map, so it is neither
 * selectable nor searchable. The page prints its own canonical URL instead.
 */
async function printRoute(
  { route, outputPath }: Printable,
  origin: string,
  chromium: string,
): Promise<void> {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const previous = fs.existsSync(outputPath)
    ? fs.readFileSync(outputPath)
    : undefined;

  await headless(chromium, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--no-pdf-header-footer',
    // Without it the print can fire before the page's images have painted.
    '--virtual-time-budget=20000',
    `--print-to-pdf=${outputPath}`,
    `${origin}${route}`,
  ]);

  // Chromium does not always exit non-zero on a page it could not print, and
  // an unwritten file would otherwise pass as a render and ship as a 404.
  if (!fs.existsSync(outputPath)) {
    throw new Error(`Printing ${route} wrote no file at ${outputPath}.`);
  }

  const relative = path.relative(REPO_ROOT, outputPath);

  if (
    previous !== undefined &&
    sameRender(previous, fs.readFileSync(outputPath))
  ) {
    // Restoring the previous bytes skips the write, not the bookkeeping:
    // `runRenderJob` records the new source hash either way.
    fs.writeFileSync(outputPath, previous);
    console.log(`  kept ${relative} — the render is unchanged`);
    return;
  }

  console.log(`  rendered ${relative} from ${route}`);
}

async function printAll(stale: Printable[]): Promise<void> {
  const chromium = findChromium();
  const queue = [...stale];

  await withPrintOrigin(printOrigin(), async (origin) => {
    await Promise.all(
      Array.from({ length: Math.min(PRINT_WORKERS, queue.length) }, async () =>
        drain(queue, async (printable) =>
          printRoute(printable, origin, chromium),
        ),
      ),
    );
  });
}

await runRenderJob(
  {
    label: 'page PDF',
    manifestName: MANIFEST_NAME,
    isOutput: (name) => name.endsWith('.pdf'),
    // The CV's renders sit outside the content tree, so its root is walked too
    // — otherwise a pruned render's manifest is never found.
    manifestDirs: [...CONTENT_DIRS, ...(PRINTS_CV ? [CV_DIR] : [])],
    entries: [...documentPrintables(), ...cvPrintables()],
    render: printAll,
  },
  process.argv.includes('--check'),
);
