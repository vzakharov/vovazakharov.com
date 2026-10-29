/**
 * Prints every printable page to a PDF at that page's own URL plus an
 * extension: each document and its cuts beside the markdown they were authored
 * as (`/case-studies/playgram.mini.pdf`), and whatever a site adds of its own —
 * vova's CV once per framing and language (`/cv/cto/en.pdf`). Each printing
 * site's `scripts/render-pdf.ts` is the entry.
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
 *   pnpm content:pdf <site>                 # spawn a dev server and print from it
 *   pnpm content:pdf <site> --origin <url>  # print from a server already up
 *   pnpm content:pdf <site> --from-out      # print from `out/`, as the deploy does
 *   pnpm content:pdf <site> --check         # report staleness, write nothing
 *
 * One run serves one site, because it is entered in that site's directory —
 * which is what `public/`, `out/` and the dev server it spawns all resolve
 * against.
 */

/* eslint-disable no-console -- stdout is this script's interface: progress,
   the `--check` staleness report, and the prune log are what a human runs it
   for. The rule stays `error` in the app, where a stray log ships to a user. */

import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { siteConfig } from '@/kernel/shared/config';
import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';
import { contentHash } from '@/kernel/shared/lib/content-hash';
import type { Routed } from '@/kernel/shared/typings';

import { isDocumentFile } from '@/blog/shared/content/index.node-safe';

import {
  CONTENT_DIRS,
  contentFiles,
  PRINTABLE_CONTENT_DIRS,
} from './content-tree.ts';
import { sameRender } from './same-render.ts';

import { flag, given } from '@/kernel/scripts/lib/argv';
import { findChromium } from '@/kernel/scripts/lib/chromium';
import {
  type PrintOrigin,
  withPrintOrigin,
} from '@/kernel/scripts/lib/print-origin';
import {
  type ManifestRoots,
  type Renderable,
  runRenderJob,
} from '@/kernel/scripts/lib/render-manifest';
import {
  filesUnder,
  RENDERED_SITE,
  REPO_ROOT,
} from '@/kernel/scripts/lib/site-tree';

/** A document's PDF, and the route the dev server renders it from. */
export type Printable = Renderable & Routed;

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
export const PRINT_SOURCES = [
  'src/shell/app/styles/print.scss',
  'src/shell/app/styles/theme.ts',
  'src/shell/app/styles/theme.module.scss',
  // Names Mantine's sheets and their order, which decide what a rule on the
  // page resolves to.
  'src/shell/app/ui/theme-provider.tsx',
  'src/kernel/shared/config',
  'src/kernel/shared/lib',
  'src/shell/shared/ui',
];

/**
 * What shapes a document's printed page on top of that: its prose and its
 * pipeline. A site whose documents print more adds it as `documentSources`.
 */
const DOCUMENT_SOURCES = [
  'src/shell/app/styles/prose.scss',
  'src/blog/entities/document',
  'src/blog/pages/article/ui',
  'src/blog/shared/ui',
  'src/blog/shared/content',
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
export function hashFiles(files: string[]): string {
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

export function sourceFiles(...sources: string[][]): string[] {
  return sources
    .flat()
    .flatMap((source) => filesUnder(path.join(REPO_ROOT, source)));
}

/**
 * Each printable collection's PDFs. The route is the output path's own place
 * under `public/`, minus the extension — which is the whole of the rule this
 * pipeline rests on.
 */
function documentPrintables(
  documentSources: string[],
  documentFiles: (route: string) => string[],
): Printable[] {
  const shared = sourceFiles(
    PRINT_SOURCES,
    DOCUMENT_SOURCES,
    documentSources,
    SEAL_SOURCES,
  );

  return contentFiles(isDocumentFile, PRINTABLE_CONTENT_DIRS).map(
    (documentPath) => {
      const stem = documentPath.replace(/\.md$/, '');
      const route = `/${path.relative(PUBLIC_DIR, stem)}`;

      return {
        route,
        outputPath: `${stem}.pdf`,
        sourceHash: hashFiles([
          documentPath,
          ...referencedAssets(documentPath),
          ...documentFiles(route),
          ...shared,
        ]),
      };
    },
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

export async function printAll(stale: Printable[]): Promise<void> {
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

/**
 * What a site adds to the core: `documentSources` shape its documents' print
 * on top of the core's, and `documentFiles` names the files that shape one
 * document's alone, by its route; `printables` are pages of its own, outside
 * the content tree, under `manifestDirs`; `onRendered` runs after a render that
 * wrote.
 */
export type PdfOptions = Partial<ManifestRoots> & {
  documentSources?: string[];
  documentFiles?: (route: string) => string[];
  printables?: Printable[];
  onRendered?: () => void;
};

export async function renderPdfs({
  documentSources = [],
  documentFiles = () => [],
  printables = [],
  manifestDirs = [],
  onRendered,
}: PdfOptions = {}): Promise<void> {
  const check = process.argv.includes('--check');

  await runRenderJob(
    {
      label: 'page PDF',
      manifestName: MANIFEST_NAME,
      isOutput: (name) => name.endsWith('.pdf'),
      manifestDirs: [...CONTENT_DIRS, ...manifestDirs],
      entries: [
        ...documentPrintables(documentSources, documentFiles),
        ...printables,
      ],
      render: printAll,
    },
    check,
  );

  if (!check) onRendered?.();
}
