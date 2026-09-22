#!/usr/bin/env node

/**
 * Holds the per-component Mantine stylesheet imports in
 * `src/app/ui/theme-provider.tsx` to what the sites actually render:
 *
 *   pnpm check:mantine-styles
 *
 * Why that list needs holding is `.claude/rules/styling.md` § Styling; this is
 * the half that measures it, in both directions — a class rendered with no rule
 * behind it, and a sheet whose classes nothing renders.
 *
 * It reads the **built HTML and CSS** rather than the import list, so the answer
 * covers what Mantine composes internally: `Button` renders `UnstyledButton`'s
 * class, which no import in the tree names. That is also the limit — a component
 * rendered only after an interaction never reaches a static export, so one that
 * grows that shape needs its sheet confirmed by eye.
 *
 * Bare Node runs this file, relying on its type stripping: it reads the build
 * output and `node_modules`, and imports nothing from the app.
 */

/* eslint-disable no-console -- stdout is this script's interface: which sheet
   is missing and which is unused is the whole report the non-zero exit refers
   to. The rule stays `error` in the app, where a stray log ships to a user. */

import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.join(import.meta.dirname, '..');
const MANTINE_STYLES = path.join(
  REPO_ROOT,
  'node_modules/@mantine/core/styles',
);

/** Mantine's own class names, hashed at publish time and unique to it. */
const MANTINE_CLASS = /m_[\da-f]{7,8}/g;

/** The same names as CSS selectors, so the hash shape is stated once. */
const MANTINE_SELECTOR = new RegExp(String.raw`\.${MANTINE_CLASS.source}`, 'g');

/** The layered half of each stylesheet — the half `theme-provider.tsx` imports. */
const SHEET_SUFFIX = '.layer.css';

const importLine = (sheet: string) =>
  `  import '@mantine/core/styles/${sheet}${SHEET_SUFFIX}';`;

/**
 * The three files that carry no component of their own — the reset, the
 * element defaults and the `--mantine-*` block. Nothing renders a class from
 * them, so the unused half below would report them every run.
 */
const CORE_SHEETS = new Set(['baseline', 'default-css-variables', 'global']);

function walk(dir: string, extension: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(full, extension);

    return entry.name.endsWith(extension) ? [full] : [];
  });
}

function classesIn(files: string[], pattern: RegExp): Set<string> {
  return new Set(
    files.flatMap((file) => [
      ...(fs.readFileSync(file, 'utf8').match(pattern) ?? []),
    ]),
  );
}

/** Which of Mantine's stylesheets declares each class it ships. */
function sheetsByClass(): Map<string, string> {
  const byClass = new Map<string, string>();

  for (const file of fs.readdirSync(MANTINE_STYLES)) {
    if (!file.endsWith(SHEET_SUFFIX)) continue;

    const sheet = file.slice(0, -SHEET_SUFFIX.length);
    const declared =
      fs
        .readFileSync(path.join(MANTINE_STYLES, file), 'utf8')
        .match(MANTINE_SELECTOR) ?? [];

    for (const selector of declared) byClass.set(selector.slice(1), sheet);
  }

  return byClass;
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
      'This check reads the rendered HTML, so it has nothing to say without it.',
  );
  process.exit(1);
}

// Each site's HTML is answered by its own CSS. Pooling the two would let one
// site's stylesheet cover the other's markup — which, with a single shared
// import list, differs from the truth only when one `out/` is staler than the
// other, and that is exactly the case worth catching.
const sites = built.map((dir) => ({
  name: path.basename(path.dirname(dir)),
  rendered: classesIn(walk(dir, '.html'), MANTINE_CLASS),
  styled: classesIn(walk(dir, '.css'), MANTINE_CLASS),
}));

const owner = sheetsByClass();
const missing = new Map<string, string[]>();

for (const site of sites) {
  for (const className of site.rendered) {
    if (site.styled.has(className)) continue;

    const sheet = owner.get(className) ?? '(unknown)';

    missing.set(sheet, [
      ...(missing.get(sheet) ?? []),
      `${className} on ${site.name}`,
    ]);
  }
}

const rendered = new Set(sites.flatMap((site) => [...site.rendered]));
const styled = new Set(sites.flatMap((site) => [...site.styled]));

/** `?? []` over `?? undefined` so the result narrows to the sheets that exist. */
function sheetsFor(classNames: Set<string>): Set<string> {
  return new Set([...classNames].flatMap((name) => owner.get(name) ?? []));
}

const alphabetical = (a: string, b: string) => a.localeCompare(b);

// A sheet is in use when the build ships a class it declares. Read off the
// emitted CSS rather than the import list, so a sheet pulled in transitively
// counts as used by whoever pulls it.
const renderedSheets = sheetsFor(rendered);
const unused = [...sheetsFor(styled)]
  .filter((sheet) => !CORE_SHEETS.has(sheet) && !renderedSheets.has(sheet))
  .toSorted(alphabetical);

if (missing.size > 0) {
  console.error('Rendered with no rule behind it — add to theme-provider.tsx:');
  for (const [sheet, classNames] of [...missing].toSorted(([a], [b]) =>
    alphabetical(a, b),
  )) {
    console.error(
      `${importLine(sheet)}  (${classNames.toSorted(alphabetical).join(', ')})`,
    );
  }
}

if (unused.length > 0) {
  console.error(
    `${missing.size > 0 ? '\n' : ''}Imported but never rendered — drop from theme-provider.tsx:`,
  );
  for (const sheet of unused) {
    console.error(importLine(sheet));
  }
}

if (missing.size > 0 || unused.length > 0) process.exit(1);

console.log(
  `mantine styles OK — ${rendered.size} classes rendered across ${built.length} sites, all styled`,
);
