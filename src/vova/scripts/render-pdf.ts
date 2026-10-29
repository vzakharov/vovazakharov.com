#!/usr/bin/env tsx

/**
 * vovazakharov.com's PDFs: the core's documents, and the CV once per framing
 * and language, at the page's canonical address plus an extension.
 * `src/blog/scripts/lib/print-job.ts` carries the contract.
 *
 *   pnpm content:pdf vova --cv-pages --from-out  # hold the CV to its page ceiling
 *
 * **The CV is held to `CV_PAGE_CEILING`** wherever it prints: a render that
 * leaves any edition past it fails, and `--cv-pages` prints the editions into a
 * temporary directory just to ask, for the vet run, which has no other way to
 * see a print. That mode skips the print while the CV's sources hash the same
 * as at its last pass, recorded in `tmp/`, so a vet run on a branch that never
 * touches the CV pays for one print per working tree.
 */

/* eslint-disable no-console -- stdout is this script's interface: the ceiling
   report is what a human runs it for. The rule stays `error` in the app, where
   a stray log ships to a user. */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';
import { routing } from '@/kernel/shared/i18n';
import { contentHash } from '@/kernel/shared/lib/content-hash';

import { CV_PAGE_CEILING, CV_VARIANTS, cvPath } from '@/vova/entities/cv';

import { pdfPageCount } from './lib/pdf-pages.ts';

import {
  hashFiles,
  PRINT_SOURCES,
  type Printable,
  printAll,
  renderPdfs,
  sourceFiles,
} from '@/blog/scripts/lib/print-job';
import { given } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/site-tree';

/** What shapes the CV's printed page; its own language's catalogue is added per printable. */
const CV_SOURCES = ['src/vova/pages/cv', 'src/vova/entities/cv'];

/**
 * The CV's PDF per framing and language. Only the printable's own catalogue is
 * hashed, so rewording the English leaves the Russian print alone.
 */
function cvPrintables(): Printable[] {
  const shared = sourceFiles(PRINT_SOURCES, CV_SOURCES);

  return CV_VARIANTS.flatMap((variant) =>
    routing.locales.map((locale) => {
      const route = cvPath(variant, locale);

      return {
        route,
        outputPath: path.join(PUBLIC_DIR, `${route}.pdf`),
        sourceHash: hashFiles([
          ...shared,
          path.join(REPO_ROOT, `src/vova/shared/i18n/messages/${locale}.json`),
        ]),
      };
    }),
  );
}

/** Throws naming every CV print past the ceiling, so one run reports them all. */
function holdCvToCeiling(prints: Printable[]): void {
  if (prints.length === 0) return;

  const over = prints
    .map(({ route, outputPath }) => ({
      route,
      pages: pdfPageCount(fs.readFileSync(outputPath), outputPath),
    }))
    .filter(({ pages }) => pages > CV_PAGE_CEILING);

  if (over.length > 0) {
    throw new Error(
      `The CV prints past its ${CV_PAGE_CEILING}-page ceiling: ${over
        .map(({ route, pages }) => `${route} (${pages} pages)`)
        .join(', ')}.`,
    );
  }

  console.log(
    `${prints.length} CV PDF(s) within the ${CV_PAGE_CEILING}-page ceiling.`,
  );
}

/** The source hash, over every edition's, of the last `--cv-pages` run that passed. */
const CV_PAGES_PASS = path.join(REPO_ROOT, 'tmp', 'cv-pages-pass.txt');

async function checkCvPages(): Promise<void> {
  const editions = cvPrintables();
  const sourceHash = contentHash(
    editions.map((edition) => edition.sourceHash).join('\n'),
  );

  if (
    fs.existsSync(CV_PAGES_PASS) &&
    fs.readFileSync(CV_PAGES_PASS, 'utf8') === sourceHash
  ) {
    console.log('The CV is unchanged since its last page check passed.');
    return;
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-pages-'));

  try {
    const prints = editions.map((edition) => ({
      ...edition,
      outputPath: path.join(dir, `${edition.route}.pdf`),
    }));

    await printAll(prints);
    holdCvToCeiling(prints);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  fs.mkdirSync(path.dirname(CV_PAGES_PASS), { recursive: true });
  fs.writeFileSync(CV_PAGES_PASS, sourceHash);
}

if (given('cv-pages')) {
  await checkCvPages();
} else {
  const printables = cvPrintables();

  await renderPdfs({
    printables,
    // The CV's renders sit outside the content tree, so its root is walked
    // too — otherwise a pruned render's manifest is never found.
    manifestDirs: [path.join(PUBLIC_DIR, cvPath())],
    onRendered: () => {
      holdCvToCeiling(printables);
    },
  });
}
