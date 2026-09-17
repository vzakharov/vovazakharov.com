#!/usr/bin/env tsx

/**
 * Holds next-intl's client runtime to the pages that render in more than one
 * language:
 *
 *   pnpm check:i18n-payload
 *
 * Reaching the bare `next-intl` specifier from a page's graph ships that
 * runtime — 14 kB gzipped — to that page, and the mistake is invisible:
 * `useTranslations` in a client component compiles, builds and translates
 * correctly. `.claude/rules/i18n.md` carries what earns it.
 *
 * **Which pages are allowed is derived, never listed.** A page qualifies when a
 * locale from `routing.locales` appears in its own route or under it, so a new
 * localized page is permitted by existing at its locales — there is no
 * allowlist here or in `eslint.config.ts` to remember to extend. That is the
 * whole reason this reads the build rather than the import graph: a lint rule
 * can only ask which file an import sits in, and every legitimate caller is a
 * client component inside a localized page, indistinguishable by path from an
 * illegitimate one.
 *
 * The fingerprint below cannot rot silently: a localized page that does **not**
 * ship the runtime fails too, so markers that stop matching a future next-intl
 * surface as a failure rather than as a check that passes on everything.
 *
 * Runs under `tsx` rather than bare Node, to read the locale list from the app
 * itself instead of restating it.
 */

/* eslint-disable no-console -- stdout is this script's interface: which page
   ships what is the whole report the non-zero exit refers to. The rule stays
   `error` in the app, where a stray log ships to a user. */

import fs from 'node:fs';
import path from 'node:path';

import { routing } from '@/shared/i18n';

const REPO_ROOT = path.join(import.meta.dirname, '..');

/**
 * Strings next-intl's client runtime carries into a minified chunk: its own
 * error code, its formatting dependency, and its provider's display name. Any
 * one of them identifies the runtime.
 */
const RUNTIME_MARKERS = ['MISSING_MESSAGE', '@formatjs', 'IntlProvider'];

const SCRIPT_SRC = /src="(\/_next\/[^"]+\.js)"/g;

const LOCALES = new Set<string>(routing.locales);

/** A page's route, as the path that addresses it — `cv/cto/en`, or `''`. */
function routeOf(page: string, out: string): string {
  return path
    .relative(out, page)
    .replace(/\.html$/, '')
    .replace(/^index$/, '');
}

function walk(dir: string, extension: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(full, extension);

    return entry.name.endsWith(extension) ? [full] : [];
  });
}

const hasLocale = (route: string) =>
  route.split('/').some((segment) => LOCALES.has(segment));

/**
 * Whether a locale addresses this route or something under it. The second half
 * is what covers the defaulted forms of a localized route — `/cv` and `/cv/cto`
 * render the same page as `/cv/cto/en`, and carry no locale segment of their
 * own. An empty route prefixes every page, so the site root never qualifies
 * this way.
 */
function isLocalized(route: string, routes: string[]): boolean {
  if (hasLocale(route)) return true;
  if (route === '') return false;

  return routes.some(
    (other) => other.startsWith(`${route}/`) && hasLocale(other),
  );
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

const built = outDirs();

if (built.length === 0) {
  console.error(
    'No built site found under apps/*/out — run `pnpm build` first.\n' +
      'This check reads the rendered pages, so it has nothing to say without it.',
  );
  process.exit(1);
}

const alphabetical = (a: string, b: string) => a.localeCompare(b);

const unearned: string[] = [];
const missing: string[] = [];
let localizedPages = 0;
let checkedPages = 0;

for (const out of built) {
  const site = path.basename(path.dirname(out));
  const pages = walk(out, '.html');
  const routes = pages.map((page) => routeOf(page, out));
  const cache = new Map<string, boolean>();

  for (const page of pages) {
    const route = routeOf(page, out);
    const chunks = shipsRuntime(page, out, cache);
    const localized = isLocalized(route, routes);
    const address = `${site}:/${route}`;

    checkedPages += 1;
    if (localized) localizedPages += 1;

    if (localized && chunks.length === 0) missing.push(address);
    if (!localized && chunks.length > 0) {
      unearned.push(`${address}  (${chunks.join(', ')})`);
    }
  }
}

if (unearned.length > 0) {
  console.error(
    "Pages rendering in one language that ship next-intl's client runtime:",
  );
  for (const page of unearned.toSorted(alphabetical)) {
    console.error(`  ${page}`);
  }
  console.error(
    '\nTranslate on the server with `getTranslations` and pass the string down.\n' +
      'See .claude/rules/i18n.md.',
  );
}

// A localized page that does not ship the runtime means the fingerprint above
// no longer matches next-intl — the failure that would otherwise turn this
// check into one that passes on everything.
if (missing.length > 0) {
  console.error(
    `${unearned.length > 0 ? '\n' : ''}Localized pages with no next-intl runtime — the marker list is stale:`,
  );
  for (const page of missing.toSorted(alphabetical)) {
    console.error(`  ${page}`);
  }
  console.error(
    `\nMarkers tried: ${RUNTIME_MARKERS.join(', ')}. Re-fingerprint the runtime\n` +
      'against the built chunks and update RUNTIME_MARKERS in this file.',
  );
}

if (unearned.length > 0 || missing.length > 0) process.exit(1);

console.log(
  `i18n payload OK — ${localizedPages} of ${checkedPages} pages are localized ` +
    'and carry the runtime; the rest ship none of it',
);
