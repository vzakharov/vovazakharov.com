#!/usr/bin/env node

/**
 * Holds next-intl's client runtime out of every built page:
 *
 *   pnpm check:i18n-payload
 *
 * Reaching the bare `next-intl` specifier from a client component ships that
 * runtime — 14 kB gzipped — to every page that renders it, and no page here
 * earns it: each locale is a pre-rendered page of its own, so the language
 * chips are links and the copy is translated on the server.
 * `.claude/rules/i18n.md` carries the reasoning.
 *
 * `@typescript-eslint/no-restricted-imports` is the first guard and catches the
 * import where it is written. This is the second, and it covers what a lint rule
 * cannot see: a dependency that pulls the runtime in transitively, or a
 * component that reaches it under a specifier nobody thought to restrict. What
 * a page costs is not a property of the file an import sits in, so this reads
 * the build.
 *
 * The marker list below cannot rot silently: the run first asserts that every
 * marker still appears in the installed next-intl, so a future release that
 * renames them fails here rather than turning this into a check that passes on
 * everything.
 */

/* eslint-disable no-console -- stdout is this script's interface: which page
   ships what is the whole report the non-zero exit refers to. The rule stays
   `error` in the app, where a stray log ships to a user. */

import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.join(import.meta.dirname, '..');

/**
 * Strings next-intl's client runtime carries into a minified chunk: its own
 * error code, its formatting dependency, and its provider's display name. Any
 * one of them identifies the runtime.
 */
const RUNTIME_MARKERS = ['MISSING_MESSAGE', '@formatjs', 'IntlProvider'];

const SCRIPT_SRC = /src="(\/_next\/[^"]+\.js)"/g;

function walk(dir: string, extension: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(full, extension);

    return entry.name.endsWith(extension) ? [full] : [];
  });
}

/**
 * The runtime's own sources, as installed. `use-intl` is next-intl's core and
 * where the markers actually live, so it is found beside the copy next-intl
 * itself resolves rather than at the tree's root, which under pnpm holds only
 * what `package.json` names.
 */
function runtimeSources(): string {
  const installed = fs.realpathSync(
    path.join(REPO_ROOT, 'node_modules', 'next-intl'),
  );

  return path.join(installed, '..', 'use-intl', 'dist', 'esm', 'production');
}

/** Fails the run when a marker no longer appears in the runtime it fingerprints. */
function verifyMarkers() {
  const sources = runtimeSources();
  const files = walk(sources, '.js');

  if (files.length === 0) {
    console.error(
      `Cannot read next-intl's own sources at ${sources} — this check cannot\n` +
        'verify its fingerprint, so it refuses to pass. Run `pnpm install` first.',
    );
    process.exit(1);
  }

  const blob = files.map((file) => fs.readFileSync(file, 'utf8')).join('');
  const stale = RUNTIME_MARKERS.filter((marker) => !blob.includes(marker));

  if (stale.length === 0) return;

  console.error(
    `Markers that no longer appear in the installed next-intl: ${stale.join(', ')}\n\n` +
      'They are how this check recognizes the runtime inside a minified chunk,\n' +
      'so a marker that stopped matching leaves it blind. Re-fingerprint against\n' +
      `${sources}\nand update RUNTIME_MARKERS in this file.`,
  );
  process.exit(1);
}

function shipsRuntime(html: string, out: string, cache: Map<string, boolean>) {
  const carriesMarker = (chunk: string) => {
    const cached = cache.get(chunk);

    if (cached !== undefined) return cached;

    const file = path.join(out, chunk);
    const carries =
      fs.existsSync(file) &&
      RUNTIME_MARKERS.some((marker) =>
        fs.readFileSync(file, 'utf8').includes(marker),
      );

    cache.set(chunk, carries);

    return carries;
  };

  return [...fs.readFileSync(html, 'utf8').matchAll(SCRIPT_SRC)].flatMap(
    ([, chunk]) => (chunk !== undefined && carriesMarker(chunk) ? [chunk] : []),
  );
}

function outDirs(): string[] {
  const apps = path.join(REPO_ROOT, 'apps');

  return fs
    .readdirSync(apps, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(apps, entry.name, 'out'))
    .filter((dir) => fs.existsSync(dir));
}

verifyMarkers();

const built = outDirs();

if (built.length === 0) {
  console.error(
    'No built site found under apps/*/out — run `pnpm build` first.\n' +
      'This check reads the rendered pages, so it has nothing to say without it.',
  );
  process.exit(1);
}

const carrying: string[] = [];
let checkedPages = 0;

for (const out of built) {
  const site = path.basename(path.dirname(out));
  const cache = new Map<string, boolean>();

  for (const page of walk(out, '.html')) {
    const chunks = shipsRuntime(page, out, cache);
    const route = path.relative(out, page).replace(/\.html$/, '');

    checkedPages += 1;

    if (chunks.length > 0) {
      carrying.push(`${site}:/${route}  (${chunks.join(', ')})`);
    }
  }
}

if (carrying.length > 0) {
  console.error("Pages shipping next-intl's client runtime:");
  for (const page of carrying.toSorted((a, b) => a.localeCompare(b))) {
    console.error(`  ${page}`);
  }
  console.error(
    '\nEvery locale is its own pre-rendered page, so nothing here needs to\n' +
      'translate in the browser. Translate on the server — `getTranslations`\n' +
      'from `next-intl/server`, or the catalogue through `@/shared/i18n` — and\n' +
      'pass the strings down. See .claude/rules/i18n.md.',
  );
  process.exit(1);
}

console.log(
  `i18n payload OK — none of ${checkedPages} pages ship next-intl's client runtime`,
);
